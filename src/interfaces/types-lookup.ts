// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import "@polkadot/types/lookup"

import type { Data } from "@polkadot/types"
import type {
  BTreeMap,
  BTreeSet,
  Bytes,
  Compact,
  Enum,
  Null,
  Option,
  Result,
  Set,
  Struct,
  Text,
  U8aFixed,
  Vec,
  WrapperKeepOpaque,
  bool,
  i128,
  u128,
  u16,
  u32,
  u64,
  u8,
} from "@polkadot/types-codec"
import type { ITuple } from "@polkadot/types-codec/types"
import type { Vote } from "@polkadot/types/interfaces/elections"
import type {
  AccountId32,
  Call,
  H256,
  Perbill,
  Permill,
  Perquintill,
  WeightV1,
} from "@polkadot/types/interfaces/runtime"
import type { Event } from "@polkadot/types/interfaces/system"

declare module "@polkadot/types/lookup" {
  /** @name FrameSystemAccountInfo (3) */
  interface FrameSystemAccountInfo extends Struct {
    readonly nonce: u32
    readonly consumers: u32
    readonly providers: u32
    readonly sufficients: u32
    readonly data: PalletBalancesAccountData
  }

  /** @name PalletBalancesAccountData (5) */
  interface PalletBalancesAccountData extends Struct {
    readonly free: u128
    readonly reserved: u128
    readonly miscFrozen: u128
    readonly feeFrozen: u128
  }

  /** @name FrameSupportWeightsPerDispatchClassWeight (7) */
  interface FrameSupportWeightsPerDispatchClassWeight extends Struct {
    readonly normal: WeightV1
    readonly operational: WeightV1
    readonly mandatory: WeightV1
  }

  /** @name SpRuntimeDigest (12) */
  interface SpRuntimeDigest extends Struct {
    readonly logs: Vec<SpRuntimeDigestDigestItem>
  }

  /** @name SpRuntimeDigestDigestItem (14) */
  interface SpRuntimeDigestDigestItem extends Enum {
    readonly isOther: boolean
    readonly asOther: Bytes
    readonly isConsensus: boolean
    readonly asConsensus: ITuple<[U8aFixed, Bytes]>
    readonly isSeal: boolean
    readonly asSeal: ITuple<[U8aFixed, Bytes]>
    readonly isPreRuntime: boolean
    readonly asPreRuntime: ITuple<[U8aFixed, Bytes]>
    readonly isRuntimeEnvironmentUpdated: boolean
    readonly type:
      | "Other"
      | "Consensus"
      | "Seal"
      | "PreRuntime"
      | "RuntimeEnvironmentUpdated"
  }

  /** @name FrameSystemEventRecord (17) */
  interface FrameSystemEventRecord extends Struct {
    readonly phase: FrameSystemPhase
    readonly event: Event
    readonly topics: Vec<H256>
  }

  /** @name FrameSystemEvent (19) */
  interface FrameSystemEvent extends Enum {
    readonly isExtrinsicSuccess: boolean
    readonly asExtrinsicSuccess: {
      readonly dispatchInfo: FrameSupportWeightsDispatchInfo
    } & Struct
    readonly isExtrinsicFailed: boolean
    readonly asExtrinsicFailed: {
      readonly dispatchError: SpRuntimeDispatchError
      readonly dispatchInfo: FrameSupportWeightsDispatchInfo
    } & Struct
    readonly isCodeUpdated: boolean
    readonly isNewAccount: boolean
    readonly asNewAccount: {
      readonly account: AccountId32
    } & Struct
    readonly isKilledAccount: boolean
    readonly asKilledAccount: {
      readonly account: AccountId32
    } & Struct
    readonly isRemarked: boolean
    readonly asRemarked: {
      readonly sender: AccountId32
      readonly hash_: H256
    } & Struct
    readonly type:
      | "ExtrinsicSuccess"
      | "ExtrinsicFailed"
      | "CodeUpdated"
      | "NewAccount"
      | "KilledAccount"
      | "Remarked"
  }

  /** @name FrameSupportWeightsDispatchInfo (20) */
  interface FrameSupportWeightsDispatchInfo extends Struct {
    readonly weight: WeightV1
    readonly class: FrameSupportWeightsDispatchClass
    readonly paysFee: FrameSupportWeightsPays
  }

  /** @name FrameSupportWeightsDispatchClass (21) */
  interface FrameSupportWeightsDispatchClass extends Enum {
    readonly isNormal: boolean
    readonly isOperational: boolean
    readonly isMandatory: boolean
    readonly type: "Normal" | "Operational" | "Mandatory"
  }

  /** @name FrameSupportWeightsPays (22) */
  interface FrameSupportWeightsPays extends Enum {
    readonly isYes: boolean
    readonly isNo: boolean
    readonly type: "Yes" | "No"
  }

  /** @name SpRuntimeDispatchError (23) */
  interface SpRuntimeDispatchError extends Enum {
    readonly isOther: boolean
    readonly isCannotLookup: boolean
    readonly isBadOrigin: boolean
    readonly isModule: boolean
    readonly asModule: SpRuntimeModuleError
    readonly isConsumerRemaining: boolean
    readonly isNoProviders: boolean
    readonly isTooManyConsumers: boolean
    readonly isToken: boolean
    readonly asToken: SpRuntimeTokenError
    readonly isArithmetic: boolean
    readonly asArithmetic: SpRuntimeArithmeticError
    readonly isTransactional: boolean
    readonly asTransactional: SpRuntimeTransactionalError
    readonly type:
      | "Other"
      | "CannotLookup"
      | "BadOrigin"
      | "Module"
      | "ConsumerRemaining"
      | "NoProviders"
      | "TooManyConsumers"
      | "Token"
      | "Arithmetic"
      | "Transactional"
  }

  /** @name SpRuntimeModuleError (24) */
  interface SpRuntimeModuleError extends Struct {
    readonly index: u8
    readonly error: U8aFixed
  }

  /** @name SpRuntimeTokenError (25) */
  interface SpRuntimeTokenError extends Enum {
    readonly isNoFunds: boolean
    readonly isWouldDie: boolean
    readonly isBelowMinimum: boolean
    readonly isCannotCreate: boolean
    readonly isUnknownAsset: boolean
    readonly isFrozen: boolean
    readonly isUnsupported: boolean
    readonly type:
      | "NoFunds"
      | "WouldDie"
      | "BelowMinimum"
      | "CannotCreate"
      | "UnknownAsset"
      | "Frozen"
      | "Unsupported"
  }

  /** @name SpRuntimeArithmeticError (26) */
  interface SpRuntimeArithmeticError extends Enum {
    readonly isUnderflow: boolean
    readonly isOverflow: boolean
    readonly isDivisionByZero: boolean
    readonly type: "Underflow" | "Overflow" | "DivisionByZero"
  }

  /** @name SpRuntimeTransactionalError (27) */
  interface SpRuntimeTransactionalError extends Enum {
    readonly isLimitReached: boolean
    readonly isNoLayer: boolean
    readonly type: "LimitReached" | "NoLayer"
  }

