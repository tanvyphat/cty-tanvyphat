/** Standardize admin fetch failures (including HTML 405/413/redirect responses). */
export async function readAdminResponse<T>(response: Response): Promise<T> {
  const bodyText = await response.text()
  let payload: unknown
  try { payload = bodyText ? JSON.parse(bodyText) : null } catch { payload = null }

  const serverError = payload && typeof payload === 'object' && 'error' in payload
    && typeof (payload as { error: unknown }).error === 'string'
    ? (payload as { error: string }).error : null

  if (!response.ok) {
    const defaults: Record<number, string> = {
      400: 'Yêu cầu gửi lên không hợp lệ.',
      401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      403: 'Bạn không có quyền thực hiện thao tác này.',
      404: 'Không tìm thấy dữ liệu hoặc đường dẫn API.',
      405: 'Máy chủ chưa hỗ trợ thao tác này.',
      409: 'Thao tác xung đột với dữ liệu hiện tại.',
      413: 'Tập tin quá lớn so với giới hạn tải lên.',
    }
    throw new Error(`${serverError ?? defaults[response.status] ?? 'Máy chủ gặp lỗi khi xử lý yêu cầu.'} (HTTP ${response.status})`)
  }
  if (payload === null) {
    throw new Error('Máy chủ trả về dữ liệu không hợp lệ (không phải JSON). Có thể phiên đăng nhập đã hết hạn.')
  }
  return payload as T
}

export async function adminRequest<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { ...init, cache: 'no-store' })
  } catch {
    throw new Error('Không thể kết nối đến máy chủ. Hãy kiểm tra kết nối Internet và thử lại.')
  }
  return readAdminResponse<T>(response)
}
