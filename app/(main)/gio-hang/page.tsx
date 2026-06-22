import { getCategories } from '../../../src/lib/supabase/server'
import CartClient from './CartClient'

export default async function CartPage() {
  const categories = await getCategories()
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]))
  return <CartClient categoryMap={categoryMap} />
}
