import { createHmac } from 'crypto'

const GRAPH_URL = 'https://graph.facebook.com/v21.0'

function getToken(pageId: string) {
  const token = process.env[`FB_PAGE_ACCESS_TOKEN_${pageId}`]
  if (!token) throw new Error(`Missing FB_PAGE_ACCESS_TOKEN_${pageId}`)
  return token
}

export function verifySignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.FB_APP_SECRET
  if (!secret) return false
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')
  return expected === signatureHeader
}

export async function sendPrivateReply(
  pageId: string,
  commentId: string,
  message: object,
  postId?: string
): Promise<boolean> {
  const candidateIds = buildPrivateReplyCommentIdCandidates(commentId, postId)
  let lastError: string | null = null

  for (const candidateId of candidateIds) {
    const params = new URLSearchParams({ access_token: getToken(pageId) })
    const res = await fetch(`${GRAPH_URL}/${candidateId}/private_replies?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (res.ok) return true

    lastError = await res.text()
    console.error('sendPrivateReply attempt failed:', {
      candidateId,
      originalCommentId: commentId,
      postId,
      response: lastError,
    })
  }

  console.error('sendPrivateReply error:', {
    commentId,
    postId,
    response: lastError,
    hint:
      'Check FB_PAGE_ACCESS_TOKEN_<pageId> for the target page and required permissions/pages subscription (pages_manage_metadata, pages_read_engagement, pages_messaging).',
  })
  return false
}

export async function sendMessage(pageId: string, psid: string, message: object): Promise<void> {
  const res = await fetch(`${GRAPH_URL}/me/messages?access_token=${getToken(pageId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: psid }, ...message }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('sendMessage error:', err)
  }
}

function buildPrivateReplyCommentIdCandidates(commentId: string, postId?: string): string[] {
  const comment = commentId.trim()
  const post = postId?.trim()
  const candidates: string[] = []

  const pushUnique = (id: string | undefined) => {
    if (!id) return
    if (!candidates.includes(id)) candidates.push(id)
  }

  pushUnique(comment)

  const commentLeaf = comment.includes('_') ? comment.split('_').filter(Boolean).at(-1) : undefined
  pushUnique(commentLeaf)
  const pageId = post?.includes('_') ? post.split('_').filter(Boolean).at(0) : undefined
  if (pageId && commentLeaf) {
    pushUnique(`${pageId}_${commentLeaf}`)
  }

  // Keep this as a final fallback for payload variants that require post context.
  if (post && commentLeaf) {
    pushUnique(`${post}_${commentLeaf}`)
  }

  return candidates
}

export function buildProductReplyMessage(product: {
  id: number
  name: string
  price: number | null
  stock: number
}) {
  const price = product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  return {
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `🛍️ ${product.name}\n💰 Giá: ${price}\n📦 Còn hàng: ${product.stock} sản phẩm\n\nNhấn để thêm vào giỏ hàng:`,
          buttons: [
            {
              type: 'postback',
              title: 'Thêm vào giỏ hàng',
              payload: `ADD_TO_CART:${product.id}`,
            },
          ],
        },
      },
    },
  }
}

export function buildCartLinkMessage(
  product: { id: number; name: string; price: number | null },
  psid: string
) {
  const price = product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tanvyphat.com'
  return {
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `✅ Đã thêm vào giỏ hàng!\n\n🛍️ ${product.name}\n💰 Giá: ${price}\n\nNhấn để xem giỏ hàng và đặt hàng:`,
          buttons: [
            {
              type: 'web_url',
              url: `${siteUrl}/gio-hang?add=${product.id}&fbid=${psid}`,
              title: 'Xem giỏ hàng',
              webview_height_ratio: 'full',
            },
          ],
        },
      },
    },
  }
}
