const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
process.chdir(path.resolve(__dirname, '..'))
process.env.NODE_ENV = 'production'
process.env.DATABASE_URL = 'postgresql://test:test@192.0.2.10:5432/test'
process.env.DATABASE_SSL = 'disable'
delete process.env.DATABASE_TLS_SERVERNAME
const code = ts.transpileModule(fs.readFileSync('lib/db.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText
function settings() {
  let options
  const module = {exports: {}}
  new Function('require', 'module', 'exports', code)(name => name === 'pg' ? {Pool: class {constructor(value) {options = value}}} : require(name), module, module.exports)
  module.exports.getDb()
  return options.ssl
}
const cert = {subject: {CN: 'db.example.test'}, subjectaltname: 'IP Address:192.0.2.10'}
let ssl = settings()
assert.equal(ssl.rejectUnauthorized, true)
assert.ok(ssl.ca.length > 0)
assert.equal(ssl.checkServerIdentity('localhost', cert), undefined)
assert.equal(ssl.checkServerIdentity('localhost', {...cert, subjectaltname: 'IP Address:192.0.2.11'}).code, 'ERR_TLS_CERT_ALTNAME_INVALID')
process.env.DATABASE_TLS_SERVERNAME = 'db.example.test'
ssl = settings()
assert.equal(ssl.checkServerIdentity('localhost', {...cert, subjectaltname: 'DNS:db.example.test'}), undefined)
assert.equal(ssl.checkServerIdentity('localhost', {...cert, subjectaltname: 'DNS:other.example.test'}).code, 'ERR_TLS_CERT_ALTNAME_INVALID')
console.log('PASS database TLS: IP SAN, wrong IP rejection, explicit DNS identity, production certificate verification')
