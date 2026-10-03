const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { createRequire } = require('node:module')
function load(file, mocks = {}) {
  const filename = path.resolve(__dirname, '..', file)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  const localRequire = createRequire(filename)
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : localRequire(name), module, module.exports)
  return module.exports
}
const { catalogCharacteristics: characteristics, deriveCharacteristicsFromName: derive } = load('lib/characteristics.ts')
assert.deepEqual(derive('Вагонка Штиль 12.5х96х3000 мм'), { Размер: '12.5×96×3000 мм' })
assert.deepEqual(derive('Фанера ламинированная 1250×2500 12 мм'), { Размер: '1250×2500 мм', Толщина: '12 мм' })
assert.deepEqual(derive('Фанера 10 мм 1220×2440'), { Размер: '1220×2440 мм', Толщина: '10 мм' })
assert.deepEqual(derive('ЦСП 3200*1250*10 мм'), { Размер: '3200×1250 мм', Толщина: '10 мм' })
const timber = characteristics({name:'Брус 200х200х6000 мм',characteristics:{size:'200х200', thickness:'6000 мм',pieces_per_cubic_meter:4}})
assert.deepEqual(timber, {Размер:'200×200×6000 мм'})
if (process.argv[2]) {
  const products = JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''))
  for (const id of [140,142]) for (const p of products.filter(p=>p.category_id===id)) {
    assert.match(characteristics(p).Размер, /×6000 мм$/)
    assert.equal(characteristics(p).Толщина, undefined)
  }
  for (const p of products.filter(p=>p.category_id===113)) assert.match(characteristics(p).Толщина, /^\d+(?:[.,]\d+)? мм$/)
  assert(products.some(p=>p.category_id===141 && characteristics(p).Размер==='200×200×6000 мм'))
  for (const id of [69,120,121,64]) assert(products.filter(p=>p.category_id===id).length>0)
  console.log('Live catalog fixtures passed (503-product snapshot)')
}
async function testOrder({mailFails=false, itemFails=false, missing=false, quantity=2, unit="шт"}={}) {
  const events=[]
  let mail
  const client={
    async query(sql, values) {
      events.push(sql.split(/\s+/).slice(0,3).join(' '))
      if(sql.startsWith('SELECT')) return {rows:missing?[]:[{id:7,name:'Доска',price:'150',price_per_cubic:'20000'}]}
      if(sql.startsWith('INSERT INTO orders')) return {rows:[{id:42,customer_name:values[0],customer_phone:values[1],total_amount:values[5]}]}
      if(sql.startsWith('INSERT INTO order_items') && itemFails) throw Error('mock insert failure')
      return {rows:[]}
    },
    release(){events.push('release')},
  }
  const {POST}=load('app/api/orders/route.ts',{
    '@/lib/lumber-pricing':load('lib/lumber-pricing.ts'),
    '@/lib/db':{getDb:()=>({connect:async()=>client})},
    '@/lib/admin-auth':{checkAdminSession:async()=>false},
    '@/lib/order-mail':{sendOrderNotification:async data=>{events.push('mail');mail=data;if(mailFails)throw Error('mock SMTP failure')}},
  })
  const originalError=console.error;console.error=()=>{}
  let response
  try {response=await POST(new Request('http://localhost/api/orders',{method:'POST',body:JSON.stringify({customer_name:'Тест',customer_phone:'+70000000000',total_amount:1,items:[{product_id:7,price:1,quantity,unit}]})}))}finally{console.error=originalError}
  const data=await response.json()
  if(quantity<=0){assert.equal(response.status,400);assert.equal(events.length,0);return}
  if(itemFails || missing){assert.equal(response.status,itemFails?500:400);assert(events.includes('ROLLBACK'));assert(!events.includes('mail'));assert(events.includes('release'));return}
  assert.equal(response.status,200)
  assert.equal(data.total_amount,unit === "м³" ? 40000 : 300)
  assert.equal(data.notification_sent,!mailFails)
  assert(events.indexOf('COMMIT')<events.indexOf('mail'))
  assert(events.indexOf('release')<events.indexOf('mail'))
  assert.equal(mail.items[0].product.price,unit === "м³" ? 20000 : 150)
}
async function main(){
  await testOrder();await testOrder({unit:"м³"});await testOrder({mailFails:true});await testOrder({itemFails:true});await testOrder({missing:true});await testOrder({quantity:-1})
  const pricing=load('lib/lumber-pricing.ts').createLumberPriceCalculation()
  assert.deepEqual(pricing.extractDimensionsFromName('Вагонка 12.5х96х3000 мм'),{thickness:12.5,width:96,length:3000})
  assert.equal(pricing.getPrice({name:'Вагонка 12.5х100х1000 мм',price:100},'cubic').price,80000)
  const {escapeHtml}=load('lib/mail.ts')
  let sent
  const {sendOrderNotification}=load('lib/order-mail.ts',{'./mail':{escapeHtml,mailSettings:()=>({from:'test@example.com',to:'owner@example.com',transporter:{sendMail:async message=>{sent=message;return{accepted:['owner@example.com'],rejected:[]}}}})}})
  await sendOrderNotification({orderId:42,customerName:'<script>test</script>',customerPhone:'0',totalAmount:300,items:[{product:{name:'Доска & брус',price:150},quantity:2}]})
  assert(sent.html.includes('&lt;script&gt;test&lt;/script&gt;'))
  assert(sent.html.includes('Доска &amp; брус'))
  assert.equal(sent.subject,'Новый заказ #42')
  console.log('Catalog parsing, order commit/rollback, SMTP failure and email template tests passed')
}
main().catch(error=>{console.error(error);process.exitCode=1})
