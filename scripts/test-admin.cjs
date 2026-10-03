// Real PostgreSQL engine in memory; no production connection or mail is used.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {createRequire} = require('node:module')
const {createHmac, randomBytes} = require('node:crypto')
const ts = require('typescript')
const {PGlite} = require('@electric-sql/pglite')
const sharp = require('sharp')
const root = path.resolve(__dirname, '..')
process.chdir(root)
process.env.ADMIN_USERNAME = 'isolated-audit'
process.env.ADMIN_PASSWORD = randomBytes(32).toString('hex')
process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString('hex')
process.env.NODE_ENV = 'test'
delete process.env.SITE_URL
let cookie, db, failSql
const cache = new Map()
const pool = {query: async (sql, args) => {
  if (failSql && sql.startsWith(failSql)) {failSql = null; throw Error('Injected SQL failure')}
  return db.query(sql, args)
}, connect: async () => ({query: (...args) => pool.query(...args), release() {}})}
const mocks = {
  '@/lib/db': {getDb: () => pool},
  'next/headers': {cookies: async () => ({get: () => cookie ? {value: cookie} : undefined, set: (_name, value) => {cookie = value}, delete: () => {cookie = undefined}})},
  'next/navigation': {redirect: url => {throw Error('REDIRECT ' + url)}},
  'next/cache': {revalidatePath() {}},
}
function load(file) {
  const filename = path.resolve(root, file)
  if (cache.has(filename)) return cache.get(filename)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText
  const module = {exports: {}}
  cache.set(filename, module.exports)
  const nativeRequire = createRequire(filename)
  const requireLocal = name => name in mocks ? mocks[name] : name.startsWith('@/') ? load(name.slice(2) + '.ts') : name.startsWith('.') && fs.existsSync(path.resolve(path.dirname(filename), name + '.ts')) ? load(path.resolve(path.dirname(filename), name + '.ts')) : nativeRequire(name)
  new Function('require', 'module', 'exports', code)(requireLocal, module, module.exports)
  cache.set(filename, module.exports)
  return module.exports
}
let count = 0
async function test(name, work) {await work(); count++; console.log('PASS ' + name)}
const expectError = (work, status) => assert.rejects(work, error => error.status === status)
const req = (route, method, data, headers = {}) => new Request('http://localhost:3002' + route, {method, headers: {'content-type': 'application/json', ...headers}, ...(data === undefined ? {} : {body: JSON.stringify(data)})})
const params = id => ({params: Promise.resolve({id: String(id)})})
async function main() {
  db = await PGlite.create()
  await db.exec(fs.readFileSync(path.join(__dirname, 'fixtures/admin.sql'), 'utf8'))
  const auth = load('lib/admin-auth.ts'), service = load('lib/admin-catalog.ts')
  const login = load('app/api/admin/login/route.ts'), session = load('app/api/admin/session/route.ts')
  const productApi = load('app/api/products/route.ts'), productIdApi = load('app/api/products/[id]/route.ts')
  const categoryApi = load('app/api/categories/route.ts'), categoryIdApi = load('app/api/categories/[id]/route.ts')
  const orderApi = load('app/api/orders/[id]/route.ts'), upload = load('app/api/admin/upload/route.ts')
  await test('dashboard sums numeric strings, excludes cancelled orders and sorts years', async () => {
    const data=load('lib/order-stats.ts').buildOrderChartData([
      {created_at:'2025-12-01',total_amount:'10.10'}, {created_at:'2025-12-02',total_amount:'20.20'},
      {created_at:'2026-01-01',total_amount:'300.00'}, {created_at:'2026-01-02',total_amount:'999.00',status:'cancelled'},
    ])
    assert.deepEqual(data.salesData,[{month:'12.2025',total:30.3},{month:'01.2026',total:300}])
    assert.deepEqual(data.ordersCountData.map(row=>row.count),[2,2])
  })
  await test('anonymous writes, orders, stats and diagnostics denied', async () => {
    for (const response of [await productApi.POST(req('/api/products','POST',{})), await categoryApi.POST(req('/api/categories','POST',{})), await orderApi.GET(req('/api/orders/1','GET'),params(1)), await upload.POST(req('/api/admin/upload','POST',{})), await load('app/api/admin/stats/route.ts').GET(), await load('app/api/health/db/route.ts').GET(), await load('app/api/health/env/route.ts').GET()]) assert.equal(response.status,401)
    assert.equal((await (await session.GET()).json()).authenticated,false)
    await assert.rejects(auth.requireAdminSession, /REDIRECT/)
  })
  await test('invalid credentials, malformed JSON and cross-origin login rejected', async () => {
    assert.equal((await login.POST(req('/api/admin/login','POST',{username:'bad',password:'bad'}))).status,401)
    assert.equal((await login.POST(req('/api/admin/login','POST',null))).status,400)
    assert.equal((await login.POST(req('/api/admin/login','POST',{}, {origin:'https://foreign.example'}))).status,403)
  })
  await test('signed cookie login succeeds and expired/future/tampered cookies fail', async () => {
    assert.equal((await login.POST(req('/api/admin/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD}))).status,200)
    assert.equal(await auth.checkAdminSession(),true)
    assert.equal(auth.verifyAdminSession(cookie + 'x'),false)
    for(const stamp of [Date.now()-86400001,Date.now()+60000]) {
      const ts=String(stamp),sig=createHmac('sha256',process.env.ADMIN_SESSION_SECRET).update(ts).digest('hex')
      assert.equal(auth.verifyAdminSession(Buffer.from(ts+'.'+sig).toString('base64url')),false)
    }
    assert.equal(auth.verifyAdminSession('garbage'),false)
  })
  let parent, child, grandchild, product, order
  await test('create nested categories and product using PostgreSQL', async () => {
    parent = await service.createCategory({name:'Materials'})
    child = await service.createCategory({name:'Lumber',parent_id:parent.id})
    grandchild = await service.createCategory({name:'Boards',parent_id:child.id})
    product = await service.createProduct({name:'Audit board',price:123.45,category_id:grandchild.id,stock:5})
    assert.equal(Number(product.price),123.45)
    assert.equal(product.unit,'шт')
  })
  await test('invalid numbers, image URLs and unknown categories rejected', async () => {
    for (const patch of [{price:-1},{price:NaN},{stock:-1},{stock:0.5},{name:' '},{image_url:'javascript:alert(1)'}]) await expectError(() => service.createProduct({name:'Invalid',price:20,category_id:parent.id,...patch}),400)
    await expectError(() => service.createProduct({name:'Invalid',price:20,category_id:99999}),409)
    await expectError(() => service.createCategory({name:'Invalid',parent_id:99999}),409)
  })
  await test('partial update preserves fields, missing and invalid IDs fail', async () => {
    const edited = await service.editProduct(product.id,{price:200})
    assert.equal(edited.name,product.name); assert.equal(edited.stock,5); assert.equal(Number(edited.price),200)
    await expectError(() => service.editProduct('bad',{price:1}),400)
    await expectError(() => service.editProduct(99999,{price:1}),404)
    await expectError(() => service.editProduct(product.id,{id:99999}),400)
  })
  await test('self and descendant category cycles rejected atomically', async () => {
    await expectError(() => service.editCategory(parent.id,{parent_id:parent.id}),409)
    await expectError(() => service.editCategory(parent.id,{parent_id:grandchild.id}),409)
    assert.equal((await db.query('SELECT parent_id FROM categories WHERE id=$1',[parent.id])).rows[0].parent_id,null)
  })
  await test('authenticated cross-origin modification blocked', async () => {
    const result=await productIdApi.PATCH(req('/api/products/'+product.id,'PATCH',{price:1},{origin:'https://foreign.example'}),params(product.id))
    assert.equal(result.status,403)
  })
  await test('public catalog can read fixture and category hierarchy', async () => {
    assert.equal((await productApi.GET(req('/api/products','GET'))).status,200)
    const ancestors=await (await categoryApi.GET(req('/api/categories?pathFor='+grandchild.id,'GET'))).json()
    assert.deepEqual(ancestors.map(c=>c.id),[parent.id,child.id,grandchild.id])
  })
  await test('ordered product and its category cannot be deleted', async () => {
    order=(await db.query("INSERT INTO orders(customer_name,customer_phone,total_amount) VALUES('Audit','000',400) RETURNING *")).rows[0]
    await db.query('INSERT INTO order_items(order_id,product_id,quantity,price) VALUES($1,$2,2,200)',[order.id,product.id])
    await expectError(() => service.removeProduct(product.id),409)
    await expectError(() => service.removeCategory(parent.id),409)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM categories')).rows[0].n,3)
  })
  await test('status API validates enum, missing orders and persists valid status', async () => {
    assert.equal((await orderApi.PATCH(req('/api/orders/1','PATCH',{status:'paid-by-hacker'}),params(order.id))).status,400)
    assert.equal((await orderApi.PATCH(req('/api/orders/1','PATCH',{status:'processing'}),params(99999))).status,404)
    assert.equal((await orderApi.PATCH(req('/api/orders/1','PATCH',{status:'processing'}),params(order.id))).status,200)
    assert.equal((await db.query('SELECT status FROM orders WHERE id=$1',[order.id])).rows[0].status,'processing')
  })
  await test('failed order deletion rolls back removed items', async () => {
    failSql='DELETE FROM orders '
    await assert.rejects(()=>service.removeOrder(order.id),/Injected/)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM order_items')).rows[0].n,1)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n,1)
  })
  await test('order deletion API deletes items and reports missing record', async () => {
    assert.equal((await orderApi.DELETE(req('/api/orders/1','DELETE'),params(order.id))).status,200)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM order_items')).rows[0].n,0)
    assert.equal((await orderApi.DELETE(req('/api/orders/1','DELETE'),params(order.id))).status,404)
  })
  await test('category deletion rolls back products if final delete fails', async () => {
    failSql='DELETE FROM categories '
    await assert.rejects(()=>service.removeCategory(parent.id),/Injected/)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM products')).rows[0].n,1)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM categories')).rows[0].n,3)
  })
  await test('category subtree deletion is complete and atomic', async () => {
    assert.equal((await categoryIdApi.DELETE(req('/api/categories/'+parent.id,'DELETE'),params(parent.id))).status,200)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM products')).rows[0].n,0)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM categories')).rows[0].n,0)
  })
  const fileRequest=(bytes,name,type)=>{const form=new FormData();form.append('file',new File([bytes],name,{type}));return new Request('http://localhost:3002/api/admin/upload',{method:'POST',body:form})}
  await test('upload rejects active/disguised images and files over size limit', async () => {
    assert.equal((await upload.POST(fileRequest('<svg/>','x.svg','image/svg+xml'))).status,415)
    assert.equal((await upload.POST(fileRequest('<html>bad</html>','x.png','image/png'))).status,415)
    assert.equal((await upload.POST(fileRequest(Buffer.alloc(5*1024*1024+1),'x.png','image/png'))).status,413)
  })
  await test('valid upload decodes, re-encodes and saves WebP', async () => {
    const png=await sharp({create:{width:8,height:8,channels:3,background:'#126b35'}}).png().toBuffer()
    const response=await upload.POST(fileRequest(png,'../../test.html','image/png'))
    assert.equal(response.status,200)
    const {url}=await response.json();assert.match(url,/^\/uploads\/[a-f0-9-]+\.webp$/)
    const filename=path.join(root,'public',url)
    assert.equal((await sharp(fs.readFileSync(filename)).metadata()).format,'webp')
    fs.unlinkSync(filename)
  })
  await test('real mail transport sends only to isolated local SMTP receiver', async () => {
    let message = '', recipient = ''
    const server = require('node:net').createServer(socket => {
      socket.setEncoding('utf8'); socket.write('220 localhost SMTP\r\n')
      let pending = '', dataMode = false
      socket.on('data', chunk => {
        pending += chunk
        let end
        while ((end = pending.indexOf('\r\n')) >= 0) {
          const line = pending.slice(0, end); pending = pending.slice(end + 2)
          if (dataMode) {
            if (line === '.') {dataMode=false;socket.write('250 accepted\r\n')} else message += line + '\r\n'
          } else if (line.startsWith('EHLO')) socket.write('250-localhost\r\n250 AUTH PLAIN\r\n')
          else if (line.startsWith('AUTH')) socket.write('235 authenticated\r\n')
          else if (line.startsWith('RCPT')) {recipient=line;socket.write('250 recipient\r\n')}
          else if (line === 'DATA') {dataMode=true;socket.write('354 send data\r\n')}
          else if (line === 'QUIT') socket.end('221 bye\r\n')
          else socket.write('250 ok\r\n')
        }
      })
    })
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
    Object.assign(process.env,{SMTP_HOST:'127.0.0.1',SMTP_PORT:String(server.address().port),SMTP_USER:'sender@example.test',SMTP_PASS:'isolated-test',NODEMAILER_TARGET:'orders@example.test'})
    try {
      await load('lib/order-mail.ts').sendOrderNotification({orderId:1,customerName:'Local audit',customerPhone:'000',totalAmount:100,items:[{product:{name:'Board',price:100,unit:'шт'},quantity:1}]})
      assert.match(recipient,/orders@example.test/)
      assert.match(message,/Content-Type: text\/html/)
      assert.match(message,/Local audit/)
    } finally { await new Promise(resolve=>server.close(resolve)) }
  })
  await test('logout clears session and login attempts are limited', async () => {
    await load('app/api/admin/logout/route.ts').POST(req('/api/admin/logout','POST'))
    assert.equal(await auth.checkAdminSession(),false)
    const limiter=load('lib/admin-login-limit.ts')
    limiter.clearLoginAttempts('admin')
    for(let i=0;i<10;i++) assert.equal((await login.POST(req('/api/admin/login','POST',{username:'bad',password:'bad'}))).status,401)
    assert.equal((await login.POST(req('/api/admin/login','POST',{username:'bad',password:'bad'}))).status,429)
    assert.equal(limiter.allowLoginAttempt('admin',Date.now()+900001),true)
  })
  await db.close()
  console.log(`Admin integration: ${count} scenarios passed`)
}
main().catch(async error=>{console.error(error);if(db)await db.close();process.exitCode=1})
