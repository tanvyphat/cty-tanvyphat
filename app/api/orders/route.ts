import {NextRequest} from 'next/server'
import {createSSRClient, getAdminClient} from '@/src/lib/supabase/server'

interface OrderItem {
    product_id: number
    unit_id: number
    quantity: number
}

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>
    try {
        body = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON'}, {status: 400})
    }

    const {
        customer_name,
        customer_phone,
        customer_address,
        note,
        fb_user_id,
        items,
        shipping_fee = 0,
        province,
        district,
        delivery_type,
    } = body as {
        customer_name: string
        customer_phone: string
        customer_address: string
        note?: string
        fb_user_id?: string
        items: OrderItem[]
        shipping_fee?: number
        province?: string
        district?: string
        delivery_type?: string
    }

    // Kiểm tra dữ liệu đầu vào
    if (!customer_name?.trim() || !customer_phone?.trim() || !customer_address?.trim()) {
        return Response.json({error: 'Thiếu thông tin bắt buộc'}, {status: 400})
    }

    if (!Array.isArray(items) || items.length === 0) {
        return Response.json({error: 'Giỏ hàng trống'}, {status: 400})
    }

    const db = getAdminClient()

    // Lấy user_id đúng cách trên server
    let finalUserId: string | null = null

    try {
        const supabase = await createSSRClient()
        const {data: {user}, error} = await supabase.auth.getUser()

        if (!error && user?.id) {
            finalUserId = user.id
        }
    } catch (error) {
        console.warn('Guest order (không đăng nhập):', error)
    }

    console.log('Final User ID:', finalUserId)

    // Lấy thông tin sản phẩm & đơn vị
    const productIds = [...new Set(items.map((i) => i.product_id))]
    const unitIds = [...new Set(items.map((i) => i.unit_id))]

    const [{data: products}, {data: units}] = await Promise.all([
        db.from('products').select('id, name').in('id', productIds),
        db.from('product_units').select('id, product_id, unit_name, price').in('id', unitIds),
    ])

    if (!products || products.length === 0) {
        return Response.json({error: 'Không tìm thấy sản phẩm'}, {status: 404})
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const unitMap = Object.fromEntries((units ?? []).map((u) => [u.id, u]))

    const resolvedItems = items.map((item) => {
        const product = productMap[item.product_id]
        const unit = unitMap[item.unit_id]
        return {
            product_id: item.product_id,
            product_name: product?.name ?? 'Sản phẩm không xác định',
            product_price: unit?.price ?? 0,
            unit_name: unit?.unit_name ?? null,
            quantity: item.quantity,
        }
    })

    const subtotal = resolvedItems.reduce(
        (sum, i) => sum + Number(i.product_price) * i.quantity,
        0
    )

    const shippingFeeNum = Number(shipping_fee)
    const total_price = subtotal + shippingFeeNum

    // Tạo đơn hàng
    const {data: order, error: orderError} = await db
        .from('orders')
        .insert({
            customer_name: customer_name.trim(),
            customer_phone: customer_phone.trim(),
            customer_address: customer_address.trim(),
            note: note?.trim() || null,
            total_price,
            shipping_fee: shippingFeeNum,
            province: province?.trim() || null,
            district: district?.trim() || null,
            delivery_type: delivery_type ?? 'standard',
            status: 'moi',
            payment_method: 'cod',
            payment_status: 'pending',
            user_id: finalUserId,
        })
        .select('id')
        .single()

    if (orderError || !order) {
        console.error('Create order error:', orderError)
        return Response.json({
            error: `Lỗi tạo đơn hàng: ${orderError?.message || 'Unknown error'}`,
        }, {status: 500})
    }

    // Thêm chi tiết đơn hàng
    const {error: itemsError} = await db.from('order_items').insert(
        resolvedItems.map((i) => ({order_id: order.id, ...i}))
    )

    if (itemsError) {
        console.error('Create order_items error:', itemsError)
        return Response.json({error: 'Không thể lưu chi tiết đơn hàng'}, {status: 500})
    }

    // Cập nhật thông tin khách từ Facebook (nếu có)
    if (fb_user_id) {
        await db.from('fb_customers').upsert({
            fb_user_id,
            customer_name: customer_name.trim(),
            customer_phone: customer_phone.trim(),
            customer_address: customer_address.trim(),
            updated_at: new Date().toISOString(),
        })
    }

    return Response.json({
        success: true,
        order_id: order.id
    })
}
