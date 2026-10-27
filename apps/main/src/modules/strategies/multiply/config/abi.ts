// Looper — galacticcouncil/money-market@feat/looper, looper/src. Only the
// entries the UI reads or calls; struct field order follows ILooperPosition.

const PARAMS_COMPONENTS = [
  { name: "collateral", type: "address" },
  { name: "aCollateral", type: "address" },
  { name: "debt", type: "address" },
  { name: "variableDebt", type: "address" },
  { name: "feeAsset", type: "address" },
  { name: "debtAssetId", type: "uint32" },
  { name: "aCollateralAssetId", type: "uint32" },
  { name: "feeAssetId", type: "uint32" },
  { name: "eMode", type: "uint8" },
  { name: "slippageBps", type: "uint16" },
  { name: "leverage", type: "uint256" },
  { name: "minHf", type: "uint256" },
  { name: "stepHf", type: "uint256" },
  { name: "feeReserve", type: "uint256" },
  { name: "minIntentDebt", type: "uint256" },
  { name: "minIntentAToken", type: "uint256" },
] as const

const view = <const N extends string, const T extends string>(
  name: N,
  type: T,
) =>
  ({
    type: "function",
    name,
    inputs: [],
    outputs: [{ name: "", type }],
    stateMutability: "view",
  }) as const

export const LOOPER_FACTORY_ABI = [
  {
    type: "function",
    name: "open",
    inputs: [
      { name: "p", type: "tuple", components: PARAMS_COMPONENTS },
      { name: "amount", type: "uint256" },
      { name: "feeBudget", type: "uint256" },
    ],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "position", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "predict",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxLeverage",
    inputs: [
      { name: "collateral", type: "address" },
      { name: "eMode", type: "uint8" },
      { name: "minHf", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  view("nextId", "uint256"),
  {
    type: "event",
    name: "PositionCreated",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "position", type: "address", indexed: false },
    ],
  },
] as const

export const LOOPER_POSITION_ABI = [
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "close",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resume",
    inputs: [{ name: "intentId", type: "uint128" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "params",
    inputs: [],
    outputs: [{ name: "", type: "tuple", components: PARAMS_COMPONENTS }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pending",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "nonce", type: "uint64" },
          { name: "kind", type: "uint8" },
          { name: "amountIn", type: "uint128" },
          { name: "minOut", type: "uint128" },
          { name: "reconcileOut", type: "uint128" },
          { name: "submittedAt", type: "uint64" },
          { name: "deadline", type: "uint64" },
          { name: "inSnap", type: "uint256" },
          { name: "outSnap", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  view("ladder", "uint8"),
  view("stalled", "uint8"),
  view("closing", "bool"),
  view("isClosed", "bool"),
  view("nonce", "uint64"),
  view("request", "uint256"),
  view("principal", "uint256"),
  view("targetLeverage", "uint256"),
  view("aaveLeverage", "uint256"),
  view("effectiveHealthFactor", "uint256"),
  view("collateral", "uint256"),
  view("debt", "uint256"),
  view("nav", "uint256"),
  view("pnl", "int256"),
  {
    type: "event",
    name: "LadderStopped",
    inputs: [
      { name: "reason", type: "uint8", indexed: false },
      { name: "remainder", type: "uint256", indexed: false },
    ],
  },
] as const

// ILooperPosition enums, by ordinal.
export enum Ladder {
  None,
  Ramp,
  Unwind,
}

export enum Stall {
  None,
  AaveRefused,
  IntentRejected,
  IntentTooSmall,
  InsufficientHeadroom,
  TailUnfunded,
  Returned,
  Cancelled,
  FeeBudgetLow,
}
