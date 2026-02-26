const JITOEXPLORER_URL = "https://explorer.jito.wtf"
type JitoExplorerLinkPath = "bundle"

export const jitoexplorer = {
  link: (path: JitoExplorerLinkPath, data: string | number): string => {
    return `${JITOEXPLORER_URL}/${path}/${data}`
  },
  bundle: (bundleId: string) => {
    return jitoexplorer.link("bundle", bundleId)
  },
}
