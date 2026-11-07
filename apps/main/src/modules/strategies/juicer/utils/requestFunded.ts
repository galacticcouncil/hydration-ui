/**
 * funded vault shares a waiting withdrawal took beyond its wallet shares. the
 * escrow only holds wallet shares until the unwind starts and folds these in,
 * so this mirrors the yield accounting's startExit for the request's units
 */
export const requestFundedShares = ({
  units,
  requestEpoch,
  requestScale,
  epoch,
  unitScale,
  totalUnits,
  fund,
}: {
  units: bigint
  requestEpoch: bigint
  requestScale: bigint
  epoch: bigint
  unitScale: bigint
  totalUnits: bigint
  /** the yield accounting's own vault wallet */
  fund: bigint
}) => {
  // a write-off starts a new epoch and voids older units
  if (units === 0n || totalUnits === 0n || requestEpoch !== epoch) return 0n
  return (fund * (units >> (unitScale - requestScale))) / totalUnits
}