  /** @name PalletBalancesEvent (28) */
  interface PalletBalancesEvent extends Enum {
    readonly isEndowed: boolean
    readonly asEndowed: {
      readonly account: AccountId32
      readonly freeBalance: u128
    } & Struct
    readonly isDustLost: boolean
    readonly asDustLost: {
      readonly account: AccountId32
      readonly amount: u128
    } & Struct
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly from: AccountId32
      readonly to: AccountId32
      readonly amount: u128
    } & Struct
    readonly isBalanceSet: boolean
    readonly asBalanceSet: {
      readonly who: AccountId32
      readonly free: u128
      readonly reserved: u128
    } & Struct
    readonly isReserved: boolean
    readonly asReserved: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isUnreserved: boolean
    readonly asUnreserved: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isReserveRepatriated: boolean
    readonly asReserveRepatriated: {
      readonly from: AccountId32
      readonly to: AccountId32
      readonly amount: u128
      readonly destinationStatus: FrameSupportTokensMiscBalanceStatus
    } & Struct
    readonly isDeposit: boolean
    readonly asDeposit: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isWithdraw: boolean
    readonly asWithdraw: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isSlashed: boolean
    readonly asSlashed: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly type:
      | "Endowed"
      | "DustLost"
      | "Transfer"
      | "BalanceSet"
      | "Reserved"
      | "Unreserved"
      | "ReserveRepatriated"
      | "Deposit"
      | "Withdraw"
      | "Slashed"
  }

  /** @name FrameSupportTokensMiscBalanceStatus (29) */
  interface FrameSupportTokensMiscBalanceStatus extends Enum {
    readonly isFree: boolean
    readonly isReserved: boolean
    readonly type: "Free" | "Reserved"
  }

  /** @name PalletTransactionPaymentEvent (30) */
  interface PalletTransactionPaymentEvent extends Enum {
    readonly isTransactionFeePaid: boolean
    readonly asTransactionFeePaid: {
      readonly who: AccountId32
      readonly actualFee: u128
      readonly tip: u128
    } & Struct
    readonly type: "TransactionFeePaid"
  }

  /** @name PalletTreasuryEvent (31) */
  interface PalletTreasuryEvent extends Enum {
    readonly isProposed: boolean
    readonly asProposed: {
      readonly proposalIndex: u32
    } & Struct
    readonly isSpending: boolean
    readonly asSpending: {
      readonly budgetRemaining: u128
    } & Struct
    readonly isAwarded: boolean
    readonly asAwarded: {
      readonly proposalIndex: u32
      readonly award: u128
      readonly account: AccountId32
    } & Struct
    readonly isRejected: boolean
    readonly asRejected: {
      readonly proposalIndex: u32
      readonly slashed: u128
    } & Struct
    readonly isBurnt: boolean
    readonly asBurnt: {
      readonly burntFunds: u128
    } & Struct
    readonly isRollover: boolean
    readonly asRollover: {
      readonly rolloverBalance: u128
    } & Struct
    readonly isDeposit: boolean
    readonly asDeposit: {
      readonly value: u128
    } & Struct
    readonly isSpendApproved: boolean
    readonly asSpendApproved: {
      readonly proposalIndex: u32
      readonly amount: u128
      readonly beneficiary: AccountId32
    } & Struct
    readonly type:
      | "Proposed"
      | "Spending"
      | "Awarded"
      | "Rejected"
      | "Burnt"
      | "Rollover"
      | "Deposit"
      | "SpendApproved"
  }

  /** @name PalletUtilityEvent (32) */
  interface PalletUtilityEvent extends Enum {
    readonly isBatchInterrupted: boolean
    readonly asBatchInterrupted: {
      readonly index: u32
      readonly error: SpRuntimeDispatchError
    } & Struct
    readonly isBatchCompleted: boolean
    readonly isBatchCompletedWithErrors: boolean
    readonly isItemCompleted: boolean
    readonly isItemFailed: boolean
    readonly asItemFailed: {
      readonly error: SpRuntimeDispatchError
    } & Struct
    readonly isDispatchedAs: boolean
    readonly asDispatchedAs: {
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly type:
      | "BatchInterrupted"
      | "BatchCompleted"
      | "BatchCompletedWithErrors"
      | "ItemCompleted"
      | "ItemFailed"
      | "DispatchedAs"
  }

  /** @name PalletPreimageEvent (35) */
  interface PalletPreimageEvent extends Enum {
    readonly isNoted: boolean
    readonly asNoted: {
      readonly hash_: H256
    } & Struct
    readonly isRequested: boolean
    readonly asRequested: {
      readonly hash_: H256
    } & Struct
    readonly isCleared: boolean
    readonly asCleared: {
      readonly hash_: H256
    } & Struct
    readonly type: "Noted" | "Requested" | "Cleared"
  }

  /** @name PalletIdentityEvent (36) */
  interface PalletIdentityEvent extends Enum {
    readonly isIdentitySet: boolean
    readonly asIdentitySet: {
      readonly who: AccountId32
    } & Struct
    readonly isIdentityCleared: boolean
    readonly asIdentityCleared: {
      readonly who: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isIdentityKilled: boolean
    readonly asIdentityKilled: {
      readonly who: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isJudgementRequested: boolean
    readonly asJudgementRequested: {
      readonly who: AccountId32
      readonly registrarIndex: u32
    } & Struct
    readonly isJudgementUnrequested: boolean
    readonly asJudgementUnrequested: {
      readonly who: AccountId32
      readonly registrarIndex: u32
    } & Struct
    readonly isJudgementGiven: boolean
    readonly asJudgementGiven: {
      readonly target: AccountId32
      readonly registrarIndex: u32
    } & Struct
    readonly isRegistrarAdded: boolean
    readonly asRegistrarAdded: {
      readonly registrarIndex: u32
    } & Struct
    readonly isSubIdentityAdded: boolean
    readonly asSubIdentityAdded: {
      readonly sub: AccountId32
      readonly main: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isSubIdentityRemoved: boolean
    readonly asSubIdentityRemoved: {
      readonly sub: AccountId32
      readonly main: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isSubIdentityRevoked: boolean
    readonly asSubIdentityRevoked: {
      readonly sub: AccountId32
      readonly main: AccountId32
      readonly deposit: u128
    } & Struct
    readonly type:
      | "IdentitySet"
      | "IdentityCleared"
      | "IdentityKilled"
      | "JudgementRequested"
      | "JudgementUnrequested"
      | "JudgementGiven"
      | "RegistrarAdded"
      | "SubIdentityAdded"
      | "SubIdentityRemoved"
      | "SubIdentityRevoked"
  }

  /** @name PalletDemocracyEvent (37) */
  interface PalletDemocracyEvent extends Enum {
    readonly isProposed: boolean
    readonly asProposed: {
      readonly proposalIndex: u32
      readonly deposit: u128
    } & Struct
    readonly isTabled: boolean
    readonly asTabled: {
      readonly proposalIndex: u32
      readonly deposit: u128
      readonly depositors: Vec<AccountId32>
    } & Struct
    readonly isExternalTabled: boolean
    readonly isStarted: boolean
    readonly asStarted: {
      readonly refIndex: u32
      readonly threshold: PalletDemocracyVoteThreshold
    } & Struct
    readonly isPassed: boolean
    readonly asPassed: {
      readonly refIndex: u32
    } & Struct
    readonly isNotPassed: boolean
    readonly asNotPassed: {
      readonly refIndex: u32
    } & Struct
    readonly isCancelled: boolean
    readonly asCancelled: {
      readonly refIndex: u32
    } & Struct
    readonly isExecuted: boolean
    readonly asExecuted: {
      readonly refIndex: u32
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly isDelegated: boolean
    readonly asDelegated: {
      readonly who: AccountId32
      readonly target: AccountId32
    } & Struct
    readonly isUndelegated: boolean
    readonly asUndelegated: {
      readonly account: AccountId32
    } & Struct
    readonly isVetoed: boolean
    readonly asVetoed: {
      readonly who: AccountId32
      readonly proposalHash: H256
      readonly until: u32
    } & Struct
    readonly isPreimageNoted: boolean
    readonly asPreimageNoted: {
      readonly proposalHash: H256
      readonly who: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isPreimageUsed: boolean
    readonly asPreimageUsed: {
      readonly proposalHash: H256
      readonly provider: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isPreimageInvalid: boolean
    readonly asPreimageInvalid: {
      readonly proposalHash: H256
      readonly refIndex: u32
    } & Struct
    readonly isPreimageMissing: boolean
    readonly asPreimageMissing: {
      readonly proposalHash: H256
      readonly refIndex: u32
    } & Struct
    readonly isPreimageReaped: boolean
    readonly asPreimageReaped: {
      readonly proposalHash: H256
      readonly provider: AccountId32
      readonly deposit: u128
      readonly reaper: AccountId32
    } & Struct
    readonly isBlacklisted: boolean
    readonly asBlacklisted: {
      readonly proposalHash: H256
    } & Struct
    readonly isVoted: boolean
    readonly asVoted: {
      readonly voter: AccountId32
      readonly refIndex: u32
      readonly vote: PalletDemocracyVoteAccountVote
    } & Struct
    readonly isSeconded: boolean
    readonly asSeconded: {
      readonly seconder: AccountId32
      readonly propIndex: u32
    } & Struct
    readonly isProposalCanceled: boolean
    readonly asProposalCanceled: {
      readonly propIndex: u32
    } & Struct
    readonly type:
      | "Proposed"
      | "Tabled"
      | "ExternalTabled"
      | "Started"
      | "Passed"
      | "NotPassed"
      | "Cancelled"
      | "Executed"
      | "Delegated"
      | "Undelegated"
      | "Vetoed"
      | "PreimageNoted"
      | "PreimageUsed"
      | "PreimageInvalid"
      | "PreimageMissing"
      | "PreimageReaped"
      | "Blacklisted"
      | "Voted"
      | "Seconded"
      | "ProposalCanceled"
  }

  /** @name PalletDemocracyVoteThreshold (39) */
  interface PalletDemocracyVoteThreshold extends Enum {
    readonly isSuperMajorityApprove: boolean
    readonly isSuperMajorityAgainst: boolean
    readonly isSimpleMajority: boolean
    readonly type:
      | "SuperMajorityApprove"
      | "SuperMajorityAgainst"
      | "SimpleMajority"
  }

  /** @name PalletDemocracyVoteAccountVote (40) */
  interface PalletDemocracyVoteAccountVote extends Enum {
    readonly isStandard: boolean
    readonly asStandard: {
      readonly vote: Vote
      readonly balance: u128
    } & Struct
    readonly isSplit: boolean
    readonly asSplit: {
      readonly aye: u128
      readonly nay: u128
    } & Struct
    readonly type: "Standard" | "Split"
  }

  /** @name PalletElectionsPhragmenEvent (42) */
  interface PalletElectionsPhragmenEvent extends Enum {
    readonly isNewTerm: boolean
    readonly asNewTerm: {
      readonly newMembers: Vec<ITuple<[AccountId32, u128]>>
    } & Struct
    readonly isEmptyTerm: boolean
    readonly isElectionError: boolean
    readonly isMemberKicked: boolean
    readonly asMemberKicked: {
      readonly member: AccountId32
    } & Struct
    readonly isRenounced: boolean
    readonly asRenounced: {
      readonly candidate: AccountId32
    } & Struct
    readonly isCandidateSlashed: boolean
    readonly asCandidateSlashed: {
      readonly candidate: AccountId32
      readonly amount: u128
    } & Struct
    readonly isSeatHolderSlashed: boolean
    readonly asSeatHolderSlashed: {
      readonly seatHolder: AccountId32
      readonly amount: u128
    } & Struct
    readonly type:
      | "NewTerm"
      | "EmptyTerm"
      | "ElectionError"
      | "MemberKicked"
      | "Renounced"
      | "CandidateSlashed"
      | "SeatHolderSlashed"
  }

  /** @name PalletCollectiveEvent (45) */
  interface PalletCollectiveEvent extends Enum {
    readonly isProposed: boolean
    readonly asProposed: {
      readonly account: AccountId32
      readonly proposalIndex: u32
      readonly proposalHash: H256
      readonly threshold: u32
    } & Struct
    readonly isVoted: boolean
    readonly asVoted: {
      readonly account: AccountId32
      readonly proposalHash: H256
      readonly voted: bool
      readonly yes: u32
      readonly no: u32
    } & Struct
    readonly isApproved: boolean
    readonly asApproved: {
      readonly proposalHash: H256
    } & Struct
    readonly isDisapproved: boolean
    readonly asDisapproved: {
      readonly proposalHash: H256
    } & Struct
    readonly isExecuted: boolean
    readonly asExecuted: {
      readonly proposalHash: H256
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly isMemberExecuted: boolean
    readonly asMemberExecuted: {
      readonly proposalHash: H256
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly isClosed: boolean
    readonly asClosed: {
      readonly proposalHash: H256
      readonly yes: u32
      readonly no: u32
    } & Struct
    readonly type:
      | "Proposed"
      | "Voted"
      | "Approved"
      | "Disapproved"
      | "Executed"
      | "MemberExecuted"
      | "Closed"
  }

  /** @name PalletTipsEvent (48) */
  interface PalletTipsEvent extends Enum {
    readonly isNewTip: boolean
    readonly asNewTip: {
      readonly tipHash: H256
    } & Struct
    readonly isTipClosing: boolean
    readonly asTipClosing: {
      readonly tipHash: H256
    } & Struct
    readonly isTipClosed: boolean
    readonly asTipClosed: {
      readonly tipHash: H256
      readonly who: AccountId32
      readonly payout: u128
    } & Struct
    readonly isTipRetracted: boolean
    readonly asTipRetracted: {
      readonly tipHash: H256
    } & Struct
    readonly isTipSlashed: boolean
    readonly asTipSlashed: {
      readonly tipHash: H256
      readonly finder: AccountId32
      readonly deposit: u128
    } & Struct
    readonly type:
      | "NewTip"
      | "TipClosing"
      | "TipClosed"
      | "TipRetracted"
      | "TipSlashed"
  }

  /** @name PalletProxyEvent (49) */
  interface PalletProxyEvent extends Enum {
    readonly isProxyExecuted: boolean
    readonly asProxyExecuted: {
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly isAnonymousCreated: boolean
    readonly asAnonymousCreated: {
      readonly anonymous: AccountId32
      readonly who: AccountId32
      readonly proxyType: CommonRuntimeProxyType
      readonly disambiguationIndex: u16
    } & Struct
    readonly isAnnounced: boolean
    readonly asAnnounced: {
      readonly real: AccountId32
      readonly proxy: AccountId32
      readonly callHash: H256
    } & Struct
    readonly isProxyAdded: boolean
    readonly asProxyAdded: {
      readonly delegator: AccountId32
      readonly delegatee: AccountId32
      readonly proxyType: CommonRuntimeProxyType
      readonly delay: u32
    } & Struct
    readonly isProxyRemoved: boolean
    readonly asProxyRemoved: {
      readonly delegator: AccountId32
      readonly delegatee: AccountId32
      readonly proxyType: CommonRuntimeProxyType
      readonly delay: u32
    } & Struct
    readonly type:
      | "ProxyExecuted"
      | "AnonymousCreated"
      | "Announced"
      | "ProxyAdded"
      | "ProxyRemoved"
  }

  /** @name CommonRuntimeProxyType (50) */
  interface CommonRuntimeProxyType extends Enum {
    readonly isAny: boolean
    readonly isCancelProxy: boolean
    readonly isGovernance: boolean
    readonly isTransfer: boolean
    readonly type: "Any" | "CancelProxy" | "Governance" | "Transfer"
  }

  /** @name PalletMultisigEvent (52) */
  interface PalletMultisigEvent extends Enum {
    readonly isNewMultisig: boolean
    readonly asNewMultisig: {
      readonly approving: AccountId32
      readonly multisig: AccountId32
      readonly callHash: U8aFixed
    } & Struct
    readonly isMultisigApproval: boolean
    readonly asMultisigApproval: {
      readonly approving: AccountId32
      readonly timepoint: PalletMultisigTimepoint
      readonly multisig: AccountId32
      readonly callHash: U8aFixed
    } & Struct
    readonly isMultisigExecuted: boolean
    readonly asMultisigExecuted: {
      readonly approving: AccountId32
      readonly timepoint: PalletMultisigTimepoint
      readonly multisig: AccountId32
      readonly callHash: U8aFixed
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly isMultisigCancelled: boolean
    readonly asMultisigCancelled: {
      readonly cancelling: AccountId32
      readonly timepoint: PalletMultisigTimepoint
      readonly multisig: AccountId32
      readonly callHash: U8aFixed
    } & Struct
    readonly type:
      | "NewMultisig"
      | "MultisigApproval"
      | "MultisigExecuted"
      | "MultisigCancelled"
  }

  /** @name PalletMultisigTimepoint (53) */
  interface PalletMultisigTimepoint extends Struct {
    readonly height: u32
    readonly index: u32
  }

  /** @name PalletUniquesEvent (54) */
  interface PalletUniquesEvent extends Enum {
    readonly isCreated: boolean
    readonly asCreated: {
      readonly collection: u128
      readonly creator: AccountId32
      readonly owner: AccountId32
    } & Struct
    readonly isForceCreated: boolean
    readonly asForceCreated: {
      readonly collection: u128
      readonly owner: AccountId32
    } & Struct
    readonly isDestroyed: boolean
    readonly asDestroyed: {
      readonly collection: u128
    } & Struct
    readonly isIssued: boolean
    readonly asIssued: {
      readonly collection: u128
      readonly item: u128
      readonly owner: AccountId32
    } & Struct
    readonly isTransferred: boolean
    readonly asTransferred: {
      readonly collection: u128
      readonly item: u128
      readonly from: AccountId32
      readonly to: AccountId32
    } & Struct
    readonly isBurned: boolean
    readonly asBurned: {
      readonly collection: u128
      readonly item: u128
      readonly owner: AccountId32
    } & Struct
    readonly isFrozen: boolean
    readonly asFrozen: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isThawed: boolean
    readonly asThawed: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isCollectionFrozen: boolean
    readonly asCollectionFrozen: {
      readonly collection: u128
    } & Struct
    readonly isCollectionThawed: boolean
    readonly asCollectionThawed: {
      readonly collection: u128
    } & Struct
    readonly isOwnerChanged: boolean
    readonly asOwnerChanged: {
      readonly collection: u128
      readonly newOwner: AccountId32
    } & Struct
    readonly isTeamChanged: boolean
    readonly asTeamChanged: {
      readonly collection: u128
      readonly issuer: AccountId32
      readonly admin: AccountId32
      readonly freezer: AccountId32
    } & Struct
    readonly isApprovedTransfer: boolean
    readonly asApprovedTransfer: {
      readonly collection: u128
      readonly item: u128
      readonly owner: AccountId32
      readonly delegate: AccountId32
    } & Struct
    readonly isApprovalCancelled: boolean
    readonly asApprovalCancelled: {
      readonly collection: u128
      readonly item: u128
      readonly owner: AccountId32
      readonly delegate: AccountId32
    } & Struct
    readonly isItemStatusChanged: boolean
    readonly asItemStatusChanged: {
      readonly collection: u128
    } & Struct
    readonly isCollectionMetadataSet: boolean
    readonly asCollectionMetadataSet: {
      readonly collection: u128
      readonly data: Bytes
      readonly isFrozen: bool
    } & Struct
    readonly isCollectionMetadataCleared: boolean
    readonly asCollectionMetadataCleared: {
      readonly collection: u128
    } & Struct
    readonly isMetadataSet: boolean
    readonly asMetadataSet: {
      readonly collection: u128
      readonly item: u128
      readonly data: Bytes
      readonly isFrozen: bool
    } & Struct
    readonly isMetadataCleared: boolean
    readonly asMetadataCleared: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isRedeposited: boolean
    readonly asRedeposited: {
      readonly collection: u128
      readonly successfulItems: Vec<u128>
    } & Struct
    readonly isAttributeSet: boolean
    readonly asAttributeSet: {
      readonly collection: u128
      readonly maybeItem: Option<u128>
      readonly key: Bytes
      readonly value: Bytes
    } & Struct
    readonly isAttributeCleared: boolean
    readonly asAttributeCleared: {
      readonly collection: u128
      readonly maybeItem: Option<u128>
      readonly key: Bytes
    } & Struct
    readonly isOwnershipAcceptanceChanged: boolean
    readonly asOwnershipAcceptanceChanged: {
      readonly who: AccountId32
      readonly maybeCollection: Option<u128>
    } & Struct
    readonly isCollectionMaxSupplySet: boolean
    readonly asCollectionMaxSupplySet: {
      readonly collection: u128
      readonly maxSupply: u32
    } & Struct
    readonly isItemPriceSet: boolean
    readonly asItemPriceSet: {
      readonly collection: u128
      readonly item: u128
      readonly price: u128
      readonly whitelistedBuyer: Option<AccountId32>
    } & Struct
    readonly isItemPriceRemoved: boolean
    readonly asItemPriceRemoved: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isItemBought: boolean
    readonly asItemBought: {
      readonly collection: u128
      readonly item: u128
      readonly price: u128
      readonly seller: AccountId32
      readonly buyer: AccountId32
    } & Struct
    readonly type:
      | "Created"
      | "ForceCreated"
      | "Destroyed"
      | "Issued"
      | "Transferred"
      | "Burned"
      | "Frozen"
      | "Thawed"
      | "CollectionFrozen"
      | "CollectionThawed"
      | "OwnerChanged"
      | "TeamChanged"
      | "ApprovedTransfer"
      | "ApprovalCancelled"
      | "ItemStatusChanged"
      | "CollectionMetadataSet"
      | "CollectionMetadataCleared"
      | "MetadataSet"
      | "MetadataCleared"
      | "Redeposited"
      | "AttributeSet"
      | "AttributeCleared"
      | "OwnershipAcceptanceChanged"
      | "CollectionMaxSupplySet"
      | "ItemPriceSet"
      | "ItemPriceRemoved"
      | "ItemBought"
  }

  /** @name PalletAssetRegistryEvent (61) */
  interface PalletAssetRegistryEvent extends Enum {
    readonly isRegistered: boolean
    readonly asRegistered: {
      readonly assetId: u32
      readonly assetName: Bytes
      readonly assetType: PalletAssetRegistryAssetType
    } & Struct
    readonly isUpdated: boolean
    readonly asUpdated: {
      readonly assetId: u32
      readonly assetName: Bytes
      readonly assetType: PalletAssetRegistryAssetType
    } & Struct
    readonly isMetadataSet: boolean
    readonly asMetadataSet: {
      readonly assetId: u32
      readonly symbol: Bytes
      readonly decimals: u8
    } & Struct
    readonly isLocationSet: boolean
    readonly asLocationSet: {
      readonly assetId: u32
      readonly location: HydradxRuntimeAssetLocation
    } & Struct
    readonly type: "Registered" | "Updated" | "MetadataSet" | "LocationSet"
  }

  /** @name PalletAssetRegistryAssetType (63) */
  interface PalletAssetRegistryAssetType extends Enum {
    readonly isToken: boolean
    readonly isPoolShare: boolean
    readonly asPoolShare: ITuple<[u32, u32]>
    readonly type: "Token" | "PoolShare"
  }

  /** @name HydradxRuntimeAssetLocation (64) */
  interface HydradxRuntimeAssetLocation extends XcmV1MultiLocation {}

  /** @name XcmV1MultiLocation (65) */
  interface XcmV1MultiLocation extends Struct {
    readonly parents: u8
    readonly interior: XcmV1MultilocationJunctions
  }

  /** @name XcmV1MultilocationJunctions (66) */
  interface XcmV1MultilocationJunctions extends Enum {
    readonly isHere: boolean
    readonly isX1: boolean
    readonly asX1: XcmV1Junction
    readonly isX2: boolean
    readonly asX2: ITuple<[XcmV1Junction, XcmV1Junction]>
    readonly isX3: boolean
    readonly asX3: ITuple<[XcmV1Junction, XcmV1Junction, XcmV1Junction]>
    readonly isX4: boolean
    readonly asX4: ITuple<
      [XcmV1Junction, XcmV1Junction, XcmV1Junction, XcmV1Junction]
    >
    readonly isX5: boolean
    readonly asX5: ITuple<
      [
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
      ]
    >
    readonly isX6: boolean
    readonly asX6: ITuple<
      [
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
      ]
    >
    readonly isX7: boolean
    readonly asX7: ITuple<
      [
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
      ]
    >
    readonly isX8: boolean
    readonly asX8: ITuple<
      [
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
        XcmV1Junction,
      ]
    >
    readonly type:
      | "Here"
      | "X1"
      | "X2"
      | "X3"
      | "X4"
      | "X5"
      | "X6"
      | "X7"
      | "X8"
  }

  /** @name XcmV1Junction (67) */
  interface XcmV1Junction extends Enum {
    readonly isParachain: boolean
    readonly asParachain: Compact<u32>
    readonly isAccountId32: boolean
    readonly asAccountId32: {
      readonly network: XcmV0JunctionNetworkId
      readonly id: U8aFixed
    } & Struct
    readonly isAccountIndex64: boolean
    readonly asAccountIndex64: {
      readonly network: XcmV0JunctionNetworkId
      readonly index: Compact<u64>
    } & Struct
    readonly isAccountKey20: boolean
    readonly asAccountKey20: {
      readonly network: XcmV0JunctionNetworkId
      readonly key: U8aFixed
    } & Struct
    readonly isPalletInstance: boolean
    readonly asPalletInstance: u8
    readonly isGeneralIndex: boolean
    readonly asGeneralIndex: Compact<u128>
    readonly isGeneralKey: boolean
    readonly asGeneralKey: Bytes
    readonly isOnlyChild: boolean
    readonly isPlurality: boolean
    readonly asPlurality: {
      readonly id: XcmV0JunctionBodyId
      readonly part: XcmV0JunctionBodyPart
    } & Struct
    readonly type:
      | "Parachain"
      | "AccountId32"
      | "AccountIndex64"
      | "AccountKey20"
      | "PalletInstance"
      | "GeneralIndex"
      | "GeneralKey"
      | "OnlyChild"
      | "Plurality"
  }

  /** @name XcmV0JunctionNetworkId (69) */
  interface XcmV0JunctionNetworkId extends Enum {
    readonly isAny: boolean
    readonly isNamed: boolean
    readonly asNamed: Bytes
    readonly isPolkadot: boolean
    readonly isKusama: boolean
    readonly type: "Any" | "Named" | "Polkadot" | "Kusama"
  }

  /** @name XcmV0JunctionBodyId (74) */
  interface XcmV0JunctionBodyId extends Enum {
    readonly isUnit: boolean
    readonly isNamed: boolean
    readonly asNamed: Bytes
    readonly isIndex: boolean
    readonly asIndex: Compact<u32>
    readonly isExecutive: boolean
    readonly isTechnical: boolean
    readonly isLegislative: boolean
    readonly isJudicial: boolean
    readonly type:
      | "Unit"
      | "Named"
      | "Index"
      | "Executive"
      | "Technical"
      | "Legislative"
      | "Judicial"
  }

  /** @name XcmV0JunctionBodyPart (75) */
  interface XcmV0JunctionBodyPart extends Enum {
    readonly isVoice: boolean
    readonly isMembers: boolean
    readonly asMembers: {
      readonly count: Compact<u32>
    } & Struct
    readonly isFraction: boolean
    readonly asFraction: {
      readonly nom: Compact<u32>
      readonly denom: Compact<u32>
    } & Struct
    readonly isAtLeastProportion: boolean
    readonly asAtLeastProportion: {
      readonly nom: Compact<u32>
      readonly denom: Compact<u32>
    } & Struct
    readonly isMoreThanProportion: boolean
    readonly asMoreThanProportion: {
      readonly nom: Compact<u32>
      readonly denom: Compact<u32>
    } & Struct
    readonly type:
      | "Voice"
      | "Members"
      | "Fraction"
      | "AtLeastProportion"
      | "MoreThanProportion"
  }

  /** @name PalletClaimsEvent (76) */
  interface PalletClaimsEvent extends Enum {
    readonly isClaim: boolean
    readonly asClaim: ITuple<[AccountId32, PalletClaimsEthereumAddress, u128]>
    readonly type: "Claim"
  }

  /** @name PalletClaimsEthereumAddress (77) */
  interface PalletClaimsEthereumAddress extends U8aFixed {}

  /** @name PalletCollatorRewardsEvent (78) */
  interface PalletCollatorRewardsEvent extends Enum {
    readonly isCollatorRewarded: boolean
    readonly asCollatorRewarded: {
      readonly who: AccountId32
      readonly amount: u128
      readonly currency: u32
    } & Struct
    readonly type: "CollatorRewarded"
  }

  /** @name PalletOmnipoolEvent (79) */
  interface PalletOmnipoolEvent extends Enum {
    readonly isTokenAdded: boolean
    readonly asTokenAdded: {
      readonly assetId: u32
      readonly initialAmount: u128
      readonly initialPrice: u128
    } & Struct
    readonly isLiquidityAdded: boolean
    readonly asLiquidityAdded: {
      readonly who: AccountId32
      readonly assetId: u32
      readonly amount: u128
      readonly positionId: u128
    } & Struct
    readonly isLiquidityRemoved: boolean
    readonly asLiquidityRemoved: {
      readonly who: AccountId32
      readonly positionId: u128
      readonly assetId: u32
      readonly sharesRemoved: u128
    } & Struct
    readonly isSellExecuted: boolean
    readonly asSellExecuted: {
      readonly who: AccountId32
      readonly assetIn: u32
      readonly assetOut: u32
      readonly amountIn: u128
      readonly amountOut: u128
    } & Struct
    readonly isBuyExecuted: boolean
    readonly asBuyExecuted: {
      readonly who: AccountId32
      readonly assetIn: u32
      readonly assetOut: u32
      readonly amountIn: u128
      readonly amountOut: u128
    } & Struct
    readonly isPositionCreated: boolean
    readonly asPositionCreated: {
      readonly positionId: u128
      readonly owner: AccountId32
      readonly asset: u32
      readonly amount: u128
      readonly shares: u128
      readonly price: u128
    } & Struct
    readonly isPositionDestroyed: boolean
    readonly asPositionDestroyed: {
      readonly positionId: u128
      readonly owner: AccountId32
    } & Struct
    readonly isPositionUpdated: boolean
    readonly asPositionUpdated: {
      readonly positionId: u128
      readonly owner: AccountId32
      readonly asset: u32
      readonly amount: u128
      readonly shares: u128
      readonly price: u128
    } & Struct
    readonly isTradableStateUpdated: boolean
    readonly asTradableStateUpdated: {
      readonly assetId: u32
      readonly state: PalletOmnipoolTradability
    } & Struct
    readonly isAssetRefunded: boolean
    readonly asAssetRefunded: {
      readonly assetId: u32
      readonly amount: u128
      readonly recipient: AccountId32
    } & Struct
    readonly isAssetWeightCapUpdated: boolean
    readonly asAssetWeightCapUpdated: {
      readonly assetId: u32
      readonly cap: Permill
    } & Struct
    readonly isTvlCapUpdated: boolean
    readonly asTvlCapUpdated: {
      readonly cap: u128
    } & Struct
    readonly type:
      | "TokenAdded"
      | "LiquidityAdded"
      | "LiquidityRemoved"
      | "SellExecuted"
      | "BuyExecuted"
      | "PositionCreated"
      | "PositionDestroyed"
      | "PositionUpdated"
      | "TradableStateUpdated"
      | "AssetRefunded"
      | "AssetWeightCapUpdated"
      | "TvlCapUpdated"
  }

  /** @name PalletOmnipoolTradability (81) */
  interface PalletOmnipoolTradability extends Struct {
    readonly bits: u8
  }

  /** @name PalletTransactionPauseEvent (83) */
  interface PalletTransactionPauseEvent extends Enum {
    readonly isTransactionPaused: boolean
    readonly asTransactionPaused: {
      readonly palletNameBytes: Bytes
      readonly functionNameBytes: Bytes
    } & Struct
    readonly isTransactionUnpaused: boolean
    readonly asTransactionUnpaused: {
      readonly palletNameBytes: Bytes
      readonly functionNameBytes: Bytes
    } & Struct
    readonly type: "TransactionPaused" | "TransactionUnpaused"
  }

  /** @name PalletDusterEvent (84) */
  interface PalletDusterEvent extends Enum {
    readonly isDusted: boolean
    readonly asDusted: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isAdded: boolean
    readonly asAdded: {
      readonly who: AccountId32
    } & Struct
    readonly isRemoved: boolean
    readonly asRemoved: {
      readonly who: AccountId32
    } & Struct
    readonly type: "Dusted" | "Added" | "Removed"
  }

  /** @name PalletLiquidityMiningEvent (85) */
  interface PalletLiquidityMiningEvent extends Enum {
    readonly isGlobalFarmAccRPZUpdated: boolean
    readonly asGlobalFarmAccRPZUpdated: {
      readonly globalFarmId: u32
      readonly accumulatedRpz: u128
      readonly totalSharesZ: u128
    } & Struct
    readonly isYieldFarmAccRPVSUpdated: boolean
    readonly asYieldFarmAccRPVSUpdated: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly accumulatedRpvs: u128
      readonly totalValuedShares: u128
    } & Struct
    readonly isAllRewardsDistributed: boolean
    readonly asAllRewardsDistributed: {
      readonly globalFarmId: u32
    } & Struct
    readonly type:
      | "GlobalFarmAccRPZUpdated"
      | "YieldFarmAccRPVSUpdated"
      | "AllRewardsDistributed"
  }

  /** @name PalletOmnipoolLiquidityMiningEvent (86) */
  interface PalletOmnipoolLiquidityMiningEvent extends Enum {
    readonly isGlobalFarmCreated: boolean
    readonly asGlobalFarmCreated: {
      readonly id: u32
      readonly owner: AccountId32
      readonly totalRewards: u128
      readonly rewardCurrency: u32
      readonly yieldPerPeriod: Perquintill
      readonly plannedYieldingPeriods: u32
      readonly blocksPerPeriod: u32
      readonly maxRewardPerPeriod: u128
      readonly minDeposit: u128
      readonly lrnaPriceAdjustment: u128
    } & Struct
    readonly isGlobalFarmUpdated: boolean
    readonly asGlobalFarmUpdated: {
      readonly id: u32
      readonly lrnaPriceAdjustment: u128
    } & Struct
    readonly isGlobalFarmTerminated: boolean
    readonly asGlobalFarmTerminated: {
      readonly globalFarmId: u32
      readonly who: AccountId32
      readonly rewardCurrency: u32
      readonly undistributedRewards: u128
    } & Struct
    readonly isYieldFarmCreated: boolean
    readonly asYieldFarmCreated: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
      readonly multiplier: u128
      readonly loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>
    } & Struct
    readonly isYieldFarmUpdated: boolean
    readonly asYieldFarmUpdated: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
      readonly who: AccountId32
      readonly multiplier: u128
    } & Struct
    readonly isYieldFarmStopped: boolean
    readonly asYieldFarmStopped: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
      readonly who: AccountId32
    } & Struct
    readonly isYieldFarmResumed: boolean
    readonly asYieldFarmResumed: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
      readonly who: AccountId32
      readonly multiplier: u128
    } & Struct
    readonly isYieldFarmTerminated: boolean
    readonly asYieldFarmTerminated: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
      readonly who: AccountId32
    } & Struct
    readonly isSharesDeposited: boolean
    readonly asSharesDeposited: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly depositId: u128
      readonly assetId: u32
      readonly who: AccountId32
      readonly sharesAmount: u128
      readonly positionId: u128
    } & Struct
    readonly isSharesRedeposited: boolean
    readonly asSharesRedeposited: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly depositId: u128
      readonly assetId: u32
      readonly who: AccountId32
      readonly sharesAmount: u128
      readonly positionId: u128
    } & Struct
    readonly isRewardClaimed: boolean
    readonly asRewardClaimed: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly who: AccountId32
      readonly claimed: u128
      readonly rewardCurrency: u32
      readonly depositId: u128
    } & Struct
    readonly isSharesWithdrawn: boolean
    readonly asSharesWithdrawn: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly who: AccountId32
      readonly amount: u128
      readonly depositId: u128
    } & Struct
    readonly isDepositDestroyed: boolean
    readonly asDepositDestroyed: {
      readonly who: AccountId32
      readonly depositId: u128
    } & Struct
    readonly type:
      | "GlobalFarmCreated"
      | "GlobalFarmUpdated"
      | "GlobalFarmTerminated"
      | "YieldFarmCreated"
      | "YieldFarmUpdated"
      | "YieldFarmStopped"
      | "YieldFarmResumed"
      | "YieldFarmTerminated"
      | "SharesDeposited"
      | "SharesRedeposited"
      | "RewardClaimed"
      | "SharesWithdrawn"
      | "DepositDestroyed"
  }

  /** @name PalletLiquidityMiningLoyaltyCurve (89) */
  interface PalletLiquidityMiningLoyaltyCurve extends Struct {
    readonly initialRewardPercentage: u128
    readonly scaleCoef: u32
  }

  /** @name PalletOtcEvent (90) */
  interface PalletOtcEvent extends Enum {
    readonly isCancelled: boolean
    readonly asCancelled: {
      readonly orderId: u32
    } & Struct
    readonly isFilled: boolean
    readonly asFilled: {
      readonly orderId: u32
      readonly who: AccountId32
      readonly amountIn: u128
      readonly amountOut: u128
    } & Struct
    readonly isPartiallyFilled: boolean
    readonly asPartiallyFilled: {
      readonly orderId: u32
      readonly who: AccountId32
      readonly amountIn: u128
      readonly amountOut: u128
    } & Struct
    readonly isPlaced: boolean
    readonly asPlaced: {
      readonly orderId: u32
      readonly assetIn: u32
      readonly assetOut: u32
      readonly amountIn: u128
      readonly amountOut: u128
      readonly partiallyFillable: bool
    } & Struct
    readonly type: "Cancelled" | "Filled" | "PartiallyFilled" | "Placed"
  }

  /** @name PalletCircuitBreakerEvent (91) */
  interface PalletCircuitBreakerEvent extends Enum {
    readonly isTradeVolumeLimitChanged: boolean
    readonly asTradeVolumeLimitChanged: {
      readonly assetId: u32
      readonly tradeVolumeLimit: ITuple<[u32, u32]>
    } & Struct
    readonly isAddLiquidityLimitChanged: boolean
    readonly asAddLiquidityLimitChanged: {
      readonly assetId: u32
      readonly liquidityLimit: Option<ITuple<[u32, u32]>>
    } & Struct
    readonly isRemoveLiquidityLimitChanged: boolean
    readonly asRemoveLiquidityLimitChanged: {
      readonly assetId: u32
      readonly liquidityLimit: Option<ITuple<[u32, u32]>>
    } & Struct
    readonly type:
      | "TradeVolumeLimitChanged"
      | "AddLiquidityLimitChanged"
      | "RemoveLiquidityLimitChanged"
  }

  /** @name OrmlTokensModuleEvent (94) */
  interface OrmlTokensModuleEvent extends Enum {
    readonly isEndowed: boolean
    readonly asEndowed: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isDustLost: boolean
    readonly asDustLost: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly currencyId: u32
      readonly from: AccountId32
      readonly to: AccountId32
      readonly amount: u128
    } & Struct
    readonly isReserved: boolean
    readonly asReserved: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isUnreserved: boolean
    readonly asUnreserved: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isReserveRepatriated: boolean
    readonly asReserveRepatriated: {
      readonly currencyId: u32
      readonly from: AccountId32
      readonly to: AccountId32
      readonly amount: u128
      readonly status: FrameSupportTokensMiscBalanceStatus
    } & Struct
    readonly isBalanceSet: boolean
    readonly asBalanceSet: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly free: u128
      readonly reserved: u128
    } & Struct
    readonly isTotalIssuanceSet: boolean
    readonly asTotalIssuanceSet: {
      readonly currencyId: u32
      readonly amount: u128
    } & Struct
    readonly isWithdrawn: boolean
    readonly asWithdrawn: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isSlashed: boolean
    readonly asSlashed: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly freeAmount: u128
      readonly reservedAmount: u128
    } & Struct
    readonly isDeposited: boolean
    readonly asDeposited: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isLockSet: boolean
    readonly asLockSet: {
      readonly lockId: U8aFixed
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isLockRemoved: boolean
    readonly asLockRemoved: {
      readonly lockId: U8aFixed
      readonly currencyId: u32
      readonly who: AccountId32
    } & Struct
    readonly type:
      | "Endowed"
      | "DustLost"
      | "Transfer"
      | "Reserved"
      | "Unreserved"
      | "ReserveRepatriated"
      | "BalanceSet"
      | "TotalIssuanceSet"
      | "Withdrawn"
      | "Slashed"
      | "Deposited"
      | "LockSet"
      | "LockRemoved"
  }

  /** @name PalletCurrenciesModuleEvent (96) */
  interface PalletCurrenciesModuleEvent extends Enum {
    readonly isTransferred: boolean
    readonly asTransferred: {
      readonly currencyId: u32
      readonly from: AccountId32
      readonly to: AccountId32
      readonly amount: u128
    } & Struct
    readonly isBalanceUpdated: boolean
    readonly asBalanceUpdated: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: i128
    } & Struct
    readonly isDeposited: boolean
    readonly asDeposited: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isWithdrawn: boolean
    readonly asWithdrawn: {
      readonly currencyId: u32
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly type: "Transferred" | "BalanceUpdated" | "Deposited" | "Withdrawn"
  }

  /** @name OrmlVestingModuleEvent (98) */
  interface OrmlVestingModuleEvent extends Enum {
    readonly isVestingScheduleAdded: boolean
    readonly asVestingScheduleAdded: {
      readonly from: AccountId32
      readonly to: AccountId32
      readonly vestingSchedule: OrmlVestingVestingSchedule
    } & Struct
    readonly isClaimed: boolean
    readonly asClaimed: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly isVestingSchedulesUpdated: boolean
    readonly asVestingSchedulesUpdated: {
      readonly who: AccountId32
    } & Struct
    readonly type:
      | "VestingScheduleAdded"
      | "Claimed"
      | "VestingSchedulesUpdated"
  }

  /** @name OrmlVestingVestingSchedule (99) */
  interface OrmlVestingVestingSchedule extends Struct {
    readonly start: u32
    readonly period: u32
    readonly periodCount: u32
    readonly perPeriod: Compact<u128>
  }

  /** @name CumulusPalletParachainSystemEvent (100) */
  interface CumulusPalletParachainSystemEvent extends Enum {
    readonly isValidationFunctionStored: boolean
    readonly isValidationFunctionApplied: boolean
    readonly asValidationFunctionApplied: {
      readonly relayChainBlockNum: u32
    } & Struct
    readonly isValidationFunctionDiscarded: boolean
    readonly isUpgradeAuthorized: boolean
    readonly asUpgradeAuthorized: {
      readonly codeHash: H256
    } & Struct
    readonly isDownwardMessagesReceived: boolean
    readonly asDownwardMessagesReceived: {
      readonly count: u32
    } & Struct
    readonly isDownwardMessagesProcessed: boolean
    readonly asDownwardMessagesProcessed: {
      readonly weightUsed: WeightV1
      readonly dmqHead: H256
    } & Struct
    readonly type:
      | "ValidationFunctionStored"
      | "ValidationFunctionApplied"
      | "ValidationFunctionDiscarded"
      | "UpgradeAuthorized"
      | "DownwardMessagesReceived"
      | "DownwardMessagesProcessed"
  }

  /** @name PalletSchedulerEvent (101) */
  interface PalletSchedulerEvent extends Enum {
    readonly isScheduled: boolean
    readonly asScheduled: {
      readonly when: u32
      readonly index: u32
    } & Struct
    readonly isCanceled: boolean
    readonly asCanceled: {
      readonly when: u32
      readonly index: u32
    } & Struct
    readonly isDispatched: boolean
    readonly asDispatched: {
      readonly task: ITuple<[u32, u32]>
      readonly id: Option<Bytes>
      readonly result: Result<Null, SpRuntimeDispatchError>
    } & Struct
    readonly isCallLookupFailed: boolean
    readonly asCallLookupFailed: {
      readonly task: ITuple<[u32, u32]>
      readonly id: Option<Bytes>
      readonly error: FrameSupportScheduleLookupError
    } & Struct
    readonly type: "Scheduled" | "Canceled" | "Dispatched" | "CallLookupFailed"
  }

  /** @name FrameSupportScheduleLookupError (103) */
  interface FrameSupportScheduleLookupError extends Enum {
    readonly isUnknown: boolean
    readonly isBadFormat: boolean
    readonly type: "Unknown" | "BadFormat"
  }

  /** @name PalletXcmEvent (104) */
  interface PalletXcmEvent extends Enum {
    readonly isAttempted: boolean
    readonly asAttempted: XcmV2TraitsOutcome
    readonly isSent: boolean
    readonly asSent: ITuple<[XcmV1MultiLocation, XcmV1MultiLocation, XcmV2Xcm]>
    readonly isUnexpectedResponse: boolean
    readonly asUnexpectedResponse: ITuple<[XcmV1MultiLocation, u64]>
    readonly isResponseReady: boolean
    readonly asResponseReady: ITuple<[u64, XcmV2Response]>
    readonly isNotified: boolean
    readonly asNotified: ITuple<[u64, u8, u8]>
    readonly isNotifyOverweight: boolean
    readonly asNotifyOverweight: ITuple<[u64, u8, u8, WeightV1, WeightV1]>
    readonly isNotifyDispatchError: boolean
    readonly asNotifyDispatchError: ITuple<[u64, u8, u8]>
    readonly isNotifyDecodeFailed: boolean
    readonly asNotifyDecodeFailed: ITuple<[u64, u8, u8]>
    readonly isInvalidResponder: boolean
    readonly asInvalidResponder: ITuple<
      [XcmV1MultiLocation, u64, Option<XcmV1MultiLocation>]
    >
    readonly isInvalidResponderVersion: boolean
    readonly asInvalidResponderVersion: ITuple<[XcmV1MultiLocation, u64]>
    readonly isResponseTaken: boolean
    readonly asResponseTaken: u64
    readonly isAssetsTrapped: boolean
    readonly asAssetsTrapped: ITuple<
      [H256, XcmV1MultiLocation, XcmVersionedMultiAssets]
    >
    readonly isVersionChangeNotified: boolean
    readonly asVersionChangeNotified: ITuple<[XcmV1MultiLocation, u32]>
    readonly isSupportedVersionChanged: boolean
    readonly asSupportedVersionChanged: ITuple<[XcmV1MultiLocation, u32]>
    readonly isNotifyTargetSendFail: boolean
    readonly asNotifyTargetSendFail: ITuple<
      [XcmV1MultiLocation, u64, XcmV2TraitsError]
    >
    readonly isNotifyTargetMigrationFail: boolean
    readonly asNotifyTargetMigrationFail: ITuple<
      [XcmVersionedMultiLocation, u64]
    >
    readonly type:
      | "Attempted"
      | "Sent"
      | "UnexpectedResponse"
      | "ResponseReady"
      | "Notified"
      | "NotifyOverweight"
      | "NotifyDispatchError"
      | "NotifyDecodeFailed"
      | "InvalidResponder"
      | "InvalidResponderVersion"
      | "ResponseTaken"
      | "AssetsTrapped"
      | "VersionChangeNotified"
      | "SupportedVersionChanged"
      | "NotifyTargetSendFail"
      | "NotifyTargetMigrationFail"
  }

  /** @name XcmV2TraitsOutcome (105) */
  interface XcmV2TraitsOutcome extends Enum {
    readonly isComplete: boolean
    readonly asComplete: u64
    readonly isIncomplete: boolean
    readonly asIncomplete: ITuple<[u64, XcmV2TraitsError]>
    readonly isError: boolean
    readonly asError: XcmV2TraitsError
    readonly type: "Complete" | "Incomplete" | "Error"
  }

  /** @name XcmV2TraitsError (106) */
  interface XcmV2TraitsError extends Enum {
    readonly isOverflow: boolean
    readonly isUnimplemented: boolean
    readonly isUntrustedReserveLocation: boolean
    readonly isUntrustedTeleportLocation: boolean
    readonly isMultiLocationFull: boolean
    readonly isMultiLocationNotInvertible: boolean
    readonly isBadOrigin: boolean
    readonly isInvalidLocation: boolean
    readonly isAssetNotFound: boolean
    readonly isFailedToTransactAsset: boolean
    readonly isNotWithdrawable: boolean
    readonly isLocationCannotHold: boolean
    readonly isExceedsMaxMessageSize: boolean
    readonly isDestinationUnsupported: boolean
    readonly isTransport: boolean
    readonly isUnroutable: boolean
    readonly isUnknownClaim: boolean
    readonly isFailedToDecode: boolean
    readonly isMaxWeightInvalid: boolean
    readonly isNotHoldingFees: boolean
    readonly isTooExpensive: boolean
    readonly isTrap: boolean
    readonly asTrap: u64
    readonly isUnhandledXcmVersion: boolean
    readonly isWeightLimitReached: boolean
    readonly asWeightLimitReached: u64
    readonly isBarrier: boolean
    readonly isWeightNotComputable: boolean
    readonly type:
      | "Overflow"
      | "Unimplemented"
      | "UntrustedReserveLocation"
      | "UntrustedTeleportLocation"
      | "MultiLocationFull"
      | "MultiLocationNotInvertible"
      | "BadOrigin"
      | "InvalidLocation"
      | "AssetNotFound"
      | "FailedToTransactAsset"
      | "NotWithdrawable"
      | "LocationCannotHold"
      | "ExceedsMaxMessageSize"
      | "DestinationUnsupported"
      | "Transport"
      | "Unroutable"
      | "UnknownClaim"
      | "FailedToDecode"
      | "MaxWeightInvalid"
      | "NotHoldingFees"
      | "TooExpensive"
      | "Trap"
      | "UnhandledXcmVersion"
      | "WeightLimitReached"
      | "Barrier"
      | "WeightNotComputable"
  }

  /** @name XcmV2Xcm (107) */
  interface XcmV2Xcm extends Vec<XcmV2Instruction> {}

  /** @name XcmV2Instruction (109) */
  interface XcmV2Instruction extends Enum {
    readonly isWithdrawAsset: boolean
    readonly asWithdrawAsset: XcmV1MultiassetMultiAssets
    readonly isReserveAssetDeposited: boolean
    readonly asReserveAssetDeposited: XcmV1MultiassetMultiAssets
    readonly isReceiveTeleportedAsset: boolean
    readonly asReceiveTeleportedAsset: XcmV1MultiassetMultiAssets
    readonly isQueryResponse: boolean
    readonly asQueryResponse: {
      readonly queryId: Compact<u64>
      readonly response: XcmV2Response
      readonly maxWeight: Compact<u64>
    } & Struct
    readonly isTransferAsset: boolean
    readonly asTransferAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly beneficiary: XcmV1MultiLocation
    } & Struct
    readonly isTransferReserveAsset: boolean
    readonly asTransferReserveAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly dest: XcmV1MultiLocation
      readonly xcm: XcmV2Xcm
    } & Struct
    readonly isTransact: boolean
    readonly asTransact: {
      readonly originType: XcmV0OriginKind
      readonly requireWeightAtMost: Compact<u64>
      readonly call: XcmDoubleEncoded
    } & Struct
    readonly isHrmpNewChannelOpenRequest: boolean
    readonly asHrmpNewChannelOpenRequest: {
      readonly sender: Compact<u32>
      readonly maxMessageSize: Compact<u32>
      readonly maxCapacity: Compact<u32>
    } & Struct
    readonly isHrmpChannelAccepted: boolean
    readonly asHrmpChannelAccepted: {
      readonly recipient: Compact<u32>
    } & Struct
    readonly isHrmpChannelClosing: boolean
    readonly asHrmpChannelClosing: {
      readonly initiator: Compact<u32>
      readonly sender: Compact<u32>
      readonly recipient: Compact<u32>
    } & Struct
    readonly isClearOrigin: boolean
    readonly isDescendOrigin: boolean
    readonly asDescendOrigin: XcmV1MultilocationJunctions
    readonly isReportError: boolean
    readonly asReportError: {
      readonly queryId: Compact<u64>
      readonly dest: XcmV1MultiLocation
      readonly maxResponseWeight: Compact<u64>
    } & Struct
    readonly isDepositAsset: boolean
    readonly asDepositAsset: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly maxAssets: Compact<u32>
      readonly beneficiary: XcmV1MultiLocation
    } & Struct
    readonly isDepositReserveAsset: boolean
    readonly asDepositReserveAsset: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly maxAssets: Compact<u32>
      readonly dest: XcmV1MultiLocation
      readonly xcm: XcmV2Xcm
    } & Struct
    readonly isExchangeAsset: boolean
    readonly asExchangeAsset: {
      readonly give: XcmV1MultiassetMultiAssetFilter
      readonly receive: XcmV1MultiassetMultiAssets
    } & Struct
    readonly isInitiateReserveWithdraw: boolean
    readonly asInitiateReserveWithdraw: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly reserve: XcmV1MultiLocation
      readonly xcm: XcmV2Xcm
    } & Struct
    readonly isInitiateTeleport: boolean
    readonly asInitiateTeleport: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly dest: XcmV1MultiLocation
      readonly xcm: XcmV2Xcm
    } & Struct
    readonly isQueryHolding: boolean
    readonly asQueryHolding: {
      readonly queryId: Compact<u64>
      readonly dest: XcmV1MultiLocation
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly maxResponseWeight: Compact<u64>
    } & Struct
    readonly isBuyExecution: boolean
    readonly asBuyExecution: {
      readonly fees: XcmV1MultiAsset
      readonly weightLimit: XcmV2WeightLimit
    } & Struct
    readonly isRefundSurplus: boolean
    readonly isSetErrorHandler: boolean
    readonly asSetErrorHandler: XcmV2Xcm
    readonly isSetAppendix: boolean
    readonly asSetAppendix: XcmV2Xcm
    readonly isClearError: boolean
    readonly isClaimAsset: boolean
    readonly asClaimAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly ticket: XcmV1MultiLocation
    } & Struct
    readonly isTrap: boolean
    readonly asTrap: Compact<u64>
    readonly isSubscribeVersion: boolean
    readonly asSubscribeVersion: {
      readonly queryId: Compact<u64>
      readonly maxResponseWeight: Compact<u64>
    } & Struct
    readonly isUnsubscribeVersion: boolean
    readonly type:
      | "WithdrawAsset"
      | "ReserveAssetDeposited"
      | "ReceiveTeleportedAsset"
      | "QueryResponse"
      | "TransferAsset"
      | "TransferReserveAsset"
      | "Transact"
      | "HrmpNewChannelOpenRequest"
      | "HrmpChannelAccepted"
      | "HrmpChannelClosing"
      | "ClearOrigin"
      | "DescendOrigin"
      | "ReportError"
      | "DepositAsset"
      | "DepositReserveAsset"
      | "ExchangeAsset"
      | "InitiateReserveWithdraw"
      | "InitiateTeleport"
      | "QueryHolding"
      | "BuyExecution"
      | "RefundSurplus"
      | "SetErrorHandler"
      | "SetAppendix"
      | "ClearError"
      | "ClaimAsset"
      | "Trap"
      | "SubscribeVersion"
      | "UnsubscribeVersion"
  }

  /** @name XcmV1MultiassetMultiAssets (110) */
  interface XcmV1MultiassetMultiAssets extends Vec<XcmV1MultiAsset> {}

  /** @name XcmV1MultiAsset (112) */
  interface XcmV1MultiAsset extends Struct {
    readonly id: XcmV1MultiassetAssetId
    readonly fun: XcmV1MultiassetFungibility
  }

  /** @name XcmV1MultiassetAssetId (113) */
  interface XcmV1MultiassetAssetId extends Enum {
    readonly isConcrete: boolean
    readonly asConcrete: XcmV1MultiLocation
    readonly isAbstract: boolean
    readonly asAbstract: Bytes
    readonly type: "Concrete" | "Abstract"
  }

  /** @name XcmV1MultiassetFungibility (114) */
  interface XcmV1MultiassetFungibility extends Enum {
    readonly isFungible: boolean
    readonly asFungible: Compact<u128>
    readonly isNonFungible: boolean
    readonly asNonFungible: XcmV1MultiassetAssetInstance
    readonly type: "Fungible" | "NonFungible"
  }

  /** @name XcmV1MultiassetAssetInstance (115) */
  interface XcmV1MultiassetAssetInstance extends Enum {
    readonly isUndefined: boolean
    readonly isIndex: boolean
    readonly asIndex: Compact<u128>
    readonly isArray4: boolean
    readonly asArray4: U8aFixed
    readonly isArray8: boolean
    readonly asArray8: U8aFixed
    readonly isArray16: boolean
    readonly asArray16: U8aFixed
    readonly isArray32: boolean
    readonly asArray32: U8aFixed
    readonly isBlob: boolean
    readonly asBlob: Bytes
    readonly type:
      | "Undefined"
      | "Index"
      | "Array4"
      | "Array8"
      | "Array16"
      | "Array32"
      | "Blob"
  }

  /** @name XcmV2Response (117) */
  interface XcmV2Response extends Enum {
    readonly isNull: boolean
    readonly isAssets: boolean
    readonly asAssets: XcmV1MultiassetMultiAssets
    readonly isExecutionResult: boolean
    readonly asExecutionResult: Option<ITuple<[u32, XcmV2TraitsError]>>
    readonly isVersion: boolean
    readonly asVersion: u32
    readonly type: "Null" | "Assets" | "ExecutionResult" | "Version"
  }

  /** @name XcmV0OriginKind (120) */
  interface XcmV0OriginKind extends Enum {
    readonly isNative: boolean
    readonly isSovereignAccount: boolean
    readonly isSuperuser: boolean
    readonly isXcm: boolean
    readonly type: "Native" | "SovereignAccount" | "Superuser" | "Xcm"
  }

  /** @name XcmDoubleEncoded (121) */
  interface XcmDoubleEncoded extends Struct {
    readonly encoded: Bytes
  }

  /** @name XcmV1MultiassetMultiAssetFilter (122) */
  interface XcmV1MultiassetMultiAssetFilter extends Enum {
    readonly isDefinite: boolean
    readonly asDefinite: XcmV1MultiassetMultiAssets
    readonly isWild: boolean
    readonly asWild: XcmV1MultiassetWildMultiAsset
    readonly type: "Definite" | "Wild"
  }

  /** @name XcmV1MultiassetWildMultiAsset (123) */
  interface XcmV1MultiassetWildMultiAsset extends Enum {
    readonly isAll: boolean
    readonly isAllOf: boolean
    readonly asAllOf: {
      readonly id: XcmV1MultiassetAssetId
      readonly fun: XcmV1MultiassetWildFungibility
    } & Struct
    readonly type: "All" | "AllOf"
  }

  /** @name XcmV1MultiassetWildFungibility (124) */
  interface XcmV1MultiassetWildFungibility extends Enum {
    readonly isFungible: boolean
    readonly isNonFungible: boolean
    readonly type: "Fungible" | "NonFungible"
  }

  /** @name XcmV2WeightLimit (125) */
  interface XcmV2WeightLimit extends Enum {
    readonly isUnlimited: boolean
    readonly isLimited: boolean
    readonly asLimited: Compact<u64>
    readonly type: "Unlimited" | "Limited"
  }

  /** @name XcmVersionedMultiAssets (127) */
  interface XcmVersionedMultiAssets extends Enum {
    readonly isV0: boolean
    readonly asV0: Vec<XcmV0MultiAsset>
    readonly isV1: boolean
    readonly asV1: XcmV1MultiassetMultiAssets
    readonly type: "V0" | "V1"
  }

  /** @name XcmV0MultiAsset (129) */
  interface XcmV0MultiAsset extends Enum {
    readonly isNone: boolean
    readonly isAll: boolean
    readonly isAllFungible: boolean
    readonly isAllNonFungible: boolean
    readonly isAllAbstractFungible: boolean
    readonly asAllAbstractFungible: {
      readonly id: Bytes
    } & Struct
    readonly isAllAbstractNonFungible: boolean
    readonly asAllAbstractNonFungible: {
      readonly class: Bytes
    } & Struct
    readonly isAllConcreteFungible: boolean
    readonly asAllConcreteFungible: {
      readonly id: XcmV0MultiLocation
    } & Struct
    readonly isAllConcreteNonFungible: boolean
    readonly asAllConcreteNonFungible: {
      readonly class: XcmV0MultiLocation
    } & Struct
    readonly isAbstractFungible: boolean
    readonly asAbstractFungible: {
      readonly id: Bytes
      readonly amount: Compact<u128>
    } & Struct
    readonly isAbstractNonFungible: boolean
    readonly asAbstractNonFungible: {
      readonly class: Bytes
      readonly instance: XcmV1MultiassetAssetInstance
    } & Struct
    readonly isConcreteFungible: boolean
    readonly asConcreteFungible: {
      readonly id: XcmV0MultiLocation
      readonly amount: Compact<u128>
    } & Struct
    readonly isConcreteNonFungible: boolean
    readonly asConcreteNonFungible: {
      readonly class: XcmV0MultiLocation
      readonly instance: XcmV1MultiassetAssetInstance
    } & Struct
    readonly type:
      | "None"
      | "All"
      | "AllFungible"
      | "AllNonFungible"
      | "AllAbstractFungible"
      | "AllAbstractNonFungible"
      | "AllConcreteFungible"
      | "AllConcreteNonFungible"
      | "AbstractFungible"
      | "AbstractNonFungible"
      | "ConcreteFungible"
      | "ConcreteNonFungible"
  }

  /** @name XcmV0MultiLocation (130) */
  interface XcmV0MultiLocation extends Enum {
    readonly isNull: boolean
    readonly isX1: boolean
    readonly asX1: XcmV0Junction
    readonly isX2: boolean
    readonly asX2: ITuple<[XcmV0Junction, XcmV0Junction]>
    readonly isX3: boolean
    readonly asX3: ITuple<[XcmV0Junction, XcmV0Junction, XcmV0Junction]>
    readonly isX4: boolean
    readonly asX4: ITuple<
      [XcmV0Junction, XcmV0Junction, XcmV0Junction, XcmV0Junction]
    >
    readonly isX5: boolean
    readonly asX5: ITuple<
      [
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
      ]
    >
    readonly isX6: boolean
    readonly asX6: ITuple<
      [
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
      ]
    >
    readonly isX7: boolean
    readonly asX7: ITuple<
      [
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
      ]
    >
    readonly isX8: boolean
    readonly asX8: ITuple<
      [
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
        XcmV0Junction,
      ]
    >
    readonly type:
      | "Null"
      | "X1"
      | "X2"
      | "X3"
      | "X4"
      | "X5"
      | "X6"
      | "X7"
      | "X8"
  }

  /** @name XcmV0Junction (131) */
  interface XcmV0Junction extends Enum {
    readonly isParent: boolean
    readonly isParachain: boolean
    readonly asParachain: Compact<u32>
    readonly isAccountId32: boolean
    readonly asAccountId32: {
      readonly network: XcmV0JunctionNetworkId
      readonly id: U8aFixed
    } & Struct
    readonly isAccountIndex64: boolean
    readonly asAccountIndex64: {
      readonly network: XcmV0JunctionNetworkId
      readonly index: Compact<u64>
    } & Struct
    readonly isAccountKey20: boolean
    readonly asAccountKey20: {
      readonly network: XcmV0JunctionNetworkId
      readonly key: U8aFixed
    } & Struct
    readonly isPalletInstance: boolean
    readonly asPalletInstance: u8
    readonly isGeneralIndex: boolean
    readonly asGeneralIndex: Compact<u128>
    readonly isGeneralKey: boolean
    readonly asGeneralKey: Bytes
    readonly isOnlyChild: boolean
    readonly isPlurality: boolean
    readonly asPlurality: {
      readonly id: XcmV0JunctionBodyId
      readonly part: XcmV0JunctionBodyPart
    } & Struct
    readonly type:
      | "Parent"
      | "Parachain"
      | "AccountId32"
      | "AccountIndex64"
      | "AccountKey20"
      | "PalletInstance"
      | "GeneralIndex"
      | "GeneralKey"
      | "OnlyChild"
      | "Plurality"
  }

  /** @name XcmVersionedMultiLocation (132) */
  interface XcmVersionedMultiLocation extends Enum {
    readonly isV0: boolean
    readonly asV0: XcmV0MultiLocation
    readonly isV1: boolean
    readonly asV1: XcmV1MultiLocation
    readonly type: "V0" | "V1"
  }

  /** @name CumulusPalletXcmEvent (133) */
  interface CumulusPalletXcmEvent extends Enum {
    readonly isInvalidFormat: boolean
    readonly asInvalidFormat: U8aFixed
    readonly isUnsupportedVersion: boolean
    readonly asUnsupportedVersion: U8aFixed
    readonly isExecutedDownward: boolean
    readonly asExecutedDownward: ITuple<[U8aFixed, XcmV2TraitsOutcome]>
    readonly type: "InvalidFormat" | "UnsupportedVersion" | "ExecutedDownward"
  }

  /** @name CumulusPalletXcmpQueueEvent (134) */
  interface CumulusPalletXcmpQueueEvent extends Enum {
    readonly isSuccess: boolean
    readonly asSuccess: {
      readonly messageHash: Option<H256>
      readonly weight: WeightV1
    } & Struct
    readonly isFail: boolean
    readonly asFail: {
      readonly messageHash: Option<H256>
      readonly error: XcmV2TraitsError
      readonly weight: WeightV1
    } & Struct
    readonly isBadVersion: boolean
    readonly asBadVersion: {
      readonly messageHash: Option<H256>
    } & Struct
    readonly isBadFormat: boolean
    readonly asBadFormat: {
      readonly messageHash: Option<H256>
    } & Struct
    readonly isUpwardMessageSent: boolean
    readonly asUpwardMessageSent: {
      readonly messageHash: Option<H256>
    } & Struct
    readonly isXcmpMessageSent: boolean
    readonly asXcmpMessageSent: {
      readonly messageHash: Option<H256>
    } & Struct
    readonly isOverweightEnqueued: boolean
    readonly asOverweightEnqueued: {
      readonly sender: u32
      readonly sentAt: u32
      readonly index: u64
      readonly required: WeightV1
    } & Struct
    readonly isOverweightServiced: boolean
    readonly asOverweightServiced: {
      readonly index: u64
      readonly used: WeightV1
    } & Struct
    readonly type:
      | "Success"
      | "Fail"
      | "BadVersion"
      | "BadFormat"
      | "UpwardMessageSent"
      | "XcmpMessageSent"
      | "OverweightEnqueued"
      | "OverweightServiced"
  }

  /** @name CumulusPalletDmpQueueEvent (137) */
  interface CumulusPalletDmpQueueEvent extends Enum {
    readonly isInvalidFormat: boolean
    readonly asInvalidFormat: {
      readonly messageId: U8aFixed
    } & Struct
    readonly isUnsupportedVersion: boolean
    readonly asUnsupportedVersion: {
      readonly messageId: U8aFixed
    } & Struct
    readonly isExecutedDownward: boolean
    readonly asExecutedDownward: {
      readonly messageId: U8aFixed
      readonly outcome: XcmV2TraitsOutcome
    } & Struct
    readonly isWeightExhausted: boolean
    readonly asWeightExhausted: {
      readonly messageId: U8aFixed
      readonly remainingWeight: WeightV1
      readonly requiredWeight: WeightV1
    } & Struct
    readonly isOverweightEnqueued: boolean
    readonly asOverweightEnqueued: {
      readonly messageId: U8aFixed
      readonly overweightIndex: u64
      readonly requiredWeight: WeightV1
    } & Struct
    readonly isOverweightServiced: boolean
    readonly asOverweightServiced: {
      readonly overweightIndex: u64
      readonly weightUsed: WeightV1
    } & Struct
    readonly type:
      | "InvalidFormat"
      | "UnsupportedVersion"
      | "ExecutedDownward"
      | "WeightExhausted"
      | "OverweightEnqueued"
      | "OverweightServiced"
  }

  /** @name OrmlXcmModuleEvent (138) */
  interface OrmlXcmModuleEvent extends Enum {
    readonly isSent: boolean
    readonly asSent: {
      readonly to: XcmV1MultiLocation
      readonly message: XcmV2Xcm
    } & Struct
    readonly type: "Sent"
  }

  /** @name OrmlXtokensModuleEvent (139) */
  interface OrmlXtokensModuleEvent extends Enum {
    readonly isTransferredMultiAssets: boolean
    readonly asTransferredMultiAssets: {
      readonly sender: AccountId32
      readonly assets: XcmV1MultiassetMultiAssets
      readonly fee: XcmV1MultiAsset
      readonly dest: XcmV1MultiLocation
    } & Struct
    readonly type: "TransferredMultiAssets"
  }

  /** @name OrmlUnknownTokensModuleEvent (140) */
  interface OrmlUnknownTokensModuleEvent extends Enum {
    readonly isDeposited: boolean
    readonly asDeposited: {
      readonly asset: XcmV1MultiAsset
      readonly who: XcmV1MultiLocation
    } & Struct
    readonly isWithdrawn: boolean
    readonly asWithdrawn: {
      readonly asset: XcmV1MultiAsset
      readonly who: XcmV1MultiLocation
    } & Struct
    readonly type: "Deposited" | "Withdrawn"
  }

  /** @name PalletCollatorSelectionEvent (141) */
  interface PalletCollatorSelectionEvent extends Enum {
    readonly isNewInvulnerables: boolean
    readonly asNewInvulnerables: {
      readonly invulnerables: Vec<AccountId32>
    } & Struct
    readonly isNewDesiredCandidates: boolean
    readonly asNewDesiredCandidates: {
      readonly desiredCandidates: u32
    } & Struct
    readonly isNewCandidacyBond: boolean
    readonly asNewCandidacyBond: {
      readonly bondAmount: u128
    } & Struct
    readonly isCandidateAdded: boolean
    readonly asCandidateAdded: {
      readonly accountId: AccountId32
      readonly deposit: u128
    } & Struct
    readonly isCandidateRemoved: boolean
    readonly asCandidateRemoved: {
      readonly accountId: AccountId32
    } & Struct
    readonly type:
      | "NewInvulnerables"
      | "NewDesiredCandidates"
      | "NewCandidacyBond"
      | "CandidateAdded"
      | "CandidateRemoved"
  }

  /** @name PalletSessionEvent (142) */
  interface PalletSessionEvent extends Enum {
    readonly isNewSession: boolean
    readonly asNewSession: {
      readonly sessionIndex: u32
    } & Struct
    readonly type: "NewSession"
  }

  /** @name PalletRelaychainInfoEvent (143) */
  interface PalletRelaychainInfoEvent extends Enum {
    readonly isCurrentBlockNumbers: boolean
    readonly asCurrentBlockNumbers: {
      readonly parachainBlockNumber: u32
      readonly relaychainBlockNumber: u32
    } & Struct
    readonly type: "CurrentBlockNumbers"
  }

  /** @name PalletEmaOracleEvent (144) */
  type PalletEmaOracleEvent = Null

  /** @name PalletTransactionMultiPaymentEvent (145) */
  interface PalletTransactionMultiPaymentEvent extends Enum {
    readonly isCurrencySet: boolean
    readonly asCurrencySet: {
      readonly accountId: AccountId32
      readonly assetId: u32
    } & Struct
    readonly isCurrencyAdded: boolean
    readonly asCurrencyAdded: {
      readonly assetId: u32
    } & Struct
    readonly isCurrencyRemoved: boolean
    readonly asCurrencyRemoved: {
      readonly assetId: u32
    } & Struct
    readonly isFeeWithdrawn: boolean
    readonly asFeeWithdrawn: {
      readonly accountId: AccountId32
      readonly assetId: u32
      readonly nativeFeeAmount: u128
      readonly nonNativeFeeAmount: u128
      readonly destinationAccountId: AccountId32
    } & Struct
    readonly type:
      | "CurrencySet"
      | "CurrencyAdded"
      | "CurrencyRemoved"
      | "FeeWithdrawn"
  }

  /** @name FrameSystemPhase (146) */
  interface FrameSystemPhase extends Enum {
    readonly isApplyExtrinsic: boolean
    readonly asApplyExtrinsic: u32
    readonly isFinalization: boolean
    readonly isInitialization: boolean
    readonly type: "ApplyExtrinsic" | "Finalization" | "Initialization"
  }

  /** @name FrameSystemLastRuntimeUpgradeInfo (149) */
  interface FrameSystemLastRuntimeUpgradeInfo extends Struct {
    readonly specVersion: Compact<u32>
    readonly specName: Text
  }

  /** @name FrameSystemCall (151) */
  interface FrameSystemCall extends Enum {
    readonly isFillBlock: boolean
    readonly asFillBlock: {
      readonly ratio: Perbill
    } & Struct
    readonly isRemark: boolean
    readonly asRemark: {
      readonly remark: Bytes
    } & Struct
    readonly isSetHeapPages: boolean
    readonly asSetHeapPages: {
      readonly pages: u64
    } & Struct
    readonly isSetCode: boolean
    readonly asSetCode: {
      readonly code: Bytes
    } & Struct
    readonly isSetCodeWithoutChecks: boolean
    readonly asSetCodeWithoutChecks: {
      readonly code: Bytes
    } & Struct
    readonly isSetStorage: boolean
    readonly asSetStorage: {
      readonly items: Vec<ITuple<[Bytes, Bytes]>>
    } & Struct
    readonly isKillStorage: boolean
    readonly asKillStorage: {
      readonly keys_: Vec<Bytes>
    } & Struct
    readonly isKillPrefix: boolean
    readonly asKillPrefix: {
      readonly prefix: Bytes
      readonly subkeys: u32
    } & Struct
    readonly isRemarkWithEvent: boolean
    readonly asRemarkWithEvent: {
      readonly remark: Bytes
    } & Struct
    readonly type:
      | "FillBlock"
      | "Remark"
      | "SetHeapPages"
      | "SetCode"
      | "SetCodeWithoutChecks"
      | "SetStorage"
      | "KillStorage"
      | "KillPrefix"
      | "RemarkWithEvent"
  }

  /** @name FrameSystemLimitsBlockWeights (156) */
  interface FrameSystemLimitsBlockWeights extends Struct {
    readonly baseBlock: WeightV1
    readonly maxBlock: WeightV1
    readonly perClass: FrameSupportWeightsPerDispatchClassWeightsPerClass
  }

  /** @name FrameSupportWeightsPerDispatchClassWeightsPerClass (157) */
  interface FrameSupportWeightsPerDispatchClassWeightsPerClass extends Struct {
    readonly normal: FrameSystemLimitsWeightsPerClass
    readonly operational: FrameSystemLimitsWeightsPerClass
    readonly mandatory: FrameSystemLimitsWeightsPerClass
  }

  /** @name FrameSystemLimitsWeightsPerClass (158) */
  interface FrameSystemLimitsWeightsPerClass extends Struct {
    readonly baseExtrinsic: WeightV1
    readonly maxExtrinsic: Option<WeightV1>
    readonly maxTotal: Option<WeightV1>
    readonly reserved: Option<WeightV1>
  }

  /** @name FrameSystemLimitsBlockLength (160) */
  interface FrameSystemLimitsBlockLength extends Struct {
    readonly max: FrameSupportWeightsPerDispatchClassU32
  }

  /** @name FrameSupportWeightsPerDispatchClassU32 (161) */
  interface FrameSupportWeightsPerDispatchClassU32 extends Struct {
    readonly normal: u32
    readonly operational: u32
    readonly mandatory: u32
  }

  /** @name FrameSupportWeightsRuntimeDbWeight (162) */
  interface FrameSupportWeightsRuntimeDbWeight extends Struct {
    readonly read: u64
    readonly write: u64
  }

  /** @name SpVersionRuntimeVersion (163) */
  interface SpVersionRuntimeVersion extends Struct {
    readonly specName: Text
    readonly implName: Text
    readonly authoringVersion: u32
    readonly specVersion: u32
    readonly implVersion: u32
    readonly apis: Vec<ITuple<[U8aFixed, u32]>>
    readonly transactionVersion: u32
    readonly stateVersion: u8
  }

  /** @name FrameSystemError (167) */
  interface FrameSystemError extends Enum {
    readonly isInvalidSpecName: boolean
    readonly isSpecVersionNeedsToIncrease: boolean
    readonly isFailedToExtractRuntimeVersion: boolean
    readonly isNonDefaultComposite: boolean
    readonly isNonZeroRefCount: boolean
    readonly isCallFiltered: boolean
    readonly type:
      | "InvalidSpecName"
      | "SpecVersionNeedsToIncrease"
      | "FailedToExtractRuntimeVersion"
      | "NonDefaultComposite"
      | "NonZeroRefCount"
      | "CallFiltered"
  }

  /** @name PalletTimestampCall (168) */
  interface PalletTimestampCall extends Enum {
    readonly isSet: boolean
    readonly asSet: {
      readonly now: Compact<u64>
    } & Struct
    readonly type: "Set"
  }

  /** @name PalletBalancesBalanceLock (170) */
  interface PalletBalancesBalanceLock extends Struct {
    readonly id: U8aFixed
    readonly amount: u128
    readonly reasons: PalletBalancesReasons
  }

  /** @name PalletBalancesReasons (171) */
  interface PalletBalancesReasons extends Enum {
    readonly isFee: boolean
    readonly isMisc: boolean
    readonly isAll: boolean
    readonly type: "Fee" | "Misc" | "All"
  }

  /** @name PalletBalancesReserveData (174) */
  interface PalletBalancesReserveData extends Struct {
    readonly id: U8aFixed
    readonly amount: u128
  }

  /** @name PalletBalancesReleases (176) */
  interface PalletBalancesReleases extends Enum {
    readonly isV100: boolean
    readonly isV200: boolean
    readonly type: "V100" | "V200"
  }

  /** @name PalletBalancesCall (177) */
  interface PalletBalancesCall extends Enum {
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly dest: AccountId32
      readonly value: Compact<u128>
    } & Struct
    readonly isSetBalance: boolean
    readonly asSetBalance: {
      readonly who: AccountId32
      readonly newFree: Compact<u128>
      readonly newReserved: Compact<u128>
    } & Struct
    readonly isForceTransfer: boolean
    readonly asForceTransfer: {
      readonly source: AccountId32
      readonly dest: AccountId32
      readonly value: Compact<u128>
    } & Struct
    readonly isTransferKeepAlive: boolean
    readonly asTransferKeepAlive: {
      readonly dest: AccountId32
      readonly value: Compact<u128>
    } & Struct
    readonly isTransferAll: boolean
    readonly asTransferAll: {
      readonly dest: AccountId32
      readonly keepAlive: bool
    } & Struct
    readonly isForceUnreserve: boolean
    readonly asForceUnreserve: {
      readonly who: AccountId32
      readonly amount: u128
    } & Struct
    readonly type:
      | "Transfer"
      | "SetBalance"
      | "ForceTransfer"
      | "TransferKeepAlive"
      | "TransferAll"
      | "ForceUnreserve"
  }

  /** @name PalletBalancesError (178) */
  interface PalletBalancesError extends Enum {
    readonly isVestingBalance: boolean
    readonly isLiquidityRestrictions: boolean
    readonly isInsufficientBalance: boolean
    readonly isExistentialDeposit: boolean
    readonly isKeepAlive: boolean
    readonly isExistingVestingSchedule: boolean
    readonly isDeadAccount: boolean
    readonly isTooManyReserves: boolean
    readonly type:
      | "VestingBalance"
      | "LiquidityRestrictions"
      | "InsufficientBalance"
      | "ExistentialDeposit"
      | "KeepAlive"
      | "ExistingVestingSchedule"
      | "DeadAccount"
      | "TooManyReserves"
  }

  /** @name PalletTransactionPaymentReleases (179) */
  interface PalletTransactionPaymentReleases extends Enum {
    readonly isV1Ancient: boolean
    readonly isV2: boolean
    readonly type: "V1Ancient" | "V2"
  }

  /** @name PalletTreasuryProposal (180) */
  interface PalletTreasuryProposal extends Struct {
    readonly proposer: AccountId32
    readonly value: u128
    readonly beneficiary: AccountId32
    readonly bond: u128
  }

  /** @name PalletTreasuryCall (183) */
  interface PalletTreasuryCall extends Enum {
    readonly isProposeSpend: boolean
    readonly asProposeSpend: {
      readonly value: Compact<u128>
      readonly beneficiary: AccountId32
    } & Struct
    readonly isRejectProposal: boolean
    readonly asRejectProposal: {
      readonly proposalId: Compact<u32>
    } & Struct
    readonly isApproveProposal: boolean
    readonly asApproveProposal: {
      readonly proposalId: Compact<u32>
    } & Struct
    readonly isSpend: boolean
    readonly asSpend: {
      readonly amount: Compact<u128>
      readonly beneficiary: AccountId32
    } & Struct
    readonly isRemoveApproval: boolean
    readonly asRemoveApproval: {
      readonly proposalId: Compact<u32>
    } & Struct
    readonly type:
      | "ProposeSpend"
      | "RejectProposal"
      | "ApproveProposal"
      | "Spend"
      | "RemoveApproval"
  }

  /** @name FrameSupportPalletId (184) */
  interface FrameSupportPalletId extends U8aFixed {}

  /** @name PalletTreasuryError (185) */
  interface PalletTreasuryError extends Enum {
    readonly isInsufficientProposersBalance: boolean
    readonly isInvalidIndex: boolean
    readonly isTooManyApprovals: boolean
    readonly isInsufficientPermission: boolean
    readonly isProposalNotApproved: boolean
    readonly type:
      | "InsufficientProposersBalance"
      | "InvalidIndex"
      | "TooManyApprovals"
      | "InsufficientPermission"
      | "ProposalNotApproved"
  }

  /** @name PalletUtilityCall (186) */
  interface PalletUtilityCall extends Enum {
    readonly isBatch: boolean
    readonly asBatch: {
      readonly calls: Vec<Call>
    } & Struct
    readonly isAsDerivative: boolean
    readonly asAsDerivative: {
      readonly index: u16
      readonly call: Call
    } & Struct
    readonly isBatchAll: boolean
    readonly asBatchAll: {
      readonly calls: Vec<Call>
    } & Struct
    readonly isDispatchAs: boolean
    readonly asDispatchAs: {
      readonly asOrigin: HydradxRuntimeOriginCaller
      readonly call: Call
    } & Struct
    readonly isForceBatch: boolean
    readonly asForceBatch: {
      readonly calls: Vec<Call>
    } & Struct
    readonly type:
      | "Batch"
      | "AsDerivative"
      | "BatchAll"
      | "DispatchAs"
      | "ForceBatch"
  }

  /** @name PalletPreimageCall (189) */
  interface PalletPreimageCall extends Enum {
    readonly isNotePreimage: boolean
    readonly asNotePreimage: {
      readonly bytes: Bytes
    } & Struct
    readonly isUnnotePreimage: boolean
    readonly asUnnotePreimage: {
      readonly hash_: H256
    } & Struct
    readonly isRequestPreimage: boolean
    readonly asRequestPreimage: {
      readonly hash_: H256
    } & Struct
    readonly isUnrequestPreimage: boolean
    readonly asUnrequestPreimage: {
      readonly hash_: H256
    } & Struct
    readonly type:
      | "NotePreimage"
      | "UnnotePreimage"
      | "RequestPreimage"
      | "UnrequestPreimage"
  }

  /** @name PalletIdentityCall (190) */
  interface PalletIdentityCall extends Enum {
    readonly isAddRegistrar: boolean
    readonly asAddRegistrar: {
      readonly account: AccountId32
    } & Struct
    readonly isSetIdentity: boolean
    readonly asSetIdentity: {
      readonly info: PalletIdentityIdentityInfo
    } & Struct
    readonly isSetSubs: boolean
    readonly asSetSubs: {
      readonly subs: Vec<ITuple<[AccountId32, Data]>>
    } & Struct
    readonly isClearIdentity: boolean
    readonly isRequestJudgement: boolean
    readonly asRequestJudgement: {
      readonly regIndex: Compact<u32>
      readonly maxFee: Compact<u128>
    } & Struct
    readonly isCancelRequest: boolean
    readonly asCancelRequest: {
      readonly regIndex: u32
    } & Struct
    readonly isSetFee: boolean
    readonly asSetFee: {
      readonly index: Compact<u32>
      readonly fee: Compact<u128>
    } & Struct
    readonly isSetAccountId: boolean
    readonly asSetAccountId: {
      readonly index: Compact<u32>
      readonly new_: AccountId32
    } & Struct
    readonly isSetFields: boolean
    readonly asSetFields: {
      readonly index: Compact<u32>
      readonly fields: PalletIdentityBitFlags
    } & Struct
    readonly isProvideJudgement: boolean
    readonly asProvideJudgement: {
      readonly regIndex: Compact<u32>
      readonly target: AccountId32
      readonly judgement: PalletIdentityJudgement
    } & Struct
    readonly isKillIdentity: boolean
    readonly asKillIdentity: {
      readonly target: AccountId32
    } & Struct
    readonly isAddSub: boolean
    readonly asAddSub: {
      readonly sub: AccountId32
      readonly data: Data
    } & Struct
    readonly isRenameSub: boolean
    readonly asRenameSub: {
      readonly sub: AccountId32
      readonly data: Data
    } & Struct
    readonly isRemoveSub: boolean
    readonly asRemoveSub: {
      readonly sub: AccountId32
    } & Struct
    readonly isQuitSub: boolean
    readonly type:
      | "AddRegistrar"
      | "SetIdentity"
      | "SetSubs"
      | "ClearIdentity"
      | "RequestJudgement"
      | "CancelRequest"
      | "SetFee"
      | "SetAccountId"
      | "SetFields"
      | "ProvideJudgement"
      | "KillIdentity"
      | "AddSub"
      | "RenameSub"
      | "RemoveSub"
      | "QuitSub"
  }

  /** @name PalletIdentityIdentityInfo (191) */
  interface PalletIdentityIdentityInfo extends Struct {
    readonly additional: Vec<ITuple<[Data, Data]>>
    readonly display: Data
    readonly legal: Data
    readonly web: Data
    readonly riot: Data
    readonly email: Data
    readonly pgpFingerprint: Option<U8aFixed>
    readonly image: Data
    readonly twitter: Data
  }

  /** @name PalletIdentityBitFlags (227) */
  interface PalletIdentityBitFlags extends Set {
    readonly isDisplay: boolean
    readonly isLegal: boolean
    readonly isWeb: boolean
    readonly isRiot: boolean
    readonly isEmail: boolean
    readonly isPgpFingerprint: boolean
    readonly isImage: boolean
    readonly isTwitter: boolean
  }

  /** @name PalletIdentityIdentityField (228) */
  interface PalletIdentityIdentityField extends Enum {
    readonly isDisplay: boolean
    readonly isLegal: boolean
    readonly isWeb: boolean
    readonly isRiot: boolean
    readonly isEmail: boolean
    readonly isPgpFingerprint: boolean
    readonly isImage: boolean
    readonly isTwitter: boolean
    readonly type:
      | "Display"
      | "Legal"
      | "Web"
      | "Riot"
      | "Email"
      | "PgpFingerprint"
      | "Image"
      | "Twitter"
  }

  /** @name PalletIdentityJudgement (229) */
  interface PalletIdentityJudgement extends Enum {
    readonly isUnknown: boolean
    readonly isFeePaid: boolean
    readonly asFeePaid: u128
    readonly isReasonable: boolean
    readonly isKnownGood: boolean
    readonly isOutOfDate: boolean
    readonly isLowQuality: boolean
    readonly isErroneous: boolean
    readonly type:
      | "Unknown"
      | "FeePaid"
      | "Reasonable"
      | "KnownGood"
      | "OutOfDate"
      | "LowQuality"
      | "Erroneous"
  }

  /** @name PalletDemocracyCall (230) */
  interface PalletDemocracyCall extends Enum {
    readonly isPropose: boolean
    readonly asPropose: {
      readonly proposalHash: H256
      readonly value: Compact<u128>
    } & Struct
    readonly isSecond: boolean
    readonly asSecond: {
      readonly proposal: Compact<u32>
      readonly secondsUpperBound: Compact<u32>
    } & Struct
    readonly isVote: boolean
    readonly asVote: {
      readonly refIndex: Compact<u32>
      readonly vote: PalletDemocracyVoteAccountVote
    } & Struct
    readonly isEmergencyCancel: boolean
    readonly asEmergencyCancel: {
      readonly refIndex: u32
    } & Struct
    readonly isExternalPropose: boolean
    readonly asExternalPropose: {
      readonly proposalHash: H256
    } & Struct
    readonly isExternalProposeMajority: boolean
    readonly asExternalProposeMajority: {
      readonly proposalHash: H256
    } & Struct
    readonly isExternalProposeDefault: boolean
    readonly asExternalProposeDefault: {
      readonly proposalHash: H256
    } & Struct
    readonly isFastTrack: boolean
    readonly asFastTrack: {
      readonly proposalHash: H256
      readonly votingPeriod: u32
      readonly delay: u32
    } & Struct
    readonly isVetoExternal: boolean
    readonly asVetoExternal: {
      readonly proposalHash: H256
    } & Struct
    readonly isCancelReferendum: boolean
    readonly asCancelReferendum: {
      readonly refIndex: Compact<u32>
    } & Struct
    readonly isCancelQueued: boolean
    readonly asCancelQueued: {
      readonly which: u32
    } & Struct
    readonly isDelegate: boolean
    readonly asDelegate: {
      readonly to: AccountId32
      readonly conviction: PalletDemocracyConviction
      readonly balance: u128
    } & Struct
    readonly isUndelegate: boolean
    readonly isClearPublicProposals: boolean
    readonly isNotePreimage: boolean
    readonly asNotePreimage: {
      readonly encodedProposal: Bytes
    } & Struct
    readonly isNotePreimageOperational: boolean
    readonly asNotePreimageOperational: {
      readonly encodedProposal: Bytes
    } & Struct
    readonly isNoteImminentPreimage: boolean
    readonly asNoteImminentPreimage: {
      readonly encodedProposal: Bytes
    } & Struct
    readonly isNoteImminentPreimageOperational: boolean
    readonly asNoteImminentPreimageOperational: {
      readonly encodedProposal: Bytes
    } & Struct
    readonly isReapPreimage: boolean
    readonly asReapPreimage: {
      readonly proposalHash: H256
      readonly proposalLenUpperBound: Compact<u32>
    } & Struct
    readonly isUnlock: boolean
    readonly asUnlock: {
      readonly target: AccountId32
    } & Struct
    readonly isRemoveVote: boolean
    readonly asRemoveVote: {
      readonly index: u32
    } & Struct
    readonly isRemoveOtherVote: boolean
    readonly asRemoveOtherVote: {
      readonly target: AccountId32
      readonly index: u32
    } & Struct
    readonly isEnactProposal: boolean
    readonly asEnactProposal: {
      readonly proposalHash: H256
      readonly index: u32
    } & Struct
    readonly isBlacklist: boolean
    readonly asBlacklist: {
      readonly proposalHash: H256
      readonly maybeRefIndex: Option<u32>
    } & Struct
    readonly isCancelProposal: boolean
    readonly asCancelProposal: {
      readonly propIndex: Compact<u32>
    } & Struct
    readonly type:
      | "Propose"
      | "Second"
      | "Vote"
      | "EmergencyCancel"
      | "ExternalPropose"
      | "ExternalProposeMajority"
      | "ExternalProposeDefault"
      | "FastTrack"
      | "VetoExternal"
      | "CancelReferendum"
      | "CancelQueued"
      | "Delegate"
      | "Undelegate"
      | "ClearPublicProposals"
      | "NotePreimage"
      | "NotePreimageOperational"
      | "NoteImminentPreimage"
      | "NoteImminentPreimageOperational"
      | "ReapPreimage"
      | "Unlock"
      | "RemoveVote"
      | "RemoveOtherVote"
      | "EnactProposal"
      | "Blacklist"
      | "CancelProposal"
  }

  /** @name PalletDemocracyConviction (231) */
  interface PalletDemocracyConviction extends Enum {
    readonly isNone: boolean
    readonly isLocked1x: boolean
    readonly isLocked2x: boolean
    readonly isLocked3x: boolean
    readonly isLocked4x: boolean
    readonly isLocked5x: boolean
    readonly isLocked6x: boolean
    readonly type:
      | "None"
      | "Locked1x"
      | "Locked2x"
      | "Locked3x"
      | "Locked4x"
      | "Locked5x"
      | "Locked6x"
  }

  /** @name PalletElectionsPhragmenCall (233) */
  interface PalletElectionsPhragmenCall extends Enum {
    readonly isVote: boolean
    readonly asVote: {
      readonly votes: Vec<AccountId32>
      readonly value: Compact<u128>
    } & Struct
    readonly isRemoveVoter: boolean
    readonly isSubmitCandidacy: boolean
    readonly asSubmitCandidacy: {
      readonly candidateCount: Compact<u32>
    } & Struct
    readonly isRenounceCandidacy: boolean
    readonly asRenounceCandidacy: {
      readonly renouncing: PalletElectionsPhragmenRenouncing
    } & Struct
    readonly isRemoveMember: boolean
    readonly asRemoveMember: {
      readonly who: AccountId32
      readonly slashBond: bool
      readonly rerunElection: bool
    } & Struct
    readonly isCleanDefunctVoters: boolean
    readonly asCleanDefunctVoters: {
      readonly numVoters: u32
      readonly numDefunct: u32
    } & Struct
    readonly type:
      | "Vote"
      | "RemoveVoter"
      | "SubmitCandidacy"
      | "RenounceCandidacy"
      | "RemoveMember"
      | "CleanDefunctVoters"
  }

  /** @name PalletElectionsPhragmenRenouncing (234) */
  interface PalletElectionsPhragmenRenouncing extends Enum {
    readonly isMember: boolean
    readonly isRunnerUp: boolean
    readonly isCandidate: boolean
    readonly asCandidate: Compact<u32>
    readonly type: "Member" | "RunnerUp" | "Candidate"
  }

  /** @name PalletCollectiveCall (235) */
  interface PalletCollectiveCall extends Enum {
    readonly isSetMembers: boolean
    readonly asSetMembers: {
      readonly newMembers: Vec<AccountId32>
      readonly prime: Option<AccountId32>
      readonly oldCount: u32
    } & Struct
    readonly isExecute: boolean
    readonly asExecute: {
      readonly proposal: Call
      readonly lengthBound: Compact<u32>
    } & Struct
    readonly isPropose: boolean
    readonly asPropose: {
      readonly threshold: Compact<u32>
      readonly proposal: Call
      readonly lengthBound: Compact<u32>
    } & Struct
    readonly isVote: boolean
    readonly asVote: {
      readonly proposal: H256
      readonly index: Compact<u32>
      readonly approve: bool
    } & Struct
    readonly isClose: boolean
    readonly asClose: {
      readonly proposalHash: H256
      readonly index: Compact<u32>
      readonly proposalWeightBound: Compact<WeightV1>
      readonly lengthBound: Compact<u32>
    } & Struct
    readonly isDisapproveProposal: boolean
    readonly asDisapproveProposal: {
      readonly proposalHash: H256
    } & Struct
    readonly type:
      | "SetMembers"
      | "Execute"
      | "Propose"
      | "Vote"
      | "Close"
      | "DisapproveProposal"
  }

  /** @name PalletTipsCall (238) */
  interface PalletTipsCall extends Enum {
    readonly isReportAwesome: boolean
    readonly asReportAwesome: {
      readonly reason: Bytes
      readonly who: AccountId32
    } & Struct
    readonly isRetractTip: boolean
    readonly asRetractTip: {
      readonly hash_: H256
    } & Struct
    readonly isTipNew: boolean
    readonly asTipNew: {
      readonly reason: Bytes
      readonly who: AccountId32
      readonly tipValue: Compact<u128>
    } & Struct
    readonly isTip: boolean
    readonly asTip: {
      readonly hash_: H256
      readonly tipValue: Compact<u128>
    } & Struct
    readonly isCloseTip: boolean
    readonly asCloseTip: {
      readonly hash_: H256
    } & Struct
    readonly isSlashTip: boolean
    readonly asSlashTip: {
      readonly hash_: H256
    } & Struct
    readonly type:
      | "ReportAwesome"
      | "RetractTip"
      | "TipNew"
      | "Tip"
      | "CloseTip"
      | "SlashTip"
  }

  /** @name PalletProxyCall (239) */
  interface PalletProxyCall extends Enum {
    readonly isProxy: boolean
    readonly asProxy: {
      readonly real: AccountId32
      readonly forceProxyType: Option<CommonRuntimeProxyType>
      readonly call: Call
    } & Struct
    readonly isAddProxy: boolean
    readonly asAddProxy: {
      readonly delegate: AccountId32
      readonly proxyType: CommonRuntimeProxyType
      readonly delay: u32
    } & Struct
    readonly isRemoveProxy: boolean
    readonly asRemoveProxy: {
      readonly delegate: AccountId32
      readonly proxyType: CommonRuntimeProxyType
      readonly delay: u32
    } & Struct
    readonly isRemoveProxies: boolean
    readonly isAnonymous: boolean
    readonly asAnonymous: {
      readonly proxyType: CommonRuntimeProxyType
      readonly delay: u32
      readonly index: u16
    } & Struct
    readonly isKillAnonymous: boolean
    readonly asKillAnonymous: {
      readonly spawner: AccountId32
      readonly proxyType: CommonRuntimeProxyType
      readonly index: u16
      readonly height: Compact<u32>
      readonly extIndex: Compact<u32>
    } & Struct
    readonly isAnnounce: boolean
    readonly asAnnounce: {
      readonly real: AccountId32
      readonly callHash: H256
    } & Struct
    readonly isRemoveAnnouncement: boolean
    readonly asRemoveAnnouncement: {
      readonly real: AccountId32
      readonly callHash: H256
    } & Struct
    readonly isRejectAnnouncement: boolean
    readonly asRejectAnnouncement: {
      readonly delegate: AccountId32
      readonly callHash: H256
    } & Struct
    readonly isProxyAnnounced: boolean
    readonly asProxyAnnounced: {
      readonly delegate: AccountId32
      readonly real: AccountId32
      readonly forceProxyType: Option<CommonRuntimeProxyType>
      readonly call: Call
    } & Struct
    readonly type:
      | "Proxy"
      | "AddProxy"
      | "RemoveProxy"
      | "RemoveProxies"
      | "Anonymous"
      | "KillAnonymous"
      | "Announce"
      | "RemoveAnnouncement"
      | "RejectAnnouncement"
      | "ProxyAnnounced"
  }

  /** @name PalletMultisigCall (241) */
  interface PalletMultisigCall extends Enum {
    readonly isAsMultiThreshold1: boolean
    readonly asAsMultiThreshold1: {
      readonly otherSignatories: Vec<AccountId32>
      readonly call: Call
    } & Struct
    readonly isAsMulti: boolean
    readonly asAsMulti: {
      readonly threshold: u16
      readonly otherSignatories: Vec<AccountId32>
      readonly maybeTimepoint: Option<PalletMultisigTimepoint>
      readonly call: WrapperKeepOpaque<Call>
      readonly storeCall: bool
      readonly maxWeight: WeightV1
    } & Struct
    readonly isApproveAsMulti: boolean
    readonly asApproveAsMulti: {
      readonly threshold: u16
      readonly otherSignatories: Vec<AccountId32>
      readonly maybeTimepoint: Option<PalletMultisigTimepoint>
      readonly callHash: U8aFixed
      readonly maxWeight: WeightV1
    } & Struct
    readonly isCancelAsMulti: boolean
    readonly asCancelAsMulti: {
      readonly threshold: u16
      readonly otherSignatories: Vec<AccountId32>
      readonly timepoint: PalletMultisigTimepoint
      readonly callHash: U8aFixed
    } & Struct
    readonly type:
      | "AsMultiThreshold1"
      | "AsMulti"
      | "ApproveAsMulti"
      | "CancelAsMulti"
  }

  /** @name PalletUniquesCall (244) */
  interface PalletUniquesCall extends Enum {
    readonly isCreate: boolean
    readonly asCreate: {
      readonly collection: u128
      readonly admin: AccountId32
    } & Struct
    readonly isForceCreate: boolean
    readonly asForceCreate: {
      readonly collection: u128
      readonly owner: AccountId32
      readonly freeHolding: bool
    } & Struct
    readonly isDestroy: boolean
    readonly asDestroy: {
      readonly collection: u128
      readonly witness: PalletUniquesDestroyWitness
    } & Struct
    readonly isMint: boolean
    readonly asMint: {
      readonly collection: u128
      readonly item: u128
      readonly owner: AccountId32
    } & Struct
    readonly isBurn: boolean
    readonly asBurn: {
      readonly collection: u128
      readonly item: u128
      readonly checkOwner: Option<AccountId32>
    } & Struct
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly collection: u128
      readonly item: u128
      readonly dest: AccountId32
    } & Struct
    readonly isRedeposit: boolean
    readonly asRedeposit: {
      readonly collection: u128
      readonly items: Vec<u128>
    } & Struct
    readonly isFreeze: boolean
    readonly asFreeze: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isThaw: boolean
    readonly asThaw: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isFreezeCollection: boolean
    readonly asFreezeCollection: {
      readonly collection: u128
    } & Struct
    readonly isThawCollection: boolean
    readonly asThawCollection: {
      readonly collection: u128
    } & Struct
    readonly isTransferOwnership: boolean
    readonly asTransferOwnership: {
      readonly collection: u128
      readonly owner: AccountId32
    } & Struct
    readonly isSetTeam: boolean
    readonly asSetTeam: {
      readonly collection: u128
      readonly issuer: AccountId32
      readonly admin: AccountId32
      readonly freezer: AccountId32
    } & Struct
    readonly isApproveTransfer: boolean
    readonly asApproveTransfer: {
      readonly collection: u128
      readonly item: u128
      readonly delegate: AccountId32
    } & Struct
    readonly isCancelApproval: boolean
    readonly asCancelApproval: {
      readonly collection: u128
      readonly item: u128
      readonly maybeCheckDelegate: Option<AccountId32>
    } & Struct
    readonly isForceItemStatus: boolean
    readonly asForceItemStatus: {
      readonly collection: u128
      readonly owner: AccountId32
      readonly issuer: AccountId32
      readonly admin: AccountId32
      readonly freezer: AccountId32
      readonly freeHolding: bool
      readonly isFrozen: bool
    } & Struct
    readonly isSetAttribute: boolean
    readonly asSetAttribute: {
      readonly collection: u128
      readonly maybeItem: Option<u128>
      readonly key: Bytes
      readonly value: Bytes
    } & Struct
    readonly isClearAttribute: boolean
    readonly asClearAttribute: {
      readonly collection: u128
      readonly maybeItem: Option<u128>
      readonly key: Bytes
    } & Struct
    readonly isSetMetadata: boolean
    readonly asSetMetadata: {
      readonly collection: u128
      readonly item: u128
      readonly data: Bytes
      readonly isFrozen: bool
    } & Struct
    readonly isClearMetadata: boolean
    readonly asClearMetadata: {
      readonly collection: u128
      readonly item: u128
    } & Struct
    readonly isSetCollectionMetadata: boolean
    readonly asSetCollectionMetadata: {
      readonly collection: u128
      readonly data: Bytes
      readonly isFrozen: bool
    } & Struct
    readonly isClearCollectionMetadata: boolean
    readonly asClearCollectionMetadata: {
      readonly collection: u128
    } & Struct
    readonly isSetAcceptOwnership: boolean
    readonly asSetAcceptOwnership: {
      readonly maybeCollection: Option<u128>
    } & Struct
    readonly isSetCollectionMaxSupply: boolean
    readonly asSetCollectionMaxSupply: {
      readonly collection: u128
      readonly maxSupply: u32
    } & Struct
    readonly isSetPrice: boolean
    readonly asSetPrice: {
      readonly collection: u128
      readonly item: u128
      readonly price: Option<u128>
      readonly whitelistedBuyer: Option<AccountId32>
    } & Struct
    readonly isBuyItem: boolean
    readonly asBuyItem: {
      readonly collection: u128
      readonly item: u128
      readonly bidPrice: u128
    } & Struct
    readonly type:
      | "Create"
      | "ForceCreate"
      | "Destroy"
      | "Mint"
      | "Burn"
      | "Transfer"
      | "Redeposit"
      | "Freeze"
      | "Thaw"
      | "FreezeCollection"
      | "ThawCollection"
      | "TransferOwnership"
      | "SetTeam"
      | "ApproveTransfer"
      | "CancelApproval"
      | "ForceItemStatus"
      | "SetAttribute"
      | "ClearAttribute"
      | "SetMetadata"
      | "ClearMetadata"
      | "SetCollectionMetadata"
      | "ClearCollectionMetadata"
      | "SetAcceptOwnership"
      | "SetCollectionMaxSupply"
      | "SetPrice"
      | "BuyItem"
  }

  /** @name PalletUniquesDestroyWitness (245) */
  interface PalletUniquesDestroyWitness extends Struct {
    readonly items: Compact<u32>
    readonly itemMetadatas: Compact<u32>
    readonly attributes: Compact<u32>
  }

  /** @name PalletAssetRegistryCall (246) */
  interface PalletAssetRegistryCall extends Enum {
    readonly isRegister: boolean
    readonly asRegister: {
      readonly name: Bytes
      readonly assetType: PalletAssetRegistryAssetType
      readonly existentialDeposit: u128
      readonly assetId: Option<u32>
      readonly metadata: Option<PalletAssetRegistryMetadata>
      readonly location: Option<HydradxRuntimeAssetLocation>
    } & Struct
    readonly isUpdate: boolean
    readonly asUpdate: {
      readonly assetId: u32
      readonly name: Bytes
      readonly assetType: PalletAssetRegistryAssetType
      readonly existentialDeposit: Option<u128>
    } & Struct
    readonly isSetMetadata: boolean
    readonly asSetMetadata: {
      readonly assetId: u32
      readonly symbol: Bytes
      readonly decimals: u8
    } & Struct
    readonly isSetLocation: boolean
    readonly asSetLocation: {
      readonly assetId: u32
      readonly location: HydradxRuntimeAssetLocation
    } & Struct
    readonly type: "Register" | "Update" | "SetMetadata" | "SetLocation"
  }

  /** @name PalletAssetRegistryMetadata (248) */
  interface PalletAssetRegistryMetadata extends Struct {
    readonly symbol: Bytes
    readonly decimals: u8
  }

  /** @name PalletClaimsCall (250) */
  interface PalletClaimsCall extends Enum {
    readonly isClaim: boolean
    readonly asClaim: {
      readonly ethereumSignature: PalletClaimsEcdsaSignature
    } & Struct
    readonly type: "Claim"
  }

  /** @name PalletClaimsEcdsaSignature (251) */
  interface PalletClaimsEcdsaSignature extends U8aFixed {}

  /** @name PalletGenesisHistoryCall (253) */
  type PalletGenesisHistoryCall = Null

  /** @name PalletOmnipoolCall (254) */
  interface PalletOmnipoolCall extends Enum {
    readonly isInitializePool: boolean
    readonly asInitializePool: {
      readonly stableAssetPrice: u128
      readonly nativeAssetPrice: u128
      readonly stableWeightCap: Permill
      readonly nativeWeightCap: Permill
    } & Struct
    readonly isAddToken: boolean
    readonly asAddToken: {
      readonly asset: u32
      readonly initialPrice: u128
      readonly weightCap: Permill
      readonly positionOwner: AccountId32
    } & Struct
    readonly isAddLiquidity: boolean
    readonly asAddLiquidity: {
      readonly asset: u32
      readonly amount: u128
    } & Struct
    readonly isRemoveLiquidity: boolean
    readonly asRemoveLiquidity: {
      readonly positionId: u128
      readonly amount: u128
    } & Struct
    readonly isSacrificePosition: boolean
    readonly asSacrificePosition: {
      readonly positionId: u128
    } & Struct
    readonly isSell: boolean
    readonly asSell: {
      readonly assetIn: u32
      readonly assetOut: u32
      readonly amount: u128
      readonly minBuyAmount: u128
    } & Struct
    readonly isBuy: boolean
    readonly asBuy: {
      readonly assetOut: u32
      readonly assetIn: u32
      readonly amount: u128
      readonly maxSellAmount: u128
    } & Struct
    readonly isSetAssetTradableState: boolean
    readonly asSetAssetTradableState: {
      readonly assetId: u32
      readonly state: PalletOmnipoolTradability
    } & Struct
    readonly isRefundRefusedAsset: boolean
    readonly asRefundRefusedAsset: {
      readonly assetId: u32
      readonly amount: u128
      readonly recipient: AccountId32
    } & Struct
    readonly isSetAssetWeightCap: boolean
    readonly asSetAssetWeightCap: {
      readonly assetId: u32
      readonly cap: Permill
    } & Struct
    readonly isSetTvlCap: boolean
    readonly asSetTvlCap: {
      readonly cap: u128
    } & Struct
    readonly type:
      | "InitializePool"
      | "AddToken"
      | "AddLiquidity"
      | "RemoveLiquidity"
      | "SacrificePosition"
      | "Sell"
      | "Buy"
      | "SetAssetTradableState"
      | "RefundRefusedAsset"
      | "SetAssetWeightCap"
      | "SetTvlCap"
  }

  /** @name PalletTransactionPauseCall (255) */
  interface PalletTransactionPauseCall extends Enum {
    readonly isPauseTransaction: boolean
    readonly asPauseTransaction: {
      readonly palletName: Bytes
      readonly functionName: Bytes
    } & Struct
    readonly isUnpauseTransaction: boolean
    readonly asUnpauseTransaction: {
      readonly palletName: Bytes
      readonly functionName: Bytes
    } & Struct
    readonly type: "PauseTransaction" | "UnpauseTransaction"
  }

  /** @name PalletDusterCall (256) */
  interface PalletDusterCall extends Enum {
    readonly isDustAccount: boolean
    readonly asDustAccount: {
      readonly account: AccountId32
      readonly currencyId: u32
    } & Struct
    readonly isAddNondustableAccount: boolean
    readonly asAddNondustableAccount: {
      readonly account: AccountId32
    } & Struct
    readonly isRemoveNondustableAccount: boolean
    readonly asRemoveNondustableAccount: {
      readonly account: AccountId32
    } & Struct
    readonly type:
      | "DustAccount"
      | "AddNondustableAccount"
      | "RemoveNondustableAccount"
  }

  /** @name PalletLiquidityMiningCall (257) */
  type PalletLiquidityMiningCall = Null

  /** @name PalletOmnipoolLiquidityMiningCall (258) */
  interface PalletOmnipoolLiquidityMiningCall extends Enum {
    readonly isCreateGlobalFarm: boolean
    readonly asCreateGlobalFarm: {
      readonly totalRewards: u128
      readonly plannedYieldingPeriods: u32
      readonly blocksPerPeriod: u32
      readonly rewardCurrency: u32
      readonly owner: AccountId32
      readonly yieldPerPeriod: Perquintill
      readonly minDeposit: u128
      readonly lrnaPriceAdjustment: u128
    } & Struct
    readonly isUpdateGlobalFarm: boolean
    readonly asUpdateGlobalFarm: {
      readonly globalFarmId: u32
      readonly lrnaPriceAdjustment: u128
    } & Struct
    readonly isTerminateGlobalFarm: boolean
    readonly asTerminateGlobalFarm: {
      readonly globalFarmId: u32
    } & Struct
    readonly isCreateYieldFarm: boolean
    readonly asCreateYieldFarm: {
      readonly globalFarmId: u32
      readonly assetId: u32
      readonly multiplier: u128
      readonly loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>
    } & Struct
    readonly isUpdateYieldFarm: boolean
    readonly asUpdateYieldFarm: {
      readonly globalFarmId: u32
      readonly assetId: u32
      readonly multiplier: u128
    } & Struct
    readonly isStopYieldFarm: boolean
    readonly asStopYieldFarm: {
      readonly globalFarmId: u32
      readonly assetId: u32
    } & Struct
    readonly isResumeYieldFarm: boolean
    readonly asResumeYieldFarm: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
      readonly multiplier: u128
    } & Struct
    readonly isTerminateYieldFarm: boolean
    readonly asTerminateYieldFarm: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly assetId: u32
    } & Struct
    readonly isDepositShares: boolean
    readonly asDepositShares: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly positionId: u128
    } & Struct
    readonly isRedepositShares: boolean
    readonly asRedepositShares: {
      readonly globalFarmId: u32
      readonly yieldFarmId: u32
      readonly depositId: u128
    } & Struct
    readonly isClaimRewards: boolean
    readonly asClaimRewards: {
      readonly depositId: u128
      readonly yieldFarmId: u32
    } & Struct
    readonly isWithdrawShares: boolean
    readonly asWithdrawShares: {
      readonly depositId: u128
      readonly yieldFarmId: u32
    } & Struct
    readonly type:
      | "CreateGlobalFarm"
      | "UpdateGlobalFarm"
      | "TerminateGlobalFarm"
      | "CreateYieldFarm"
      | "UpdateYieldFarm"
      | "StopYieldFarm"
      | "ResumeYieldFarm"
      | "TerminateYieldFarm"
      | "DepositShares"
      | "RedepositShares"
      | "ClaimRewards"
      | "WithdrawShares"
  }

  /** @name PalletOtcCall (259) */
  interface PalletOtcCall extends Enum {
    readonly isPlaceOrder: boolean
    readonly asPlaceOrder: {
      readonly assetIn: u32
      readonly assetOut: u32
      readonly amountIn: u128
      readonly amountOut: u128
      readonly partiallyFillable: bool
    } & Struct
    readonly isPartialFillOrder: boolean
    readonly asPartialFillOrder: {
      readonly orderId: u32
      readonly amountIn: u128
    } & Struct
    readonly isFillOrder: boolean
    readonly asFillOrder: {
      readonly orderId: u32
    } & Struct
    readonly isCancelOrder: boolean
    readonly asCancelOrder: {
      readonly orderId: u32
    } & Struct
    readonly type:
      | "PlaceOrder"
      | "PartialFillOrder"
      | "FillOrder"
      | "CancelOrder"
  }

  /** @name PalletCircuitBreakerCall (260) */
  interface PalletCircuitBreakerCall extends Enum {
    readonly isSetTradeVolumeLimit: boolean
    readonly asSetTradeVolumeLimit: {
      readonly assetId: u32
      readonly tradeVolumeLimit: ITuple<[u32, u32]>
    } & Struct
    readonly isSetAddLiquidityLimit: boolean
    readonly asSetAddLiquidityLimit: {
      readonly assetId: u32
      readonly liquidityLimit: Option<ITuple<[u32, u32]>>
    } & Struct
    readonly isSetRemoveLiquidityLimit: boolean
    readonly asSetRemoveLiquidityLimit: {
      readonly assetId: u32
      readonly liquidityLimit: Option<ITuple<[u32, u32]>>
    } & Struct
    readonly type:
      | "SetTradeVolumeLimit"
      | "SetAddLiquidityLimit"
      | "SetRemoveLiquidityLimit"
  }

  /** @name OrmlTokensModuleCall (261) */
  interface OrmlTokensModuleCall extends Enum {
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly dest: AccountId32
      readonly currencyId: u32
      readonly amount: Compact<u128>
    } & Struct
    readonly isTransferAll: boolean
    readonly asTransferAll: {
      readonly dest: AccountId32
      readonly currencyId: u32
      readonly keepAlive: bool
    } & Struct
    readonly isTransferKeepAlive: boolean
    readonly asTransferKeepAlive: {
      readonly dest: AccountId32
      readonly currencyId: u32
      readonly amount: Compact<u128>
    } & Struct
    readonly isForceTransfer: boolean
    readonly asForceTransfer: {
      readonly source: AccountId32
      readonly dest: AccountId32
      readonly currencyId: u32
      readonly amount: Compact<u128>
    } & Struct
    readonly isSetBalance: boolean
    readonly asSetBalance: {
      readonly who: AccountId32
      readonly currencyId: u32
      readonly newFree: Compact<u128>
      readonly newReserved: Compact<u128>
    } & Struct
    readonly type:
      | "Transfer"
      | "TransferAll"
      | "TransferKeepAlive"
      | "ForceTransfer"
      | "SetBalance"
  }

  /** @name PalletCurrenciesModuleCall (262) */
  interface PalletCurrenciesModuleCall extends Enum {
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly dest: AccountId32
      readonly currencyId: u32
      readonly amount: Compact<u128>
    } & Struct
    readonly isTransferNativeCurrency: boolean
    readonly asTransferNativeCurrency: {
      readonly dest: AccountId32
      readonly amount: Compact<u128>
    } & Struct
    readonly isUpdateBalance: boolean
    readonly asUpdateBalance: {
      readonly who: AccountId32
      readonly currencyId: u32
      readonly amount: i128
    } & Struct
    readonly type: "Transfer" | "TransferNativeCurrency" | "UpdateBalance"
  }

  /** @name OrmlVestingModuleCall (263) */
  interface OrmlVestingModuleCall extends Enum {
    readonly isClaim: boolean
    readonly isVestedTransfer: boolean
    readonly asVestedTransfer: {
      readonly dest: AccountId32
      readonly schedule: OrmlVestingVestingSchedule
    } & Struct
    readonly isUpdateVestingSchedules: boolean
    readonly asUpdateVestingSchedules: {
      readonly who: AccountId32
      readonly vestingSchedules: Vec<OrmlVestingVestingSchedule>
    } & Struct
    readonly isClaimFor: boolean
    readonly asClaimFor: {
      readonly dest: AccountId32
    } & Struct
    readonly type:
      | "Claim"
      | "VestedTransfer"
      | "UpdateVestingSchedules"
      | "ClaimFor"
  }

  /** @name CumulusPalletParachainSystemCall (265) */
  interface CumulusPalletParachainSystemCall extends Enum {
    readonly isSetValidationData: boolean
    readonly asSetValidationData: {
      readonly data: CumulusPrimitivesParachainInherentParachainInherentData
    } & Struct
    readonly isSudoSendUpwardMessage: boolean
    readonly asSudoSendUpwardMessage: {
      readonly message: Bytes
    } & Struct
    readonly isAuthorizeUpgrade: boolean
    readonly asAuthorizeUpgrade: {
      readonly codeHash: H256
    } & Struct
    readonly isEnactAuthorizedUpgrade: boolean
    readonly asEnactAuthorizedUpgrade: {
      readonly code: Bytes
    } & Struct
    readonly type:
      | "SetValidationData"
      | "SudoSendUpwardMessage"
      | "AuthorizeUpgrade"
      | "EnactAuthorizedUpgrade"
  }

  /** @name CumulusPrimitivesParachainInherentParachainInherentData (266) */
  interface CumulusPrimitivesParachainInherentParachainInherentData
    extends Struct {
    readonly validationData: PolkadotPrimitivesV2PersistedValidationData
    readonly relayChainState: SpTrieStorageProof
    readonly downwardMessages: Vec<PolkadotCorePrimitivesInboundDownwardMessage>
    readonly horizontalMessages: BTreeMap<
      u32,
      Vec<PolkadotCorePrimitivesInboundHrmpMessage>
    >
  }

  /** @name PolkadotPrimitivesV2PersistedValidationData (267) */
  interface PolkadotPrimitivesV2PersistedValidationData extends Struct {
    readonly parentHead: Bytes
    readonly relayParentNumber: u32
    readonly relayParentStorageRoot: H256
    readonly maxPovSize: u32
  }

  /** @name SpTrieStorageProof (269) */
  interface SpTrieStorageProof extends Struct {
    readonly trieNodes: BTreeSet<Bytes>
  }

  /** @name PolkadotCorePrimitivesInboundDownwardMessage (272) */
  interface PolkadotCorePrimitivesInboundDownwardMessage extends Struct {
    readonly sentAt: u32
    readonly msg: Bytes
  }

  /** @name PolkadotCorePrimitivesInboundHrmpMessage (275) */
  interface PolkadotCorePrimitivesInboundHrmpMessage extends Struct {
    readonly sentAt: u32
    readonly data: Bytes
  }

  /** @name ParachainInfoCall (278) */
  type ParachainInfoCall = Null

  /** @name PalletSchedulerCall (279) */
  interface PalletSchedulerCall extends Enum {
    readonly isSchedule: boolean
    readonly asSchedule: {
      readonly when: u32
      readonly maybePeriodic: Option<ITuple<[u32, u32]>>
      readonly priority: u8
      readonly call: FrameSupportScheduleMaybeHashed
    } & Struct
    readonly isCancel: boolean
    readonly asCancel: {
      readonly when: u32
      readonly index: u32
    } & Struct
    readonly isScheduleNamed: boolean
    readonly asScheduleNamed: {
      readonly id: Bytes
      readonly when: u32
      readonly maybePeriodic: Option<ITuple<[u32, u32]>>
      readonly priority: u8
      readonly call: FrameSupportScheduleMaybeHashed
    } & Struct
    readonly isCancelNamed: boolean
    readonly asCancelNamed: {
      readonly id: Bytes
    } & Struct
    readonly isScheduleAfter: boolean
    readonly asScheduleAfter: {
      readonly after: u32
      readonly maybePeriodic: Option<ITuple<[u32, u32]>>
      readonly priority: u8
      readonly call: FrameSupportScheduleMaybeHashed
    } & Struct
    readonly isScheduleNamedAfter: boolean
    readonly asScheduleNamedAfter: {
      readonly id: Bytes
      readonly after: u32
      readonly maybePeriodic: Option<ITuple<[u32, u32]>>
      readonly priority: u8
      readonly call: FrameSupportScheduleMaybeHashed
    } & Struct
    readonly type:
      | "Schedule"
      | "Cancel"
      | "ScheduleNamed"
      | "CancelNamed"
      | "ScheduleAfter"
      | "ScheduleNamedAfter"
  }

  /** @name FrameSupportScheduleMaybeHashed (280) */
  interface FrameSupportScheduleMaybeHashed extends Enum {
    readonly isValue: boolean
    readonly asValue: Call
    readonly isHash: boolean
    readonly asHash: H256
    readonly type: "Value" | "Hash"
  }

  /** @name PalletXcmCall (281) */
  interface PalletXcmCall extends Enum {
    readonly isSend: boolean
    readonly asSend: {
      readonly dest: XcmVersionedMultiLocation
      readonly message: XcmVersionedXcm
    } & Struct
    readonly isTeleportAssets: boolean
    readonly asTeleportAssets: {
      readonly dest: XcmVersionedMultiLocation
      readonly beneficiary: XcmVersionedMultiLocation
      readonly assets: XcmVersionedMultiAssets
      readonly feeAssetItem: u32
    } & Struct
    readonly isReserveTransferAssets: boolean
    readonly asReserveTransferAssets: {
      readonly dest: XcmVersionedMultiLocation
      readonly beneficiary: XcmVersionedMultiLocation
      readonly assets: XcmVersionedMultiAssets
      readonly feeAssetItem: u32
    } & Struct
    readonly isExecute: boolean
    readonly asExecute: {
      readonly message: XcmVersionedXcm
      readonly maxWeight: WeightV1
    } & Struct
    readonly isForceXcmVersion: boolean
    readonly asForceXcmVersion: {
      readonly location: XcmV1MultiLocation
      readonly xcmVersion: u32
    } & Struct
    readonly isForceDefaultXcmVersion: boolean
    readonly asForceDefaultXcmVersion: {
      readonly maybeXcmVersion: Option<u32>
    } & Struct
    readonly isForceSubscribeVersionNotify: boolean
    readonly asForceSubscribeVersionNotify: {
      readonly location: XcmVersionedMultiLocation
    } & Struct
    readonly isForceUnsubscribeVersionNotify: boolean
    readonly asForceUnsubscribeVersionNotify: {
      readonly location: XcmVersionedMultiLocation
    } & Struct
    readonly isLimitedReserveTransferAssets: boolean
    readonly asLimitedReserveTransferAssets: {
      readonly dest: XcmVersionedMultiLocation
      readonly beneficiary: XcmVersionedMultiLocation
      readonly assets: XcmVersionedMultiAssets
      readonly feeAssetItem: u32
      readonly weightLimit: XcmV2WeightLimit
    } & Struct
    readonly isLimitedTeleportAssets: boolean
    readonly asLimitedTeleportAssets: {
      readonly dest: XcmVersionedMultiLocation
      readonly beneficiary: XcmVersionedMultiLocation
      readonly assets: XcmVersionedMultiAssets
      readonly feeAssetItem: u32
      readonly weightLimit: XcmV2WeightLimit
    } & Struct
    readonly type:
      | "Send"
      | "TeleportAssets"
      | "ReserveTransferAssets"
      | "Execute"
      | "ForceXcmVersion"
      | "ForceDefaultXcmVersion"
      | "ForceSubscribeVersionNotify"
      | "ForceUnsubscribeVersionNotify"
      | "LimitedReserveTransferAssets"
      | "LimitedTeleportAssets"
  }

  /** @name XcmVersionedXcm (282) */
  interface XcmVersionedXcm extends Enum {
    readonly isV0: boolean
    readonly asV0: XcmV0Xcm
    readonly isV1: boolean
    readonly asV1: XcmV1Xcm
    readonly isV2: boolean
    readonly asV2: XcmV2Xcm
    readonly type: "V0" | "V1" | "V2"
  }

  /** @name XcmV0Xcm (283) */
  interface XcmV0Xcm extends Enum {
    readonly isWithdrawAsset: boolean
    readonly asWithdrawAsset: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isReserveAssetDeposit: boolean
    readonly asReserveAssetDeposit: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isTeleportAsset: boolean
    readonly asTeleportAsset: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isQueryResponse: boolean
    readonly asQueryResponse: {
      readonly queryId: Compact<u64>
      readonly response: XcmV0Response
    } & Struct
    readonly isTransferAsset: boolean
    readonly asTransferAsset: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly dest: XcmV0MultiLocation
    } & Struct
    readonly isTransferReserveAsset: boolean
    readonly asTransferReserveAsset: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly dest: XcmV0MultiLocation
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isTransact: boolean
    readonly asTransact: {
      readonly originType: XcmV0OriginKind
      readonly requireWeightAtMost: u64
      readonly call: XcmDoubleEncoded
    } & Struct
    readonly isHrmpNewChannelOpenRequest: boolean
    readonly asHrmpNewChannelOpenRequest: {
      readonly sender: Compact<u32>
      readonly maxMessageSize: Compact<u32>
      readonly maxCapacity: Compact<u32>
    } & Struct
    readonly isHrmpChannelAccepted: boolean
    readonly asHrmpChannelAccepted: {
      readonly recipient: Compact<u32>
    } & Struct
    readonly isHrmpChannelClosing: boolean
    readonly asHrmpChannelClosing: {
      readonly initiator: Compact<u32>
      readonly sender: Compact<u32>
      readonly recipient: Compact<u32>
    } & Struct
    readonly isRelayedFrom: boolean
    readonly asRelayedFrom: {
      readonly who: XcmV0MultiLocation
      readonly message: XcmV0Xcm
    } & Struct
    readonly type:
      | "WithdrawAsset"
      | "ReserveAssetDeposit"
      | "TeleportAsset"
      | "QueryResponse"
      | "TransferAsset"
      | "TransferReserveAsset"
      | "Transact"
      | "HrmpNewChannelOpenRequest"
      | "HrmpChannelAccepted"
      | "HrmpChannelClosing"
      | "RelayedFrom"
  }

  /** @name XcmV0Order (285) */
  interface XcmV0Order extends Enum {
    readonly isNull: boolean
    readonly isDepositAsset: boolean
    readonly asDepositAsset: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly dest: XcmV0MultiLocation
    } & Struct
    readonly isDepositReserveAsset: boolean
    readonly asDepositReserveAsset: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly dest: XcmV0MultiLocation
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isExchangeAsset: boolean
    readonly asExchangeAsset: {
      readonly give: Vec<XcmV0MultiAsset>
      readonly receive: Vec<XcmV0MultiAsset>
    } & Struct
    readonly isInitiateReserveWithdraw: boolean
    readonly asInitiateReserveWithdraw: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly reserve: XcmV0MultiLocation
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isInitiateTeleport: boolean
    readonly asInitiateTeleport: {
      readonly assets: Vec<XcmV0MultiAsset>
      readonly dest: XcmV0MultiLocation
      readonly effects: Vec<XcmV0Order>
    } & Struct
    readonly isQueryHolding: boolean
    readonly asQueryHolding: {
      readonly queryId: Compact<u64>
      readonly dest: XcmV0MultiLocation
      readonly assets: Vec<XcmV0MultiAsset>
    } & Struct
    readonly isBuyExecution: boolean
    readonly asBuyExecution: {
      readonly fees: XcmV0MultiAsset
      readonly weight: u64
      readonly debt: u64
      readonly haltOnError: bool
      readonly xcm: Vec<XcmV0Xcm>
    } & Struct
    readonly type:
      | "Null"
      | "DepositAsset"
      | "DepositReserveAsset"
      | "ExchangeAsset"
      | "InitiateReserveWithdraw"
      | "InitiateTeleport"
      | "QueryHolding"
      | "BuyExecution"
  }

  /** @name XcmV0Response (287) */
  interface XcmV0Response extends Enum {
    readonly isAssets: boolean
    readonly asAssets: Vec<XcmV0MultiAsset>
    readonly type: "Assets"
  }

  /** @name XcmV1Xcm (288) */
  interface XcmV1Xcm extends Enum {
    readonly isWithdrawAsset: boolean
    readonly asWithdrawAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isReserveAssetDeposited: boolean
    readonly asReserveAssetDeposited: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isReceiveTeleportedAsset: boolean
    readonly asReceiveTeleportedAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isQueryResponse: boolean
    readonly asQueryResponse: {
      readonly queryId: Compact<u64>
      readonly response: XcmV1Response
    } & Struct
    readonly isTransferAsset: boolean
    readonly asTransferAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly beneficiary: XcmV1MultiLocation
    } & Struct
    readonly isTransferReserveAsset: boolean
    readonly asTransferReserveAsset: {
      readonly assets: XcmV1MultiassetMultiAssets
      readonly dest: XcmV1MultiLocation
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isTransact: boolean
    readonly asTransact: {
      readonly originType: XcmV0OriginKind
      readonly requireWeightAtMost: u64
      readonly call: XcmDoubleEncoded
    } & Struct
    readonly isHrmpNewChannelOpenRequest: boolean
    readonly asHrmpNewChannelOpenRequest: {
      readonly sender: Compact<u32>
      readonly maxMessageSize: Compact<u32>
      readonly maxCapacity: Compact<u32>
    } & Struct
    readonly isHrmpChannelAccepted: boolean
    readonly asHrmpChannelAccepted: {
      readonly recipient: Compact<u32>
    } & Struct
    readonly isHrmpChannelClosing: boolean
    readonly asHrmpChannelClosing: {
      readonly initiator: Compact<u32>
      readonly sender: Compact<u32>
      readonly recipient: Compact<u32>
    } & Struct
    readonly isRelayedFrom: boolean
    readonly asRelayedFrom: {
      readonly who: XcmV1MultilocationJunctions
      readonly message: XcmV1Xcm
    } & Struct
    readonly isSubscribeVersion: boolean
    readonly asSubscribeVersion: {
      readonly queryId: Compact<u64>
      readonly maxResponseWeight: Compact<u64>
    } & Struct
    readonly isUnsubscribeVersion: boolean
    readonly type:
      | "WithdrawAsset"
      | "ReserveAssetDeposited"
      | "ReceiveTeleportedAsset"
      | "QueryResponse"
      | "TransferAsset"
      | "TransferReserveAsset"
      | "Transact"
      | "HrmpNewChannelOpenRequest"
      | "HrmpChannelAccepted"
      | "HrmpChannelClosing"
      | "RelayedFrom"
      | "SubscribeVersion"
      | "UnsubscribeVersion"
  }

  /** @name XcmV1Order (290) */
  interface XcmV1Order extends Enum {
    readonly isNoop: boolean
    readonly isDepositAsset: boolean
    readonly asDepositAsset: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly maxAssets: u32
      readonly beneficiary: XcmV1MultiLocation
    } & Struct
    readonly isDepositReserveAsset: boolean
    readonly asDepositReserveAsset: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly maxAssets: u32
      readonly dest: XcmV1MultiLocation
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isExchangeAsset: boolean
    readonly asExchangeAsset: {
      readonly give: XcmV1MultiassetMultiAssetFilter
      readonly receive: XcmV1MultiassetMultiAssets
    } & Struct
    readonly isInitiateReserveWithdraw: boolean
    readonly asInitiateReserveWithdraw: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly reserve: XcmV1MultiLocation
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isInitiateTeleport: boolean
    readonly asInitiateTeleport: {
      readonly assets: XcmV1MultiassetMultiAssetFilter
      readonly dest: XcmV1MultiLocation
      readonly effects: Vec<XcmV1Order>
    } & Struct
    readonly isQueryHolding: boolean
    readonly asQueryHolding: {
      readonly queryId: Compact<u64>
      readonly dest: XcmV1MultiLocation
      readonly assets: XcmV1MultiassetMultiAssetFilter
    } & Struct
    readonly isBuyExecution: boolean
    readonly asBuyExecution: {
      readonly fees: XcmV1MultiAsset
      readonly weight: u64
      readonly debt: u64
      readonly haltOnError: bool
      readonly instructions: Vec<XcmV1Xcm>
    } & Struct
    readonly type:
      | "Noop"
      | "DepositAsset"
      | "DepositReserveAsset"
      | "ExchangeAsset"
      | "InitiateReserveWithdraw"
      | "InitiateTeleport"
      | "QueryHolding"
      | "BuyExecution"
  }

  /** @name XcmV1Response (292) */
  interface XcmV1Response extends Enum {
    readonly isAssets: boolean
    readonly asAssets: XcmV1MultiassetMultiAssets
    readonly isVersion: boolean
    readonly asVersion: u32
    readonly type: "Assets" | "Version"
  }

  /** @name CumulusPalletXcmCall (306) */
  type CumulusPalletXcmCall = Null

  /** @name CumulusPalletDmpQueueCall (307) */
  interface CumulusPalletDmpQueueCall extends Enum {
    readonly isServiceOverweight: boolean
    readonly asServiceOverweight: {
      readonly index: u64
      readonly weightLimit: WeightV1
    } & Struct
    readonly type: "ServiceOverweight"
  }

  /** @name OrmlXcmModuleCall (308) */
  interface OrmlXcmModuleCall extends Enum {
    readonly isSendAsSovereign: boolean
    readonly asSendAsSovereign: {
      readonly dest: XcmVersionedMultiLocation
      readonly message: XcmVersionedXcm
    } & Struct
    readonly type: "SendAsSovereign"
  }

  /** @name OrmlXtokensModuleCall (309) */
  interface OrmlXtokensModuleCall extends Enum {
    readonly isTransfer: boolean
    readonly asTransfer: {
      readonly currencyId: u32
      readonly amount: u128
      readonly dest: XcmVersionedMultiLocation
      readonly destWeight: u64
    } & Struct
    readonly isTransferMultiasset: boolean
    readonly asTransferMultiasset: {
      readonly asset: XcmVersionedMultiAsset
      readonly dest: XcmVersionedMultiLocation
      readonly destWeight: u64
    } & Struct
    readonly isTransferWithFee: boolean
    readonly asTransferWithFee: {
      readonly currencyId: u32
      readonly amount: u128
      readonly fee: u128
      readonly dest: XcmVersionedMultiLocation
      readonly destWeight: u64
    } & Struct
    readonly isTransferMultiassetWithFee: boolean
    readonly asTransferMultiassetWithFee: {
      readonly asset: XcmVersionedMultiAsset
      readonly fee: XcmVersionedMultiAsset
      readonly dest: XcmVersionedMultiLocation
      readonly destWeight: u64
    } & Struct
    readonly isTransferMulticurrencies: boolean
    readonly asTransferMulticurrencies: {
      readonly currencies: Vec<ITuple<[u32, u128]>>
      readonly feeItem: u32
      readonly dest: XcmVersionedMultiLocation
      readonly destWeight: u64
    } & Struct
    readonly isTransferMultiassets: boolean
    readonly asTransferMultiassets: {
      readonly assets: XcmVersionedMultiAssets
      readonly feeItem: u32
      readonly dest: XcmVersionedMultiLocation
      readonly destWeight: u64
    } & Struct
    readonly type:
      | "Transfer"
      | "TransferMultiasset"
      | "TransferWithFee"
      | "TransferMultiassetWithFee"
      | "TransferMulticurrencies"
      | "TransferMultiassets"
  }

  /** @name XcmVersionedMultiAsset (310) */
  interface XcmVersionedMultiAsset extends Enum {
    readonly isV0: boolean
    readonly asV0: XcmV0MultiAsset
    readonly isV1: boolean
    readonly asV1: XcmV1MultiAsset
    readonly type: "V0" | "V1"
  }

  /** @name OrmlUnknownTokensModuleCall (313) */
  type OrmlUnknownTokensModuleCall = Null

  /** @name PalletAuthorshipCall (314) */
  interface PalletAuthorshipCall extends Enum {
    readonly isSetUncles: boolean
    readonly asSetUncles: {
      readonly newUncles: Vec<SpRuntimeHeader>
    } & Struct
    readonly type: "SetUncles"
  }

  /** @name SpRuntimeHeader (316) */
  interface SpRuntimeHeader extends Struct {
    readonly parentHash: H256
    readonly number: Compact<u32>
    readonly stateRoot: H256
    readonly extrinsicsRoot: H256
    readonly digest: SpRuntimeDigest
  }

  /** @name SpRuntimeBlakeTwo256 (317) */
  type SpRuntimeBlakeTwo256 = Null

  /** @name PalletCollatorSelectionCall (318) */
  interface PalletCollatorSelectionCall extends Enum {
    readonly isSetInvulnerables: boolean
    readonly asSetInvulnerables: {
      readonly new_: Vec<AccountId32>
    } & Struct
    readonly isSetDesiredCandidates: boolean
    readonly asSetDesiredCandidates: {
      readonly max: u32
    } & Struct
    readonly isSetCandidacyBond: boolean
    readonly asSetCandidacyBond: {
      readonly bond: u128
    } & Struct
    readonly isRegisterAsCandidate: boolean
    readonly isLeaveIntent: boolean
    readonly type:
      | "SetInvulnerables"
      | "SetDesiredCandidates"
      | "SetCandidacyBond"
      | "RegisterAsCandidate"
      | "LeaveIntent"
  }

  /** @name PalletSessionCall (319) */
  interface PalletSessionCall extends Enum {
    readonly isSetKeys: boolean
    readonly asSetKeys: {
      readonly keys_: HydradxRuntimeOpaqueSessionKeys
      readonly proof: Bytes
    } & Struct
    readonly isPurgeKeys: boolean
    readonly type: "SetKeys" | "PurgeKeys"
  }

  /** @name HydradxRuntimeOpaqueSessionKeys (320) */
  interface HydradxRuntimeOpaqueSessionKeys extends Struct {
    readonly aura: SpConsensusAuraSr25519AppSr25519Public
  }

  /** @name SpConsensusAuraSr25519AppSr25519Public (321) */
  interface SpConsensusAuraSr25519AppSr25519Public
    extends SpCoreSr25519Public {}

  /** @name SpCoreSr25519Public (322) */
  interface SpCoreSr25519Public extends U8aFixed {}

  /** @name PalletRelaychainInfoCall (323) */
  type PalletRelaychainInfoCall = Null

  /** @name PalletEmaOracleCall (324) */
  type PalletEmaOracleCall = Null

  /** @name PalletTransactionMultiPaymentCall (325) */
  interface PalletTransactionMultiPaymentCall extends Enum {
    readonly isSetCurrency: boolean
    readonly asSetCurrency: {
      readonly currency: u32
    } & Struct
    readonly isAddCurrency: boolean
    readonly asAddCurrency: {
      readonly currency: u32
      readonly price: u128
    } & Struct
    readonly isRemoveCurrency: boolean
    readonly asRemoveCurrency: {
      readonly currency: u32
    } & Struct
    readonly type: "SetCurrency" | "AddCurrency" | "RemoveCurrency"
  }

  /** @name HydradxRuntimeOriginCaller (326) */
  interface HydradxRuntimeOriginCaller extends Enum {
    readonly isSystem: boolean
    readonly asSystem: FrameSupportDispatchRawOrigin
    readonly isVoid: boolean
    readonly isCouncil: boolean
    readonly asCouncil: PalletCollectiveRawOrigin
    readonly isTechnicalCommittee: boolean
    readonly asTechnicalCommittee: PalletCollectiveRawOrigin
    readonly isPolkadotXcm: boolean
    readonly asPolkadotXcm: PalletXcmOrigin
    readonly isCumulusXcm: boolean
    readonly asCumulusXcm: CumulusPalletXcmOrigin
    readonly type:
      | "System"
      | "Void"
      | "Council"
      | "TechnicalCommittee"
      | "PolkadotXcm"
      | "CumulusXcm"
  }

  /** @name FrameSupportDispatchRawOrigin (327) */
  interface FrameSupportDispatchRawOrigin extends Enum {
    readonly isRoot: boolean
    readonly isSigned: boolean
    readonly asSigned: AccountId32
    readonly isNone: boolean
    readonly type: "Root" | "Signed" | "None"
  }

  /** @name PalletCollectiveRawOrigin (328) */
  interface PalletCollectiveRawOrigin extends Enum {
    readonly isMembers: boolean
    readonly asMembers: ITuple<[u32, u32]>
    readonly isMember: boolean
    readonly asMember: AccountId32
    readonly isPhantom: boolean
    readonly type: "Members" | "Member" | "Phantom"
  }

  /** @name PalletXcmOrigin (330) */
  interface PalletXcmOrigin extends Enum {
    readonly isXcm: boolean
    readonly asXcm: XcmV1MultiLocation
    readonly isResponse: boolean
    readonly asResponse: XcmV1MultiLocation
    readonly type: "Xcm" | "Response"
  }

  /** @name CumulusPalletXcmOrigin (331) */
  interface CumulusPalletXcmOrigin extends Enum {
    readonly isRelay: boolean
    readonly isSiblingParachain: boolean
    readonly asSiblingParachain: u32
    readonly type: "Relay" | "SiblingParachain"
  }

  /** @name SpCoreVoid (332) */
  type SpCoreVoid = Null

  /** @name PalletUtilityError (333) */
  interface PalletUtilityError extends Enum {
    readonly isTooManyCalls: boolean
    readonly type: "TooManyCalls"
  }

  /** @name PalletPreimageRequestStatus (334) */
  interface PalletPreimageRequestStatus extends Enum {
    readonly isUnrequested: boolean
    readonly asUnrequested: Option<ITuple<[AccountId32, u128]>>
    readonly isRequested: boolean
    readonly asRequested: u32
    readonly type: "Unrequested" | "Requested"
  }

  /** @name PalletPreimageError (337) */
  interface PalletPreimageError extends Enum {
    readonly isTooLarge: boolean
    readonly isAlreadyNoted: boolean
    readonly isNotAuthorized: boolean
    readonly isNotNoted: boolean
    readonly isRequested: boolean
    readonly isNotRequested: boolean
    readonly type:
      | "TooLarge"
      | "AlreadyNoted"
      | "NotAuthorized"
      | "NotNoted"
      | "Requested"
      | "NotRequested"
  }

  /** @name PalletIdentityRegistration (338) */
  interface PalletIdentityRegistration extends Struct {
    readonly judgements: Vec<ITuple<[u32, PalletIdentityJudgement]>>
    readonly deposit: u128
    readonly info: PalletIdentityIdentityInfo
  }

  /** @name PalletIdentityRegistrarInfo (346) */
  interface PalletIdentityRegistrarInfo extends Struct {
    readonly account: AccountId32
    readonly fee: u128
    readonly fields: PalletIdentityBitFlags
  }

  /** @name PalletIdentityError (348) */
  interface PalletIdentityError extends Enum {
    readonly isTooManySubAccounts: boolean
    readonly isNotFound: boolean
    readonly isNotNamed: boolean
    readonly isEmptyIndex: boolean
    readonly isFeeChanged: boolean
    readonly isNoIdentity: boolean
    readonly isStickyJudgement: boolean
    readonly isJudgementGiven: boolean
    readonly isInvalidJudgement: boolean
    readonly isInvalidIndex: boolean
    readonly isInvalidTarget: boolean
    readonly isTooManyFields: boolean
    readonly isTooManyRegistrars: boolean
    readonly isAlreadyClaimed: boolean
    readonly isNotSub: boolean
    readonly isNotOwned: boolean
    readonly type:
      | "TooManySubAccounts"
      | "NotFound"
      | "NotNamed"
      | "EmptyIndex"
      | "FeeChanged"
      | "NoIdentity"
      | "StickyJudgement"
      | "JudgementGiven"
      | "InvalidJudgement"
      | "InvalidIndex"
      | "InvalidTarget"
      | "TooManyFields"
      | "TooManyRegistrars"
      | "AlreadyClaimed"
      | "NotSub"
      | "NotOwned"
  }

  /** @name PalletDemocracyPreimageStatus (352) */
  interface PalletDemocracyPreimageStatus extends Enum {
    readonly isMissing: boolean
    readonly asMissing: u32
    readonly isAvailable: boolean
    readonly asAvailable: {
      readonly data: Bytes
      readonly provider: AccountId32
      readonly deposit: u128
      readonly since: u32
      readonly expiry: Option<u32>
    } & Struct
    readonly type: "Missing" | "Available"
  }

  /** @name PalletDemocracyReferendumInfo (353) */
  interface PalletDemocracyReferendumInfo extends Enum {
    readonly isOngoing: boolean
    readonly asOngoing: PalletDemocracyReferendumStatus
    readonly isFinished: boolean
    readonly asFinished: {
      readonly approved: bool
      readonly end: u32
    } & Struct
    readonly type: "Ongoing" | "Finished"
  }

  /** @name PalletDemocracyReferendumStatus (354) */
  interface PalletDemocracyReferendumStatus extends Struct {
    readonly end: u32
    readonly proposalHash: H256
    readonly threshold: PalletDemocracyVoteThreshold
    readonly delay: u32
    readonly tally: PalletDemocracyTally
  }

  /** @name PalletDemocracyTally (355) */
  interface PalletDemocracyTally extends Struct {
    readonly ayes: u128
    readonly nays: u128
    readonly turnout: u128
  }

  /** @name PalletDemocracyVoteVoting (356) */
  interface PalletDemocracyVoteVoting extends Enum {
    readonly isDirect: boolean
    readonly asDirect: {
      readonly votes: Vec<ITuple<[u32, PalletDemocracyVoteAccountVote]>>
      readonly delegations: PalletDemocracyDelegations
      readonly prior: PalletDemocracyVotePriorLock
    } & Struct
    readonly isDelegating: boolean
    readonly asDelegating: {
      readonly balance: u128
      readonly target: AccountId32
      readonly conviction: PalletDemocracyConviction
      readonly delegations: PalletDemocracyDelegations
      readonly prior: PalletDemocracyVotePriorLock
    } & Struct
    readonly type: "Direct" | "Delegating"
  }

  /** @name PalletDemocracyDelegations (359) */
  interface PalletDemocracyDelegations extends Struct {
    readonly votes: u128
    readonly capital: u128
  }

  /** @name PalletDemocracyVotePriorLock (360) */
  interface PalletDemocracyVotePriorLock extends ITuple<[u32, u128]> {}

  /** @name PalletDemocracyReleases (363) */
  interface PalletDemocracyReleases extends Enum {
    readonly isV1: boolean
    readonly type: "V1"
  }

  /** @name PalletDemocracyError (364) */
  interface PalletDemocracyError extends Enum {
    readonly isValueLow: boolean
    readonly isProposalMissing: boolean
    readonly isAlreadyCanceled: boolean
    readonly isDuplicateProposal: boolean
    readonly isProposalBlacklisted: boolean
    readonly isNotSimpleMajority: boolean
    readonly isInvalidHash: boolean
    readonly isNoProposal: boolean
    readonly isAlreadyVetoed: boolean
    readonly isDuplicatePreimage: boolean
    readonly isNotImminent: boolean
    readonly isTooEarly: boolean
    readonly isImminent: boolean
    readonly isPreimageMissing: boolean
    readonly isReferendumInvalid: boolean
    readonly isPreimageInvalid: boolean
    readonly isNoneWaiting: boolean
    readonly isNotVoter: boolean
    readonly isNoPermission: boolean
    readonly isAlreadyDelegating: boolean
    readonly isInsufficientFunds: boolean
    readonly isNotDelegating: boolean
    readonly isVotesExist: boolean
    readonly isInstantNotAllowed: boolean
    readonly isNonsense: boolean
    readonly isWrongUpperBound: boolean
    readonly isMaxVotesReached: boolean
    readonly isTooManyProposals: boolean
    readonly isVotingPeriodLow: boolean
    readonly type:
      | "ValueLow"
      | "ProposalMissing"
      | "AlreadyCanceled"
      | "DuplicateProposal"
      | "ProposalBlacklisted"
      | "NotSimpleMajority"
      | "InvalidHash"
      | "NoProposal"
      | "AlreadyVetoed"
      | "DuplicatePreimage"
      | "NotImminent"
      | "TooEarly"
      | "Imminent"
      | "PreimageMissing"
      | "ReferendumInvalid"
      | "PreimageInvalid"
      | "NoneWaiting"
      | "NotVoter"
      | "NoPermission"
      | "AlreadyDelegating"
      | "InsufficientFunds"
      | "NotDelegating"
      | "VotesExist"
      | "InstantNotAllowed"
      | "Nonsense"
      | "WrongUpperBound"
      | "MaxVotesReached"
      | "TooManyProposals"
      | "VotingPeriodLow"
  }

  /** @name PalletElectionsPhragmenSeatHolder (366) */
  interface PalletElectionsPhragmenSeatHolder extends Struct {
    readonly who: AccountId32
    readonly stake: u128
    readonly deposit: u128
  }

  /** @name PalletElectionsPhragmenVoter (367) */
  interface PalletElectionsPhragmenVoter extends Struct {
    readonly votes: Vec<AccountId32>
    readonly stake: u128
    readonly deposit: u128
  }

  /** @name PalletElectionsPhragmenError (368) */
  interface PalletElectionsPhragmenError extends Enum {
    readonly isUnableToVote: boolean
    readonly isNoVotes: boolean
    readonly isTooManyVotes: boolean
    readonly isMaximumVotesExceeded: boolean
    readonly isLowBalance: boolean
    readonly isUnableToPayBond: boolean
    readonly isMustBeVoter: boolean
    readonly isDuplicatedCandidate: boolean
    readonly isTooManyCandidates: boolean
    readonly isMemberSubmit: boolean
    readonly isRunnerUpSubmit: boolean
    readonly isInsufficientCandidateFunds: boolean
    readonly isNotMember: boolean
    readonly isInvalidWitnessData: boolean
    readonly isInvalidVoteCount: boolean
    readonly isInvalidRenouncing: boolean
    readonly isInvalidReplacement: boolean
    readonly type:
      | "UnableToVote"
      | "NoVotes"
      | "TooManyVotes"
      | "MaximumVotesExceeded"
      | "LowBalance"
      | "UnableToPayBond"
      | "MustBeVoter"
      | "DuplicatedCandidate"
      | "TooManyCandidates"
      | "MemberSubmit"
      | "RunnerUpSubmit"
      | "InsufficientCandidateFunds"
      | "NotMember"
      | "InvalidWitnessData"
      | "InvalidVoteCount"
      | "InvalidRenouncing"
      | "InvalidReplacement"
  }

  /** @name PalletCollectiveVotes (370) */
  interface PalletCollectiveVotes extends Struct {
    readonly index: u32
    readonly threshold: u32
    readonly ayes: Vec<AccountId32>
    readonly nays: Vec<AccountId32>
    readonly end: u32
  }

  /** @name PalletCollectiveError (371) */
  interface PalletCollectiveError extends Enum {
    readonly isNotMember: boolean
    readonly isDuplicateProposal: boolean
    readonly isProposalMissing: boolean
    readonly isWrongIndex: boolean
    readonly isDuplicateVote: boolean
    readonly isAlreadyInitialized: boolean
    readonly isTooEarly: boolean
    readonly isTooManyProposals: boolean
    readonly isWrongProposalWeight: boolean
    readonly isWrongProposalLength: boolean
    readonly type:
      | "NotMember"
      | "DuplicateProposal"
      | "ProposalMissing"
      | "WrongIndex"
      | "DuplicateVote"
      | "AlreadyInitialized"
      | "TooEarly"
      | "TooManyProposals"
      | "WrongProposalWeight"
      | "WrongProposalLength"
  }

  /** @name PalletTipsOpenTip (374) */
  interface PalletTipsOpenTip extends Struct {
    readonly reason: H256
    readonly who: AccountId32
    readonly finder: AccountId32
    readonly deposit: u128
    readonly closes: Option<u32>
    readonly tips: Vec<ITuple<[AccountId32, u128]>>
    readonly findersFee: bool
  }

  /** @name PalletTipsError (376) */
  interface PalletTipsError extends Enum {
    readonly isReasonTooBig: boolean
    readonly isAlreadyKnown: boolean
    readonly isUnknownTip: boolean
    readonly isNotFinder: boolean
    readonly isStillOpen: boolean
    readonly isPremature: boolean
    readonly type:
      | "ReasonTooBig"
      | "AlreadyKnown"
      | "UnknownTip"
      | "NotFinder"
      | "StillOpen"
      | "Premature"
  }

  /** @name PalletProxyProxyDefinition (379) */
  interface PalletProxyProxyDefinition extends Struct {
    readonly delegate: AccountId32
    readonly proxyType: CommonRuntimeProxyType
    readonly delay: u32
  }

  /** @name PalletProxyAnnouncement (383) */
  interface PalletProxyAnnouncement extends Struct {
    readonly real: AccountId32
    readonly callHash: H256
    readonly height: u32
  }

  /** @name PalletProxyError (385) */
  interface PalletProxyError extends Enum {
    readonly isTooMany: boolean
    readonly isNotFound: boolean
    readonly isNotProxy: boolean
    readonly isUnproxyable: boolean
    readonly isDuplicate: boolean
    readonly isNoPermission: boolean
    readonly isUnannounced: boolean
    readonly isNoSelfProxy: boolean
    readonly type:
      | "TooMany"
      | "NotFound"
      | "NotProxy"
      | "Unproxyable"
      | "Duplicate"
      | "NoPermission"
      | "Unannounced"
      | "NoSelfProxy"
  }

  /** @name PalletMultisigMultisig (387) */
  interface PalletMultisigMultisig extends Struct {
    readonly when: PalletMultisigTimepoint
    readonly deposit: u128
    readonly depositor: AccountId32
    readonly approvals: Vec<AccountId32>
  }

  /** @name PalletMultisigError (389) */
  interface PalletMultisigError extends Enum {
    readonly isMinimumThreshold: boolean
    readonly isAlreadyApproved: boolean
    readonly isNoApprovalsNeeded: boolean
    readonly isTooFewSignatories: boolean
    readonly isTooManySignatories: boolean
    readonly isSignatoriesOutOfOrder: boolean
    readonly isSenderInSignatories: boolean
    readonly isNotFound: boolean
    readonly isNotOwner: boolean
    readonly isNoTimepoint: boolean
    readonly isWrongTimepoint: boolean
    readonly isUnexpectedTimepoint: boolean
    readonly isMaxWeightTooLow: boolean
    readonly isAlreadyStored: boolean
    readonly type:
      | "MinimumThreshold"
      | "AlreadyApproved"
      | "NoApprovalsNeeded"
      | "TooFewSignatories"
      | "TooManySignatories"
      | "SignatoriesOutOfOrder"
      | "SenderInSignatories"
      | "NotFound"
      | "NotOwner"
      | "NoTimepoint"
      | "WrongTimepoint"
      | "UnexpectedTimepoint"
      | "MaxWeightTooLow"
      | "AlreadyStored"
  }

  /** @name PalletUniquesCollectionDetails (390) */
  interface PalletUniquesCollectionDetails extends Struct {
    readonly owner: AccountId32
    readonly issuer: AccountId32
    readonly admin: AccountId32
    readonly freezer: AccountId32
    readonly totalDeposit: u128
    readonly freeHolding: bool
    readonly items: u32
    readonly itemMetadatas: u32
    readonly attributes: u32
    readonly isFrozen: bool
  }

  /** @name PalletUniquesItemDetails (393) */
  interface PalletUniquesItemDetails extends Struct {
    readonly owner: AccountId32
    readonly approved: Option<AccountId32>
    readonly isFrozen: bool
    readonly deposit: u128
  }

  /** @name PalletUniquesCollectionMetadata (394) */
  interface PalletUniquesCollectionMetadata extends Struct {
    readonly deposit: u128
    readonly data: Bytes
    readonly isFrozen: bool
  }

  /** @name PalletUniquesItemMetadata (395) */
  interface PalletUniquesItemMetadata extends Struct {
    readonly deposit: u128
    readonly data: Bytes
    readonly isFrozen: bool
  }

  /** @name PalletUniquesError (399) */
  interface PalletUniquesError extends Enum {
    readonly isNoPermission: boolean
    readonly isUnknownCollection: boolean
    readonly isAlreadyExists: boolean
    readonly isWrongOwner: boolean
    readonly isBadWitness: boolean
    readonly isInUse: boolean
    readonly isFrozen: boolean
    readonly isWrongDelegate: boolean
    readonly isNoDelegate: boolean
    readonly isUnapproved: boolean
    readonly isUnaccepted: boolean
    readonly isLocked: boolean
    readonly isMaxSupplyReached: boolean
    readonly isMaxSupplyAlreadySet: boolean
    readonly isMaxSupplyTooSmall: boolean
    readonly isUnknownItem: boolean
    readonly isNotForSale: boolean
    readonly isBidTooLow: boolean
    readonly type:
      | "NoPermission"
      | "UnknownCollection"
      | "AlreadyExists"
      | "WrongOwner"
      | "BadWitness"
      | "InUse"
      | "Frozen"
      | "WrongDelegate"
      | "NoDelegate"
      | "Unapproved"
      | "Unaccepted"
      | "Locked"
      | "MaxSupplyReached"
      | "MaxSupplyAlreadySet"
      | "MaxSupplyTooSmall"
      | "UnknownItem"
      | "NotForSale"
      | "BidTooLow"
  }

  /** @name PalletAssetRegistryAssetDetails (400) */
  interface PalletAssetRegistryAssetDetails extends Struct {
    readonly name: Bytes
    readonly assetType: PalletAssetRegistryAssetType
    readonly existentialDeposit: u128
    readonly locked: bool
  }

  /** @name PalletAssetRegistryAssetMetadata (401) */
  interface PalletAssetRegistryAssetMetadata extends Struct {
    readonly symbol: Bytes
    readonly decimals: u8
  }

  /** @name PalletAssetRegistryError (402) */
  interface PalletAssetRegistryError extends Enum {
    readonly isNoIdAvailable: boolean
    readonly isAssetNotFound: boolean
    readonly isTooLong: boolean
    readonly isAssetNotRegistered: boolean
    readonly isAssetAlreadyRegistered: boolean
    readonly isInvalidSharedAssetLen: boolean
    readonly isCannotUpdateLocation: boolean
    readonly isNotInReservedRange: boolean
    readonly type:
      | "NoIdAvailable"
      | "AssetNotFound"
      | "TooLong"
      | "AssetNotRegistered"
      | "AssetAlreadyRegistered"
      | "InvalidSharedAssetLen"
      | "CannotUpdateLocation"
      | "NotInReservedRange"
  }

  /** @name PalletClaimsError (403) */
  interface PalletClaimsError extends Enum {
    readonly isInvalidEthereumSignature: boolean
    readonly isNoClaimOrAlreadyClaimed: boolean
    readonly isBalanceOverflow: boolean
    readonly type:
      | "InvalidEthereumSignature"
      | "NoClaimOrAlreadyClaimed"
      | "BalanceOverflow"
  }

  /** @name PalletGenesisHistoryChain (404) */
  interface PalletGenesisHistoryChain extends Struct {
    readonly genesisHash: Bytes
    readonly lastBlockHash: Bytes
  }

  /** @name PalletCollatorRewardsError (406) */
  type PalletCollatorRewardsError = Null

  /** @name PalletOmnipoolAssetState (407) */
  interface PalletOmnipoolAssetState extends Struct {
    readonly hubReserve: u128
    readonly shares: u128
    readonly protocolShares: u128
    readonly cap: u128
    readonly tradable: PalletOmnipoolTradability
  }

  /** @name PalletOmnipoolSimpleImbalance (408) */
  interface PalletOmnipoolSimpleImbalance extends Struct {
    readonly value: u128
    readonly negative: bool
  }

  /** @name PalletOmnipoolPosition (409) */
  interface PalletOmnipoolPosition extends Struct {
    readonly assetId: u32
    readonly amount: u128
    readonly shares: u128
    readonly price: ITuple<[u128, u128]>
  }

  /** @name PalletOmnipoolError (410) */
  interface PalletOmnipoolError extends Enum {
    readonly isInsufficientBalance: boolean
    readonly isAssetAlreadyAdded: boolean
    readonly isAssetNotFound: boolean
    readonly isNoStableAssetInPool: boolean
    readonly isNoNativeAssetInPool: boolean
    readonly isMissingBalance: boolean
    readonly isInvalidInitialAssetPrice: boolean
    readonly isBuyLimitNotReached: boolean
    readonly isSellLimitExceeded: boolean
    readonly isPositionNotFound: boolean
    readonly isInsufficientShares: boolean
    readonly isNotAllowed: boolean
    readonly isForbidden: boolean
    readonly isAssetWeightCapExceeded: boolean
    readonly isTvlCapExceeded: boolean
    readonly isAssetNotRegistered: boolean
    readonly isInsufficientLiquidity: boolean
    readonly isInsufficientTradingAmount: boolean
    readonly isSameAssetTradeNotAllowed: boolean
    readonly isHubAssetUpdateError: boolean
    readonly isPositiveImbalance: boolean
    readonly isInvalidSharesAmount: boolean
    readonly isInvalidHubAssetTradableState: boolean
    readonly isAssetRefundNotAllowed: boolean
    readonly isMaxOutRatioExceeded: boolean
    readonly isMaxInRatioExceeded: boolean
    readonly isPriceDifferenceTooHigh: boolean
    readonly type:
      | "InsufficientBalance"
      | "AssetAlreadyAdded"
      | "AssetNotFound"
      | "NoStableAssetInPool"
      | "NoNativeAssetInPool"
      | "MissingBalance"
      | "InvalidInitialAssetPrice"
      | "BuyLimitNotReached"
      | "SellLimitExceeded"
      | "PositionNotFound"
      | "InsufficientShares"
      | "NotAllowed"
      | "Forbidden"
      | "AssetWeightCapExceeded"
      | "TvlCapExceeded"
      | "AssetNotRegistered"
      | "InsufficientLiquidity"
      | "InsufficientTradingAmount"
      | "SameAssetTradeNotAllowed"
      | "HubAssetUpdateError"
      | "PositiveImbalance"
      | "InvalidSharesAmount"
      | "InvalidHubAssetTradableState"
      | "AssetRefundNotAllowed"
      | "MaxOutRatioExceeded"
      | "MaxInRatioExceeded"
      | "PriceDifferenceTooHigh"
  }

  /** @name PalletTransactionPauseError (411) */
  interface PalletTransactionPauseError extends Enum {
    readonly isCannotPause: boolean
    readonly isInvalidCharacter: boolean
    readonly type: "CannotPause" | "InvalidCharacter"
  }

  /** @name PalletDusterError (412) */
  interface PalletDusterError extends Enum {
    readonly isAccountBlacklisted: boolean
    readonly isAccountNotBlacklisted: boolean
    readonly isZeroBalance: boolean
    readonly isBalanceSufficient: boolean
    readonly isDustAccountNotSet: boolean
    readonly isReserveAccountNotSet: boolean
    readonly type:
      | "AccountBlacklisted"
      | "AccountNotBlacklisted"
      | "ZeroBalance"
      | "BalanceSufficient"
      | "DustAccountNotSet"
      | "ReserveAccountNotSet"
  }

  /** @name PalletLiquidityMiningGlobalFarmData (413) */
  interface PalletLiquidityMiningGlobalFarmData extends Struct {
    readonly id: u32
    readonly owner: AccountId32
    readonly updatedAt: u32
    readonly totalSharesZ: u128
    readonly accumulatedRpz: u128
    readonly rewardCurrency: u32
    readonly pendingRewards: u128
    readonly accumulatedPaidRewards: u128
    readonly yieldPerPeriod: Perquintill
    readonly plannedYieldingPeriods: u32
    readonly blocksPerPeriod: u32
    readonly incentivizedAsset: u32
    readonly maxRewardPerPeriod: u128
    readonly minDeposit: u128
    readonly liveYieldFarmsCount: u32
    readonly totalYieldFarmsCount: u32
    readonly priceAdjustment: u128
    readonly state: PalletLiquidityMiningFarmState
  }

  /** @name PalletLiquidityMiningFarmState (414) */
  interface PalletLiquidityMiningFarmState extends Enum {
    readonly isActive: boolean
    readonly isStopped: boolean
    readonly isTerminated: boolean
    readonly type: "Active" | "Stopped" | "Terminated"
  }

  /** @name PalletLiquidityMiningYieldFarmData (416) */
  interface PalletLiquidityMiningYieldFarmData extends Struct {
    readonly id: u32
    readonly updatedAt: u32
    readonly totalShares: u128
    readonly totalValuedShares: u128
    readonly accumulatedRpvs: u128
    readonly accumulatedRpz: u128
    readonly loyaltyCurve: Option<PalletLiquidityMiningLoyaltyCurve>
    readonly multiplier: u128
    readonly state: PalletLiquidityMiningFarmState
    readonly entriesCount: u64
    readonly leftToDistribute: u128
    readonly totalStopped: u32
  }

  /** @name PalletLiquidityMiningDepositData (417) */
  interface PalletLiquidityMiningDepositData extends Struct {
    readonly shares: u128
    readonly ammPoolId: u32
    readonly yieldFarmEntries: Vec<PalletLiquidityMiningYieldFarmEntry>
  }

  /** @name PalletLiquidityMiningYieldFarmEntry (419) */
  interface PalletLiquidityMiningYieldFarmEntry extends Struct {
    readonly globalFarmId: u32
    readonly yieldFarmId: u32
    readonly valuedShares: u128
    readonly accumulatedRpvs: u128
    readonly accumulatedClaimedRewards: u128
    readonly enteredAt: u32
    readonly updatedAt: u32
    readonly stoppedAtCreation: u32
  }

  /** @name PalletLiquidityMiningError (421) */
  interface PalletLiquidityMiningError extends Enum {
    readonly isGlobalFarmNotFound: boolean
    readonly isYieldFarmNotFound: boolean
    readonly isDoubleClaimInPeriod: boolean
    readonly isLiquidityMiningCanceled: boolean
    readonly isLiquidityMiningIsActive: boolean
    readonly isLiquidityMiningIsNotStopped: boolean
    readonly isInvalidDepositAmount: boolean
    readonly isForbidden: boolean
    readonly isInvalidMultiplier: boolean
    readonly isYieldFarmAlreadyExists: boolean
    readonly isInvalidInitialRewardPercentage: boolean
    readonly isGlobalFarmIsNotEmpty: boolean
    readonly isMissingIncentivizedAsset: boolean
    readonly isInsufficientRewardCurrencyBalance: boolean
    readonly isInvalidBlocksPerPeriod: boolean
    readonly isInvalidYieldPerPeriod: boolean
    readonly isInvalidTotalRewards: boolean
    readonly isInvalidPlannedYieldingPeriods: boolean
    readonly isMaxEntriesPerDeposit: boolean
    readonly isDoubleLock: boolean
    readonly isYieldFarmEntryNotFound: boolean
    readonly isGlobalFarmIsFull: boolean
    readonly isInvalidMinDeposit: boolean
    readonly isInvalidPriceAdjustment: boolean
    readonly isErrorGetAccountId: boolean
    readonly isZeroValuedShares: boolean
    readonly isRewardCurrencyNotRegistered: boolean
    readonly isIncentivizedAssetNotRegistered: boolean
    readonly isInconsistentState: boolean
    readonly asInconsistentState: PalletLiquidityMiningInconsistentStateError
    readonly type:
      | "GlobalFarmNotFound"
      | "YieldFarmNotFound"
      | "DoubleClaimInPeriod"
      | "LiquidityMiningCanceled"
      | "LiquidityMiningIsActive"
      | "LiquidityMiningIsNotStopped"
      | "InvalidDepositAmount"
      | "Forbidden"
      | "InvalidMultiplier"
      | "YieldFarmAlreadyExists"
      | "InvalidInitialRewardPercentage"
      | "GlobalFarmIsNotEmpty"
      | "MissingIncentivizedAsset"
      | "InsufficientRewardCurrencyBalance"
      | "InvalidBlocksPerPeriod"
      | "InvalidYieldPerPeriod"
      | "InvalidTotalRewards"
      | "InvalidPlannedYieldingPeriods"
      | "MaxEntriesPerDeposit"
      | "DoubleLock"
      | "YieldFarmEntryNotFound"
      | "GlobalFarmIsFull"
      | "InvalidMinDeposit"
      | "InvalidPriceAdjustment"
      | "ErrorGetAccountId"
      | "ZeroValuedShares"
      | "RewardCurrencyNotRegistered"
      | "IncentivizedAssetNotRegistered"
      | "InconsistentState"
  }

  /** @name PalletLiquidityMiningInconsistentStateError (422) */
  interface PalletLiquidityMiningInconsistentStateError extends Enum {
    readonly isYieldFarmNotFound: boolean
    readonly isGlobalFarmNotFound: boolean
    readonly isLiquidityIsNotActive: boolean
    readonly isGlobalFarmIsNotActive: boolean
    readonly isDepositNotFound: boolean
    readonly isInvalidPeriod: boolean
    readonly isNotEnoughRewardsInYieldFarm: boolean
    readonly isInvalidLiveYielFarmsCount: boolean
    readonly isInvalidTotalYieldFarmsCount: boolean
    readonly isInvalidYieldFarmEntriesCount: boolean
    readonly isInvalidTotalShares: boolean
    readonly isInvalidValuedShares: boolean
    readonly isInvalidTotalSharesZ: boolean
    readonly isInvalidPaidAccumulatedRewards: boolean
    readonly isInvalidFarmId: boolean
    readonly isInvalidLoyaltyMultiplier: boolean
    readonly type:
      | "YieldFarmNotFound"
      | "GlobalFarmNotFound"
      | "LiquidityIsNotActive"
      | "GlobalFarmIsNotActive"
      | "DepositNotFound"
      | "InvalidPeriod"
      | "NotEnoughRewardsInYieldFarm"
      | "InvalidLiveYielFarmsCount"
      | "InvalidTotalYieldFarmsCount"
      | "InvalidYieldFarmEntriesCount"
      | "InvalidTotalShares"
      | "InvalidValuedShares"
      | "InvalidTotalSharesZ"
      | "InvalidPaidAccumulatedRewards"
      | "InvalidFarmId"
      | "InvalidLoyaltyMultiplier"
  }

  /** @name PalletOmnipoolLiquidityMiningError (423) */
  interface PalletOmnipoolLiquidityMiningError extends Enum {
    readonly isAssetNotFound: boolean
    readonly isForbidden: boolean
    readonly isZeroClaimedRewards: boolean
    readonly isInconsistentState: boolean
    readonly asInconsistentState: PalletOmnipoolLiquidityMiningInconsistentStateError
    readonly type:
      | "AssetNotFound"
      | "Forbidden"
      | "ZeroClaimedRewards"
      | "InconsistentState"
  }

  /** @name PalletOmnipoolLiquidityMiningInconsistentStateError (424) */
  interface PalletOmnipoolLiquidityMiningInconsistentStateError extends Enum {
    readonly isMissingLpPosition: boolean
    readonly isDepositDataNotFound: boolean
    readonly type: "MissingLpPosition" | "DepositDataNotFound"
  }

  /** @name PalletOtcOrder (425) */
  interface PalletOtcOrder extends Struct {
    readonly owner: AccountId32
    readonly assetIn: u32
    readonly assetOut: u32
    readonly amountIn: u128
    readonly amountOut: u128
    readonly partiallyFillable: bool
  }

  /** @name PalletOtcError (426) */
  interface PalletOtcError extends Enum {
    readonly isAssetNotRegistered: boolean
    readonly isOrderNotFound: boolean
    readonly isOrderIdOutOfBound: boolean
    readonly isOrderNotPartiallyFillable: boolean
    readonly isOrderAmountTooSmall: boolean
    readonly isMathError: boolean
    readonly isForbidden: boolean
    readonly type:
      | "AssetNotRegistered"
      | "OrderNotFound"
      | "OrderIdOutOfBound"
      | "OrderNotPartiallyFillable"
      | "OrderAmountTooSmall"
      | "MathError"
      | "Forbidden"
  }

  /** @name PalletCircuitBreakerTradeVolumeLimit (427) */
  interface PalletCircuitBreakerTradeVolumeLimit extends Struct {
    readonly volumeIn: u128
    readonly volumeOut: u128
    readonly limit: u128
  }

  /** @name PalletCircuitBreakerLiquidityLimit (428) */
  interface PalletCircuitBreakerLiquidityLimit extends Struct {
    readonly liquidity: u128
    readonly limit: u128
  }

  /** @name PalletCircuitBreakerError (429) */
  interface PalletCircuitBreakerError extends Enum {
    readonly isInvalidLimitValue: boolean
    readonly isLiquidityLimitNotStoredForAsset: boolean
    readonly isTokenOutflowLimitReached: boolean
    readonly isTokenInfluxLimitReached: boolean
    readonly isMaxLiquidityLimitPerBlockReached: boolean
    readonly isNotAllowed: boolean
    readonly type:
      | "InvalidLimitValue"
      | "LiquidityLimitNotStoredForAsset"
      | "TokenOutflowLimitReached"
      | "TokenInfluxLimitReached"
      | "MaxLiquidityLimitPerBlockReached"
      | "NotAllowed"
  }

  /** @name OrmlTokensBalanceLock (432) */
  interface OrmlTokensBalanceLock extends Struct {
    readonly id: U8aFixed
    readonly amount: u128
  }

  /** @name OrmlTokensAccountData (434) */
  interface OrmlTokensAccountData extends Struct {
    readonly free: u128
    readonly reserved: u128
    readonly frozen: u128
  }

  /** @name OrmlTokensReserveData (436) */
  interface OrmlTokensReserveData extends Struct {
    readonly id: U8aFixed
    readonly amount: u128
  }

  /** @name OrmlTokensModuleError (438) */
  interface OrmlTokensModuleError extends Enum {
    readonly isBalanceTooLow: boolean
    readonly isAmountIntoBalanceFailed: boolean
    readonly isLiquidityRestrictions: boolean
    readonly isMaxLocksExceeded: boolean
    readonly isKeepAlive: boolean
    readonly isExistentialDeposit: boolean
    readonly isDeadAccount: boolean
    readonly isTooManyReserves: boolean
    readonly type:
      | "BalanceTooLow"
      | "AmountIntoBalanceFailed"
      | "LiquidityRestrictions"
      | "MaxLocksExceeded"
      | "KeepAlive"
      | "ExistentialDeposit"
      | "DeadAccount"
      | "TooManyReserves"
  }

  /** @name PalletCurrenciesModuleError (439) */
  interface PalletCurrenciesModuleError extends Enum {
    readonly isAmountIntoBalanceFailed: boolean
    readonly isBalanceTooLow: boolean
    readonly isDepositFailed: boolean
    readonly type: "AmountIntoBalanceFailed" | "BalanceTooLow" | "DepositFailed"
  }

  /** @name OrmlVestingModuleError (441) */
  interface OrmlVestingModuleError extends Enum {
    readonly isZeroVestingPeriod: boolean
    readonly isZeroVestingPeriodCount: boolean
    readonly isInsufficientBalanceToLock: boolean
    readonly isTooManyVestingSchedules: boolean
    readonly isAmountLow: boolean
    readonly isMaxVestingSchedulesExceeded: boolean
    readonly type:
      | "ZeroVestingPeriod"
      | "ZeroVestingPeriodCount"
      | "InsufficientBalanceToLock"
      | "TooManyVestingSchedules"
      | "AmountLow"
      | "MaxVestingSchedulesExceeded"
  }

  /** @name PolkadotPrimitivesV2UpgradeRestriction (443) */
  interface PolkadotPrimitivesV2UpgradeRestriction extends Enum {
    readonly isPresent: boolean
    readonly type: "Present"
  }

  /** @name CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot (444) */
  interface CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot
    extends Struct {
    readonly dmqMqcHead: H256
    readonly relayDispatchQueueSize: ITuple<[u32, u32]>
    readonly ingressChannels: Vec<
      ITuple<[u32, PolkadotPrimitivesV2AbridgedHrmpChannel]>
    >
    readonly egressChannels: Vec<
      ITuple<[u32, PolkadotPrimitivesV2AbridgedHrmpChannel]>
    >
  }

  /** @name PolkadotPrimitivesV2AbridgedHrmpChannel (447) */
  interface PolkadotPrimitivesV2AbridgedHrmpChannel extends Struct {
    readonly maxCapacity: u32
    readonly maxTotalSize: u32
    readonly maxMessageSize: u32
    readonly msgCount: u32
    readonly totalSize: u32
    readonly mqcHead: Option<H256>
  }

  /** @name PolkadotPrimitivesV2AbridgedHostConfiguration (448) */
  interface PolkadotPrimitivesV2AbridgedHostConfiguration extends Struct {
    readonly maxCodeSize: u32
    readonly maxHeadDataSize: u32
    readonly maxUpwardQueueCount: u32
    readonly maxUpwardQueueSize: u32
    readonly maxUpwardMessageSize: u32
    readonly maxUpwardMessageNumPerCandidate: u32
    readonly hrmpMaxMessageNumPerCandidate: u32
    readonly validationUpgradeCooldown: u32
    readonly validationUpgradeDelay: u32
  }

  /** @name PolkadotCorePrimitivesOutboundHrmpMessage (454) */
  interface PolkadotCorePrimitivesOutboundHrmpMessage extends Struct {
    readonly recipient: u32
    readonly data: Bytes
  }

  /** @name CumulusPalletParachainSystemError (455) */
  interface CumulusPalletParachainSystemError extends Enum {
    readonly isOverlappingUpgrades: boolean
    readonly isProhibitedByPolkadot: boolean
    readonly isTooBig: boolean
    readonly isValidationDataNotAvailable: boolean
    readonly isHostConfigurationNotAvailable: boolean
    readonly isNotScheduled: boolean
    readonly isNothingAuthorized: boolean
    readonly isUnauthorized: boolean
    readonly type:
      | "OverlappingUpgrades"
      | "ProhibitedByPolkadot"
      | "TooBig"
      | "ValidationDataNotAvailable"
      | "HostConfigurationNotAvailable"
      | "NotScheduled"
      | "NothingAuthorized"
      | "Unauthorized"
  }

  /** @name PalletSchedulerScheduledV3 (458) */
  interface PalletSchedulerScheduledV3 extends Struct {
    readonly maybeId: Option<Bytes>
    readonly priority: u8
    readonly call: FrameSupportScheduleMaybeHashed
    readonly maybePeriodic: Option<ITuple<[u32, u32]>>
    readonly origin: HydradxRuntimeOriginCaller
  }

  /** @name PalletSchedulerError (459) */
  interface PalletSchedulerError extends Enum {
    readonly isFailedToSchedule: boolean
    readonly isNotFound: boolean
    readonly isTargetBlockNumberInPast: boolean
    readonly isRescheduleNoChange: boolean
    readonly type:
      | "FailedToSchedule"
      | "NotFound"
      | "TargetBlockNumberInPast"
      | "RescheduleNoChange"
  }

  /** @name PalletXcmQueryStatus (460) */
  interface PalletXcmQueryStatus extends Enum {
    readonly isPending: boolean
    readonly asPending: {
      readonly responder: XcmVersionedMultiLocation
      readonly maybeNotify: Option<ITuple<[u8, u8]>>
      readonly timeout: u32
    } & Struct
    readonly isVersionNotifier: boolean
    readonly asVersionNotifier: {
      readonly origin: XcmVersionedMultiLocation
      readonly isActive: bool
    } & Struct
    readonly isReady: boolean
    readonly asReady: {
      readonly response: XcmVersionedResponse
      readonly at: u32
    } & Struct
    readonly type: "Pending" | "VersionNotifier" | "Ready"
  }

  /** @name XcmVersionedResponse (463) */
  interface XcmVersionedResponse extends Enum {
    readonly isV0: boolean
    readonly asV0: XcmV0Response
    readonly isV1: boolean
    readonly asV1: XcmV1Response
    readonly isV2: boolean
    readonly asV2: XcmV2Response
    readonly type: "V0" | "V1" | "V2"
  }

  /** @name PalletXcmVersionMigrationStage (469) */
  interface PalletXcmVersionMigrationStage extends Enum {
    readonly isMigrateSupportedVersion: boolean
    readonly isMigrateVersionNotifiers: boolean
    readonly isNotifyCurrentTargets: boolean
    readonly asNotifyCurrentTargets: Option<Bytes>
    readonly isMigrateAndNotifyOldTargets: boolean
    readonly type:
      | "MigrateSupportedVersion"
      | "MigrateVersionNotifiers"
      | "NotifyCurrentTargets"
      | "MigrateAndNotifyOldTargets"
  }

  /** @name PalletXcmError (470) */
  interface PalletXcmError extends Enum {
    readonly isUnreachable: boolean
    readonly isSendFailure: boolean
    readonly isFiltered: boolean
    readonly isUnweighableMessage: boolean
    readonly isDestinationNotInvertible: boolean
    readonly isEmpty: boolean
    readonly isCannotReanchor: boolean
    readonly isTooManyAssets: boolean
    readonly isInvalidOrigin: boolean
    readonly isBadVersion: boolean
    readonly isBadLocation: boolean
    readonly isNoSubscription: boolean
    readonly isAlreadySubscribed: boolean
    readonly type:
      | "Unreachable"
      | "SendFailure"
      | "Filtered"
      | "UnweighableMessage"
      | "DestinationNotInvertible"
      | "Empty"
      | "CannotReanchor"
      | "TooManyAssets"
      | "InvalidOrigin"
      | "BadVersion"
      | "BadLocation"
      | "NoSubscription"
      | "AlreadySubscribed"
  }

  /** @name CumulusPalletXcmError (471) */
  type CumulusPalletXcmError = Null

  /** @name CumulusPalletXcmpQueueInboundChannelDetails (473) */
  interface CumulusPalletXcmpQueueInboundChannelDetails extends Struct {
    readonly sender: u32
    readonly state: CumulusPalletXcmpQueueInboundState
    readonly messageMetadata: Vec<
      ITuple<[u32, PolkadotParachainPrimitivesXcmpMessageFormat]>
    >
  }

  /** @name CumulusPalletXcmpQueueInboundState (474) */
  interface CumulusPalletXcmpQueueInboundState extends Enum {
    readonly isOk: boolean
    readonly isSuspended: boolean
    readonly type: "Ok" | "Suspended"
  }

  /** @name PolkadotParachainPrimitivesXcmpMessageFormat (477) */
  interface PolkadotParachainPrimitivesXcmpMessageFormat extends Enum {
    readonly isConcatenatedVersionedXcm: boolean
    readonly isConcatenatedEncodedBlob: boolean
    readonly isSignals: boolean
    readonly type:
      | "ConcatenatedVersionedXcm"
      | "ConcatenatedEncodedBlob"
      | "Signals"
  }

  /** @name CumulusPalletXcmpQueueOutboundChannelDetails (480) */
  interface CumulusPalletXcmpQueueOutboundChannelDetails extends Struct {
    readonly recipient: u32
    readonly state: CumulusPalletXcmpQueueOutboundState
    readonly signalsExist: bool
    readonly firstIndex: u16
    readonly lastIndex: u16
  }

  /** @name CumulusPalletXcmpQueueOutboundState (481) */
  interface CumulusPalletXcmpQueueOutboundState extends Enum {
    readonly isOk: boolean
    readonly isSuspended: boolean
    readonly type: "Ok" | "Suspended"
  }

  /** @name CumulusPalletXcmpQueueQueueConfigData (483) */
  interface CumulusPalletXcmpQueueQueueConfigData extends Struct {
    readonly suspendThreshold: u32
    readonly dropThreshold: u32
    readonly resumeThreshold: u32
    readonly thresholdWeight: WeightV1
    readonly weightRestrictDecay: WeightV1
    readonly xcmpMaxIndividualWeight: WeightV1
  }

  /** @name CumulusPalletXcmpQueueError (485) */
  interface CumulusPalletXcmpQueueError extends Enum {
    readonly isFailedToSend: boolean
    readonly isBadXcmOrigin: boolean
    readonly isBadXcm: boolean
    readonly isBadOverweightIndex: boolean
    readonly isWeightOverLimit: boolean
    readonly type:
      | "FailedToSend"
      | "BadXcmOrigin"
      | "BadXcm"
      | "BadOverweightIndex"
      | "WeightOverLimit"
  }

  /** @name CumulusPalletDmpQueueConfigData (486) */
  interface CumulusPalletDmpQueueConfigData extends Struct {
    readonly maxIndividual: WeightV1
  }

  /** @name CumulusPalletDmpQueuePageIndexData (487) */
  interface CumulusPalletDmpQueuePageIndexData extends Struct {
    readonly beginUsed: u32
    readonly endUsed: u32
    readonly overweightCount: u64
  }

  /** @name CumulusPalletDmpQueueError (490) */
  interface CumulusPalletDmpQueueError extends Enum {
    readonly isUnknown: boolean
    readonly isOverLimit: boolean
    readonly type: "Unknown" | "OverLimit"
  }

  /** @name OrmlXcmModuleError (491) */
  interface OrmlXcmModuleError extends Enum {
    readonly isUnreachable: boolean
    readonly isSendFailure: boolean
    readonly isBadVersion: boolean
    readonly type: "Unreachable" | "SendFailure" | "BadVersion"
  }

  /** @name OrmlXtokensModuleError (492) */
  interface OrmlXtokensModuleError extends Enum {
    readonly isAssetHasNoReserve: boolean
    readonly isNotCrossChainTransfer: boolean
    readonly isInvalidDest: boolean
    readonly isNotCrossChainTransferableCurrency: boolean
    readonly isUnweighableMessage: boolean
    readonly isXcmExecutionFailed: boolean
    readonly isCannotReanchor: boolean
    readonly isInvalidAncestry: boolean
    readonly isInvalidAsset: boolean
    readonly isDestinationNotInvertible: boolean
    readonly isBadVersion: boolean
    readonly isDistinctReserveForAssetAndFee: boolean
    readonly isZeroFee: boolean
    readonly isZeroAmount: boolean
    readonly isTooManyAssetsBeingSent: boolean
    readonly isAssetIndexNonExistent: boolean
    readonly isFeeNotEnough: boolean
    readonly isNotSupportedMultiLocation: boolean
    readonly isMinXcmFeeNotDefined: boolean
    readonly type:
      | "AssetHasNoReserve"
      | "NotCrossChainTransfer"
      | "InvalidDest"
      | "NotCrossChainTransferableCurrency"
      | "UnweighableMessage"
      | "XcmExecutionFailed"
      | "CannotReanchor"
      | "InvalidAncestry"
      | "InvalidAsset"
      | "DestinationNotInvertible"
      | "BadVersion"
      | "DistinctReserveForAssetAndFee"
      | "ZeroFee"
      | "ZeroAmount"
      | "TooManyAssetsBeingSent"
      | "AssetIndexNonExistent"
      | "FeeNotEnough"
      | "NotSupportedMultiLocation"
      | "MinXcmFeeNotDefined"
  }

  /** @name OrmlUnknownTokensModuleError (495) */
  interface OrmlUnknownTokensModuleError extends Enum {
    readonly isBalanceTooLow: boolean
    readonly isBalanceOverflow: boolean
    readonly isUnhandledAsset: boolean
    readonly type: "BalanceTooLow" | "BalanceOverflow" | "UnhandledAsset"
  }

  /** @name PalletAuthorshipUncleEntryItem (497) */
  interface PalletAuthorshipUncleEntryItem extends Enum {
    readonly isInclusionHeight: boolean
    readonly asInclusionHeight: u32
    readonly isUncle: boolean
    readonly asUncle: ITuple<[H256, Option<AccountId32>]>
    readonly type: "InclusionHeight" | "Uncle"
  }

  /** @name PalletAuthorshipError (499) */
  interface PalletAuthorshipError extends Enum {
    readonly isInvalidUncleParent: boolean
    readonly isUnclesAlreadySet: boolean
    readonly isTooManyUncles: boolean
    readonly isGenesisUncle: boolean
    readonly isTooHighUncle: boolean
    readonly isUncleAlreadyIncluded: boolean
    readonly isOldUncle: boolean
    readonly type:
      | "InvalidUncleParent"
      | "UnclesAlreadySet"
      | "TooManyUncles"
      | "GenesisUncle"
      | "TooHighUncle"
      | "UncleAlreadyIncluded"
      | "OldUncle"
  }

  /** @name PalletCollatorSelectionCandidateInfo (502) */
  interface PalletCollatorSelectionCandidateInfo extends Struct {
    readonly who: AccountId32
    readonly deposit: u128
  }

  /** @name PalletCollatorSelectionError (504) */
  interface PalletCollatorSelectionError extends Enum {
    readonly isTooManyCandidates: boolean
    readonly isTooFewCandidates: boolean
    readonly isUnknown: boolean
    readonly isPermission: boolean
    readonly isAlreadyCandidate: boolean
    readonly isNotCandidate: boolean
    readonly isTooManyInvulnerables: boolean
    readonly isAlreadyInvulnerable: boolean
    readonly isNoAssociatedValidatorId: boolean
    readonly isValidatorNotRegistered: boolean
    readonly type:
      | "TooManyCandidates"
      | "TooFewCandidates"
      | "Unknown"
      | "Permission"
      | "AlreadyCandidate"
      | "NotCandidate"
      | "TooManyInvulnerables"
      | "AlreadyInvulnerable"
      | "NoAssociatedValidatorId"
      | "ValidatorNotRegistered"
  }

  /** @name SpCoreCryptoKeyTypeId (508) */
  interface SpCoreCryptoKeyTypeId extends U8aFixed {}

  /** @name PalletSessionError (509) */
  interface PalletSessionError extends Enum {
    readonly isInvalidProof: boolean
    readonly isNoAssociatedValidatorId: boolean
    readonly isDuplicatedKey: boolean
    readonly isNoKeys: boolean
    readonly isNoAccount: boolean
    readonly type:
      | "InvalidProof"
      | "NoAssociatedValidatorId"
      | "DuplicatedKey"
      | "NoKeys"
      | "NoAccount"
  }

  /** @name PalletRelaychainInfoError (513) */
  type PalletRelaychainInfoError = Null

  /** @name PalletEmaOracleOracleEntry (516) */
  interface PalletEmaOracleOracleEntry extends Struct {
    readonly price: HydraDxMathRatio
    readonly volume: HydradxTraitsOracleVolume
    readonly liquidity: HydradxTraitsOracleLiquidity
    readonly timestamp: u32
  }

  /** @name HydraDxMathRatio (517) */
  interface HydraDxMathRatio extends Struct {
    readonly n: u128
    readonly d: u128
  }

  /** @name HydradxTraitsOracleVolume (518) */
  interface HydradxTraitsOracleVolume extends Struct {
    readonly aIn: u128
    readonly bOut: u128
    readonly aOut: u128
    readonly bIn: u128
  }

  /** @name HydradxTraitsOracleLiquidity (519) */
  interface HydradxTraitsOracleLiquidity extends Struct {
    readonly a: u128
    readonly b: u128
  }

  /** @name HydradxTraitsOracleOraclePeriod (524) */
  interface HydradxTraitsOracleOraclePeriod extends Enum {
    readonly isLastBlock: boolean
    readonly isShort: boolean
    readonly isTenMinutes: boolean
    readonly isHour: boolean
    readonly isDay: boolean
    readonly isWeek: boolean
    readonly type:
      | "LastBlock"
      | "Short"
      | "TenMinutes"
      | "Hour"
      | "Day"
      | "Week"
  }

  /** @name PalletEmaOracleError (526) */
  interface PalletEmaOracleError extends Enum {
    readonly isTooManyUniqueEntries: boolean
    readonly isOnTradeValueZero: boolean
    readonly type: "TooManyUniqueEntries" | "OnTradeValueZero"
  }

  /** @name PalletTransactionMultiPaymentError (527) */
  interface PalletTransactionMultiPaymentError extends Enum {
    readonly isUnsupportedCurrency: boolean
    readonly isZeroBalance: boolean
    readonly isAlreadyAccepted: boolean
    readonly isCoreAssetNotAllowed: boolean
    readonly isZeroPrice: boolean
    readonly isFallbackPriceNotFound: boolean
    readonly isOverflow: boolean
    readonly type:
      | "UnsupportedCurrency"
      | "ZeroBalance"
      | "AlreadyAccepted"
      | "CoreAssetNotAllowed"
      | "ZeroPrice"
      | "FallbackPriceNotFound"
      | "Overflow"
  }

  /** @name SpRuntimeMultiSignature (529) */
  interface SpRuntimeMultiSignature extends Enum {
    readonly isEd25519: boolean
    readonly asEd25519: SpCoreEd25519Signature
    readonly isSr25519: boolean
    readonly asSr25519: SpCoreSr25519Signature
    readonly isEcdsa: boolean
    readonly asEcdsa: SpCoreEcdsaSignature
    readonly type: "Ed25519" | "Sr25519" | "Ecdsa"
  }

  /** @name SpCoreEd25519Signature (530) */
  interface SpCoreEd25519Signature extends U8aFixed {}

  /** @name SpCoreSr25519Signature (532) */
  interface SpCoreSr25519Signature extends U8aFixed {}

  /** @name SpCoreEcdsaSignature (533) */
  interface SpCoreEcdsaSignature extends U8aFixed {}

  /** @name FrameSystemExtensionsCheckSpecVersion (535) */
  type FrameSystemExtensionsCheckSpecVersion = Null

  /** @name FrameSystemExtensionsCheckTxVersion (536) */
  type FrameSystemExtensionsCheckTxVersion = Null

  /** @name FrameSystemExtensionsCheckGenesis (537) */
  type FrameSystemExtensionsCheckGenesis = Null

  /** @name FrameSystemExtensionsCheckNonce (540) */
  interface FrameSystemExtensionsCheckNonce extends Compact<u32> {}

  /** @name FrameSystemExtensionsCheckWeight (541) */
  type FrameSystemExtensionsCheckWeight = Null

  /** @name PalletTransactionPaymentChargeTransactionPayment (542) */
  interface PalletTransactionPaymentChargeTransactionPayment
    extends Compact<u128> {}

  /** @name PalletTransactionMultiPaymentCurrencyBalanceCheck (543) */
  type PalletTransactionMultiPaymentCurrencyBalanceCheck = Null

  /** @name HydradxRuntimeRuntime (544) */
  type HydradxRuntimeRuntime = Null
} // declare module
