// Re-export from CartContext for backward compatibility
export type { CartItem } from '../contexts/CartContext'
export { useCart } from '../contexts/CartContext'

const FB_USER_KEY = 'tvp_fb_user_id'

export function useFbUserId() {
  const get = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(FB_USER_KEY)
  }
  const set = (id: string) => {
    localStorage.setItem(FB_USER_KEY, id)
  }
  return { getFbUserId: get, setFbUserId: set }
}
