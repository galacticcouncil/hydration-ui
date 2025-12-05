import loaderHtml from "./loader.html?raw"

export const Loader = () => {
  return <div dangerouslySetInnerHTML={{ __html: loaderHtml }} />
}
