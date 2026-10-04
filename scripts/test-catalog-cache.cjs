const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
let calls = 0, now = 0, fail = false
const moduleUnderTest = {exports: {}}
const code = ts.transpileModule(fs.readFileSync('lib/catalog-fetch.ts', 'utf8'), {compilerOptions: {module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
new Function('fetch', 'Date', 'module', 'exports', code)(async () => {
  calls++
  await Promise.resolve()
  return new Response(JSON.stringify({value:calls}), {status:fail ? 500 : 200})
}, class extends Date {static now() {return now}}, moduleUnderTest, moduleUnderTest.exports)
async function main() {
  const {catalogFetch} = moduleUnderTest.exports
  const responses = await Promise.all(Array.from({length:3},() => catalogFetch('/api/products?category=56')))
  assert.equal(calls, 1)
  assert.deepEqual(await Promise.all(responses.map(r => r.json())), [{value:1},{value:1},{value:1}])
  now = 30_001
  await catalogFetch('/api/products?category=56')
  assert.equal(calls, 2)
  fail = true
  await catalogFetch('/api/categories?id=99')
  fail = false
  assert.equal((await catalogFetch('/api/categories?id=99')).status, 200)
  assert.equal(calls, 4)
  await assert.rejects(catalogFetch('/api/orders'), /Not a public catalog endpoint/)
  for(let i=0;i<41;i++) await catalogFetch('/api/categories?id='+i)
  const previous = calls
  await catalogFetch('/api/products?category=56')
  assert.equal(calls, previous + 1)
  console.log('PASS catalog cache: shared concurrent request, independent response bodies, expiry, retry, bounded size and endpoint restriction')
}
main().catch(e=>{console.error(e);process.exitCode=1})
