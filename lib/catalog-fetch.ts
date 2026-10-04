// Share public catalog requests across the menu, filters and catalog page.
// Short-lived and bounded: edits/prices are refreshed after 30 seconds.
const requests = new Map<string, { expires: number; response: Promise<Response> }>()
export async function catalogFetch(url: string): Promise<Response> {
  if (!/^\/api\/(categories|products)(\?|$)/.test(url)) throw new Error("Not a public catalog endpoint")
  let entry = requests.get(url)
  if (!entry || entry.expires <= Date.now()) {
    requests.delete(url)
    if (requests.size >= 40) requests.delete(requests.keys().next().value!)
    const next = { expires: Date.now() + 30_000, response: Promise.resolve(null as unknown as Response) }
    next.response = fetch(url).then(response => {
      if (!response.ok && requests.get(url) === next) requests.delete(url)
      return response
    }).catch(error => {
      if (requests.get(url) === next) requests.delete(url)
      throw error
    })
    requests.set(url, next)
    entry = next
  }
  return (await entry.response).clone()
}
