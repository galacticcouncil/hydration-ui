export const getDeployType = () => {
  const hostname = window.location.hostname

  if (hostname === "localhost") {
    return "localhost"
  } else if (hostname.includes("testnet-app")) {
    return "testnet"
  } else if (hostname.includes("paseo-app")) {
    return "paseo"
  } else if (hostname.includes("edge-app")) {
    return "edge"
  } else if (hostname.includes("hollarnet")) {
    return "hollarnet"
  } else if (hostname.includes("deploy-preview")) {
    return hostname.match(/--([^-\s]+)-/)?.[1]
  } else {
    return undefined
  }
}

export const getDeployPreviewId = () => {
  const hostname = window.location.hostname
  return hostname.match(/deploy-preview-(\d+)/)?.[1]
}
