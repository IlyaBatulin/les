// Run on a development machine: no image conversion is required on the VPS.
const fs = require('node:fs/promises')
const path = require('node:path')
const {createHash} = require('node:crypto')
const sharp = require('sharp')
const root = path.resolve(__dirname, '..')
const site = process.env.CATALOG_SOURCE_URL || 'https://vyborplus.ru'
const output = path.join(root, 'public/catalog-previews')
const manifestPath = path.join(root, 'lib/catalog-image-previews.json')
sharp.concurrency(2)
async function main() {
  const responses = await Promise.all(['/api/products', '/api/categories?flat=1'].map(p => fetch(site + p)))
  if (responses.some(r => !r.ok)) throw Error('Catalog fetch failed')
  const records = (await Promise.all(responses.map(r => r.json()))).flat()
  const allSources = [...new Set(records.map(r => r.image_url).filter(Boolean))]
  await fs.mkdir(output, {recursive: true})
  const manifest = {}
  if (!process.argv.includes('--refresh')) {
    const existing = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => '{}'))
    for (const source of allSources) {
      const variants = existing[source]
      if (variants?.length && (await Promise.all(variants.map(v => fs.access(path.join(root, 'public', v.src)).then(() => true, () => false)))).every(Boolean)) manifest[source] = variants
    }
  }
  const sources = allSources.filter(source => !manifest[source])
  const reused = Object.keys(manifest).length
  const failed = []
  let next = 0, done = 0, originalBytes = 0, previewBytes = 0
  async function worker() {
    while (next < sources.length) {
      const source = sources[next++]
      try {
        const url = new URL(source, site)
        if (!['vyborplus.ru', 'www.vyborplus.ru', 's3.regru.cloud', 'vccagsyqenvfttmghscn.supabase.co'].includes(url.hostname)) throw Error('Unsupported image host')
        const response = await fetch(url, {signal: AbortSignal.timeout(20000)})
        if (!response.ok) throw Error('HTTP ' + response.status)
        if (Number(response.headers.get('content-length')) > 32 * 1024 * 1024) throw Error('Image too large')
        const data = Buffer.from(await response.arrayBuffer())
        if (data.length > 32 * 1024 * 1024) throw Error('Image too large')
        originalBytes += data.length
        const hash = createHash('sha256').update('webp-q80-v1\0').update(data).digest('hex').slice(0, 20)
        const variants = []
        for (const width of [384, 768, 1280]) {
          const {data: preview, info} = await sharp(data, {limitInputPixels: 40_000_000}).rotate().resize({width, height: width, fit: 'inside', withoutEnlargement: true}).webp({quality:80}).toBuffer({resolveWithObject:true})
          if (variants.some(v => v.width === info.width)) continue
          const filename = `${hash}-${info.width}.webp`
          await fs.writeFile(path.join(output, filename), preview)
          previewBytes += preview.length
          variants.push({src: '/catalog-previews/' + filename, width: info.width})
        }
        manifest[source] = variants.sort((a,b) => a.width-b.width)
      } catch (e) { failed.push({source, error:e.message}) }
      if (++done % 40 === 0) console.log('PREVIEWS', done + '/' + sources.length)
    }
  }
  await Promise.all(Array.from({length:4},worker))
  if (!Object.keys(manifest).length) throw Error('No previews generated; existing manifest preserved')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(JSON.stringify({sources:allSources.length,generated:Object.keys(manifest).length,reused,originalBytes,previewBytes,failed},null,2))
}
main().catch(e => {console.error(e.message);process.exitCode=1})
