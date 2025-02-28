export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const openUrl = (url: string, target = "_blank") => {
  window.open(url, target)
}
