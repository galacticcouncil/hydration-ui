export enum DataProviderStatus {
  HEALTHY = "healthy",
  LAGGING = "lagging",
  DEGRADED = "degraded",
  OFFLINE = "offline",
}

export type DataProviderStatusThreshold = {
  max: number
  status: DataProviderStatus
}

export function getDataProviderStatus(
  value: number | null,
  thresholds: DataProviderStatusThreshold[],
): DataProviderStatus {
  if (value === null) return DataProviderStatus.OFFLINE
  return (
    thresholds.find(({ max }) => value <= max)?.status ??
    DataProviderStatus.OFFLINE
  )
}
