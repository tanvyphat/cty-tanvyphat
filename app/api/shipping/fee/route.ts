import { NextRequest } from 'next/server'
import { HCMC_CODE, HCMC_DISTRICTS } from '@/src/data/provinces'

const FREESHIP_THRESHOLD = 4_000_000
const DEFAULT_WEIGHT = 1000

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province') ?? ''
  const district = searchParams.get('district') ?? ''
  const provinceCode = searchParams.get('province_code') ?? ''
  const orderTotal = Number(searchParams.get('total') ?? '0')
  const deliveryType = searchParams.get('type') ?? 'standard'
  const address = searchParams.get('address') || '1'
  const weight = searchParams.get('weight') || String(DEFAULT_WEIGHT)
  const deliverOption = deliveryType === 'express' ? 'xteam' : 'none'

  if (!province || !district) {
    return Response.json({ error: 'Thiếu tỉnh/quận' }, { status: 400 })
  }

  // Freeship chỉ áp dụng giao thường: TP.HCM + đơn >= 4 triệu
  const isHCMC = provinceCode === HCMC_CODE
  const isHCMCDistrict = HCMC_DISTRICTS.has(district)
  if (deliveryType === 'standard' && isHCMC && isHCMCDistrict && orderTotal >= FREESHIP_THRESHOLD) {
    return Response.json({ fee: 0, freeship: true })
  }

  const token = process.env.GHTK_API_TOKEN
  const pickProvince = process.env.GHTK_PICK_PROVINCE ?? 'TP. Hồ Chí Minh'
  const pickDistrict = process.env.GHTK_PICK_DISTRICT ?? 'Quận 12'

  if (!token) {
    return Response.json({ fee: 0, freeship: false, unavailable: true })
  }

  try {
    const params = new URLSearchParams({
      pick_province: pickProvince,
      pick_district: pickDistrict,
      province,
      district,
      address,
      weight,
      deliver_option: deliverOption,
    })
    const res = await fetch(
        `https://services.giaohangtietkiem.vn/services/shipment/fee?${params}`,
        {
          headers: { Token: token },
          next: { revalidate: 300 },
        }
    )
    if (!res.ok) throw new Error(`GHTK ${res.status}`)
    const data = await res.json()
    const fee = data?.fee?.fee ?? data?.fee ?? 0
    return Response.json({ fee: Number(fee), freeship: false })
  } catch (err) {
    console.error('[shipping/fee] GHTK error:', err)
    return Response.json({ fee: 0, freeship: false, unavailable: true })
  }
}
