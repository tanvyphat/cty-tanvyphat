import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Static policy regression assertions: these do NOT replace database role tests.
const read = (path) => readFileSync(path, 'utf8')
function files(dir) {
  return readdirSync(dir).flatMap((file) => {
    const path = join(dir, file)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}
test('no privileged Supabase key dependency in website runtime', () => {
  const runtime = [...files('app'), ...files('src'), 'proxy.ts']
    .filter((path) => /\.(ts|tsx|js|mjs)$/.test(path))
  for (const path of runtime) {
    const code = read(path)
    assert.doesNotMatch(code, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|getAdminClient|auth\.admin\./,
      path + ' must use Auth session and RLS')
    assert.doesNotMatch(code, /sb_secret_[A-Za-z0-9_-]{10,}|eyJ[A-Za-z0-9_-]{20,}\./,
      path + ' must not contain hardcoded secrets')
  }
})
test('all admin product/news APIs use verified SSR Auth', () => {
  for (const path of files('app/api/admin').filter((p) => p.endsWith('/route.ts') && !p.includes('/logout/'))) {
    assert.match(read(path), /createSSRClient/)
    assert.match(read(path), /auth\.getUser\(\)/)
    assert.match(read(path), /app_metadata\?\.role.*admin/)
  }
})
test('Auth-user management is restricted to database RPC; no application service role', () => {
  const route = read('app/api/admin/users/route.ts')
  assert.match(route, /catalog_admin_list_users/)
  assert.match(route, /catalog_admin_set_user_role/)
  assert.doesNotMatch(route, /auth\.admin\./)
})
test('catalog, news, storage and Auth-role SQL policy are review-only', () => {
  const sql = read('database/review-only/20261028_catalog_rls_proposal.sql')
  for (const table of ['products','categories','branches','product_units','news']) {
    assert.match(sql, new RegExp('public\\.' + table))
  }
  for (const bucket of ['product-images','news-media']) assert.ok(sql.includes(bucket))
  assert.match(sql, /SECURITY DEFINER SET search_path = ''/)
  assert.match(sql, /FROM auth\.users/)
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.catalog_admin_set_user_role/)
  assert.match(sql, /FROM PUBLIC, anon/)
  assert.match(sql, /raw_app_meta_data/)
})
test('media upload enforces actual bucket MIME and 5 MB maximum', () => {
  const s = read('app/api/admin/products/upload/route.ts')
  assert.match(s, /5 \* 1024 \* 1024/)
  for (const mime of ['image/jpeg','image/png','image/webp']) assert.ok(s.includes(mime))
  assert.doesNotMatch(s, /image\/gif|image\/avif/)
})
