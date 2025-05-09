type BifrostAPY = {
  apy: string
  apyBase: string
  apyReward: string
}

export const fetchBifrostVDotApy = async () => {
  const res = await fetch("https://dapi.bifrost.io/api/site")
  const data = await res.json()
  return data["vDOT"] as BifrostAPY
}
