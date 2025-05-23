type Action = "enable" | "switch" | "disable"

export const getAction = (selectedMode: number, activeMode: number) => {
  const action: Action = (() => {
    if (activeMode === 0) return "enable"
    if (selectedMode !== 0) return "switch"
    return "disable"
  })()

  return <T>(dataMap: Record<Action, T>): T => {
    return dataMap[action]
  }
}

export const getEmodeMessage = (label: string): string => {
  if (label === "") {
    return "Disabled"
  }
  return label
}
