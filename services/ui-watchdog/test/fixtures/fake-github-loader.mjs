// Module resolve hook registered by ./fake-github-hook.mjs.
const fake = new URL("./fake-github.mjs", import.meta.url).href

export async function resolve(specifier, context, next) {
  const resolved = await next(specifier, context)
  return resolved.url.endsWith("/src/github.mjs")
    ? { ...resolved, url: fake }
    : resolved
}
