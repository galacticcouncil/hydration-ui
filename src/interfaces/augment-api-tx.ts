// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import "@polkadot/api-base/types/submittable"

import type {
  ApiTypes,
  AugmentedSubmittable,
  SubmittableExtrinsic,
  SubmittableExtrinsicFunction,
} from "@polkadot/api-base/types"
import type { Data } from "@polkadot/types"
import type {
  Bytes,
  Compact,
  Option,
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
import type { AnyNumber, IMethod, ITuple } from "@polkadot/types-codec/types"
import type {
  AccountId32,
  Call,
  H256,
  Perbill,
} from "@polkadot/types/interfaces/runtime"
import type {
  BasiliskRuntimeOpaqueSessionKeys,
  BasiliskRuntimeOriginCaller,
  CommonRuntimeAssetLocation,
  CommonRuntimeProxyType,
  CumulusPrimitivesParachainInherentParachainInherentData,
  FrameSupportScheduleMaybeHashed,
  OrmlVestingVestingSchedule,
  PalletAssetRegistryAssetType,
  PalletDemocracyConviction,
  PalletDemocracyVoteAccountVote,
  PalletElectionsPhragmenRenouncing,
  PalletIdentityBitFlags,
  PalletIdentityIdentityInfo,
  PalletIdentityJudgement,
  PalletLbpWeightCurveType,
  PalletMultisigTimepoint,
  PalletUniquesDestroyWitness,
  PrimitivesNftClassType,
  SpRuntimeHeader,
  XcmV1MultiLocation,
  XcmV2WeightLimit,
  XcmVersionedMultiAsset,
  XcmVersionedMultiAssets,
  XcmVersionedMultiLocation,
  XcmVersionedXcm,
} from "@polkadot/types/lookup"

export type __AugmentedSubmittable = AugmentedSubmittable<() => unknown>
export type __SubmittableExtrinsic<ApiType extends ApiTypes> =
  SubmittableExtrinsic<ApiType>
export type __SubmittableExtrinsicFunction<ApiType extends ApiTypes> =
  SubmittableExtrinsicFunction<ApiType>

declare module "@polkadot/api-base/types/submittable" {
  interface AugmentedSubmittables<ApiType extends ApiTypes> {
    assetRegistry: {
      /**
       * Register a new asset.
       *
       * Asset is identified by `name` and the name must not be used to register another asset.
       *
       * New asset is given `NextAssetId` - sequential asset id
       *
       * Adds mapping between `name` and assigned `asset_id` so asset id can be retrieved by name too (Note: this approach is used in AMM implementation (xyk))
       *
       * Emits 'Registered` event when successful.
       **/
      register: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          assetType:
            | PalletAssetRegistryAssetType
            | { Token: any }
            | { PoolShare: any }
            | string
            | Uint8Array,
          existentialDeposit: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, PalletAssetRegistryAssetType, u128]
      >
      /**
       * Set asset native location.
       *
       * Adds mapping between native location and local asset id and vice versa.
       *
       * Mainly used in XCM.
       *
       * Emits `LocationSet` event when successful.
       **/
      setLocation: AugmentedSubmittable<
        (
          assetId: u32 | AnyNumber | Uint8Array,
          location:
            | CommonRuntimeAssetLocation
            | { parents?: any; interior?: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, CommonRuntimeAssetLocation]
      >
      /**
       * Set metadata for an asset.
       *
       * - `asset_id`: Asset identifier.
       * - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
       * - `decimals`: The number of decimals this asset uses to represent one unit.
       *
       * Emits `MetadataSet` event when successful.
       **/
      setMetadata: AugmentedSubmittable<
        (
          assetId: u32 | AnyNumber | Uint8Array,
          symbol: Bytes | string | Uint8Array,
          decimals: u8 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes, u8]
      >
      /**
       * Update registered asset.
       *
       * Updates also mapping between name and asset id if provided name is different than currently registered.
       *
       * Emits `Updated` event when successful.
       **/
      update: AugmentedSubmittable<
        (
          assetId: u32 | AnyNumber | Uint8Array,
          name: Bytes | string | Uint8Array,
          assetType:
            | PalletAssetRegistryAssetType
            | { Token: any }
            | { PoolShare: any }
            | string
            | Uint8Array,
          existentialDeposit:
            | Option<u128>
            | null
            | Uint8Array
            | u128
            | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Bytes, PalletAssetRegistryAssetType, Option<u128>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    authorship: {
      /**
       * Provide a set of uncles.
       **/
      setUncles: AugmentedSubmittable<
        (
          newUncles:
            | Vec<SpRuntimeHeader>
            | (
                | SpRuntimeHeader
                | {
                    parentHash?: any
                    number?: any
                    stateRoot?: any
                    extrinsicsRoot?: any
                    digest?: any
                  }
                | string
                | Uint8Array
              )[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<SpRuntimeHeader>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    balances: {
      /**
       * Exactly as `transfer`, except the origin must be root and the source account may be
       * specified.
       * # <weight>
       * - Same as transfer, but additional read and write because the source account is not
       * assumed to be in the overlay.
       * # </weight>
       **/
      forceTransfer: AugmentedSubmittable<
        (
          source: AccountId32 | string | Uint8Array,
          dest: AccountId32 | string | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, AccountId32, Compact<u128>]
      >
      /**
       * Unreserve some balance from a user by force.
       *
       * Can only be called by ROOT.
       **/
      forceUnreserve: AugmentedSubmittable<
        (
          who: AccountId32 | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u128]
      >
      /**
       * Set the balances of a given account.
       *
       * This will alter `FreeBalance` and `ReservedBalance` in storage. it will
       * also alter the total issuance of the system (`TotalIssuance`) appropriately.
       * If the new free or reserved balance is below the existential deposit,
       * it will reset the account nonce (`frame_system::AccountNonce`).
       *
       * The dispatch origin for this call is `root`.
       **/
      setBalance: AugmentedSubmittable<
        (
          who: AccountId32 | string | Uint8Array,
          newFree: Compact<u128> | AnyNumber | Uint8Array,
          newReserved: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Compact<u128>, Compact<u128>]
      >
      /**
       * Transfer some liquid free balance to another account.
       *
       * `transfer` will set the `FreeBalance` of the sender and receiver.
       * If the sender's account is below the existential deposit as a result
       * of the transfer, the account will be reaped.
       *
       * The dispatch origin for this call must be `Signed` by the transactor.
       *
       * # <weight>
       * - Dependent on arguments but not critical, given proper implementations for input config
       * types. See related functions below.
       * - It contains a limited number of reads and writes internally and no complex
       * computation.
       *
       * Related functions:
       *
       * - `ensure_can_withdraw` is always called internally but has a bounded complexity.
       * - Transferring balances to accounts that did not exist before will cause
       * `T::OnNewAccount::on_new_account` to be called.
       * - Removing enough funds from an account will trigger `T::DustRemoval::on_unbalanced`.
       * - `transfer_keep_alive` works the same way as `transfer`, but has an additional check
       * that the transfer will not kill the origin account.
       * ---------------------------------
       * - Origin account is already in memory, so no DB operations for them.
       * # </weight>
       **/
      transfer: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Compact<u128>]
      >
      /**
       * Transfer the entire transferable balance from the caller account.
       *
       * NOTE: This function only attempts to transfer _transferable_ balances. This means that
       * any locked, reserved, or existential deposits (when `keep_alive` is `true`), will not be
       * transferred by this function. To ensure that this function results in a killed account,
       * you might need to prepare the account by removing any reference counters, storage
       * deposits, etc...
       *
       * The dispatch origin of this call must be Signed.
       *
       * - `dest`: The recipient of the transfer.
       * - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all
       * of the funds the account has, causing the sender account to be killed (false), or
       * transfer everything except at least the existential deposit, which will guarantee to
       * keep the sender account alive (true). # <weight>
       * - O(1). Just like transfer, but reading the user's transferable balance first.
       * #</weight>
       **/
      transferAll: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          keepAlive: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, bool]
      >
      /**
       * Same as the [`transfer`] call, but with a check that the transfer will not kill the
       * origin account.
       *
       * 99% of the time you want [`transfer`] instead.
       *
       * [`transfer`]: struct.Pallet.html#method.transfer
       **/
      transferKeepAlive: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Compact<u128>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    collatorSelection: {
      /**
       * Deregister `origin` as a collator candidate. Note that the collator can only leave on
       * session change. The `CandidacyBond` will be unreserved immediately.
       *
       * This call will fail if the total number of candidates would drop below `MinCandidates`.
       *
       * This call is not available to `Invulnerable` collators.
       **/
      leaveIntent: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>
      /**
       * Register this account as a collator candidate. The account must (a) already have
       * registered session keys and (b) be able to reserve the `CandidacyBond`.
       *
       * This call is not available to `Invulnerable` collators.
       **/
      registerAsCandidate: AugmentedSubmittable<
        () => SubmittableExtrinsic<ApiType>,
        []
      >
      /**
       * Set the candidacy bond amount.
       **/
      setCandidacyBond: AugmentedSubmittable<
        (bond: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u128]
      >
      /**
       * Set the ideal number of collators (not including the invulnerables).
       * If lowering this number, then the number of running collators could be higher than this figure.
       * Aside from that edge case, there should be no other way to have more collators than the desired number.
       **/
      setDesiredCandidates: AugmentedSubmittable<
        (max: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Set the list of invulnerable (fixed) collators.
       **/
      setInvulnerables: AugmentedSubmittable<
        (
          updated: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    council: {
      /**
       * Close a vote that is either approved, disapproved or whose voting period has ended.
       *
       * May be called by any signed account in order to finish voting and close the proposal.
       *
       * If called before the end of the voting period it will only close the vote if it is
       * has enough votes to be approved or disapproved.
       *
       * If called after the end of the voting period abstentions are counted as rejections
       * unless there is a prime member set and the prime member cast an approval.
       *
       * If the close operation completes successfully with disapproval, the transaction fee will
       * be waived. Otherwise execution of the approved operation will be charged to the caller.
       *
       * + `proposal_weight_bound`: The maximum amount of weight consumed by executing the closed
       * proposal.
       * + `length_bound`: The upper bound for the length of the proposal in storage. Checked via
       * `storage::read` so it is `size_of::<u32>() == 4` larger than the pure length.
       *
       * # <weight>
       * ## Weight
       * - `O(B + M + P1 + P2)` where:
       * - `B` is `proposal` size in bytes (length-fee-bounded)
       * - `M` is members-count (code- and governance-bounded)
       * - `P1` is the complexity of `proposal` preimage.
       * - `P2` is proposal-count (code-bounded)
       * - DB:
       * - 2 storage reads (`Members`: codec `O(M)`, `Prime`: codec `O(1)`)
       * - 3 mutations (`Voting`: codec `O(M)`, `ProposalOf`: codec `O(B)`, `Proposals`: codec
       * `O(P2)`)
       * - any mutations done while executing `proposal` (`P1`)
       * - up to 3 events
       * # </weight>
       **/
      close: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          index: Compact<u32> | AnyNumber | Uint8Array,
          proposalWeightBound: Compact<u64> | AnyNumber | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>, Compact<u64>, Compact<u32>]
      >
      /**
       * Disapprove a proposal, close, and remove it from the system, regardless of its current
       * state.
       *
       * Must be called by the Root origin.
       *
       * Parameters:
       * * `proposal_hash`: The hash of the proposal that should be disapproved.
       *
       * # <weight>
       * Complexity: O(P) where P is the number of max proposals
       * DB Weight:
       * * Reads: Proposals
       * * Writes: Voting, Proposals, ProposalOf
       * # </weight>
       **/
      disapproveProposal: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Dispatch a proposal from a member using the `Member` origin.
       *
       * Origin must be a member of the collective.
       *
       * # <weight>
       * ## Weight
       * - `O(M + P)` where `M` members-count (code-bounded) and `P` complexity of dispatching
       * `proposal`
       * - DB: 1 read (codec `O(M)`) + DB access of `proposal`
       * - 1 event
       * # </weight>
       **/
      execute: AugmentedSubmittable<
        (
          proposal: Call | IMethod | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Call, Compact<u32>]
      >
      /**
       * Add a new proposal to either be voted on or executed directly.
       *
       * Requires the sender to be member.
       *
       * `threshold` determines whether `proposal` is executed directly (`threshold < 2`)
       * or put up for voting.
       *
       * # <weight>
       * ## Weight
       * - `O(B + M + P1)` or `O(B + M + P2)` where:
       * - `B` is `proposal` size in bytes (length-fee-bounded)
       * - `M` is members-count (code- and governance-bounded)
       * - branching is influenced by `threshold` where:
       * - `P1` is proposal execution complexity (`threshold < 2`)
       * - `P2` is proposals-count (code-bounded) (`threshold >= 2`)
       * - DB:
       * - 1 storage read `is_member` (codec `O(M)`)
       * - 1 storage read `ProposalOf::contains_key` (codec `O(1)`)
       * - DB accesses influenced by `threshold`:
       * - EITHER storage accesses done by `proposal` (`threshold < 2`)
       * - OR proposal insertion (`threshold <= 2`)
       * - 1 storage mutation `Proposals` (codec `O(P2)`)
       * - 1 storage mutation `ProposalCount` (codec `O(1)`)
       * - 1 storage write `ProposalOf` (codec `O(B)`)
       * - 1 storage write `Voting` (codec `O(M)`)
       * - 1 event
       * # </weight>
       **/
      propose: AugmentedSubmittable<
        (
          threshold: Compact<u32> | AnyNumber | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Call, Compact<u32>]
      >
      /**
       * Set the collective's membership.
       *
       * - `new_members`: The new member list. Be nice to the chain and provide it sorted.
       * - `prime`: The prime member whose vote sets the default.
       * - `old_count`: The upper bound for the previous number of members in storage. Used for
       * weight estimation.
       *
       * Requires root origin.
       *
       * NOTE: Does not enforce the expected `MaxMembers` limit on the amount of members, but
       * the weight estimations rely on it to estimate dispatchable weight.
       *
       * # WARNING:
       *
       * The `pallet-collective` can also be managed by logic outside of the pallet through the
       * implementation of the trait [`ChangeMembers`].
       * Any call to `set_members` must be careful that the member set doesn't get out of sync
       * with other logic managing the member set.
       *
       * # <weight>
       * ## Weight
       * - `O(MP + N)` where:
       * - `M` old-members-count (code- and governance-bounded)
       * - `N` new-members-count (code- and governance-bounded)
       * - `P` proposals-count (code-bounded)
       * - DB:
       * - 1 storage mutation (codec `O(M)` read, `O(N)` write) for reading and writing the
       * members
       * - 1 storage read (codec `O(P)`) for reading the proposals
       * - `P` storage mutations (codec `O(M)`) for updating the votes for each proposal
       * - 1 storage write (codec `O(1)`) for deleting the old `prime` and setting the new one
       * # </weight>
       **/
      setMembers: AugmentedSubmittable<
        (
          newMembers: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
          prime: Option<AccountId32> | null | Uint8Array | AccountId32 | string,
          oldCount: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>, Option<AccountId32>, u32]
      >
      /**
       * Add an aye or nay vote for the sender to the given proposal.
       *
       * Requires the sender to be a member.
       *
       * Transaction fees will be waived if the member is voting on any particular proposal
       * for the first time and the call is successful. Subsequent vote changes will charge a
       * fee.
       * # <weight>
       * ## Weight
       * - `O(M)` where `M` is members-count (code- and governance-bounded)
       * - DB:
       * - 1 storage read `Members` (codec `O(M)`)
       * - 1 storage mutation `Voting` (codec `O(M)`)
       * - 1 event
       * # </weight>
       **/
      vote: AugmentedSubmittable<
        (
          proposal: H256 | string | Uint8Array,
          index: Compact<u32> | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>, bool]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    cumulusXcm: {
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    currencies: {
      /**
       * Transfer some balance to another account under `currency_id`.
       *
       * The dispatch origin for this call must be `Signed` by the
       * transactor.
       **/
      transfer: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32, Compact<u128>]
      >
      /**
       * Transfer some native currency to another account.
       *
       * The dispatch origin for this call must be `Signed` by the
       * transactor.
       **/
      transferNativeCurrency: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          amount: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Compact<u128>]
      >
      /**
       * update amount of account `who` under `currency_id`.
       *
       * The dispatch origin of this call must be _Root_.
       **/
      updateBalance: AugmentedSubmittable<
        (
          who: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: i128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32, i128]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    democracy: {
      /**
       * Permanently place a proposal into the blacklist. This prevents it from ever being
       * proposed again.
       *
       * If called on a queued public or external proposal, then this will result in it being
       * removed. If the `ref_index` supplied is an active referendum with the proposal hash,
       * then it will be cancelled.
       *
       * The dispatch origin of this call must be `BlacklistOrigin`.
       *
       * - `proposal_hash`: The proposal hash to blacklist permanently.
       * - `ref_index`: An ongoing referendum whose hash is `proposal_hash`, which will be
       * cancelled.
       *
       * Weight: `O(p)` (though as this is an high-privilege dispatch, we assume it has a
       * reasonable value).
       **/
      blacklist: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          maybeRefIndex: Option<u32> | null | Uint8Array | u32 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Option<u32>]
      >
      /**
       * Remove a proposal.
       *
       * The dispatch origin of this call must be `CancelProposalOrigin`.
       *
       * - `prop_index`: The index of the proposal to cancel.
       *
       * Weight: `O(p)` where `p = PublicProps::<T>::decode_len()`
       **/
      cancelProposal: AugmentedSubmittable<
        (
          propIndex: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >
      /**
       * Cancel a proposal queued for enactment.
       *
       * The dispatch origin of this call must be _Root_.
       *
       * - `which`: The index of the referendum to cancel.
       *
       * Weight: `O(D)` where `D` is the items in the dispatch queue. Weighted as `D = 10`.
       **/
      cancelQueued: AugmentedSubmittable<
        (which: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Remove a referendum.
       *
       * The dispatch origin of this call must be _Root_.
       *
       * - `ref_index`: The index of the referendum to cancel.
       *
       * # Weight: `O(1)`.
       **/
      cancelReferendum: AugmentedSubmittable<
        (
          refIndex: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >
      /**
       * Clears all public proposals.
       *
       * The dispatch origin of this call must be _Root_.
       *
       * Weight: `O(1)`.
       **/
      clearPublicProposals: AugmentedSubmittable<
        () => SubmittableExtrinsic<ApiType>,
        []
      >
      /**
       * Delegate the voting power (with some given conviction) of the sending account.
       *
       * The balance delegated is locked for as long as it's delegated, and thereafter for the
       * time appropriate for the conviction's lock period.
       *
       * The dispatch origin of this call must be _Signed_, and the signing account must either:
       * - be delegating already; or
       * - have no voting activity (if there is, then it will need to be removed/consolidated
       * through `reap_vote` or `unvote`).
       *
       * - `to`: The account whose voting the `target` account's voting power will follow.
       * - `conviction`: The conviction that will be attached to the delegated votes. When the
       * account is undelegated, the funds will be locked for the corresponding period.
       * - `balance`: The amount of the account's balance to be used in delegating. This must not
       * be more than the account's current balance.
       *
       * Emits `Delegated`.
       *
       * Weight: `O(R)` where R is the number of referendums the voter delegating to has
       * voted on. Weight is charged as if maximum votes.
       **/
      delegate: AugmentedSubmittable<
        (
          to: AccountId32 | string | Uint8Array,
          conviction:
            | PalletDemocracyConviction
            | "None"
            | "Locked1x"
            | "Locked2x"
            | "Locked3x"
            | "Locked4x"
            | "Locked5x"
            | "Locked6x"
            | number
            | Uint8Array,
          balance: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, PalletDemocracyConviction, u128]
      >
      /**
       * Schedule an emergency cancellation of a referendum. Cannot happen twice to the same
       * referendum.
       *
       * The dispatch origin of this call must be `CancellationOrigin`.
       *
       * -`ref_index`: The index of the referendum to cancel.
       *
       * Weight: `O(1)`.
       **/
      emergencyCancel: AugmentedSubmittable<
        (
          refIndex: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Enact a proposal from a referendum. For now we just make the weight be the maximum.
       **/
      enactProposal: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, u32]
      >
      /**
       * Schedule a referendum to be tabled once it is legal to schedule an external
       * referendum.
       *
       * The dispatch origin of this call must be `ExternalOrigin`.
       *
       * - `proposal_hash`: The preimage hash of the proposal.
       *
       * Weight: `O(V)` with V number of vetoers in the blacklist of proposal.
       * Decoding vec of length V. Charged as maximum
       **/
      externalPropose: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Schedule a negative-turnout-bias referendum to be tabled next once it is legal to
       * schedule an external referendum.
       *
       * The dispatch of this call must be `ExternalDefaultOrigin`.
       *
       * - `proposal_hash`: The preimage hash of the proposal.
       *
       * Unlike `external_propose`, blacklisting has no effect on this and it may replace a
       * pre-scheduled `external_propose` call.
       *
       * Weight: `O(1)`
       **/
      externalProposeDefault: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Schedule a majority-carries referendum to be tabled next once it is legal to schedule
       * an external referendum.
       *
       * The dispatch of this call must be `ExternalMajorityOrigin`.
       *
       * - `proposal_hash`: The preimage hash of the proposal.
       *
       * Unlike `external_propose`, blacklisting has no effect on this and it may replace a
       * pre-scheduled `external_propose` call.
       *
       * Weight: `O(1)`
       **/
      externalProposeMajority: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Schedule the currently externally-proposed majority-carries referendum to be tabled
       * immediately. If there is no externally-proposed referendum currently, or if there is one
       * but it is not a majority-carries referendum then it fails.
       *
       * The dispatch of this call must be `FastTrackOrigin`.
       *
       * - `proposal_hash`: The hash of the current external proposal.
       * - `voting_period`: The period that is allowed for voting on this proposal. Increased to
       * `FastTrackVotingPeriod` if too low.
       * - `delay`: The number of block after voting has ended in approval and this should be
       * enacted. This doesn't have a minimum amount.
       *
       * Emits `Started`.
       *
       * Weight: `O(1)`
       **/
      fastTrack: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          votingPeriod: u32 | AnyNumber | Uint8Array,
          delay: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, u32, u32]
      >
      /**
       * Register the preimage for an upcoming proposal. This requires the proposal to be
       * in the dispatch queue. No deposit is needed. When this call is successful, i.e.
       * the preimage has not been uploaded before and matches some imminent proposal,
       * no fee is paid.
       *
       * The dispatch origin of this call must be _Signed_.
       *
       * - `encoded_proposal`: The preimage of a proposal.
       *
       * Emits `PreimageNoted`.
       *
       * Weight: `O(E)` with E size of `encoded_proposal` (protected by a required deposit).
       **/
      noteImminentPreimage: AugmentedSubmittable<
        (
          encodedProposal: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Same as `note_imminent_preimage` but origin is `OperationalPreimageOrigin`.
       **/
      noteImminentPreimageOperational: AugmentedSubmittable<
        (
          encodedProposal: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Register the preimage for an upcoming proposal. This doesn't require the proposal to be
       * in the dispatch queue but does require a deposit, returned once enacted.
       *
       * The dispatch origin of this call must be _Signed_.
       *
       * - `encoded_proposal`: The preimage of a proposal.
       *
       * Emits `PreimageNoted`.
       *
       * Weight: `O(E)` with E size of `encoded_proposal` (protected by a required deposit).
       **/
      notePreimage: AugmentedSubmittable<
        (
          encodedProposal: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Same as `note_preimage` but origin is `OperationalPreimageOrigin`.
       **/
      notePreimageOperational: AugmentedSubmittable<
        (
          encodedProposal: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Propose a sensitive action to be taken.
       *
       * The dispatch origin of this call must be _Signed_ and the sender must
       * have funds to cover the deposit.
       *
       * - `proposal_hash`: The hash of the proposal preimage.
       * - `value`: The amount of deposit (must be at least `MinimumDeposit`).
       *
       * Emits `Proposed`.
       *
       * Weight: `O(p)`
       **/
      propose: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u128>]
      >
      /**
       * Remove an expired proposal preimage and collect the deposit.
       *
       * The dispatch origin of this call must be _Signed_.
       *
       * - `proposal_hash`: The preimage hash of a proposal.
       * - `proposal_length_upper_bound`: an upper bound on length of the proposal. Extrinsic is
       * weighted according to this value with no refund.
       *
       * This will only work after `VotingPeriod` blocks from the time that the preimage was
       * noted, if it's the same account doing it. If it's a different account, then it'll only
       * work an additional `EnactmentPeriod` later.
       *
       * Emits `PreimageReaped`.
       *
       * Weight: `O(D)` where D is length of proposal.
       **/
      reapPreimage: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          proposalLenUpperBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>]
      >
      /**
       * Remove a vote for a referendum.
       *
       * If the `target` is equal to the signer, then this function is exactly equivalent to
       * `remove_vote`. If not equal to the signer, then the vote must have expired,
       * either because the referendum was cancelled, because the voter lost the referendum or
       * because the conviction period is over.
       *
       * The dispatch origin of this call must be _Signed_.
       *
       * - `target`: The account of the vote to be removed; this account must have voted for
       * referendum `index`.
       * - `index`: The index of referendum of the vote to be removed.
       *
       * Weight: `O(R + log R)` where R is the number of referenda that `target` has voted on.
       * Weight is calculated for the maximum number of vote.
       **/
      removeOtherVote: AugmentedSubmittable<
        (
          target: AccountId32 | string | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32]
      >
      /**
       * Remove a vote for a referendum.
       *
       * If:
       * - the referendum was cancelled, or
       * - the referendum is ongoing, or
       * - the referendum has ended such that
       * - the vote of the account was in opposition to the result; or
       * - there was no conviction to the account's vote; or
       * - the account made a split vote
       * ...then the vote is removed cleanly and a following call to `unlock` may result in more
       * funds being available.
       *
       * If, however, the referendum has ended and:
       * - it finished corresponding to the vote of the account, and
       * - the account made a standard vote with conviction, and
       * - the lock period of the conviction is not over
       * ...then the lock will be aggregated into the overall account's lock, which may involve
       * *overlocking* (where the two locks are combined into a single lock that is the maximum
       * of both the amount locked and the time is it locked for).
       *
       * The dispatch origin of this call must be _Signed_, and the signer must have a vote
       * registered for referendum `index`.
       *
       * - `index`: The index of referendum of the vote to be removed.
       *
       * Weight: `O(R + log R)` where R is the number of referenda that `target` has voted on.
       * Weight is calculated for the maximum number of vote.
       **/
      removeVote: AugmentedSubmittable<
        (index: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Signals agreement with a particular proposal.
       *
       * The dispatch origin of this call must be _Signed_ and the sender
       * must have funds to cover the deposit, equal to the original deposit.
       *
       * - `proposal`: The index of the proposal to second.
       * - `seconds_upper_bound`: an upper bound on the current number of seconds on this
       * proposal. Extrinsic is weighted according to this value with no refund.
       *
       * Weight: `O(S)` where S is the number of seconds a proposal already has.
       **/
      second: AugmentedSubmittable<
        (
          proposal: Compact<u32> | AnyNumber | Uint8Array,
          secondsUpperBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Compact<u32>]
      >
      /**
       * Undelegate the voting power of the sending account.
       *
       * Tokens may be unlocked following once an amount of time consistent with the lock period
       * of the conviction with which the delegation was issued.
       *
       * The dispatch origin of this call must be _Signed_ and the signing account must be
       * currently delegating.
       *
       * Emits `Undelegated`.
       *
       * Weight: `O(R)` where R is the number of referendums the voter delegating to has
       * voted on. Weight is charged as if maximum votes.
       **/
      undelegate: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>
      /**
       * Unlock tokens that have an expired lock.
       *
       * The dispatch origin of this call must be _Signed_.
       *
       * - `target`: The account to remove the lock on.
       *
       * Weight: `O(R)` with R number of vote of target.
       **/
      unlock: AugmentedSubmittable<
        (
          target: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Veto and blacklist the external proposal hash.
       *
       * The dispatch origin of this call must be `VetoOrigin`.
       *
       * - `proposal_hash`: The preimage hash of the proposal to veto and blacklist.
       *
       * Emits `Vetoed`.
       *
       * Weight: `O(V + log(V))` where V is number of `existing vetoers`
       **/
      vetoExternal: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Vote in a referendum. If `vote.is_aye()`, the vote is to enact the proposal;
       * otherwise it is a vote to keep the status quo.
       *
       * The dispatch origin of this call must be _Signed_.
       *
       * - `ref_index`: The index of the referendum to vote for.
       * - `vote`: The vote configuration.
       *
       * Weight: `O(R)` where R is the number of referendums the voter has voted on.
       **/
      vote: AugmentedSubmittable<
        (
          refIndex: Compact<u32> | AnyNumber | Uint8Array,
          vote:
            | PalletDemocracyVoteAccountVote
            | { Standard: any }
            | { Split: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, PalletDemocracyVoteAccountVote]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    dmpQueue: {
      /**
       * Service a single overweight message.
       *
       * - `origin`: Must pass `ExecuteOverweightOrigin`.
       * - `index`: The index of the overweight message to service.
       * - `weight_limit`: The amount of weight that message execution may take.
       *
       * Errors:
       * - `Unknown`: Message of `index` is unknown.
       * - `OverLimit`: Message execution may use greater than `weight_limit`.
       *
       * Events:
       * - `OverweightServiced`: On success.
       **/
      serviceOverweight: AugmentedSubmittable<
        (
          index: u64 | AnyNumber | Uint8Array,
          weightLimit: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u64, u64]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    duster: {
      /**
       * Add account to list of non-dustable account. Account whihc are excluded from udsting.
       * If such account should be dusted - `AccountBlacklisted` error is returned.
       * Only root can perform this action.
       **/
      addNondustableAccount: AugmentedSubmittable<
        (
          account: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Dust specified account.
       * IF account balance is < min. existential deposit of given currency, and account is allowed to
       * be dusted, the remaining balance is transferred to selected account (usually treasury).
       *
       * Caller is rewarded with chosen reward in native currency.
       **/
      dustAccount: AugmentedSubmittable<
        (
          account: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32]
      >
      /**
       * Remove account from list of non-dustable accounts. That means account can be dusted again.
       **/
      removeNondustableAccount: AugmentedSubmittable<
        (
          account: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    elections: {
      /**
       * Clean all voters who are defunct (i.e. they do not serve any purpose at all). The
       * deposit of the removed voters are returned.
       *
       * This is an root function to be used only for cleaning the state.
       *
       * The dispatch origin of this call must be root.
       *
       * # <weight>
       * The total number of voters and those that are defunct must be provided as witness data.
       * # </weight>
       **/
      cleanDefunctVoters: AugmentedSubmittable<
        (
          numVoters: u32 | AnyNumber | Uint8Array,
          numDefunct: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >
      /**
       * Remove a particular member from the set. This is effective immediately and the bond of
       * the outgoing member is slashed.
       *
       * If a runner-up is available, then the best runner-up will be removed and replaces the
       * outgoing member. Otherwise, a new phragmen election is started.
       *
       * The dispatch origin of this call must be root.
       *
       * Note that this does not affect the designated block number of the next election.
       *
       * # <weight>
       * If we have a replacement, we use a small weight. Else, since this is a root call and
       * will go into phragmen, we assume full block for now.
       * # </weight>
       **/
      removeMember: AugmentedSubmittable<
        (
          who: AccountId32 | string | Uint8Array,
          hasReplacement: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, bool]
      >
      /**
       * Remove `origin` as a voter.
       *
       * This removes the lock and returns the deposit.
       *
       * The dispatch origin of this call must be signed and be a voter.
       **/
      removeVoter: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>
      /**
       * Renounce one's intention to be a candidate for the next election round. 3 potential
       * outcomes exist:
       *
       * - `origin` is a candidate and not elected in any set. In this case, the deposit is
       * unreserved, returned and origin is removed as a candidate.
       * - `origin` is a current runner-up. In this case, the deposit is unreserved, returned and
       * origin is removed as a runner-up.
       * - `origin` is a current member. In this case, the deposit is unreserved and origin is
       * removed as a member, consequently not being a candidate for the next round anymore.
       * Similar to [`remove_member`](Self::remove_member), if replacement runners exists, they
       * are immediately used. If the prime is renouncing, then no prime will exist until the
       * next round.
       *
       * The dispatch origin of this call must be signed, and have one of the above roles.
       *
       * # <weight>
       * The type of renouncing must be provided as witness data.
       * # </weight>
       **/
      renounceCandidacy: AugmentedSubmittable<
        (
          renouncing:
            | PalletElectionsPhragmenRenouncing
            | { Member: any }
            | { RunnerUp: any }
            | { Candidate: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [PalletElectionsPhragmenRenouncing]
      >
      /**
       * Submit oneself for candidacy. A fixed amount of deposit is recorded.
       *
       * All candidates are wiped at the end of the term. They either become a member/runner-up,
       * or leave the system while their deposit is slashed.
       *
       * The dispatch origin of this call must be signed.
       *
       * ### Warning
       *
       * Even if a candidate ends up being a member, they must call [`Call::renounce_candidacy`]
       * to get their deposit back. Losing the spot in an election will always lead to a slash.
       *
       * # <weight>
       * The number of current candidates must be provided as witness data.
       * # </weight>
       **/
      submitCandidacy: AugmentedSubmittable<
        (
          candidateCount: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >
      /**
       * Vote for a set of candidates for the upcoming round of election. This can be called to
       * set the initial votes, or update already existing votes.
       *
       * Upon initial voting, `value` units of `who`'s balance is locked and a deposit amount is
       * reserved. The deposit is based on the number of votes and can be updated over time.
       *
       * The `votes` should:
       * - not be empty.
       * - be less than the number of possible candidates. Note that all current members and
       * runners-up are also automatically candidates for the next round.
       *
       * If `value` is more than `who`'s free balance, then the maximum of the two is used.
       *
       * The dispatch origin of this call must be signed.
       *
       * ### Warning
       *
       * It is the responsibility of the caller to **NOT** place all of their balance into the
       * lock and keep some for further operations.
       *
       * # <weight>
       * We assume the maximum weight among all 3 cases: vote_equal, vote_more and vote_less.
       * # </weight>
       **/
      vote: AugmentedSubmittable<
        (
          votes: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
          value: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>, Compact<u128>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    exchange: {
      /**
       * Create buy intention
       * Calculate current spot price, create an intention and store in ```ExchangeAssetsIntentions```
       **/
      buy: AugmentedSubmittable<
        (
          assetBuy: u32 | AnyNumber | Uint8Array,
          assetSell: u32 | AnyNumber | Uint8Array,
          amountBuy: u128 | AnyNumber | Uint8Array,
          maxSold: u128 | AnyNumber | Uint8Array,
          discount: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128, bool]
      >
      /**
       * Create sell intention
       * Calculate current spot price, create an intention and store in ```ExchangeAssetsIntentions```
       **/
      sell: AugmentedSubmittable<
        (
          assetSell: u32 | AnyNumber | Uint8Array,
          assetBuy: u32 | AnyNumber | Uint8Array,
          amountSell: u128 | AnyNumber | Uint8Array,
          minBought: u128 | AnyNumber | Uint8Array,
          discount: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128, bool]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    identity: {
      /**
       * Add a registrar to the system.
       *
       * The dispatch origin for this call must be `T::RegistrarOrigin`.
       *
       * - `account`: the account of the registrar.
       *
       * Emits `RegistrarAdded` if successful.
       *
       * # <weight>
       * - `O(R)` where `R` registrar-count (governance-bounded and code-bounded).
       * - One storage mutation (codec `O(R)`).
       * - One event.
       * # </weight>
       **/
      addRegistrar: AugmentedSubmittable<
        (
          account: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Add the given account to the sender's subs.
       *
       * Payment: Balance reserved by a previous `set_subs` call for one sub will be repatriated
       * to the sender.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a registered
       * sub identity of `sub`.
       **/
      addSub: AugmentedSubmittable<
        (
          sub: AccountId32 | string | Uint8Array,
          data:
            | Data
            | { None: any }
            | { Raw: any }
            | { BlakeTwo256: any }
            | { Sha256: any }
            | { Keccak256: any }
            | { ShaThree256: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Data]
      >
      /**
       * Cancel a previous request.
       *
       * Payment: A previously reserved deposit is returned on success.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a
       * registered identity.
       *
       * - `reg_index`: The index of the registrar whose judgement is no longer requested.
       *
       * Emits `JudgementUnrequested` if successful.
       *
       * # <weight>
       * - `O(R + X)`.
       * - One balance-reserve operation.
       * - One storage mutation `O(R + X)`.
       * - One event
       * # </weight>
       **/
      cancelRequest: AugmentedSubmittable<
        (
          regIndex: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Clear an account's identity info and all sub-accounts and return all deposits.
       *
       * Payment: All reserved balances on the account are returned.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a registered
       * identity.
       *
       * Emits `IdentityCleared` if successful.
       *
       * # <weight>
       * - `O(R + S + X)`
       * - where `R` registrar-count (governance-bounded).
       * - where `S` subs-count (hard- and deposit-bounded).
       * - where `X` additional-field-count (deposit-bounded and code-bounded).
       * - One balance-unreserve operation.
       * - `2` storage reads and `S + 2` storage deletions.
       * - One event.
       * # </weight>
       **/
      clearIdentity: AugmentedSubmittable<
        () => SubmittableExtrinsic<ApiType>,
        []
      >
      /**
       * Remove an account's identity and sub-account information and slash the deposits.
       *
       * Payment: Reserved balances from `set_subs` and `set_identity` are slashed and handled by
       * `Slash`. Verification request deposits are not returned; they should be cancelled
       * manually using `cancel_request`.
       *
       * The dispatch origin for this call must match `T::ForceOrigin`.
       *
       * - `target`: the account whose identity the judgement is upon. This must be an account
       * with a registered identity.
       *
       * Emits `IdentityKilled` if successful.
       *
       * # <weight>
       * - `O(R + S + X)`.
       * - One balance-reserve operation.
       * - `S + 2` storage mutations.
       * - One event.
       * # </weight>
       **/
      killIdentity: AugmentedSubmittable<
        (
          target: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Provide a judgement for an account's identity.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must be the account
       * of the registrar whose index is `reg_index`.
       *
       * - `reg_index`: the index of the registrar whose judgement is being made.
       * - `target`: the account whose identity the judgement is upon. This must be an account
       * with a registered identity.
       * - `judgement`: the judgement of the registrar of index `reg_index` about `target`.
       *
       * Emits `JudgementGiven` if successful.
       *
       * # <weight>
       * - `O(R + X)`.
       * - One balance-transfer operation.
       * - Up to one account-lookup operation.
       * - Storage: 1 read `O(R)`, 1 mutate `O(R + X)`.
       * - One event.
       * # </weight>
       **/
      provideJudgement: AugmentedSubmittable<
        (
          regIndex: Compact<u32> | AnyNumber | Uint8Array,
          target: AccountId32 | string | Uint8Array,
          judgement:
            | PalletIdentityJudgement
            | { Unknown: any }
            | { FeePaid: any }
            | { Reasonable: any }
            | { KnownGood: any }
            | { OutOfDate: any }
            | { LowQuality: any }
            | { Erroneous: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, AccountId32, PalletIdentityJudgement]
      >
      /**
       * Remove the sender as a sub-account.
       *
       * Payment: Balance reserved by a previous `set_subs` call for one sub will be repatriated
       * to the sender (*not* the original depositor).
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a registered
       * super-identity.
       *
       * NOTE: This should not normally be used, but is provided in the case that the non-
       * controller of an account is maliciously registered as a sub-account.
       **/
      quitSub: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>
      /**
       * Remove the given account from the sender's subs.
       *
       * Payment: Balance reserved by a previous `set_subs` call for one sub will be repatriated
       * to the sender.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a registered
       * sub identity of `sub`.
       **/
      removeSub: AugmentedSubmittable<
        (
          sub: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Alter the associated name of the given sub-account.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a registered
       * sub identity of `sub`.
       **/
      renameSub: AugmentedSubmittable<
        (
          sub: AccountId32 | string | Uint8Array,
          data:
            | Data
            | { None: any }
            | { Raw: any }
            | { BlakeTwo256: any }
            | { Sha256: any }
            | { Keccak256: any }
            | { ShaThree256: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Data]
      >
      /**
       * Request a judgement from a registrar.
       *
       * Payment: At most `max_fee` will be reserved for payment to the registrar if judgement
       * given.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a
       * registered identity.
       *
       * - `reg_index`: The index of the registrar whose judgement is requested.
       * - `max_fee`: The maximum fee that may be paid. This should just be auto-populated as:
       *
       * ```nocompile
       * Self::registrars().get(reg_index).unwrap().fee
       * ```
       *
       * Emits `JudgementRequested` if successful.
       *
       * # <weight>
       * - `O(R + X)`.
       * - One balance-reserve operation.
       * - Storage: 1 read `O(R)`, 1 mutate `O(X + R)`.
       * - One event.
       * # </weight>
       **/
      requestJudgement: AugmentedSubmittable<
        (
          regIndex: Compact<u32> | AnyNumber | Uint8Array,
          maxFee: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Compact<u128>]
      >
      /**
       * Change the account associated with a registrar.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must be the account
       * of the registrar whose index is `index`.
       *
       * - `index`: the index of the registrar whose fee is to be set.
       * - `new`: the new account ID.
       *
       * # <weight>
       * - `O(R)`.
       * - One storage mutation `O(R)`.
       * - Benchmark: 8.823 + R * 0.32 µs (min squares analysis)
       * # </weight>
       **/
      setAccountId: AugmentedSubmittable<
        (
          index: Compact<u32> | AnyNumber | Uint8Array,
          updated: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, AccountId32]
      >
      /**
       * Set the fee required for a judgement to be requested from a registrar.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must be the account
       * of the registrar whose index is `index`.
       *
       * - `index`: the index of the registrar whose fee is to be set.
       * - `fee`: the new fee.
       *
       * # <weight>
       * - `O(R)`.
       * - One storage mutation `O(R)`.
       * - Benchmark: 7.315 + R * 0.329 µs (min squares analysis)
       * # </weight>
       **/
      setFee: AugmentedSubmittable<
        (
          index: Compact<u32> | AnyNumber | Uint8Array,
          fee: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Compact<u128>]
      >
      /**
       * Set the field information for a registrar.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must be the account
       * of the registrar whose index is `index`.
       *
       * - `index`: the index of the registrar whose fee is to be set.
       * - `fields`: the fields that the registrar concerns themselves with.
       *
       * # <weight>
       * - `O(R)`.
       * - One storage mutation `O(R)`.
       * - Benchmark: 7.464 + R * 0.325 µs (min squares analysis)
       * # </weight>
       **/
      setFields: AugmentedSubmittable<
        (
          index: Compact<u32> | AnyNumber | Uint8Array,
          fields: PalletIdentityBitFlags,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, PalletIdentityBitFlags]
      >
      /**
       * Set an account's identity information and reserve the appropriate deposit.
       *
       * If the account already has identity information, the deposit is taken as part payment
       * for the new deposit.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `info`: The identity information.
       *
       * Emits `IdentitySet` if successful.
       *
       * # <weight>
       * - `O(X + X' + R)`
       * - where `X` additional-field-count (deposit-bounded and code-bounded)
       * - where `R` judgements-count (registrar-count-bounded)
       * - One balance reserve operation.
       * - One storage mutation (codec-read `O(X' + R)`, codec-write `O(X + R)`).
       * - One event.
       * # </weight>
       **/
      setIdentity: AugmentedSubmittable<
        (
          info:
            | PalletIdentityIdentityInfo
            | {
                additional?: any
                display?: any
                legal?: any
                web?: any
                riot?: any
                email?: any
                pgpFingerprint?: any
                image?: any
                twitter?: any
              }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [PalletIdentityIdentityInfo]
      >
      /**
       * Set the sub-accounts of the sender.
       *
       * Payment: Any aggregate balance reserved by previous `set_subs` calls will be returned
       * and an amount `SubAccountDeposit` will be reserved for each item in `subs`.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must have a registered
       * identity.
       *
       * - `subs`: The identity's (new) sub-accounts.
       *
       * # <weight>
       * - `O(P + S)`
       * - where `P` old-subs-count (hard- and deposit-bounded).
       * - where `S` subs-count (hard- and deposit-bounded).
       * - At most one balance operations.
       * - DB:
       * - `P + S` storage mutations (codec complexity `O(1)`)
       * - One storage read (codec complexity `O(P)`).
       * - One storage write (codec complexity `O(S)`).
       * - One storage-exists (`IdentityOf::contains_key`).
       * # </weight>
       **/
      setSubs: AugmentedSubmittable<
        (
          subs:
            | Vec<ITuple<[AccountId32, Data]>>
            | [
                AccountId32 | string | Uint8Array,
                (
                  | Data
                  | { None: any }
                  | { Raw: any }
                  | { BlakeTwo256: any }
                  | { Sha256: any }
                  | { Keccak256: any }
                  | { ShaThree256: any }
                  | string
                  | Uint8Array
                ),
              ][],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[AccountId32, Data]>>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    lbp: {
      /**
       * Add liquidity to a pool.
       *
       * Assets to add has to match the pool assets. At least one amount has to be non-zero.
       *
       * The dispatch origin for this call must be signed by the pool owner.
       *
       * Parameters:
       * - `pool_id`: The identifier of the pool
       * - `amount_a`: The identifier of the asset and the amount to add.
       * - `amount_b`: The identifier of the second asset and the amount to add.
       *
       * Emits `LiquidityAdded` event when successful.
       **/
      addLiquidity: AugmentedSubmittable<
        (
          amountA:
            | ITuple<[u32, u128]>
            | [u32 | AnyNumber | Uint8Array, u128 | AnyNumber | Uint8Array],
          amountB:
            | ITuple<[u32, u128]>
            | [u32 | AnyNumber | Uint8Array, u128 | AnyNumber | Uint8Array],
        ) => SubmittableExtrinsic<ApiType>,
        [ITuple<[u32, u128]>, ITuple<[u32, u128]>]
      >
      /**
       * Trade `asset_in` for `asset_out`.
       *
       * Executes a swap of `asset_in` for `asset_out`. Price is determined by the pool and is
       * affected by the amount and the proportion of the pool assets and the weights.
       *
       * Trading `fee` is distributed to the `fee_collector`.
       *
       * Parameters:
       * - `asset_in`: The identifier of the asset being transferred from the account to the pool.
       * - `asset_out`: The identifier of the asset being transferred from the pool to the account.
       * - `amount`: The amount of `asset_out`.
       * - `max_limit`: maximum amount of `asset_in` to be sold in exchange for `asset_out`.
       *
       * Emits `BuyExecuted` when successful.
       **/
      buy: AugmentedSubmittable<
        (
          assetOut: u32 | AnyNumber | Uint8Array,
          assetIn: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          maxLimit: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128]
      >
      /**
       * Create a new liquidity bootstrapping pool for given asset pair.
       *
       * For any asset pair, only one pool can exist at a time.
       *
       * The dispatch origin for this call must be `T::CreatePoolOrigin`.
       * The pool is created with initial liquidity provided by the `pool_owner` who must have
       * sufficient funds free.
       *
       * The pool starts uninitialized and update_pool call should be called once created to set the start block.
       *
       * This function should be dispatched from governing entity `T::CreatePoolOrigin`
       *
       * Parameters:
       * - `pool_owner`: the future owner of the new pool.
       * - `asset_a`: { asset_id, amount } Asset ID and initial liquidity amount.
       * - `asset_b`: { asset_id, amount } Asset ID and initial liquidity amount.
       * - `initial_weight`: Initial weight of the asset_a. 1_000_000 corresponding to 1% and 100_000_000 to 100%
       * this should be higher than final weight
       * - `final_weight`: Final weight of the asset_a. 1_000_000 corresponding to 1% and 100_000_000 to 100%
       * this should be lower than initial weight
       * - `weight_curve`: The weight function used to update the LBP weights. Currently,
       * there is only one weight function implemented, the linear function.
       * - `fee`: The trading fee charged on every trade distributed to `fee_collector`.
       * - `fee_collector`: The account to which trading fees will be transferred.
       * - `repay_target`: The amount of tokens to repay to separate fee_collector account. Until this amount is
       * reached, fee will be increased to 20% and taken from the pool
       *
       * Emits `PoolCreated` event when successful.
       *
       * BEWARE: We are taking the fee from the accumulated asset. If the accumulated asset is sold to the pool,
       * the fee cost is transferred to the pool. If its bought from the pool the buyer bears the cost.
       * This increases the price of the sold asset on every trade. Make sure to only run this with
       * previously illiquid assets.
       **/
      createPool: AugmentedSubmittable<
        (
          poolOwner: AccountId32 | string | Uint8Array,
          assetA: u32 | AnyNumber | Uint8Array,
          assetAAmount: u128 | AnyNumber | Uint8Array,
          assetB: u32 | AnyNumber | Uint8Array,
          assetBAmount: u128 | AnyNumber | Uint8Array,
          initialWeight: u32 | AnyNumber | Uint8Array,
          finalWeight: u32 | AnyNumber | Uint8Array,
          weightCurve:
            | PalletLbpWeightCurveType
            | "Linear"
            | number
            | Uint8Array,
          fee:
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          feeCollector: AccountId32 | string | Uint8Array,
          repayTarget: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          AccountId32,
          u32,
          u128,
          u32,
          u128,
          u32,
          u32,
          PalletLbpWeightCurveType,
          ITuple<[u32, u32]>,
          AccountId32,
          u128,
        ]
      >
      /**
       * Transfer all the liquidity from a pool back to the pool owner and destroy the pool.
       * The pool data are also removed from the storage.
       *
       * The pool can't be destroyed during the sale.
       *
       * The dispatch origin for this call must be signed by the pool owner.
       *
       * Parameters:
       * - `amount_a`: The identifier of the asset and the amount to add.
       *
       * Emits 'LiquidityRemoved' when successful.
       **/
      removeLiquidity: AugmentedSubmittable<
        (
          poolId: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      /**
       * Trade `asset_in` for `asset_out`.
       *
       * Executes a swap of `asset_in` for `asset_out`. Price is determined by the pool and is
       * affected by the amount and proportion of the pool assets and the weights.
       *
       * Trading `fee` is distributed to the `fee_collector`.
       *
       * Parameters:
       * - `asset_in`: The identifier of the asset being transferred from the account to the pool.
       * - `asset_out`: The identifier of the asset being transferred from the pool to the account.
       * - `amount`: The amount of `asset_in`
       * - `max_limit`: minimum amount of `asset_out` / amount of asset_out to be obtained from the pool in exchange for `asset_in`.
       *
       * Emits `SellExecuted` when successful.
       **/
      sell: AugmentedSubmittable<
        (
          assetIn: u32 | AnyNumber | Uint8Array,
          assetOut: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          maxLimit: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128]
      >
      /**
       * Update pool data of a pool.
       *
       * The dispatch origin for this call must be signed by the pool owner.
       *
       * The pool can be updated only if the sale has not already started.
       *
       * At least one of the following optional parameters has to be specified.
       *
       * Parameters:
       * - `pool_id`: The identifier of the pool to be updated.
       * - `start`: The new starting time of the sale. This parameter is optional.
       * - `end`: The new ending time of the sale. This parameter is optional.
       * - `initial_weight`: The new initial weight. This parameter is optional.
       * - `final_weight`: The new final weight. This parameter is optional.
       * - `fee`: The new trading fee charged on every trade. This parameter is optional.
       * - `fee_collector`: The new receiver of trading fees. This parameter is optional.
       *
       * Emits `PoolUpdated` event when successful.
       **/
      updatePoolData: AugmentedSubmittable<
        (
          poolId: AccountId32 | string | Uint8Array,
          poolOwner:
            | Option<AccountId32>
            | null
            | Uint8Array
            | AccountId32
            | string,
          start: Option<u32> | null | Uint8Array | u32 | AnyNumber,
          end: Option<u32> | null | Uint8Array | u32 | AnyNumber,
          initialWeight: Option<u32> | null | Uint8Array | u32 | AnyNumber,
          finalWeight: Option<u32> | null | Uint8Array | u32 | AnyNumber,
          fee:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          feeCollector:
            | Option<AccountId32>
            | null
            | Uint8Array
            | AccountId32
            | string,
          repayTarget: Option<u128> | null | Uint8Array | u128 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [
          AccountId32,
          Option<AccountId32>,
          Option<u32>,
          Option<u32>,
          Option<u32>,
          Option<u32>,
          Option<ITuple<[u32, u32]>>,
          Option<AccountId32>,
          Option<u128>,
        ]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    marketplace: {
      /**
       * Accept an offer and process the trade
       *
       * Parameters:
       * - `class_id`: The identifier of a non-fungible token class
       * - `instance_id`: The instance identifier of a class
       * - `maker`: User who made the offer
       **/
      acceptOffer: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          maker: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, AccountId32]
      >
      /**
       * Add royalty feature where a cut for author is provided
       * There is non-refundable reserve held for creating a royalty
       *
       * Parameters:
       * - `class_id`: The class of the asset to be minted.
       * - `instance_id`: The instance value of the asset to be minted.
       * - `author`: Receiver of the royalty
       * - `royalty`: Percentage reward from each trade for the author
       **/
      addRoyalty: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          author: AccountId32 | string | Uint8Array,
          royalty: u8 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, AccountId32, u8]
      >
      /**
       * Pays a price to the current owner
       * Transfers NFT ownership to the buyer
       * Disables automatic sell of the NFT
       *
       * Parameters:
       * - `class_id`: The identifier of a non-fungible token class
       * - `instance_id`: The instance identifier of a class
       **/
      buy: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128]
      >
      /**
       * Users can indicate what price they would be willing to pay for a token
       * Price can be lower than current listing price
       * Token doesn't have to be currently listed
       *
       * Parameters:
       * - `class_id`: The identifier of a non-fungible token class
       * - `instance_id`: The instance identifier of a class
       * - `amount`: The amount user is willing to pay
       * - `expires`: The block until the current owner can accept the offer
       **/
      makeOffer: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          expires: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, u128, u32]
      >
      /**
       * Set trading price and allow sell
       * Setting price to None disables auto sell
       *
       * Parameters:
       * - `class_id`: The identifier of a non-fungible token class
       * - `instance_id`: The instance identifier of a class
       * - `new_price`: price the token will be listed for
       **/
      setPrice: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          newPrice: Option<u128> | null | Uint8Array | u128 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, Option<u128>]
      >
      /**
       * Reverse action to make_offer
       * Removes an offer and unreserves funds
       * Can be done by the offer maker or owner of the token
       *
       * Parameters:
       * - `class_id`: The identifier of a non-fungible token class
       * - `instance_id`: The instance identifier of a class
       * - `maker`: User who made the offer
       **/
      withdrawOffer: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          maker: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, AccountId32]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    multisig: {
      /**
       * Register approval for a dispatch to be made from a deterministic composite account if
       * approved by a total of `threshold - 1` of `other_signatories`.
       *
       * Payment: `DepositBase` will be reserved if this is the first approval, plus
       * `threshold` times `DepositFactor`. It is returned once this dispatch happens or
       * is cancelled.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `threshold`: The total number of approvals for this dispatch before it is executed.
       * - `other_signatories`: The accounts (other than the sender) who can approve this
       * dispatch. May not be empty.
       * - `maybe_timepoint`: If this is the first approval, then this must be `None`. If it is
       * not the first approval, then it must be `Some`, with the timepoint (block number and
       * transaction index) of the first approval transaction.
       * - `call_hash`: The hash of the call to be executed.
       *
       * NOTE: If this is the final approval, you will want to use `as_multi` instead.
       *
       * # <weight>
       * - `O(S)`.
       * - Up to one balance-reserve or unreserve operation.
       * - One passthrough operation, one insert, both `O(S)` where `S` is the number of
       * signatories. `S` is capped by `MaxSignatories`, with weight being proportional.
       * - One encode & hash, both of complexity `O(S)`.
       * - Up to one binary search and insert (`O(logS + S)`).
       * - I/O: 1 read `O(S)`, up to 1 mutate `O(S)`. Up to one remove.
       * - One event.
       * - Storage: inserts one item, value size bounded by `MaxSignatories`, with a deposit
       * taken for its lifetime of `DepositBase + threshold * DepositFactor`.
       * ----------------------------------
       * - DB Weight:
       * - Read: Multisig Storage, [Caller Account]
       * - Write: Multisig Storage, [Caller Account]
       * # </weight>
       **/
      approveAsMulti: AugmentedSubmittable<
        (
          threshold: u16 | AnyNumber | Uint8Array,
          otherSignatories:
            | Vec<AccountId32>
            | (AccountId32 | string | Uint8Array)[],
          maybeTimepoint:
            | Option<PalletMultisigTimepoint>
            | null
            | Uint8Array
            | PalletMultisigTimepoint
            | { height?: any; index?: any }
            | string,
          callHash: U8aFixed | string | Uint8Array,
          maxWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u16, Vec<AccountId32>, Option<PalletMultisigTimepoint>, U8aFixed, u64]
      >
      /**
       * Register approval for a dispatch to be made from a deterministic composite account if
       * approved by a total of `threshold - 1` of `other_signatories`.
       *
       * If there are enough, then dispatch the call.
       *
       * Payment: `DepositBase` will be reserved if this is the first approval, plus
       * `threshold` times `DepositFactor`. It is returned once this dispatch happens or
       * is cancelled.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `threshold`: The total number of approvals for this dispatch before it is executed.
       * - `other_signatories`: The accounts (other than the sender) who can approve this
       * dispatch. May not be empty.
       * - `maybe_timepoint`: If this is the first approval, then this must be `None`. If it is
       * not the first approval, then it must be `Some`, with the timepoint (block number and
       * transaction index) of the first approval transaction.
       * - `call`: The call to be executed.
       *
       * NOTE: Unless this is the final approval, you will generally want to use
       * `approve_as_multi` instead, since it only requires a hash of the call.
       *
       * Result is equivalent to the dispatched result if `threshold` is exactly `1`. Otherwise
       * on success, result is `Ok` and the result from the interior call, if it was executed,
       * may be found in the deposited `MultisigExecuted` event.
       *
       * # <weight>
       * - `O(S + Z + Call)`.
       * - Up to one balance-reserve or unreserve operation.
       * - One passthrough operation, one insert, both `O(S)` where `S` is the number of
       * signatories. `S` is capped by `MaxSignatories`, with weight being proportional.
       * - One call encode & hash, both of complexity `O(Z)` where `Z` is tx-len.
       * - One encode & hash, both of complexity `O(S)`.
       * - Up to one binary search and insert (`O(logS + S)`).
       * - I/O: 1 read `O(S)`, up to 1 mutate `O(S)`. Up to one remove.
       * - One event.
       * - The weight of the `call`.
       * - Storage: inserts one item, value size bounded by `MaxSignatories`, with a deposit
       * taken for its lifetime of `DepositBase + threshold * DepositFactor`.
       * -------------------------------
       * - DB Weight:
       * - Reads: Multisig Storage, [Caller Account], Calls (if `store_call`)
       * - Writes: Multisig Storage, [Caller Account], Calls (if `store_call`)
       * - Plus Call Weight
       * # </weight>
       **/
      asMulti: AugmentedSubmittable<
        (
          threshold: u16 | AnyNumber | Uint8Array,
          otherSignatories:
            | Vec<AccountId32>
            | (AccountId32 | string | Uint8Array)[],
          maybeTimepoint:
            | Option<PalletMultisigTimepoint>
            | null
            | Uint8Array
            | PalletMultisigTimepoint
            | { height?: any; index?: any }
            | string,
          call: WrapperKeepOpaque<Call> | object | string | Uint8Array,
          storeCall: bool | boolean | Uint8Array,
          maxWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          u16,
          Vec<AccountId32>,
          Option<PalletMultisigTimepoint>,
          WrapperKeepOpaque<Call>,
          bool,
          u64,
        ]
      >
      /**
       * Immediately dispatch a multi-signature call using a single approval from the caller.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `other_signatories`: The accounts (other than the sender) who are part of the
       * multi-signature, but do not participate in the approval process.
       * - `call`: The call to be executed.
       *
       * Result is equivalent to the dispatched result.
       *
       * # <weight>
       * O(Z + C) where Z is the length of the call and C its execution weight.
       * -------------------------------
       * - DB Weight: None
       * - Plus Call Weight
       * # </weight>
       **/
      asMultiThreshold1: AugmentedSubmittable<
        (
          otherSignatories:
            | Vec<AccountId32>
            | (AccountId32 | string | Uint8Array)[],
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>, Call]
      >
      /**
       * Cancel a pre-existing, on-going multisig transaction. Any deposit reserved previously
       * for this operation will be unreserved on success.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `threshold`: The total number of approvals for this dispatch before it is executed.
       * - `other_signatories`: The accounts (other than the sender) who can approve this
       * dispatch. May not be empty.
       * - `timepoint`: The timepoint (block number and transaction index) of the first approval
       * transaction for this dispatch.
       * - `call_hash`: The hash of the call to be executed.
       *
       * # <weight>
       * - `O(S)`.
       * - Up to one balance-reserve or unreserve operation.
       * - One passthrough operation, one insert, both `O(S)` where `S` is the number of
       * signatories. `S` is capped by `MaxSignatories`, with weight being proportional.
       * - One encode & hash, both of complexity `O(S)`.
       * - One event.
       * - I/O: 1 read `O(S)`, one remove.
       * - Storage: removes one item.
       * ----------------------------------
       * - DB Weight:
       * - Read: Multisig Storage, [Caller Account], Refund Account, Calls
       * - Write: Multisig Storage, [Caller Account], Refund Account, Calls
       * # </weight>
       **/
      cancelAsMulti: AugmentedSubmittable<
        (
          threshold: u16 | AnyNumber | Uint8Array,
          otherSignatories:
            | Vec<AccountId32>
            | (AccountId32 | string | Uint8Array)[],
          timepoint:
            | PalletMultisigTimepoint
            | { height?: any; index?: any }
            | string
            | Uint8Array,
          callHash: U8aFixed | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u16, Vec<AccountId32>, PalletMultisigTimepoint, U8aFixed]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    multiTransactionPayment: {
      /**
       * Add a currency to the list of accepted currencies.
       *
       * Only member can perform this action.
       *
       * Currency must not be already accepted. Core asset id cannot be explicitly added.
       *
       * Emits `CurrencyAdded` event when successful.
       **/
      addCurrency: AugmentedSubmittable<
        (
          currency: u32 | AnyNumber | Uint8Array,
          price: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u128]
      >
      /**
       * Remove currency from the list of supported currencies
       * Only selected members can perform this action
       *
       * Core asset cannot be removed.
       *
       * Emits `CurrencyRemoved` when successful.
       **/
      removeCurrency: AugmentedSubmittable<
        (
          currency: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Set selected currency for given account.
       *
       * This allows to set a currency for an account in which all transaction fees will be paid.
       * Account balance cannot be zero.
       *
       * Chosen currency must be in the list of accepted currencies.
       *
       * When currency is set, fixed fee is withdrawn from the account to pay for the currency change
       *
       * Emits `CurrencySet` event when successful.
       **/
      setCurrency: AugmentedSubmittable<
        (
          currency: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    nft: {
      /**
       * Removes a token from existence
       *
       * Parameters:
       * - `class_id`: The class of the asset to be burned.
       * - `instance_id`: The instance of the asset to be burned.
       **/
      burn: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128]
      >
      /**
       * Creates an NFT class of the given class
       * and sets its metadata
       *
       * Parameters:
       * - `class_id`: Identifier of a class
       * - `class_type`: The class type determines its purpose and usage
       * - `metadata`: Arbitrary data about a class, e.g. IPFS hash or name
       *
       * Emits ClassCreated event
       **/
      createClass: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          classType:
            | PrimitivesNftClassType
            | "Marketplace"
            | "LiquidityMining"
            | "Redeemable"
            | "Auction"
            | "HydraHeads"
            | number
            | Uint8Array,
          metadata: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, PrimitivesNftClassType, Bytes]
      >
      /**
       * Removes a class from existence
       *
       * Parameters:
       * - `class_id`: The identifier of the asset class to be destroyed.
       **/
      destroyClass: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128]
      >
      /**
       * Mints an NFT in the specified class
       * and sets its metadata
       *
       * Parameters:
       * - `class_id`: The class of the asset to be minted.
       * - `instance_id`: The class of the asset to be minted.
       * - `metadata`: Arbitrary data about an instance, e.g. IPFS hash or symbol
       **/
      mint: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          metadata: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, Bytes]
      >
      /**
       * Transfers NFT from account A to account B
       * Only the ProtocolOrigin can send NFT to another account
       * This is to prevent creating deposit burden for others
       *
       * Parameters:
       * - `class_id`: The class of the asset to be transferred.
       * - `instance_id`: The instance of the asset to be transferred.
       * - `dest`: The account to receive ownership of the asset.
       **/
      transfer: AugmentedSubmittable<
        (
          classId: u128 | AnyNumber | Uint8Array,
          instanceId: u128 | AnyNumber | Uint8Array,
          dest: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u128, u128, AccountId32]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    ormlXcm: {
      /**
       * Send an XCM message as parachain sovereign.
       **/
      sendAsSovereign: AugmentedSubmittable<
        (
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          message:
            | XcmVersionedXcm
            | { V0: any }
            | { V1: any }
            | { V2: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedMultiLocation, XcmVersionedXcm]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    parachainSystem: {
      authorizeUpgrade: AugmentedSubmittable<
        (codeHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      enactAuthorizedUpgrade: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Set the current validation data.
       *
       * This should be invoked exactly once per block. It will panic at the finalization
       * phase if the call was not invoked.
       *
       * The dispatch origin for this call must be `Inherent`
       *
       * As a side effect, this function upgrades the current validation function
       * if the appropriate time has come.
       **/
      setValidationData: AugmentedSubmittable<
        (
          data:
            | CumulusPrimitivesParachainInherentParachainInherentData
            | {
                validationData?: any
                relayChainState?: any
                downwardMessages?: any
                horizontalMessages?: any
              }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [CumulusPrimitivesParachainInherentParachainInherentData]
      >
      sudoSendUpwardMessage: AugmentedSubmittable<
        (message: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    polkadotXcm: {
      /**
       * Execute an XCM message from a local, signed, origin.
       *
       * An event is deposited indicating whether `msg` could be executed completely or only
       * partially.
       *
       * No more than `max_weight` will be used in its attempted execution. If this is less than the
       * maximum amount of weight that the message could take to be executed, then no execution
       * attempt will be made.
       *
       * NOTE: A successful return to this does *not* imply that the `msg` was executed successfully
       * to completion; only that *some* of it was executed.
       **/
      execute: AugmentedSubmittable<
        (
          message:
            | XcmVersionedXcm
            | { V0: any }
            | { V1: any }
            | { V2: any }
            | string
            | Uint8Array,
          maxWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedXcm, u64]
      >
      /**
       * Set a safe XCM version (the version that XCM should be encoded with if the most recent
       * version a destination can accept is unknown).
       *
       * - `origin`: Must be Root.
       * - `maybe_xcm_version`: The default XCM encoding version, or `None` to disable.
       **/
      forceDefaultXcmVersion: AugmentedSubmittable<
        (
          maybeXcmVersion: Option<u32> | null | Uint8Array | u32 | AnyNumber,
        ) => SubmittableExtrinsic<ApiType>,
        [Option<u32>]
      >
      /**
       * Ask a location to notify us regarding their XCM version and any changes to it.
       *
       * - `origin`: Must be Root.
       * - `location`: The location to which we should subscribe for XCM version notifications.
       **/
      forceSubscribeVersionNotify: AugmentedSubmittable<
        (
          location:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedMultiLocation]
      >
      /**
       * Require that a particular destination should no longer notify us regarding any XCM
       * version changes.
       *
       * - `origin`: Must be Root.
       * - `location`: The location to which we are currently subscribed for XCM version
       * notifications which we no longer desire.
       **/
      forceUnsubscribeVersionNotify: AugmentedSubmittable<
        (
          location:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedMultiLocation]
      >
      /**
       * Extoll that a particular destination can be communicated with through a particular
       * version of XCM.
       *
       * - `origin`: Must be Root.
       * - `location`: The destination that is being described.
       * - `xcm_version`: The latest version of XCM that `location` supports.
       **/
      forceXcmVersion: AugmentedSubmittable<
        (
          location:
            | XcmV1MultiLocation
            | { parents?: any; interior?: any }
            | string
            | Uint8Array,
          xcmVersion: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmV1MultiLocation, u32]
      >
      /**
       * Transfer some assets from the local chain to the sovereign account of a destination chain and forward
       * a notification XCM.
       *
       * Fee payment on the destination side is made from the first asset listed in the `assets` vector.
       *
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `X2(Parent, Parachain(..))` to send
       * from parachain to parachain, or `X1(Parachain(..))` to send from relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will generally be
       * an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the fee on the
       * `dest` side.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       * - `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
       **/
      limitedReserveTransferAssets: AugmentedSubmittable<
        (
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          beneficiary:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          assets:
            | XcmVersionedMultiAssets
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          feeAssetItem: u32 | AnyNumber | Uint8Array,
          weightLimit:
            | XcmV2WeightLimit
            | { Unlimited: any }
            | { Limited: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          XcmVersionedMultiLocation,
          XcmVersionedMultiLocation,
          XcmVersionedMultiAssets,
          u32,
          XcmV2WeightLimit,
        ]
      >
      /**
       * Teleport some assets from the local chain to some destination chain.
       *
       * Fee payment on the destination side is made from the first asset listed in the `assets` vector.
       *
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `X2(Parent, Parachain(..))` to send
       * from parachain to parachain, or `X1(Parachain(..))` to send from relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will generally be
       * an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. The first item should be the currency used to to pay the fee on the
       * `dest` side. May not be empty.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       * - `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
       **/
      limitedTeleportAssets: AugmentedSubmittable<
        (
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          beneficiary:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          assets:
            | XcmVersionedMultiAssets
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          feeAssetItem: u32 | AnyNumber | Uint8Array,
          weightLimit:
            | XcmV2WeightLimit
            | { Unlimited: any }
            | { Limited: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          XcmVersionedMultiLocation,
          XcmVersionedMultiLocation,
          XcmVersionedMultiAssets,
          u32,
          XcmV2WeightLimit,
        ]
      >
      /**
       * Transfer some assets from the local chain to the sovereign account of a destination chain and forward
       * a notification XCM.
       *
       * Fee payment on the destination side is made from the first asset listed in the `assets` vector and
       * fee-weight is calculated locally and thus remote weights are assumed to be equal to
       * local weights.
       *
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `X2(Parent, Parachain(..))` to send
       * from parachain to parachain, or `X1(Parachain(..))` to send from relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will generally be
       * an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. This should include the assets used to pay the fee on the
       * `dest` side.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       **/
      reserveTransferAssets: AugmentedSubmittable<
        (
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          beneficiary:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          assets:
            | XcmVersionedMultiAssets
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          feeAssetItem: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          XcmVersionedMultiLocation,
          XcmVersionedMultiLocation,
          XcmVersionedMultiAssets,
          u32,
        ]
      >
      send: AugmentedSubmittable<
        (
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          message:
            | XcmVersionedXcm
            | { V0: any }
            | { V1: any }
            | { V2: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedMultiLocation, XcmVersionedXcm]
      >
      /**
       * Teleport some assets from the local chain to some destination chain.
       *
       * Fee payment on the destination side is made from the first asset listed in the `assets` vector and
       * fee-weight is calculated locally and thus remote weights are assumed to be equal to
       * local weights.
       *
       * - `origin`: Must be capable of withdrawing the `assets` and executing XCM.
       * - `dest`: Destination context for the assets. Will typically be `X2(Parent, Parachain(..))` to send
       * from parachain to parachain, or `X1(Parachain(..))` to send from relay to parachain.
       * - `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will generally be
       * an `AccountId32` value.
       * - `assets`: The assets to be withdrawn. The first item should be the currency used to to pay the fee on the
       * `dest` side. May not be empty.
       * - `fee_asset_item`: The index into `assets` of the item which should be used to pay
       * fees.
       **/
      teleportAssets: AugmentedSubmittable<
        (
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          beneficiary:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          assets:
            | XcmVersionedMultiAssets
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          feeAssetItem: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          XcmVersionedMultiLocation,
          XcmVersionedMultiLocation,
          XcmVersionedMultiAssets,
          u32,
        ]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    preimage: {
      /**
       * Register a preimage on-chain.
       *
       * If the preimage was previously requested, no fees or deposits are taken for providing
       * the preimage. Otherwise, a deposit is taken proportional to the size of the preimage.
       **/
      notePreimage: AugmentedSubmittable<
        (bytes: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Request a preimage be uploaded to the chain without paying any fees or deposits.
       *
       * If the preimage requests has already been provided on-chain, we unreserve any deposit
       * a user may have paid, and take the control of the preimage out of their hands.
       **/
      requestPreimage: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Clear an unrequested preimage from the runtime storage.
       **/
      unnotePreimage: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Clear a previously made request for a preimage.
       *
       * NOTE: THIS MUST NOT BE CALLED ON `hash` MORE TIMES THAN `request_preimage`.
       **/
      unrequestPreimage: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    proxy: {
      /**
       * Register a proxy account for the sender that is able to make calls on its behalf.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Parameters:
       * - `proxy`: The account that the `caller` would like to make a proxy.
       * - `proxy_type`: The permissions allowed for this proxy account.
       * - `delay`: The announcement period required of the initial proxy. Will generally be
       * zero.
       *
       * # <weight>
       * Weight is a function of the number of proxies the user has (P).
       * # </weight>
       **/
      addProxy: AugmentedSubmittable<
        (
          delegate: AccountId32 | string | Uint8Array,
          proxyType:
            | CommonRuntimeProxyType
            | "Any"
            | "CancelProxy"
            | "Governance"
            | "Exchange"
            | "Transfer"
            | number
            | Uint8Array,
          delay: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, CommonRuntimeProxyType, u32]
      >
      /**
       * Publish the hash of a proxy-call that will be made in the future.
       *
       * This must be called some number of blocks before the corresponding `proxy` is attempted
       * if the delay associated with the proxy relationship is greater than zero.
       *
       * No more than `MaxPending` announcements may be made at any one time.
       *
       * This will take a deposit of `AnnouncementDepositFactor` as well as
       * `AnnouncementDepositBase` if there are no other pending announcements.
       *
       * The dispatch origin for this call must be _Signed_ and a proxy of `real`.
       *
       * Parameters:
       * - `real`: The account that the proxy will make a call on behalf of.
       * - `call_hash`: The hash of the call to be made by the `real` account.
       *
       * # <weight>
       * Weight is a function of:
       * - A: the number of announcements made.
       * - P: the number of proxies the user has.
       * # </weight>
       **/
      announce: AugmentedSubmittable<
        (
          real: AccountId32 | string | Uint8Array,
          callHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, H256]
      >
      /**
       * Spawn a fresh new account that is guaranteed to be otherwise inaccessible, and
       * initialize it with a proxy of `proxy_type` for `origin` sender.
       *
       * Requires a `Signed` origin.
       *
       * - `proxy_type`: The type of the proxy that the sender will be registered as over the
       * new account. This will almost always be the most permissive `ProxyType` possible to
       * allow for maximum flexibility.
       * - `index`: A disambiguation index, in case this is called multiple times in the same
       * transaction (e.g. with `utility::batch`). Unless you're using `batch` you probably just
       * want to use `0`.
       * - `delay`: The announcement period required of the initial proxy. Will generally be
       * zero.
       *
       * Fails with `Duplicate` if this has already been called in this transaction, from the
       * same sender, with the same parameters.
       *
       * Fails if there are insufficient funds to pay for deposit.
       *
       * # <weight>
       * Weight is a function of the number of proxies the user has (P).
       * # </weight>
       * TODO: Might be over counting 1 read
       **/
      anonymous: AugmentedSubmittable<
        (
          proxyType:
            | CommonRuntimeProxyType
            | "Any"
            | "CancelProxy"
            | "Governance"
            | "Exchange"
            | "Transfer"
            | number
            | Uint8Array,
          delay: u32 | AnyNumber | Uint8Array,
          index: u16 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [CommonRuntimeProxyType, u32, u16]
      >
      /**
       * Removes a previously spawned anonymous proxy.
       *
       * WARNING: **All access to this account will be lost.** Any funds held in it will be
       * inaccessible.
       *
       * Requires a `Signed` origin, and the sender account must have been created by a call to
       * `anonymous` with corresponding parameters.
       *
       * - `spawner`: The account that originally called `anonymous` to create this account.
       * - `index`: The disambiguation index originally passed to `anonymous`. Probably `0`.
       * - `proxy_type`: The proxy type originally passed to `anonymous`.
       * - `height`: The height of the chain when the call to `anonymous` was processed.
       * - `ext_index`: The extrinsic index in which the call to `anonymous` was processed.
       *
       * Fails with `NoPermission` in case the caller is not a previously created anonymous
       * account whose `anonymous` call has corresponding parameters.
       *
       * # <weight>
       * Weight is a function of the number of proxies the user has (P).
       * # </weight>
       **/
      killAnonymous: AugmentedSubmittable<
        (
          spawner: AccountId32 | string | Uint8Array,
          proxyType:
            | CommonRuntimeProxyType
            | "Any"
            | "CancelProxy"
            | "Governance"
            | "Exchange"
            | "Transfer"
            | number
            | Uint8Array,
          index: u16 | AnyNumber | Uint8Array,
          height: Compact<u32> | AnyNumber | Uint8Array,
          extIndex: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, CommonRuntimeProxyType, u16, Compact<u32>, Compact<u32>]
      >
      /**
       * Dispatch the given `call` from an account that the sender is authorised for through
       * `add_proxy`.
       *
       * Removes any corresponding announcement(s).
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Parameters:
       * - `real`: The account that the proxy will make a call on behalf of.
       * - `force_proxy_type`: Specify the exact proxy type to be used and checked for this call.
       * - `call`: The call to be made by the `real` account.
       *
       * # <weight>
       * Weight is a function of the number of proxies the user has (P).
       * # </weight>
       **/
      proxy: AugmentedSubmittable<
        (
          real: AccountId32 | string | Uint8Array,
          forceProxyType:
            | Option<CommonRuntimeProxyType>
            | null
            | Uint8Array
            | CommonRuntimeProxyType
            | "Any"
            | "CancelProxy"
            | "Governance"
            | "Exchange"
            | "Transfer"
            | number,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Option<CommonRuntimeProxyType>, Call]
      >
      /**
       * Dispatch the given `call` from an account that the sender is authorized for through
       * `add_proxy`.
       *
       * Removes any corresponding announcement(s).
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Parameters:
       * - `real`: The account that the proxy will make a call on behalf of.
       * - `force_proxy_type`: Specify the exact proxy type to be used and checked for this call.
       * - `call`: The call to be made by the `real` account.
       *
       * # <weight>
       * Weight is a function of:
       * - A: the number of announcements made.
       * - P: the number of proxies the user has.
       * # </weight>
       **/
      proxyAnnounced: AugmentedSubmittable<
        (
          delegate: AccountId32 | string | Uint8Array,
          real: AccountId32 | string | Uint8Array,
          forceProxyType:
            | Option<CommonRuntimeProxyType>
            | null
            | Uint8Array
            | CommonRuntimeProxyType
            | "Any"
            | "CancelProxy"
            | "Governance"
            | "Exchange"
            | "Transfer"
            | number,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, AccountId32, Option<CommonRuntimeProxyType>, Call]
      >
      /**
       * Remove the given announcement of a delegate.
       *
       * May be called by a target (proxied) account to remove a call that one of their delegates
       * (`delegate`) has announced they want to execute. The deposit is returned.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Parameters:
       * - `delegate`: The account that previously announced the call.
       * - `call_hash`: The hash of the call to be made.
       *
       * # <weight>
       * Weight is a function of:
       * - A: the number of announcements made.
       * - P: the number of proxies the user has.
       * # </weight>
       **/
      rejectAnnouncement: AugmentedSubmittable<
        (
          delegate: AccountId32 | string | Uint8Array,
          callHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, H256]
      >
      /**
       * Remove a given announcement.
       *
       * May be called by a proxy account to remove a call they previously announced and return
       * the deposit.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Parameters:
       * - `real`: The account that the proxy will make a call on behalf of.
       * - `call_hash`: The hash of the call to be made by the `real` account.
       *
       * # <weight>
       * Weight is a function of:
       * - A: the number of announcements made.
       * - P: the number of proxies the user has.
       * # </weight>
       **/
      removeAnnouncement: AugmentedSubmittable<
        (
          real: AccountId32 | string | Uint8Array,
          callHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, H256]
      >
      /**
       * Unregister all proxy accounts for the sender.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * WARNING: This may be called on accounts created by `anonymous`, however if done, then
       * the unreserved fees will be inaccessible. **All access to this account will be lost.**
       *
       * # <weight>
       * Weight is a function of the number of proxies the user has (P).
       * # </weight>
       **/
      removeProxies: AugmentedSubmittable<
        () => SubmittableExtrinsic<ApiType>,
        []
      >
      /**
       * Unregister a proxy account for the sender.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Parameters:
       * - `proxy`: The account that the `caller` would like to remove as a proxy.
       * - `proxy_type`: The permissions currently enabled for the removed proxy account.
       *
       * # <weight>
       * Weight is a function of the number of proxies the user has (P).
       * # </weight>
       **/
      removeProxy: AugmentedSubmittable<
        (
          delegate: AccountId32 | string | Uint8Array,
          proxyType:
            | CommonRuntimeProxyType
            | "Any"
            | "CancelProxy"
            | "Governance"
            | "Exchange"
            | "Transfer"
            | number
            | Uint8Array,
          delay: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, CommonRuntimeProxyType, u32]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    scheduler: {
      /**
       * Cancel an anonymously scheduled task.
       **/
      cancel: AugmentedSubmittable<
        (
          when: u32 | AnyNumber | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >
      /**
       * Cancel a named scheduled task.
       **/
      cancelNamed: AugmentedSubmittable<
        (id: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Anonymously schedule a task.
       **/
      schedule: AugmentedSubmittable<
        (
          when: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call:
            | FrameSupportScheduleMaybeHashed
            | { Value: any }
            | { Hash: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<ITuple<[u32, u32]>>, u8, FrameSupportScheduleMaybeHashed]
      >
      /**
       * Anonymously schedule a task after a delay.
       *
       * # <weight>
       * Same as [`schedule`].
       * # </weight>
       **/
      scheduleAfter: AugmentedSubmittable<
        (
          after: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call:
            | FrameSupportScheduleMaybeHashed
            | { Value: any }
            | { Hash: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<ITuple<[u32, u32]>>, u8, FrameSupportScheduleMaybeHashed]
      >
      /**
       * Schedule a named task.
       **/
      scheduleNamed: AugmentedSubmittable<
        (
          id: Bytes | string | Uint8Array,
          when: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call:
            | FrameSupportScheduleMaybeHashed
            | { Value: any }
            | { Hash: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Bytes,
          u32,
          Option<ITuple<[u32, u32]>>,
          u8,
          FrameSupportScheduleMaybeHashed,
        ]
      >
      /**
       * Schedule a named task after a delay.
       *
       * # <weight>
       * Same as [`schedule_named`](Self::schedule_named).
       * # </weight>
       **/
      scheduleNamedAfter: AugmentedSubmittable<
        (
          id: Bytes | string | Uint8Array,
          after: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call:
            | FrameSupportScheduleMaybeHashed
            | { Value: any }
            | { Hash: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Bytes,
          u32,
          Option<ITuple<[u32, u32]>>,
          u8,
          FrameSupportScheduleMaybeHashed,
        ]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    session: {
      /**
       * Removes any session key(s) of the function caller.
       *
       * This doesn't take effect until the next session.
       *
       * The dispatch origin of this function must be Signed and the account must be either be
       * convertible to a validator ID using the chain's typical addressing system (this usually
       * means being a controller account) or directly convertible into a validator ID (which
       * usually means being a stash account).
       *
       * # <weight>
       * - Complexity: `O(1)` in number of key types. Actual cost depends on the number of length
       * of `T::Keys::key_ids()` which is fixed.
       * - DbReads: `T::ValidatorIdOf`, `NextKeys`, `origin account`
       * - DbWrites: `NextKeys`, `origin account`
       * - DbWrites per key id: `KeyOwner`
       * # </weight>
       **/
      purgeKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>
      /**
       * Sets the session key(s) of the function caller to `keys`.
       * Allows an account to set its session key prior to becoming a validator.
       * This doesn't take effect until the next session.
       *
       * The dispatch origin of this function must be signed.
       *
       * # <weight>
       * - Complexity: `O(1)`. Actual cost depends on the number of length of
       * `T::Keys::key_ids()` which is fixed.
       * - DbReads: `origin account`, `T::ValidatorIdOf`, `NextKeys`
       * - DbWrites: `origin account`, `NextKeys`
       * - DbReads per key id: `KeyOwner`
       * - DbWrites per key id: `KeyOwner`
       * # </weight>
       **/
      setKeys: AugmentedSubmittable<
        (
          keys:
            | BasiliskRuntimeOpaqueSessionKeys
            | { aura?: any }
            | string
            | Uint8Array,
          proof: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [BasiliskRuntimeOpaqueSessionKeys, Bytes]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    system: {
      /**
       * A dispatch that will fill the block weight up to the given ratio.
       **/
      fillBlock: AugmentedSubmittable<
        (
          ratio: Perbill | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Perbill]
      >
      /**
       * Kill all storage items with a key that starts with the given prefix.
       *
       * **NOTE:** We rely on the Root origin to provide us the number of subkeys under
       * the prefix we are removing to accurately calculate the weight of this function.
       **/
      killPrefix: AugmentedSubmittable<
        (
          prefix: Bytes | string | Uint8Array,
          subkeys: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, u32]
      >
      /**
       * Kill some items from storage.
       **/
      killStorage: AugmentedSubmittable<
        (
          keys: Vec<Bytes> | (Bytes | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Bytes>]
      >
      /**
       * Make some on-chain remark.
       *
       * # <weight>
       * - `O(1)`
       * # </weight>
       **/
      remark: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Make some on-chain remark and emit event.
       **/
      remarkWithEvent: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Set the new runtime code.
       *
       * # <weight>
       * - `O(C + S)` where `C` length of `code` and `S` complexity of `can_set_code`
       * - 1 call to `can_set_code`: `O(S)` (calls `sp_io::misc::runtime_version` which is
       * expensive).
       * - 1 storage write (codec `O(C)`).
       * - 1 digest item.
       * - 1 event.
       * The weight of this function is dependent on the runtime, but generally this is very
       * expensive. We will treat this as a full block.
       * # </weight>
       **/
      setCode: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Set the new runtime code without doing any checks of the given `code`.
       *
       * # <weight>
       * - `O(C)` where `C` length of `code`
       * - 1 storage write (codec `O(C)`).
       * - 1 digest item.
       * - 1 event.
       * The weight of this function is dependent on the runtime. We will treat this as a full
       * block. # </weight>
       **/
      setCodeWithoutChecks: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >
      /**
       * Set the number of pages in the WebAssembly environment's heap.
       **/
      setHeapPages: AugmentedSubmittable<
        (pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >
      /**
       * Set some items of storage.
       **/
      setStorage: AugmentedSubmittable<
        (
          items:
            | Vec<ITuple<[Bytes, Bytes]>>
            | [Bytes | string | Uint8Array, Bytes | string | Uint8Array][],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[Bytes, Bytes]>>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    technicalCommittee: {
      /**
       * Close a vote that is either approved, disapproved or whose voting period has ended.
       *
       * May be called by any signed account in order to finish voting and close the proposal.
       *
       * If called before the end of the voting period it will only close the vote if it is
       * has enough votes to be approved or disapproved.
       *
       * If called after the end of the voting period abstentions are counted as rejections
       * unless there is a prime member set and the prime member cast an approval.
       *
       * If the close operation completes successfully with disapproval, the transaction fee will
       * be waived. Otherwise execution of the approved operation will be charged to the caller.
       *
       * + `proposal_weight_bound`: The maximum amount of weight consumed by executing the closed
       * proposal.
       * + `length_bound`: The upper bound for the length of the proposal in storage. Checked via
       * `storage::read` so it is `size_of::<u32>() == 4` larger than the pure length.
       *
       * # <weight>
       * ## Weight
       * - `O(B + M + P1 + P2)` where:
       * - `B` is `proposal` size in bytes (length-fee-bounded)
       * - `M` is members-count (code- and governance-bounded)
       * - `P1` is the complexity of `proposal` preimage.
       * - `P2` is proposal-count (code-bounded)
       * - DB:
       * - 2 storage reads (`Members`: codec `O(M)`, `Prime`: codec `O(1)`)
       * - 3 mutations (`Voting`: codec `O(M)`, `ProposalOf`: codec `O(B)`, `Proposals`: codec
       * `O(P2)`)
       * - any mutations done while executing `proposal` (`P1`)
       * - up to 3 events
       * # </weight>
       **/
      close: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
          index: Compact<u32> | AnyNumber | Uint8Array,
          proposalWeightBound: Compact<u64> | AnyNumber | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>, Compact<u64>, Compact<u32>]
      >
      /**
       * Disapprove a proposal, close, and remove it from the system, regardless of its current
       * state.
       *
       * Must be called by the Root origin.
       *
       * Parameters:
       * * `proposal_hash`: The hash of the proposal that should be disapproved.
       *
       * # <weight>
       * Complexity: O(P) where P is the number of max proposals
       * DB Weight:
       * * Reads: Proposals
       * * Writes: Voting, Proposals, ProposalOf
       * # </weight>
       **/
      disapproveProposal: AugmentedSubmittable<
        (
          proposalHash: H256 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Dispatch a proposal from a member using the `Member` origin.
       *
       * Origin must be a member of the collective.
       *
       * # <weight>
       * ## Weight
       * - `O(M + P)` where `M` members-count (code-bounded) and `P` complexity of dispatching
       * `proposal`
       * - DB: 1 read (codec `O(M)`) + DB access of `proposal`
       * - 1 event
       * # </weight>
       **/
      execute: AugmentedSubmittable<
        (
          proposal: Call | IMethod | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Call, Compact<u32>]
      >
      /**
       * Add a new proposal to either be voted on or executed directly.
       *
       * Requires the sender to be member.
       *
       * `threshold` determines whether `proposal` is executed directly (`threshold < 2`)
       * or put up for voting.
       *
       * # <weight>
       * ## Weight
       * - `O(B + M + P1)` or `O(B + M + P2)` where:
       * - `B` is `proposal` size in bytes (length-fee-bounded)
       * - `M` is members-count (code- and governance-bounded)
       * - branching is influenced by `threshold` where:
       * - `P1` is proposal execution complexity (`threshold < 2`)
       * - `P2` is proposals-count (code-bounded) (`threshold >= 2`)
       * - DB:
       * - 1 storage read `is_member` (codec `O(M)`)
       * - 1 storage read `ProposalOf::contains_key` (codec `O(1)`)
       * - DB accesses influenced by `threshold`:
       * - EITHER storage accesses done by `proposal` (`threshold < 2`)
       * - OR proposal insertion (`threshold <= 2`)
       * - 1 storage mutation `Proposals` (codec `O(P2)`)
       * - 1 storage mutation `ProposalCount` (codec `O(1)`)
       * - 1 storage write `ProposalOf` (codec `O(B)`)
       * - 1 storage write `Voting` (codec `O(M)`)
       * - 1 event
       * # </weight>
       **/
      propose: AugmentedSubmittable<
        (
          threshold: Compact<u32> | AnyNumber | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          lengthBound: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>, Call, Compact<u32>]
      >
      /**
       * Set the collective's membership.
       *
       * - `new_members`: The new member list. Be nice to the chain and provide it sorted.
       * - `prime`: The prime member whose vote sets the default.
       * - `old_count`: The upper bound for the previous number of members in storage. Used for
       * weight estimation.
       *
       * Requires root origin.
       *
       * NOTE: Does not enforce the expected `MaxMembers` limit on the amount of members, but
       * the weight estimations rely on it to estimate dispatchable weight.
       *
       * # WARNING:
       *
       * The `pallet-collective` can also be managed by logic outside of the pallet through the
       * implementation of the trait [`ChangeMembers`].
       * Any call to `set_members` must be careful that the member set doesn't get out of sync
       * with other logic managing the member set.
       *
       * # <weight>
       * ## Weight
       * - `O(MP + N)` where:
       * - `M` old-members-count (code- and governance-bounded)
       * - `N` new-members-count (code- and governance-bounded)
       * - `P` proposals-count (code-bounded)
       * - DB:
       * - 1 storage mutation (codec `O(M)` read, `O(N)` write) for reading and writing the
       * members
       * - 1 storage read (codec `O(P)`) for reading the proposals
       * - `P` storage mutations (codec `O(M)`) for updating the votes for each proposal
       * - 1 storage write (codec `O(1)`) for deleting the old `prime` and setting the new one
       * # </weight>
       **/
      setMembers: AugmentedSubmittable<
        (
          newMembers: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
          prime: Option<AccountId32> | null | Uint8Array | AccountId32 | string,
          oldCount: u32 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>, Option<AccountId32>, u32]
      >
      /**
       * Add an aye or nay vote for the sender to the given proposal.
       *
       * Requires the sender to be a member.
       *
       * Transaction fees will be waived if the member is voting on any particular proposal
       * for the first time and the call is successful. Subsequent vote changes will charge a
       * fee.
       * # <weight>
       * ## Weight
       * - `O(M)` where `M` is members-count (code- and governance-bounded)
       * - DB:
       * - 1 storage read `Members` (codec `O(M)`)
       * - 1 storage mutation `Voting` (codec `O(M)`)
       * - 1 event
       * # </weight>
       **/
      vote: AugmentedSubmittable<
        (
          proposal: H256 | string | Uint8Array,
          index: Compact<u32> | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u32>, bool]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    timestamp: {
      /**
       * Set the current time.
       *
       * This call should be invoked exactly once per block. It will panic at the finalization
       * phase, if this call hasn't been invoked by that time.
       *
       * The timestamp should be greater than the previous one by the amount specified by
       * `MinimumPeriod`.
       *
       * The dispatch origin for this call must be `Inherent`.
       *
       * # <weight>
       * - `O(1)` (Note that implementations of `OnTimestampSet` must also be `O(1)`)
       * - 1 storage read and 1 storage mutation (codec `O(1)`). (because of `DidUpdate::take` in
       * `on_finalize`)
       * - 1 event handler `on_timestamp_set`. Must be `O(1)`.
       * # </weight>
       **/
      set: AugmentedSubmittable<
        (
          now: Compact<u64> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u64>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    tips: {
      /**
       * Close and payout a tip.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * The tip identified by `hash` must have finished its countdown period.
       *
       * - `hash`: The identity of the open tip for which a tip value is declared. This is formed
       * as the hash of the tuple of the original tip `reason` and the beneficiary account ID.
       *
       * # <weight>
       * - Complexity: `O(T)` where `T` is the number of tippers. decoding `Tipper` vec of length
       * `T`. `T` is charged as upper bound given by `ContainsLengthBound`. The actual cost
       * depends on the implementation of `T::Tippers`.
       * - DbReads: `Tips`, `Tippers`, `tip finder`
       * - DbWrites: `Reasons`, `Tips`, `Tippers`, `tip finder`
       * # </weight>
       **/
      closeTip: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Report something `reason` that deserves a tip and claim any eventual the finder's fee.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * Payment: `TipReportDepositBase` will be reserved from the origin account, as well as
       * `DataDepositPerByte` for each byte in `reason`.
       *
       * - `reason`: The reason for, or the thing that deserves, the tip; generally this will be
       * a UTF-8-encoded URL.
       * - `who`: The account which should be credited for the tip.
       *
       * Emits `NewTip` if successful.
       *
       * # <weight>
       * - Complexity: `O(R)` where `R` length of `reason`.
       * - encoding and hashing of 'reason'
       * - DbReads: `Reasons`, `Tips`
       * - DbWrites: `Reasons`, `Tips`
       * # </weight>
       **/
      reportAwesome: AugmentedSubmittable<
        (
          reason: Bytes | string | Uint8Array,
          who: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, AccountId32]
      >
      /**
       * Retract a prior tip-report from `report_awesome`, and cancel the process of tipping.
       *
       * If successful, the original deposit will be unreserved.
       *
       * The dispatch origin for this call must be _Signed_ and the tip identified by `hash`
       * must have been reported by the signing account through `report_awesome` (and not
       * through `tip_new`).
       *
       * - `hash`: The identity of the open tip for which a tip value is declared. This is formed
       * as the hash of the tuple of the original tip `reason` and the beneficiary account ID.
       *
       * Emits `TipRetracted` if successful.
       *
       * # <weight>
       * - Complexity: `O(1)`
       * - Depends on the length of `T::Hash` which is fixed.
       * - DbReads: `Tips`, `origin account`
       * - DbWrites: `Reasons`, `Tips`, `origin account`
       * # </weight>
       **/
      retractTip: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Remove and slash an already-open tip.
       *
       * May only be called from `T::RejectOrigin`.
       *
       * As a result, the finder is slashed and the deposits are lost.
       *
       * Emits `TipSlashed` if successful.
       *
       * # <weight>
       * `T` is charged as upper bound given by `ContainsLengthBound`.
       * The actual cost depends on the implementation of `T::Tippers`.
       * # </weight>
       **/
      slashTip: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >
      /**
       * Declare a tip value for an already-open tip.
       *
       * The dispatch origin for this call must be _Signed_ and the signing account must be a
       * member of the `Tippers` set.
       *
       * - `hash`: The identity of the open tip for which a tip value is declared. This is formed
       * as the hash of the tuple of the hash of the original tip `reason` and the beneficiary
       * account ID.
       * - `tip_value`: The amount of tip that the sender would like to give. The median tip
       * value of active tippers will be given to the `who`.
       *
       * Emits `TipClosing` if the threshold of tippers has been reached and the countdown period
       * has started.
       *
       * # <weight>
       * - Complexity: `O(T)` where `T` is the number of tippers. decoding `Tipper` vec of length
       * `T`, insert tip and check closing, `T` is charged as upper bound given by
       * `ContainsLengthBound`. The actual cost depends on the implementation of `T::Tippers`.
       *
       * Actually weight could be lower as it depends on how many tips are in `OpenTip` but it
       * is weighted as if almost full i.e of length `T-1`.
       * - DbReads: `Tippers`, `Tips`
       * - DbWrites: `Tips`
       * # </weight>
       **/
      tip: AugmentedSubmittable<
        (
          hash: H256 | string | Uint8Array,
          tipValue: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [H256, Compact<u128>]
      >
      /**
       * Give a tip for something new; no finder's fee will be taken.
       *
       * The dispatch origin for this call must be _Signed_ and the signing account must be a
       * member of the `Tippers` set.
       *
       * - `reason`: The reason for, or the thing that deserves, the tip; generally this will be
       * a UTF-8-encoded URL.
       * - `who`: The account which should be credited for the tip.
       * - `tip_value`: The amount of tip that the sender would like to give. The median tip
       * value of active tippers will be given to the `who`.
       *
       * Emits `NewTip` if successful.
       *
       * # <weight>
       * - Complexity: `O(R + T)` where `R` length of `reason`, `T` is the number of tippers.
       * - `O(T)`: decoding `Tipper` vec of length `T`. `T` is charged as upper bound given by
       * `ContainsLengthBound`. The actual cost depends on the implementation of
       * `T::Tippers`.
       * - `O(R)`: hashing and encoding of reason of length `R`
       * - DbReads: `Tippers`, `Reasons`
       * - DbWrites: `Reasons`, `Tips`
       * # </weight>
       **/
      tipNew: AugmentedSubmittable<
        (
          reason: Bytes | string | Uint8Array,
          who: AccountId32 | string | Uint8Array,
          tipValue: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, AccountId32, Compact<u128>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    tokens: {
      /**
       * Exactly as `transfer`, except the origin must be root and the source
       * account may be specified.
       *
       * The dispatch origin for this call must be _Root_.
       *
       * - `source`: The sender of the transfer.
       * - `dest`: The recipient of the transfer.
       * - `currency_id`: currency type.
       * - `amount`: free balance amount to tranfer.
       **/
      forceTransfer: AugmentedSubmittable<
        (
          source: AccountId32 | string | Uint8Array,
          dest: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, AccountId32, u32, Compact<u128>]
      >
      /**
       * Set the balances of a given account.
       *
       * This will alter `FreeBalance` and `ReservedBalance` in storage. it
       * will also decrease the total issuance of the system
       * (`TotalIssuance`). If the new free or reserved balance is below the
       * existential deposit, it will reap the `AccountInfo`.
       *
       * The dispatch origin for this call is `root`.
       **/
      setBalance: AugmentedSubmittable<
        (
          who: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          newFree: Compact<u128> | AnyNumber | Uint8Array,
          newReserved: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32, Compact<u128>, Compact<u128>]
      >
      /**
       * Transfer some liquid free balance to another account.
       *
       * `transfer` will set the `FreeBalance` of the sender and receiver.
       * It will decrease the total issuance of the system by the
       * `TransferFee`. If the sender's account is below the existential
       * deposit as a result of the transfer, the account will be reaped.
       *
       * The dispatch origin for this call must be `Signed` by the
       * transactor.
       *
       * - `dest`: The recipient of the transfer.
       * - `currency_id`: currency type.
       * - `amount`: free balance amount to tranfer.
       **/
      transfer: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32, Compact<u128>]
      >
      /**
       * Transfer all remaining balance to the given account.
       *
       * NOTE: This function only attempts to transfer _transferable_
       * balances. This means that any locked, reserved, or existential
       * deposits (when `keep_alive` is `true`), will not be transferred by
       * this function. To ensure that this function results in a killed
       * account, you might need to prepare the account by removing any
       * reference counters, storage deposits, etc...
       *
       * The dispatch origin for this call must be `Signed` by the
       * transactor.
       *
       * - `dest`: The recipient of the transfer.
       * - `currency_id`: currency type.
       * - `keep_alive`: A boolean to determine if the `transfer_all`
       * operation should send all of the funds the account has, causing
       * the sender account to be killed (false), or transfer everything
       * except at least the existential deposit, which will guarantee to
       * keep the sender account alive (true).
       **/
      transferAll: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          keepAlive: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32, bool]
      >
      /**
       * Same as the [`transfer`] call, but with a check that the transfer
       * will not kill the origin account.
       *
       * 99% of the time you want [`transfer`] instead.
       *
       * The dispatch origin for this call must be `Signed` by the
       * transactor.
       *
       * - `dest`: The recipient of the transfer.
       * - `currency_id`: currency type.
       * - `amount`: free balance amount to tranfer.
       **/
      transferKeepAlive: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u32, Compact<u128>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    transactionPause: {
      pauseTransaction: AugmentedSubmittable<
        (
          palletName: Bytes | string | Uint8Array,
          functionName: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes]
      >
      unpauseTransaction: AugmentedSubmittable<
        (
          palletName: Bytes | string | Uint8Array,
          functionName: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Bytes]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    treasury: {
      /**
       * Approve a proposal. At a later time, the proposal will be allocated to the beneficiary
       * and the original deposit will be returned.
       *
       * May only be called from `T::ApproveOrigin`.
       *
       * # <weight>
       * - Complexity: O(1).
       * - DbReads: `Proposals`, `Approvals`
       * - DbWrite: `Approvals`
       * # </weight>
       **/
      approveProposal: AugmentedSubmittable<
        (
          proposalId: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >
      /**
       * Put forward a suggestion for spending. A deposit proportional to the value
       * is reserved and slashed if the proposal is rejected. It is returned once the
       * proposal is awarded.
       *
       * # <weight>
       * - Complexity: O(1)
       * - DbReads: `ProposalCount`, `origin account`
       * - DbWrites: `ProposalCount`, `Proposals`, `origin account`
       * # </weight>
       **/
      proposeSpend: AugmentedSubmittable<
        (
          value: Compact<u128> | AnyNumber | Uint8Array,
          beneficiary: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, AccountId32]
      >
      /**
       * Reject a proposed spend. The original deposit will be slashed.
       *
       * May only be called from `T::RejectOrigin`.
       *
       * # <weight>
       * - Complexity: O(1)
       * - DbReads: `Proposals`, `rejected proposer account`
       * - DbWrites: `Proposals`, `rejected proposer account`
       * # </weight>
       **/
      rejectProposal: AugmentedSubmittable<
        (
          proposalId: Compact<u32> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u32>]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    uniques: {
      /**
       * Approve an instance to be transferred by a delegated third-party account.
       *
       * Origin must be Signed and must be the owner of the asset `instance`.
       *
       * - `class`: The class of the asset to be approved for delegated transfer.
       * - `instance`: The instance of the asset to be approved for delegated transfer.
       * - `delegate`: The account to delegate permission to transfer the asset.
       *
       * Emits `ApprovedTransfer` on success.
       *
       * Weight: `O(1)`
       **/
      approveTransfer: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
          delegate: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>, AccountId32]
      >
      /**
       * Destroy a single asset instance.
       *
       * Origin must be Signed and the sender should be the Admin of the asset `class`.
       *
       * - `class`: The class of the asset to be burned.
       * - `instance`: The instance of the asset to be burned.
       * - `check_owner`: If `Some` then the operation will fail with `WrongOwner` unless the
       * asset is owned by this value.
       *
       * Emits `Burned` with the actual amount burned.
       *
       * Weight: `O(1)`
       * Modes: `check_owner.is_some()`.
       **/
      burn: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
          checkOwner:
            | Option<AccountId32>
            | null
            | Uint8Array
            | AccountId32
            | string,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>, Option<AccountId32>]
      >
      /**
       * Cancel the prior approval for the transfer of an asset by a delegate.
       *
       * Origin must be either:
       * - the `Force` origin;
       * - `Signed` with the signer being the Admin of the asset `class`;
       * - `Signed` with the signer being the Owner of the asset `instance`;
       *
       * Arguments:
       * - `class`: The class of the asset of whose approval will be cancelled.
       * - `instance`: The instance of the asset of whose approval will be cancelled.
       * - `maybe_check_delegate`: If `Some` will ensure that the given account is the one to
       * which permission of transfer is delegated.
       *
       * Emits `ApprovalCancelled` on success.
       *
       * Weight: `O(1)`
       **/
      cancelApproval: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
          maybeCheckDelegate:
            | Option<AccountId32>
            | null
            | Uint8Array
            | AccountId32
            | string,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>, Option<AccountId32>]
      >
      /**
       * Clear an attribute for an asset class or instance.
       *
       * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
       * asset `class`.
       *
       * Any deposit is freed for the asset class owner.
       *
       * - `class`: The identifier of the asset class whose instance's metadata to clear.
       * - `maybe_instance`: The identifier of the asset instance whose metadata to clear.
       * - `key`: The key of the attribute.
       *
       * Emits `AttributeCleared`.
       *
       * Weight: `O(1)`
       **/
      clearAttribute: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          maybeInstance: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          key: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Option<u128>, Bytes]
      >
      /**
       * Clear the metadata for an asset class.
       *
       * Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
       * the asset `class`.
       *
       * Any deposit is freed for the asset class owner.
       *
       * - `class`: The identifier of the asset class whose metadata to clear.
       *
       * Emits `ClassMetadataCleared`.
       *
       * Weight: `O(1)`
       **/
      clearClassMetadata: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>]
      >
      /**
       * Clear the metadata for an asset instance.
       *
       * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
       * asset `instance`.
       *
       * Any deposit is freed for the asset class owner.
       *
       * - `class`: The identifier of the asset class whose instance's metadata to clear.
       * - `instance`: The identifier of the asset instance whose metadata to clear.
       *
       * Emits `MetadataCleared`.
       *
       * Weight: `O(1)`
       **/
      clearMetadata: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>]
      >
      /**
       * Issue a new class of non-fungible assets from a public origin.
       *
       * This new asset class has no assets initially and its owner is the origin.
       *
       * The origin must be Signed and the sender must have sufficient funds free.
       *
       * `AssetDeposit` funds of sender are reserved.
       *
       * Parameters:
       * - `class`: The identifier of the new asset class. This must not be currently in use.
       * - `admin`: The admin of this class of assets. The admin is the initial address of each
       * member of the asset class's admin team.
       *
       * Emits `Created` event when successful.
       *
       * Weight: `O(1)`
       **/
      create: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          admin: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, AccountId32]
      >
      /**
       * Destroy a class of fungible assets.
       *
       * The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
       * owner of the asset `class`.
       *
       * - `class`: The identifier of the asset class to be destroyed.
       * - `witness`: Information on the instances minted in the asset class. This must be
       * correct.
       *
       * Emits `Destroyed` event when successful.
       *
       * Weight: `O(n + m)` where:
       * - `n = witness.instances`
       * - `m = witness.instance_metadatas`
       * - `a = witness.attributes`
       **/
      destroy: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          witness:
            | PalletUniquesDestroyWitness
            | { instances?: any; instanceMetadatas?: any; attributes?: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, PalletUniquesDestroyWitness]
      >
      /**
       * Alter the attributes of a given asset.
       *
       * Origin must be `ForceOrigin`.
       *
       * - `class`: The identifier of the asset.
       * - `owner`: The new Owner of this asset.
       * - `issuer`: The new Issuer of this asset.
       * - `admin`: The new Admin of this asset.
       * - `freezer`: The new Freezer of this asset.
       * - `free_holding`: Whether a deposit is taken for holding an instance of this asset
       * class.
       * - `is_frozen`: Whether this asset class is frozen except for permissioned/admin
       * instructions.
       *
       * Emits `AssetStatusChanged` with the identity of the asset.
       *
       * Weight: `O(1)`
       **/
      forceAssetStatus: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          owner: AccountId32 | string | Uint8Array,
          issuer: AccountId32 | string | Uint8Array,
          admin: AccountId32 | string | Uint8Array,
          freezer: AccountId32 | string | Uint8Array,
          freeHolding: bool | boolean | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          Compact<u128>,
          AccountId32,
          AccountId32,
          AccountId32,
          AccountId32,
          bool,
          bool,
        ]
      >
      /**
       * Issue a new class of non-fungible assets from a privileged origin.
       *
       * This new asset class has no assets initially.
       *
       * The origin must conform to `ForceOrigin`.
       *
       * Unlike `create`, no funds are reserved.
       *
       * - `class`: The identifier of the new asset. This must not be currently in use.
       * - `owner`: The owner of this class of assets. The owner has full superuser permissions
       * over this asset, but may later change and configure the permissions using
       * `transfer_ownership` and `set_team`.
       *
       * Emits `ForceCreated` event when successful.
       *
       * Weight: `O(1)`
       **/
      forceCreate: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          owner: AccountId32 | string | Uint8Array,
          freeHolding: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, AccountId32, bool]
      >
      /**
       * Disallow further unprivileged transfer of an asset instance.
       *
       * Origin must be Signed and the sender should be the Freezer of the asset `class`.
       *
       * - `class`: The class of the asset to be frozen.
       * - `instance`: The instance of the asset to be frozen.
       *
       * Emits `Frozen`.
       *
       * Weight: `O(1)`
       **/
      freeze: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>]
      >
      /**
       * Disallow further unprivileged transfers for a whole asset class.
       *
       * Origin must be Signed and the sender should be the Freezer of the asset `class`.
       *
       * - `class`: The asset class to be frozen.
       *
       * Emits `ClassFrozen`.
       *
       * Weight: `O(1)`
       **/
      freezeClass: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>]
      >
      /**
       * Mint an asset instance of a particular class.
       *
       * The origin must be Signed and the sender must be the Issuer of the asset `class`.
       *
       * - `class`: The class of the asset to be minted.
       * - `instance`: The instance value of the asset to be minted.
       * - `beneficiary`: The initial owner of the minted asset.
       *
       * Emits `Issued` event when successful.
       *
       * Weight: `O(1)`
       **/
      mint: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
          owner: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>, AccountId32]
      >
      /**
       * Reevaluate the deposits on some assets.
       *
       * Origin must be Signed and the sender should be the Owner of the asset `class`.
       *
       * - `class`: The class of the asset to be frozen.
       * - `instances`: The instances of the asset class whose deposits will be reevaluated.
       *
       * NOTE: This exists as a best-effort function. Any asset instances which are unknown or
       * in the case that the owner account does not have reservable funds to pay for a
       * deposit increase are ignored. Generally the owner isn't going to call this on instances
       * whose existing deposit is less than the refreshed deposit as it would only cost them,
       * so it's of little consequence.
       *
       * It will still return an error in the case that the class is unknown of the signer is
       * not permitted to call it.
       *
       * Weight: `O(instances.len())`
       **/
      redeposit: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instances: Vec<u128> | (u128 | AnyNumber | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Vec<u128>]
      >
      /**
       * Set an attribute for an asset class or instance.
       *
       * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
       * asset `class`.
       *
       * If the origin is Signed, then funds of signer are reserved according to the formula:
       * `MetadataDepositBase + DepositPerByte * (key.len + value.len)` taking into
       * account any already reserved funds.
       *
       * - `class`: The identifier of the asset class whose instance's metadata to set.
       * - `maybe_instance`: The identifier of the asset instance whose metadata to set.
       * - `key`: The key of the attribute.
       * - `value`: The value to which to set the attribute.
       *
       * Emits `AttributeSet`.
       *
       * Weight: `O(1)`
       **/
      setAttribute: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          maybeInstance: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          key: Bytes | string | Uint8Array,
          value: Bytes | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Option<u128>, Bytes, Bytes]
      >
      /**
       * Set the metadata for an asset class.
       *
       * Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
       * the asset `class`.
       *
       * If the origin is `Signed`, then funds of signer are reserved according to the formula:
       * `MetadataDepositBase + DepositPerByte * data.len` taking into
       * account any already reserved funds.
       *
       * - `class`: The identifier of the asset whose metadata to update.
       * - `data`: The general information of this asset. Limited in length by `StringLimit`.
       * - `is_frozen`: Whether the metadata should be frozen against further changes.
       *
       * Emits `ClassMetadataSet`.
       *
       * Weight: `O(1)`
       **/
      setClassMetadata: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Bytes, bool]
      >
      /**
       * Set the metadata for an asset instance.
       *
       * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
       * asset `class`.
       *
       * If the origin is Signed, then funds of signer are reserved according to the formula:
       * `MetadataDepositBase + DepositPerByte * data.len` taking into
       * account any already reserved funds.
       *
       * - `class`: The identifier of the asset class whose instance's metadata to set.
       * - `instance`: The identifier of the asset instance whose metadata to set.
       * - `data`: The general information of this asset. Limited in length by `StringLimit`.
       * - `is_frozen`: Whether the metadata should be frozen against further changes.
       *
       * Emits `MetadataSet`.
       *
       * Weight: `O(1)`
       **/
      setMetadata: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array,
          isFrozen: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>, Bytes, bool]
      >
      /**
       * Change the Issuer, Admin and Freezer of an asset class.
       *
       * Origin must be Signed and the sender should be the Owner of the asset `class`.
       *
       * - `class`: The asset class whose team should be changed.
       * - `issuer`: The new Issuer of this asset class.
       * - `admin`: The new Admin of this asset class.
       * - `freezer`: The new Freezer of this asset class.
       *
       * Emits `TeamChanged`.
       *
       * Weight: `O(1)`
       **/
      setTeam: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          issuer: AccountId32 | string | Uint8Array,
          admin: AccountId32 | string | Uint8Array,
          freezer: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, AccountId32, AccountId32, AccountId32]
      >
      /**
       * Re-allow unprivileged transfer of an asset instance.
       *
       * Origin must be Signed and the sender should be the Freezer of the asset `class`.
       *
       * - `class`: The class of the asset to be thawed.
       * - `instance`: The instance of the asset to be thawed.
       *
       * Emits `Thawed`.
       *
       * Weight: `O(1)`
       **/
      thaw: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>]
      >
      /**
       * Re-allow unprivileged transfers for a whole asset class.
       *
       * Origin must be Signed and the sender should be the Admin of the asset `class`.
       *
       * - `class`: The class to be thawed.
       *
       * Emits `ClassThawed`.
       *
       * Weight: `O(1)`
       **/
      thawClass: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>]
      >
      /**
       * Move an asset from the sender account to another.
       *
       * Origin must be Signed and the signing account must be either:
       * - the Admin of the asset `class`;
       * - the Owner of the asset `instance`;
       * - the approved delegate for the asset `instance` (in this case, the approval is reset).
       *
       * Arguments:
       * - `class`: The class of the asset to be transferred.
       * - `instance`: The instance of the asset to be transferred.
       * - `dest`: The account to receive ownership of the asset.
       *
       * Emits `Transferred`.
       *
       * Weight: `O(1)`
       **/
      transfer: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          instance: Compact<u128> | AnyNumber | Uint8Array,
          dest: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u128>, AccountId32]
      >
      /**
       * Change the Owner of an asset class.
       *
       * Origin must be Signed and the sender should be the Owner of the asset `class`.
       *
       * - `class`: The asset class whose owner should be changed.
       * - `owner`: The new Owner of this asset class.
       *
       * Emits `OwnerChanged`.
       *
       * Weight: `O(1)`
       **/
      transferOwnership: AugmentedSubmittable<
        (
          clazz: Compact<u128> | AnyNumber | Uint8Array,
          owner: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, AccountId32]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    utility: {
      /**
       * Send a call through an indexed pseudonym of the sender.
       *
       * Filter from origin are passed along. The call will be dispatched with an origin which
       * use the same filter as the origin of this call.
       *
       * NOTE: If you need to ensure that any account-based filtering is not honored (i.e.
       * because you expect `proxy` to have been used prior in the call stack and you do not want
       * the call restrictions to apply to any sub-accounts), then use `as_multi_threshold_1`
       * in the Multisig pallet instead.
       *
       * NOTE: Prior to version *12, this was called `as_limited_sub`.
       *
       * The dispatch origin for this call must be _Signed_.
       **/
      asDerivative: AugmentedSubmittable<
        (
          index: u16 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u16, Call]
      >
      /**
       * Send a batch of dispatch calls.
       *
       * May be called from any origin.
       *
       * - `calls`: The calls to be dispatched from the same origin. The number of call must not
       * exceed the constant: `batched_calls_limit` (available in constant metadata).
       *
       * If origin is root then call are dispatch without checking origin filter. (This includes
       * bypassing `frame_system::Config::BaseCallFilter`).
       *
       * # <weight>
       * - Complexity: O(C) where C is the number of calls to be batched.
       * # </weight>
       *
       * This will return `Ok` in all circumstances. To determine the success of the batch, an
       * event is deposited. If a call failed and the batch was interrupted, then the
       * `BatchInterrupted` event is deposited, along with the number of successful calls made
       * and the error of the failed call. If all were successful, then the `BatchCompleted`
       * event is deposited.
       **/
      batch: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >
      /**
       * Send a batch of dispatch calls and atomically execute them.
       * The whole transaction will rollback and fail if any of the calls failed.
       *
       * May be called from any origin.
       *
       * - `calls`: The calls to be dispatched from the same origin. The number of call must not
       * exceed the constant: `batched_calls_limit` (available in constant metadata).
       *
       * If origin is root then call are dispatch without checking origin filter. (This includes
       * bypassing `frame_system::Config::BaseCallFilter`).
       *
       * # <weight>
       * - Complexity: O(C) where C is the number of calls to be batched.
       * # </weight>
       **/
      batchAll: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[],
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >
      /**
       * Dispatches a function call with a provided origin.
       *
       * The dispatch origin for this call must be _Root_.
       *
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB write (event).
       * - Weight of derivative `call` execution + T::WeightInfo::dispatch_as().
       * # </weight>
       **/
      dispatchAs: AugmentedSubmittable<
        (
          asOrigin:
            | BasiliskRuntimeOriginCaller
            | { system: any }
            | { Void: any }
            | { Council: any }
            | { TechnicalCommittee: any }
            | { PolkadotXcm: any }
            | { CumulusXcm: any }
            | string
            | Uint8Array,
          call: Call | IMethod | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [BasiliskRuntimeOriginCaller, Call]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    vesting: {
      claim: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>
      claimFor: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >
      updateVestingSchedules: AugmentedSubmittable<
        (
          who: AccountId32 | string | Uint8Array,
          vestingSchedules:
            | Vec<OrmlVestingVestingSchedule>
            | (
                | OrmlVestingVestingSchedule
                | {
                    start?: any
                    period?: any
                    periodCount?: any
                    perPeriod?: any
                  }
                | string
                | Uint8Array
              )[],
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Vec<OrmlVestingVestingSchedule>]
      >
      vestedTransfer: AugmentedSubmittable<
        (
          dest: AccountId32 | string | Uint8Array,
          schedule:
            | OrmlVestingVestingSchedule
            | { start?: any; period?: any; periodCount?: any; perPeriod?: any }
            | string
            | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, OrmlVestingVestingSchedule]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    xTokens: {
      /**
       * Transfer native currencies.
       *
       * `dest_weight` is the weight for XCM execution on the dest chain, and
       * it would be charged from the transferred assets. If set below
       * requirements, the execution may fail and assets wouldn't be
       * received.
       *
       * It's a no-op if any error on local XCM execution or message sending.
       * Note sending assets out per se doesn't guarantee they would be
       * received. Receiving depends on if the XCM message could be delivered
       * by the network, and if the receiving chain would handle
       * messages correctly.
       **/
      transfer: AugmentedSubmittable<
        (
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          destWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u128, XcmVersionedMultiLocation, u64]
      >
      /**
       * Transfer `MultiAsset`.
       *
       * `dest_weight` is the weight for XCM execution on the dest chain, and
       * it would be charged from the transferred assets. If set below
       * requirements, the execution may fail and assets wouldn't be
       * received.
       *
       * It's a no-op if any error on local XCM execution or message sending.
       * Note sending assets out per se doesn't guarantee they would be
       * received. Receiving depends on if the XCM message could be delivered
       * by the network, and if the receiving chain would handle
       * messages correctly.
       **/
      transferMultiasset: AugmentedSubmittable<
        (
          asset:
            | XcmVersionedMultiAsset
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          destWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedMultiAsset, XcmVersionedMultiLocation, u64]
      >
      /**
       * Transfer several `MultiAsset` specifying the item to be used as fee
       *
       * `dest_weight` is the weight for XCM execution on the dest chain, and
       * it would be charged from the transferred assets. If set below
       * requirements, the execution may fail and assets wouldn't be
       * received.
       *
       * `fee_item` is index of the MultiAssets that we want to use for
       * payment
       *
       * It's a no-op if any error on local XCM execution or message sending.
       * Note sending assets out per se doesn't guarantee they would be
       * received. Receiving depends on if the XCM message could be delivered
       * by the network, and if the receiving chain would handle
       * messages correctly.
       **/
      transferMultiassets: AugmentedSubmittable<
        (
          assets:
            | XcmVersionedMultiAssets
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          feeItem: u32 | AnyNumber | Uint8Array,
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          destWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [XcmVersionedMultiAssets, u32, XcmVersionedMultiLocation, u64]
      >
      /**
       * Transfer `MultiAsset` specifying the fee and amount as separate.
       *
       * `dest_weight` is the weight for XCM execution on the dest chain, and
       * it would be charged from the transferred assets. If set below
       * requirements, the execution may fail and assets wouldn't be
       * received.
       *
       * `fee` is the multiasset to be spent to pay for execution in
       * destination chain. Both fee and amount will be subtracted form the
       * callers balance For now we only accept fee and asset having the same
       * `MultiLocation` id.
       *
       * If `fee` is not high enough to cover for the execution costs in the
       * destination chain, then the assets will be trapped in the
       * destination chain
       *
       * It's a no-op if any error on local XCM execution or message sending.
       * Note sending assets out per se doesn't guarantee they would be
       * received. Receiving depends on if the XCM message could be delivered
       * by the network, and if the receiving chain would handle
       * messages correctly.
       **/
      transferMultiassetWithFee: AugmentedSubmittable<
        (
          asset:
            | XcmVersionedMultiAsset
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          fee:
            | XcmVersionedMultiAsset
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          destWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [
          XcmVersionedMultiAsset,
          XcmVersionedMultiAsset,
          XcmVersionedMultiLocation,
          u64,
        ]
      >
      /**
       * Transfer several currencies specifying the item to be used as fee
       *
       * `dest_weight` is the weight for XCM execution on the dest chain, and
       * it would be charged from the transferred assets. If set below
       * requirements, the execution may fail and assets wouldn't be
       * received.
       *
       * `fee_item` is index of the currencies tuple that we want to use for
       * payment
       *
       * It's a no-op if any error on local XCM execution or message sending.
       * Note sending assets out per se doesn't guarantee they would be
       * received. Receiving depends on if the XCM message could be delivered
       * by the network, and if the receiving chain would handle
       * messages correctly.
       **/
      transferMulticurrencies: AugmentedSubmittable<
        (
          currencies:
            | Vec<ITuple<[u32, u128]>>
            | [u32 | AnyNumber | Uint8Array, u128 | AnyNumber | Uint8Array][],
          feeItem: u32 | AnyNumber | Uint8Array,
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          destWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[u32, u128]>>, u32, XcmVersionedMultiLocation, u64]
      >
      /**
       * Transfer native currencies specifying the fee and amount as
       * separate.
       *
       * `dest_weight` is the weight for XCM execution on the dest chain, and
       * it would be charged from the transferred assets. If set below
       * requirements, the execution may fail and assets wouldn't be
       * received.
       *
       * `fee` is the amount to be spent to pay for execution in destination
       * chain. Both fee and amount will be subtracted form the callers
       * balance.
       *
       * If `fee` is not high enough to cover for the execution costs in the
       * destination chain, then the assets will be trapped in the
       * destination chain
       *
       * It's a no-op if any error on local XCM execution or message sending.
       * Note sending assets out per se doesn't guarantee they would be
       * received. Receiving depends on if the XCM message could be delivered
       * by the network, and if the receiving chain would handle
       * messages correctly.
       **/
      transferWithFee: AugmentedSubmittable<
        (
          currencyId: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          fee: u128 | AnyNumber | Uint8Array,
          dest:
            | XcmVersionedMultiLocation
            | { V0: any }
            | { V1: any }
            | string
            | Uint8Array,
          destWeight: u64 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u128, u128, XcmVersionedMultiLocation, u64]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
    xyk: {
      /**
       * Add liquidity to previously created asset pair pool.
       *
       * Shares are issued with current price.
       *
       * Emits `LiquidityAdded` event when successful.
       **/
      addLiquidity: AugmentedSubmittable<
        (
          assetA: u32 | AnyNumber | Uint8Array,
          assetB: u32 | AnyNumber | Uint8Array,
          amountA: u128 | AnyNumber | Uint8Array,
          amountBMaxLimit: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128]
      >
      /**
       * Trade asset in for asset out.
       *
       * Executes a swap of `asset_in` for `asset_out`. Price is determined by the liquidity pool.
       *
       * `max_limit` - maximum amount of `asset_in` to be sold in exchange for `asset_out`.
       *
       * Emits `BuyExecuted` when successful.
       **/
      buy: AugmentedSubmittable<
        (
          assetOut: u32 | AnyNumber | Uint8Array,
          assetIn: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          maxLimit: u128 | AnyNumber | Uint8Array,
          discount: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128, bool]
      >
      /**
       * Create new pool for given asset pair.
       *
       * Registers new pool for given asset pair (`asset a` and `asset b`) in asset registry.
       * Asset registry creates new id or returns previously created one if such pool existed before.
       *
       * Pool is created with initial liquidity provided by `origin`.
       * Shares are issued with specified initial price and represents proportion of asset in the pool.
       *
       * Emits `PoolCreated` event when successful.
       **/
      createPool: AugmentedSubmittable<
        (
          assetA: u32 | AnyNumber | Uint8Array,
          assetB: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          initialPrice: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128]
      >
      /**
       * Remove liquidity from specific liquidity pool in the form of burning shares.
       *
       * If liquidity in the pool reaches 0, it is destroyed.
       *
       * Emits 'LiquidityRemoved' when successful.
       * Emits 'PoolDestroyed' when pool is destroyed.
       **/
      removeLiquidity: AugmentedSubmittable<
        (
          assetA: u32 | AnyNumber | Uint8Array,
          assetB: u32 | AnyNumber | Uint8Array,
          liquidityAmount: u128 | AnyNumber | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128]
      >
      /**
       * Trade asset in for asset out.
       *
       * Executes a swap of `asset_in` for `asset_out`. Price is determined by the liquidity pool.
       *
       * `max_limit` - minimum amount of `asset_out` / amount of asset_out to be obtained from the pool in exchange for `asset_in`.
       *
       * Emits `SellExecuted` when successful.
       **/
      sell: AugmentedSubmittable<
        (
          assetIn: u32 | AnyNumber | Uint8Array,
          assetOut: u32 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          maxLimit: u128 | AnyNumber | Uint8Array,
          discount: bool | boolean | Uint8Array,
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32, u128, u128, bool]
      >
      /**
       * Generic tx
       **/
      [key: string]: SubmittableExtrinsicFunction<ApiType>
    }
  } // AugmentedSubmittables
} // declare module
