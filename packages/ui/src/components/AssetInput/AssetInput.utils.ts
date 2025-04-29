export const formatAssetValue = (value?: string) => {
  if (value === undefined) return ""

  const parts = value.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")

  return parts.join(".")
}
