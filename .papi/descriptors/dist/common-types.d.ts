import { Enum, GetEnum, FixedSizeBinary, Binary, SS58String, FixedSizeArray, ResultPayload, TxCallData } from "polkadot-api";
type AnonymousEnum<T extends {}> = T & {
    __anonymous: true;
};
type MyTuple<T> = [T, ...T[]];
type SeparateUndefined<T> = undefined extends T ? undefined | Exclude<T, undefined> : T;
type Anonymize<T> = SeparateUndefined<T extends FixedSizeBinary<infer L> ? number extends L ? Binary : FixedSizeBinary<L> : T extends string | number | bigint | boolean | void | undefined | null | symbol | Uint8Array | Enum<any> ? T : T extends AnonymousEnum<infer V> ? Enum<V> : T extends MyTuple<any> ? {
    [K in keyof T]: T[K];
} : T extends [] ? [] : T extends FixedSizeArray<infer L, infer T> ? number extends L ? Array<T> : FixedSizeArray<L, T> : {
    [K in keyof T & string]: T[K];
}>;
export type I5sesotjlssv2d = {
    "nonce": number;
    "consumers": number;
    "providers": number;
    "sufficients": number;
    "data": Anonymize<I1q8tnt1cluu5j>;
};
export type I1q8tnt1cluu5j = {
    "free": bigint;
    "reserved": bigint;
    "frozen": bigint;
    "flags": bigint;
};
export type Iffmde3ekjedi9 = {
    "normal": Anonymize<I4q39t5hn830vp>;
    "operational": Anonymize<I4q39t5hn830vp>;
    "mandatory": Anonymize<I4q39t5hn830vp>;
};
export type I4q39t5hn830vp = {
    "ref_time": bigint;
    "proof_size": bigint;
};
export type I4mddgoa69c0a2 = Array<DigestItem>;
export type DigestItem = Enum<{
    "PreRuntime": Anonymize<I82jm9g7pufuel>;
    "Consensus": Anonymize<I82jm9g7pufuel>;
    "Seal": Anonymize<I82jm9g7pufuel>;
    "Other": Binary;
    "RuntimeEnvironmentUpdated": undefined;
}>;
export declare const DigestItem: GetEnum<DigestItem>;
export type I82jm9g7pufuel = [FixedSizeBinary<4>, Binary];
export type I337ai2btcivaq = Array<Anonymize<I11cj6t2vcmlfq>>;
export type I11cj6t2vcmlfq = {
    "phase": Phase;
    "event": Anonymize<I668na8k863p14>;
    "topics": Anonymize<Ic5m5lp1oioo8r>;
};
export type Phase = Enum<{
    "ApplyExtrinsic": number;
    "Finalization": undefined;
    "Initialization": undefined;
}>;
export declare const Phase: GetEnum<Phase>;
export type I668na8k863p14 = AnonymousEnum<{
    "System": Anonymize<I2t5vkq7dgaeal>;
    "ParachainSystem": Anonymize<Icbsekf57miplo>;
    "Balances": Anonymize<Iao8h4hv7atnq3>;
    "TransactionPayment": TransactionPaymentEvent;
    "AssetTxPayment": Anonymize<Ifagg2q2o5fgjl>;
    "Vesting": VestingEvent;
    "CollatorSelection": Anonymize<I4srakrmf0fspo>;
    "Session": SessionEvent;
    "XcmpQueue": Anonymize<Idsqc7mhp6nnle>;
    "PolkadotXcm": Anonymize<I5ce1ru810vv9d>;
    "CumulusXcm": Anonymize<Ibvp9t1gqae5ct>;
    "MessageQueue": Anonymize<I2kosejppk3jon>;
    "Utility": Anonymize<I45vovbl28u5ob>;
    "Multisig": Anonymize<Icjl5oqk1eo6sb>;
    "Proxy": Anonymize<I8qme4qa965a0r>;
    "Assets": Anonymize<I6avancvg8fd05>;
    "Uniques": Anonymize<Ia0j71vjrjqu9p>;
    "Nfts": Anonymize<I6qicn8jn4fftj>;
    "ForeignAssets": Anonymize<I81i2fkdo6nple>;
    "PoolAssets": Anonymize<I6avancvg8fd05>;
    "AssetConversion": Anonymize<I31lqq0fjfmnfv>;
}>;
export type I2t5vkq7dgaeal = AnonymousEnum<{
    /**
     *An extrinsic completed successfully.
     */
    "ExtrinsicSuccess": Anonymize<Ia82mnkmeo2rhc>;
    /**
     *An extrinsic failed.
     */
    "ExtrinsicFailed": Anonymize<Iane057r2vqar>;
    /**
     *`:code` was updated.
     */
    "CodeUpdated": undefined;
    /**
     *A new account was created.
     */
    "NewAccount": Anonymize<Icbccs0ug47ilf>;
    /**
     *An account was reaped.
     */
    "KilledAccount": Anonymize<Icbccs0ug47ilf>;
    /**
     *On on-chain remark happened.
     */
    "Remarked": Anonymize<I855j4i3kr8ko1>;
    /**
     *An upgrade was authorized.
     */
    "UpgradeAuthorized": Anonymize<Ibgl04rn6nbfm6>;
}>;
export type Ia82mnkmeo2rhc = {
    "dispatch_info": Anonymize<Ic9s8f85vjtncc>;
};
export type Ic9s8f85vjtncc = {
    "weight": Anonymize<I4q39t5hn830vp>;
    "class": DispatchClass;
    "pays_fee": Anonymize<Iehg04bj71rkd>;
};
export type DispatchClass = Enum<{
    "Normal": undefined;
    "Operational": undefined;
    "Mandatory": undefined;
}>;
export declare const DispatchClass: GetEnum<DispatchClass>;
export type Iehg04bj71rkd = AnonymousEnum<{
    "Yes": undefined;
    "No": undefined;
}>;
export type Iane057r2vqar = {
    "dispatch_error": Anonymize<Icogrvf0inr18b>;
    "dispatch_info": Anonymize<Ic9s8f85vjtncc>;
};
export type Icogrvf0inr18b = AnonymousEnum<{
    "Other": undefined;
    "CannotLookup": undefined;
    "BadOrigin": undefined;
    "Module": Anonymize<Iasm4f970q7bf9>;
    "ConsumerRemaining": undefined;
    "NoProviders": undefined;
    "TooManyConsumers": undefined;
    "Token": TokenError;
    "Arithmetic": ArithmeticError;
    "Transactional": TransactionalError;
    "Exhausted": undefined;
    "Corruption": undefined;
    "Unavailable": undefined;
    "RootNotAllowed": undefined;
}>;
export type Iasm4f970q7bf9 = AnonymousEnum<{
    "System": Anonymize<I5o0s7c8q1cc9b>;
    "ParachainSystem": Anonymize<I9p95gln24a0rn>;
    "Timestamp": undefined;
    "ParachainInfo": undefined;
    "Balances": Anonymize<Idj13i7adlomht>;
    "TransactionPayment": undefined;
    "AssetTxPayment": undefined;
    "Vesting": Anonymize<Icof2acl69lq3c>;
    "Authorship": undefined;
    "CollatorSelection": Anonymize<I36bcffk2387dv>;
    "Session": Anonymize<I1e07dgbaqd1sq>;
    "Aura": undefined;
    "AuraExt": undefined;
    "XcmpQueue": Anonymize<Idnnbndsjjeqqs>;
    "PolkadotXcm": Anonymize<I87j95aq93d7dq>;
    "CumulusXcm": undefined;
    "ToKusamaXcmRouter": undefined;
    "MessageQueue": Anonymize<I5iupade5ag2dp>;
    "Utility": Anonymize<I8dt2g2hcrgh36>;
    "Multisig": Anonymize<Ia76qmhhg4jvb9>;
    "Proxy": Anonymize<Iuvt54ei4cehc>;
    "Assets": Anonymize<Iapedqb0veh71>;
    "Uniques": Anonymize<Ienq2ge2rhv4jm>;
    "Nfts": Anonymize<I58r1150kmj18u>;
    "ForeignAssets": Anonymize<Iapedqb0veh71>;
    "PoolAssets": Anonymize<Iapedqb0veh71>;
    "AssetConversion": Anonymize<I4u78hb23uhvi2>;
}>;
export type I5o0s7c8q1cc9b = AnonymousEnum<{
    /**
     *The name of specification does not match between the current runtime
     *and the new runtime.
     */
    "InvalidSpecName": undefined;
    /**
     *The specification version is not allowed to decrease between the current runtime
     *and the new runtime.
     */
    "SpecVersionNeedsToIncrease": undefined;
    /**
     *Failed to extract the runtime version from the new runtime.
     *
     *Either calling `Core_version` or decoding `RuntimeVersion` failed.
     */
    "FailedToExtractRuntimeVersion": undefined;
    /**
     *Suicide called when the account has non-default composite data.
     */
    "NonDefaultComposite": undefined;
    /**
     *There is a non-zero reference count preventing the account from being purged.
     */
    "NonZeroRefCount": undefined;
    /**
     *The origin filter prevent the call to be dispatched.
     */
    "CallFiltered": undefined;
    /**
     *A multi-block migration is ongoing and prevents the current code from being replaced.
     */
    "MultiBlockMigrationsOngoing": undefined;
    /**
     *No upgrade authorized.
     */
    "NothingAuthorized": undefined;
    /**
     *The submitted code is not authorized.
     */
    "Unauthorized": undefined;
}>;
export type I9p95gln24a0rn = AnonymousEnum<{
    /**
     *Attempt to upgrade validation function while existing upgrade pending.
     */
    "OverlappingUpgrades": undefined;
    /**
     *Polkadot currently prohibits this parachain from upgrading its validation function.
     */
    "ProhibitedByPolkadot": undefined;
    /**
     *The supplied validation function has compiled into a blob larger than Polkadot is
     *willing to run.
     */
    "TooBig": undefined;
    /**
     *The inherent which supplies the validation data did not run this block.
     */
    "ValidationDataNotAvailable": undefined;
    /**
     *The inherent which supplies the host configuration did not run this block.
     */
    "HostConfigurationNotAvailable": undefined;
    /**
     *No validation function upgrade is currently scheduled.
     */
    "NotScheduled": undefined;
    /**
     *No code upgrade has been authorized.
     */
    "NothingAuthorized": undefined;
    /**
     *The given code upgrade has not been authorized.
     */
    "Unauthorized": undefined;
}>;
export type Idj13i7adlomht = AnonymousEnum<{
    /**
     *Vesting balance too high to send value.
     */
    "VestingBalance": undefined;
    /**
     *Account liquidity restrictions prevent withdrawal.
     */
    "LiquidityRestrictions": undefined;
    /**
     *Balance too low to send value.
     */
    "InsufficientBalance": undefined;
    /**
     *Value too low to create account due to existential deposit.
     */
    "ExistentialDeposit": undefined;
    /**
     *Transfer/payment would kill account.
     */
    "Expendability": undefined;
    /**
     *A vesting schedule already exists for this account.
     */
    "ExistingVestingSchedule": undefined;
    /**
     *Beneficiary account must pre-exist.
     */
    "DeadAccount": undefined;
    /**
     *Number of named reserves exceed `MaxReserves`.
     */
    "TooManyReserves": undefined;
    /**
     *Number of holds exceed `VariantCountOf<T::RuntimeHoldReason>`.
     */
    "TooManyHolds": undefined;
    /**
     *Number of freezes exceed `MaxFreezes`.
     */
    "TooManyFreezes": undefined;
    /**
     *The issuance cannot be modified since it is already deactivated.
     */
    "IssuanceDeactivated": undefined;
    /**
     *The delta cannot be zero.
     */
    "DeltaZero": undefined;
}>;
export type Icof2acl69lq3c = AnonymousEnum<{
    /**
     *The account given is not vesting.
     */
    "NotVesting": undefined;
    /**
     *The account already has `MaxVestingSchedules` count of schedules and thus
     *cannot add another one. Consider merging existing schedules in order to add another.
     */
    "AtMaxVestingSchedules": undefined;
    /**
     *Amount being transferred is too low to create a vesting schedule.
     */
    "AmountLow": undefined;
    /**
     *An index was out of bounds of the vesting schedules.
     */
    "ScheduleIndexOutOfBounds": undefined;
    /**
     *Failed to create a new schedule because some parameter was invalid.
     */
    "InvalidScheduleParams": undefined;
}>;
export type I36bcffk2387dv = AnonymousEnum<{
    /**
     *The pallet has too many candidates.
     */
    "TooManyCandidates": undefined;
    /**
     *Leaving would result in too few candidates.
     */
    "TooFewEligibleCollators": undefined;
    /**
     *Account is already a candidate.
     */
    "AlreadyCandidate": undefined;
    /**
     *Account is not a candidate.
     */
    "NotCandidate": undefined;
    /**
     *There are too many Invulnerables.
     */
    "TooManyInvulnerables": undefined;
    /**
     *Account is already an Invulnerable.
     */
    "AlreadyInvulnerable": undefined;
    /**
     *Account is not an Invulnerable.
     */
    "NotInvulnerable": undefined;
    /**
     *Account has no associated validator ID.
     */
    "NoAssociatedValidatorId": undefined;
    /**
     *Validator ID is not yet registered.
     */
    "ValidatorNotRegistered": undefined;
    /**
     *Could not insert in the candidate list.
     */
    "InsertToCandidateListFailed": undefined;
    /**
     *Could not remove from the candidate list.
     */
    "RemoveFromCandidateListFailed": undefined;
    /**
     *New deposit amount would be below the minimum candidacy bond.
     */
    "DepositTooLow": undefined;
    /**
     *Could not update the candidate list.
     */
    "UpdateCandidateListFailed": undefined;
    /**
     *Deposit amount is too low to take the target's slot in the candidate list.
     */
    "InsufficientBond": undefined;
    /**
     *The target account to be replaced in the candidate list is not a candidate.
     */
    "TargetIsNotCandidate": undefined;
    /**
     *The updated deposit amount is equal to the amount already reserved.
     */
    "IdenticalDeposit": undefined;
    /**
     *Cannot lower candidacy bond while occupying a future collator slot in the list.
     */
    "InvalidUnreserve": undefined;
}>;
export type I1e07dgbaqd1sq = AnonymousEnum<{
    /**
     *Invalid ownership proof.
     */
    "InvalidProof": undefined;
    /**
     *No associated validator ID for account.
     */
    "NoAssociatedValidatorId": undefined;
    /**
     *Registered duplicate key.
     */
    "DuplicatedKey": undefined;
    /**
     *No keys are associated with this account.
     */
    "NoKeys": undefined;
    /**
     *Key setting account is not live, so it's impossible to associate keys.
     */
    "NoAccount": undefined;
}>;
export type Idnnbndsjjeqqs = AnonymousEnum<{
    /**
     *Setting the queue config failed since one of its values was invalid.
     */
    "BadQueueConfig": undefined;
    /**
     *The execution is already suspended.
     */
    "AlreadySuspended": undefined;
    /**
     *The execution is already resumed.
     */
    "AlreadyResumed": undefined;
    /**
     *There are too many active outbound channels.
     */
    "TooManyActiveOutboundChannels": undefined;
    /**
     *The message is too big.
     */
    "TooBig": undefined;
}>;
export type I87j95aq93d7dq = AnonymousEnum<{
    /**
     *The desired destination was unreachable, generally because there is a no way of routing
     *to it.
     */
    "Unreachable": undefined;
    /**
     *There was some other issue (i.e. not to do with routing) in sending the message.
     *Perhaps a lack of space for buffering the message.
     */
    "SendFailure": undefined;
    /**
     *The message execution fails the filter.
     */
    "Filtered": undefined;
    /**
     *The message's weight could not be determined.
     */
    "UnweighableMessage": undefined;
    /**
     *The destination `Location` provided cannot be inverted.
     */
    "DestinationNotInvertible": undefined;
    /**
     *The assets to be sent are empty.
     */
    "Empty": undefined;
    /**
     *Could not re-anchor the assets to declare the fees for the destination chain.
     */
    "CannotReanchor": undefined;
    /**
     *Too many assets have been attempted for transfer.
     */
    "TooManyAssets": undefined;
    /**
     *Origin is invalid for sending.
     */
    "InvalidOrigin": undefined;
    /**
     *The version of the `Versioned` value used is not able to be interpreted.
     */
    "BadVersion": undefined;
    /**
     *The given location could not be used (e.g. because it cannot be expressed in the
     *desired version of XCM).
     */
    "BadLocation": undefined;
    /**
     *The referenced subscription could not be found.
     */
    "NoSubscription": undefined;
    /**
     *The location is invalid since it already has a subscription from us.
     */
    "AlreadySubscribed": undefined;
    /**
     *Could not check-out the assets for teleportation to the destination chain.
     */
    "CannotCheckOutTeleport": undefined;
    /**
     *The owner does not own (all) of the asset that they wish to do the operation on.
     */
    "LowBalance": undefined;
    /**
     *The asset owner has too many locks on the asset.
     */
    "TooManyLocks": undefined;
    /**
     *The given account is not an identifiable sovereign account for any location.
     */
    "AccountNotSovereign": undefined;
    /**
     *The operation required fees to be paid which the initiator could not meet.
     */
    "FeesNotMet": undefined;
    /**
     *A remote lock with the corresponding data could not be found.
     */
    "LockNotFound": undefined;
    /**
     *The unlock operation cannot succeed because there are still consumers of the lock.
     */
    "InUse": undefined;
    /**
     *Invalid asset, reserve chain could not be determined for it.
     */
    "InvalidAssetUnknownReserve": undefined;
    /**
     *Invalid asset, do not support remote asset reserves with different fees reserves.
     */
    "InvalidAssetUnsupportedReserve": undefined;
    /**
     *Too many assets with different reserve locations have been attempted for transfer.
     */
    "TooManyReserves": undefined;
    /**
     *Local XCM execution incomplete.
     */
    "LocalExecutionIncomplete": undefined;
}>;
export type I5iupade5ag2dp = AnonymousEnum<{
    /**
     *Page is not reapable because it has items remaining to be processed and is not old
     *enough.
     */
    "NotReapable": undefined;
    /**
     *Page to be reaped does not exist.
     */
    "NoPage": undefined;
    /**
     *The referenced message could not be found.
     */
    "NoMessage": undefined;
    /**
     *The message was already processed and cannot be processed again.
     */
    "AlreadyProcessed": undefined;
    /**
     *The message is queued for future execution.
     */
    "Queued": undefined;
    /**
     *There is temporarily not enough weight to continue servicing messages.
     */
    "InsufficientWeight": undefined;
    /**
     *This message is temporarily unprocessable.
     *
     *Such errors are expected, but not guaranteed, to resolve themselves eventually through
     *retrying.
     */
    "TemporarilyUnprocessable": undefined;
    /**
     *The queue is paused and no message can be executed from it.
     *
     *This can change at any time and may resolve in the future by re-trying.
     */
    "QueuePaused": undefined;
    /**
     *Another call is in progress and needs to finish before this call can happen.
     */
    "RecursiveDisallowed": undefined;
}>;
export type I8dt2g2hcrgh36 = AnonymousEnum<{
    /**
     *Too many calls batched.
     */
    "TooManyCalls": undefined;
}>;
export type Ia76qmhhg4jvb9 = AnonymousEnum<{
    /**
     *Threshold must be 2 or greater.
     */
    "MinimumThreshold": undefined;
    /**
     *Call is already approved by this signatory.
     */
    "AlreadyApproved": undefined;
    /**
     *Call doesn't need any (more) approvals.
     */
    "NoApprovalsNeeded": undefined;
    /**
     *There are too few signatories in the list.
     */
    "TooFewSignatories": undefined;
    /**
     *There are too many signatories in the list.
     */
    "TooManySignatories": undefined;
    /**
     *The signatories were provided out of order; they should be ordered.
     */
    "SignatoriesOutOfOrder": undefined;
    /**
     *The sender was contained in the other signatories; it shouldn't be.
     */
    "SenderInSignatories": undefined;
    /**
     *Multisig operation not found when attempting to cancel.
     */
    "NotFound": undefined;
    /**
     *Only the account that originally created the multisig is able to cancel it.
     */
    "NotOwner": undefined;
    /**
     *No timepoint was given, yet the multisig operation is already underway.
     */
    "NoTimepoint": undefined;
    /**
     *A different timepoint was given to the multisig operation that is underway.
     */
    "WrongTimepoint": undefined;
    /**
     *A timepoint was given, yet no multisig operation is underway.
     */
    "UnexpectedTimepoint": undefined;
    /**
     *The maximum weight information provided was too low.
     */
    "MaxWeightTooLow": undefined;
    /**
     *The data to be stored is already stored.
     */
    "AlreadyStored": undefined;
}>;
export type Iuvt54ei4cehc = AnonymousEnum<{
    /**
     *There are too many proxies registered or too many announcements pending.
     */
    "TooMany": undefined;
    /**
     *Proxy registration not found.
     */
    "NotFound": undefined;
    /**
     *Sender is not a proxy of the account to be proxied.
     */
    "NotProxy": undefined;
    /**
     *A call which is incompatible with the proxy type's filter was attempted.
     */
    "Unproxyable": undefined;
    /**
     *Account is already a proxy.
     */
    "Duplicate": undefined;
    /**
     *Call may not be made by proxy because it may escalate its privileges.
     */
    "NoPermission": undefined;
    /**
     *Announcement, if made at all, was made too recently.
     */
    "Unannounced": undefined;
    /**
     *Cannot add self as proxy.
     */
    "NoSelfProxy": undefined;
}>;
export type Iapedqb0veh71 = AnonymousEnum<{
    /**
     *Account balance must be greater than or equal to the transfer amount.
     */
    "BalanceLow": undefined;
    /**
     *The account to alter does not exist.
     */
    "NoAccount": undefined;
    /**
     *The signing account has no permission to do the operation.
     */
    "NoPermission": undefined;
    /**
     *The given asset ID is unknown.
     */
    "Unknown": undefined;
    /**
     *The origin account is frozen.
     */
    "Frozen": undefined;
    /**
     *The asset ID is already taken.
     */
    "InUse": undefined;
    /**
     *Invalid witness data given.
     */
    "BadWitness": undefined;
    /**
     *Minimum balance should be non-zero.
     */
    "MinBalanceZero": undefined;
    /**
     *Unable to increment the consumer reference counters on the account. Either no provider
     *reference exists to allow a non-zero balance of a non-self-sufficient asset, or one
     *fewer then the maximum number of consumers has been reached.
     */
    "UnavailableConsumer": undefined;
    /**
     *Invalid metadata given.
     */
    "BadMetadata": undefined;
    /**
     *No approval exists that would allow the transfer.
     */
    "Unapproved": undefined;
    /**
     *The source account would not survive the transfer and it needs to stay alive.
     */
    "WouldDie": undefined;
    /**
     *The asset-account already exists.
     */
    "AlreadyExists": undefined;
    /**
     *The asset-account doesn't have an associated deposit.
     */
    "NoDeposit": undefined;
    /**
     *The operation would result in funds being burned.
     */
    "WouldBurn": undefined;
    /**
     *The asset is a live asset and is actively being used. Usually emit for operations such
     *as `start_destroy` which require the asset to be in a destroying state.
     */
    "LiveAsset": undefined;
    /**
     *The asset is not live, and likely being destroyed.
     */
    "AssetNotLive": undefined;
    /**
     *The asset status is not the expected status.
     */
    "IncorrectStatus": undefined;
    /**
     *The asset should be frozen before the given operation.
     */
    "NotFrozen": undefined;
    /**
     *Callback action resulted in error
     */
    "CallbackFailed": undefined;
    /**
     *The asset ID must be equal to the [`NextAssetId`].
     */
    "BadAssetId": undefined;
}>;
export type Ienq2ge2rhv4jm = AnonymousEnum<{
    /**
     *The signing account has no permission to do the operation.
     */
    "NoPermission": undefined;
    /**
     *The given item ID is unknown.
     */
    "UnknownCollection": undefined;
    /**
     *The item ID has already been used for an item.
     */
    "AlreadyExists": undefined;
    /**
     *The owner turned out to be different to what was expected.
     */
    "WrongOwner": undefined;
    /**
     *Invalid witness data given.
     */
    "BadWitness": undefined;
    /**
     *The item ID is already taken.
     */
    "InUse": undefined;
    /**
     *The item or collection is frozen.
     */
    "Frozen": undefined;
    /**
     *The delegate turned out to be different to what was expected.
     */
    "WrongDelegate": undefined;
    /**
     *There is no delegate approved.
     */
    "NoDelegate": undefined;
    /**
     *No approval exists that would allow the transfer.
     */
    "Unapproved": undefined;
    /**
     *The named owner has not signed ownership of the collection is acceptable.
     */
    "Unaccepted": undefined;
    /**
     *The item is locked.
     */
    "Locked": undefined;
    /**
     *All items have been minted.
     */
    "MaxSupplyReached": undefined;
    /**
     *The max supply has already been set.
     */
    "MaxSupplyAlreadySet": undefined;
    /**
     *The provided max supply is less to the amount of items a collection already has.
     */
    "MaxSupplyTooSmall": undefined;
    /**
     *The given item ID is unknown.
     */
    "UnknownItem": undefined;
    /**
     *Item is not for sale.
     */
    "NotForSale": undefined;
    /**
     *The provided bid is too low.
     */
    "BidTooLow": undefined;
}>;
export type I58r1150kmj18u = AnonymousEnum<{
    /**
     *The signing account has no permission to do the operation.
     */
    "NoPermission": undefined;
    /**
     *The given item ID is unknown.
     */
    "UnknownCollection": undefined;
    /**
     *The item ID has already been used for an item.
     */
    "AlreadyExists": undefined;
    /**
     *The approval had a deadline that expired, so the approval isn't valid anymore.
     */
    "ApprovalExpired": undefined;
    /**
     *The owner turned out to be different to what was expected.
     */
    "WrongOwner": undefined;
    /**
     *The witness data given does not match the current state of the chain.
     */
    "BadWitness": undefined;
    /**
     *Collection ID is already taken.
     */
    "CollectionIdInUse": undefined;
    /**
     *Items within that collection are non-transferable.
     */
    "ItemsNonTransferable": undefined;
    /**
     *The provided account is not a delegate.
     */
    "NotDelegate": undefined;
    /**
     *The delegate turned out to be different to what was expected.
     */
    "WrongDelegate": undefined;
    /**
     *No approval exists that would allow the transfer.
     */
    "Unapproved": undefined;
    /**
     *The named owner has not signed ownership acceptance of the collection.
     */
    "Unaccepted": undefined;
    /**
     *The item is locked (non-transferable).
     */
    "ItemLocked": undefined;
    /**
     *Item's attributes are locked.
     */
    "LockedItemAttributes": undefined;
    /**
     *Collection's attributes are locked.
     */
    "LockedCollectionAttributes": undefined;
    /**
     *Item's metadata is locked.
     */
    "LockedItemMetadata": undefined;
    /**
     *Collection's metadata is locked.
     */
    "LockedCollectionMetadata": undefined;
    /**
     *All items have been minted.
     */
    "MaxSupplyReached": undefined;
    /**
     *The max supply is locked and can't be changed.
     */
    "MaxSupplyLocked": undefined;
    /**
     *The provided max supply is less than the number of items a collection already has.
     */
    "MaxSupplyTooSmall": undefined;
    /**
     *The given item ID is unknown.
     */
    "UnknownItem": undefined;
    /**
     *Swap doesn't exist.
     */
    "UnknownSwap": undefined;
    /**
     *The given item has no metadata set.
     */
    "MetadataNotFound": undefined;
    /**
     *The provided attribute can't be found.
     */
    "AttributeNotFound": undefined;
    /**
     *Item is not for sale.
     */
    "NotForSale": undefined;
    /**
     *The provided bid is too low.
     */
    "BidTooLow": undefined;
    /**
     *The item has reached its approval limit.
     */
    "ReachedApprovalLimit": undefined;
    /**
     *The deadline has already expired.
     */
    "DeadlineExpired": undefined;
    /**
     *The duration provided should be less than or equal to `MaxDeadlineDuration`.
     */
    "WrongDuration": undefined;
    /**
     *The method is disabled by system settings.
     */
    "MethodDisabled": undefined;
    /**
     *The provided setting can't be set.
     */
    "WrongSetting": undefined;
    /**
     *Item's config already exists and should be equal to the provided one.
     */
    "InconsistentItemConfig": undefined;
    /**
     *Config for a collection or an item can't be found.
     */
    "NoConfig": undefined;
    /**
     *Some roles were not cleared.
     */
    "RolesNotCleared": undefined;
    /**
     *Mint has not started yet.
     */
    "MintNotStarted": undefined;
    /**
     *Mint has already ended.
     */
    "MintEnded": undefined;
    /**
     *The provided Item was already used for claiming.
     */
    "AlreadyClaimed": undefined;
    /**
     *The provided data is incorrect.
     */
    "IncorrectData": undefined;
    /**
     *The extrinsic was sent by the wrong origin.
     */
    "WrongOrigin": undefined;
    /**
     *The provided signature is incorrect.
     */
    "WrongSignature": undefined;
    /**
     *The provided metadata might be too long.
     */
    "IncorrectMetadata": undefined;
    /**
     *Can't set more attributes per one call.
     */
    "MaxAttributesLimitReached": undefined;
    /**
     *The provided namespace isn't supported in this call.
     */
    "WrongNamespace": undefined;
    /**
     *Can't delete non-empty collections.
     */
    "CollectionNotEmpty": undefined;
    /**
     *The witness data should be provided.
     */
    "WitnessRequired": undefined;
}>;
export type I4u78hb23uhvi2 = AnonymousEnum<{
    /**
     *Provided asset pair is not supported for pool.
     */
    "InvalidAssetPair": undefined;
    /**
     *Pool already exists.
     */
    "PoolExists": undefined;
    /**
     *Desired amount can't be zero.
     */
    "WrongDesiredAmount": undefined;
    /**
     *Provided amount should be greater than or equal to the existential deposit/asset's
     *minimal amount.
     */
    "AmountOneLessThanMinimal": undefined;
    /**
     *Provided amount should be greater than or equal to the existential deposit/asset's
     *minimal amount.
     */
    "AmountTwoLessThanMinimal": undefined;
    /**
     *Reserve needs to always be greater than or equal to the existential deposit/asset's
     *minimal amount.
     */
    "ReserveLeftLessThanMinimal": undefined;
    /**
     *Desired amount can't be equal to the pool reserve.
     */
    "AmountOutTooHigh": undefined;
    /**
     *The pool doesn't exist.
     */
    "PoolNotFound": undefined;
    /**
     *An overflow happened.
     */
    "Overflow": undefined;
    /**
     *The minimal amount requirement for the first token in the pair wasn't met.
     */
    "AssetOneDepositDidNotMeetMinimum": undefined;
    /**
     *The minimal amount requirement for the second token in the pair wasn't met.
     */
    "AssetTwoDepositDidNotMeetMinimum": undefined;
    /**
     *The minimal amount requirement for the first token in the pair wasn't met.
     */
    "AssetOneWithdrawalDidNotMeetMinimum": undefined;
    /**
     *The minimal amount requirement for the second token in the pair wasn't met.
     */
    "AssetTwoWithdrawalDidNotMeetMinimum": undefined;
    /**
     *Optimal calculated amount is less than desired.
     */
    "OptimalAmountLessThanDesired": undefined;
    /**
     *Insufficient liquidity minted.
     */
    "InsufficientLiquidityMinted": undefined;
    /**
     *Requested liquidity can't be zero.
     */
    "ZeroLiquidity": undefined;
    /**
     *Amount can't be zero.
     */
    "ZeroAmount": undefined;
    /**
     *Calculated amount out is less than provided minimum amount.
     */
    "ProvidedMinimumNotSufficientForSwap": undefined;
    /**
     *Provided maximum amount is not sufficient for swap.
     */
    "ProvidedMaximumNotSufficientForSwap": undefined;
    /**
     *The provided path must consists of 2 assets at least.
     */
    "InvalidPath": undefined;
    /**
     *The provided path must consists of unique assets.
     */
    "NonUniquePath": undefined;
    /**
     *It was not possible to get or increment the Id of the pool.
     */
    "IncorrectPoolAssetId": undefined;
    /**
     *The destination account cannot exist with the swapped funds.
     */
    "BelowMinimum": undefined;
}>;
export type TokenError = Enum<{
    "FundsUnavailable": undefined;
    "OnlyProvider": undefined;
    "BelowMinimum": undefined;
    "CannotCreate": undefined;
    "UnknownAsset": undefined;
    "Frozen": undefined;
    "Unsupported": undefined;
    "CannotCreateHold": undefined;
    "NotExpendable": undefined;
    "Blocked": undefined;
}>;
export declare const TokenError: GetEnum<TokenError>;
export type ArithmeticError = Enum<{
    "Underflow": undefined;
    "Overflow": undefined;
    "DivisionByZero": undefined;
}>;
export declare const ArithmeticError: GetEnum<ArithmeticError>;
export type TransactionalError = Enum<{
    "LimitReached": undefined;
    "NoLayer": undefined;
}>;
export declare const TransactionalError: GetEnum<TransactionalError>;
export type Icbccs0ug47ilf = {
    "account": SS58String;
};
export type I855j4i3kr8ko1 = {
    "sender": SS58String;
    "hash": FixedSizeBinary<32>;
};
export type Ibgl04rn6nbfm6 = {
    "code_hash": FixedSizeBinary<32>;
    "check_version": boolean;
};
export type Icbsekf57miplo = AnonymousEnum<{
    /**
     *The validation function has been scheduled to apply.
     */
    "ValidationFunctionStored": undefined;
    /**
     *The validation function was applied as of the contained relay chain block number.
     */
    "ValidationFunctionApplied": Anonymize<Idd7hd99u0ho0n>;
    /**
     *The relay-chain aborted the upgrade process.
     */
    "ValidationFunctionDiscarded": undefined;
    /**
     *Some downward messages have been received and will be processed.
     */
    "DownwardMessagesReceived": Anonymize<Iafscmv8tjf0ou>;
    /**
     *Downward messages were processed using the given weight.
     */
    "DownwardMessagesProcessed": Anonymize<I100l07kaehdlp>;
    /**
     *An upward message was sent to the relay chain.
     */
    "UpwardMessageSent": Anonymize<I6gnbnvip5vvdi>;
}>;
export type Idd7hd99u0ho0n = {
    "relay_chain_block_num": number;
};
export type Iafscmv8tjf0ou = {
    "count": number;
};
export type I100l07kaehdlp = {
    "weight_used": Anonymize<I4q39t5hn830vp>;
    "dmq_head": FixedSizeBinary<32>;
};
export type I6gnbnvip5vvdi = {
    "message_hash"?: Anonymize<I4s6vifaf8k998>;
};
export type I4s6vifaf8k998 = (FixedSizeBinary<32>) | undefined;
export type Iao8h4hv7atnq3 = AnonymousEnum<{
    /**
     *An account was created with some free balance.
     */
    "Endowed": Anonymize<Icv68aq8841478>;
    /**
     *An account was removed whose balance was non-zero but below ExistentialDeposit,
     *resulting in an outright loss.
     */
    "DustLost": Anonymize<Ic262ibdoec56a>;
    /**
     *Transfer succeeded.
     */
    "Transfer": Anonymize<Iflcfm9b6nlmdd>;
    /**
     *A balance was set by root.
     */
    "BalanceSet": Anonymize<Ijrsf4mnp3eka>;
    /**
     *Some balance was reserved (moved from free to reserved).
     */
    "Reserved": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some balance was unreserved (moved from reserved to free).
     */
    "Unreserved": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some balance was moved from the reserve of the first account to the second account.
     *Final argument indicates the destination balance type.
     */
    "ReserveRepatriated": Anonymize<I8tjvj9uq4b7hi>;
    /**
     *Some amount was deposited (e.g. for transaction fees).
     */
    "Deposit": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some amount was withdrawn from the account (e.g. for transaction fees).
     */
    "Withdraw": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some amount was removed from the account (e.g. for misbehavior).
     */
    "Slashed": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some amount was minted into an account.
     */
    "Minted": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some amount was burned from an account.
     */
    "Burned": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some amount was suspended from an account (it can be restored later).
     */
    "Suspended": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some amount was restored into an account.
     */
    "Restored": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *An account was upgraded.
     */
    "Upgraded": Anonymize<I4cbvqmqadhrea>;
    /**
     *Total issuance was increased by `amount`, creating a credit to be balanced.
     */
    "Issued": Anonymize<I3qt1hgg4djhgb>;
    /**
     *Total issuance was decreased by `amount`, creating a debt to be balanced.
     */
    "Rescinded": Anonymize<I3qt1hgg4djhgb>;
    /**
     *Some balance was locked.
     */
    "Locked": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some balance was unlocked.
     */
    "Unlocked": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some balance was frozen.
     */
    "Frozen": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *Some balance was thawed.
     */
    "Thawed": Anonymize<Id5fm4p8lj5qgi>;
    /**
     *The `TotalIssuance` was forcefully changed.
     */
    "TotalIssuanceForced": Anonymize<I4fooe9dun9o0t>;
}>;
export type Icv68aq8841478 = {
    "account": SS58String;
    "free_balance": bigint;
};
export type Ic262ibdoec56a = {
    "account": SS58String;
    "amount": bigint;
};
export type Iflcfm9b6nlmdd = {
    "from": SS58String;
    "to": SS58String;
    "amount": bigint;
};
export type Ijrsf4mnp3eka = {
    "who": SS58String;
    "free": bigint;
};
export type Id5fm4p8lj5qgi = {
    "who": SS58String;
    "amount": bigint;
};
export type I8tjvj9uq4b7hi = {
    "from": SS58String;
    "to": SS58String;
    "amount": bigint;
    "destination_status": BalanceStatus;
};
export type BalanceStatus = Enum<{
    "Free": undefined;
    "Reserved": undefined;
}>;
export declare const BalanceStatus: GetEnum<BalanceStatus>;
export type I4cbvqmqadhrea = {
    "who": SS58String;
};
export type I3qt1hgg4djhgb = {
    "amount": bigint;
};
export type I4fooe9dun9o0t = {
    "old": bigint;
    "new": bigint;
};
export type TransactionPaymentEvent = Enum<{
    /**
     *A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,
     *has been paid by `who`.
     */
    "TransactionFeePaid": Anonymize<Ier2cke86dqbr2>;
}>;
export declare const TransactionPaymentEvent: GetEnum<TransactionPaymentEvent>;
export type Ier2cke86dqbr2 = {
    "who": SS58String;
    "actual_fee": bigint;
    "tip": bigint;
};
export type Ifagg2q2o5fgjl = AnonymousEnum<{
    /**
     *A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,
     *has been paid by `who` in an asset `asset_id`.
     */
    "AssetTxFeePaid": Anonymize<Iqjk6s1a2lmkt>;
    /**
     *A swap of the refund in native currency back to asset failed.
     */
    "AssetRefundFailed": Anonymize<Icjchvrijclvlv>;
}>;
export type Iqjk6s1a2lmkt = {
    "who": SS58String;
    "actual_fee": bigint;
    "tip": bigint;
    "asset_id": Anonymize<I4c0s5cioidn76>;
};
export type I4c0s5cioidn76 = {
    "parents": number;
    "interior": XcmV3Junctions;
};
export type XcmV3Junctions = Enum<{
    "Here": undefined;
    "X1": XcmV3Junction;
    "X2": Anonymize<Iam58b36i8f27i>;
    "X3": Anonymize<Iegjh9cie771d8>;
    "X4": Anonymize<Iae5flu84s2oia>;
    "X5": Anonymize<Iejq8c4n82a165>;
    "X6": Anonymize<I7rmt803vbpqrl>;
    "X7": Anonymize<I7onfe2toh27f0>;
    "X8": Anonymize<I3vjadpg0k2omo>;
}>;
export declare const XcmV3Junctions: GetEnum<XcmV3Junctions>;
export type XcmV3Junction = Enum<{
    "Parachain": number;
    "AccountId32": Anonymize<Ifq0i8kc6ds30i>;
    "AccountIndex64": Anonymize<I2a3org9qntfkr>;
    "AccountKey20": Anonymize<I9ed2klpttaegt>;
    "PalletInstance": number;
    "GeneralIndex": bigint;
    "GeneralKey": Anonymize<I15lht6t53odo4>;
    "OnlyChild": undefined;
    "Plurality": Anonymize<I518fbtnclg1oc>;
    "GlobalConsensus": XcmV3JunctionNetworkId;
}>;
export declare const XcmV3Junction: GetEnum<XcmV3Junction>;
export type Ifq0i8kc6ds30i = {
    "network"?: Anonymize<Idcq3vns9tgp5p>;
    "id": FixedSizeBinary<32>;
};
export type Idcq3vns9tgp5p = (XcmV3JunctionNetworkId) | undefined;
export type XcmV3JunctionNetworkId = Enum<{
    "ByGenesis": FixedSizeBinary<32>;
    "ByFork": Anonymize<I15vf5oinmcgps>;
    "Polkadot": undefined;
    "Kusama": undefined;
    "Westend": undefined;
    "Rococo": undefined;
    "Wococo": undefined;
    "Ethereum": Anonymize<I623eo8t3jrbeo>;
    "BitcoinCore": undefined;
    "BitcoinCash": undefined;
    "PolkadotBulletin": undefined;
}>;
export declare const XcmV3JunctionNetworkId: GetEnum<XcmV3JunctionNetworkId>;
export type I15vf5oinmcgps = {
    "block_number": bigint;
    "block_hash": FixedSizeBinary<32>;
};
export type I623eo8t3jrbeo = {
    "chain_id": bigint;
};
export type I2a3org9qntfkr = {
    "network"?: Anonymize<Idcq3vns9tgp5p>;
    "index": bigint;
};
export type I9ed2klpttaegt = {
    "network"?: Anonymize<Idcq3vns9tgp5p>;
    "key": FixedSizeBinary<20>;
};
export type I15lht6t53odo4 = {
    "length": number;
    "data": FixedSizeBinary<32>;
};
export type I518fbtnclg1oc = {
    "id": XcmV3JunctionBodyId;
    "part": XcmV2JunctionBodyPart;
};
export type XcmV3JunctionBodyId = Enum<{
    "Unit": undefined;
    "Moniker": FixedSizeBinary<4>;
    "Index": number;
    "Executive": undefined;
    "Technical": undefined;
    "Legislative": undefined;
    "Judicial": undefined;
    "Defense": undefined;
    "Administration": undefined;
    "Treasury": undefined;
}>;
export declare const XcmV3JunctionBodyId: GetEnum<XcmV3JunctionBodyId>;
export type XcmV2JunctionBodyPart = Enum<{
    "Voice": undefined;
    "Members": Anonymize<Iafscmv8tjf0ou>;
    "Fraction": Anonymize<Idif02efq16j92>;
    "AtLeastProportion": Anonymize<Idif02efq16j92>;
    "MoreThanProportion": Anonymize<Idif02efq16j92>;
}>;
export declare const XcmV2JunctionBodyPart: GetEnum<XcmV2JunctionBodyPart>;
export type Idif02efq16j92 = {
    "nom": number;
    "denom": number;
};
export type Iam58b36i8f27i = FixedSizeArray<2, XcmV3Junction>;
export type Iegjh9cie771d8 = FixedSizeArray<3, XcmV3Junction>;
export type Iae5flu84s2oia = FixedSizeArray<4, XcmV3Junction>;
export type Iejq8c4n82a165 = FixedSizeArray<5, XcmV3Junction>;
export type I7rmt803vbpqrl = FixedSizeArray<6, XcmV3Junction>;
export type I7onfe2toh27f0 = FixedSizeArray<7, XcmV3Junction>;
export type I3vjadpg0k2omo = FixedSizeArray<8, XcmV3Junction>;
export type Icjchvrijclvlv = {
    "native_amount_kept": bigint;
};
export type VestingEvent = Enum<{
    /**
     *The amount vested has been updated. This could indicate a change in funds available.
     *The balance given is the amount which is left unvested (and thus locked).
     */
    "VestingUpdated": Anonymize<Ievr89968437gm>;
    /**
     *An \[account\] has become fully vested.
     */
    "VestingCompleted": Anonymize<Icbccs0ug47ilf>;
}>;
export declare const VestingEvent: GetEnum<VestingEvent>;
export type Ievr89968437gm = {
    "account": SS58String;
    "unvested": bigint;
};
export type I4srakrmf0fspo = AnonymousEnum<{
    /**
     *New Invulnerables were set.
     */
    "NewInvulnerables": Anonymize<I39t01nnod9109>;
    /**
     *A new Invulnerable was added.
     */
    "InvulnerableAdded": Anonymize<I6v8sm60vvkmk7>;
    /**
     *An Invulnerable was removed.
     */
    "InvulnerableRemoved": Anonymize<I6v8sm60vvkmk7>;
    /**
     *The number of desired candidates was set.
     */
    "NewDesiredCandidates": Anonymize<I1qmtmbe5so8r3>;
    /**
     *The candidacy bond was set.
     */
    "NewCandidacyBond": Anonymize<Ih99m6ehpcar7>;
    /**
     *A new candidate joined.
     */
    "CandidateAdded": Anonymize<Idgorhsbgdq2ap>;
    /**
     *Bond of a candidate updated.
     */
    "CandidateBondUpdated": Anonymize<Idgorhsbgdq2ap>;
    /**
     *A candidate was removed.
     */
    "CandidateRemoved": Anonymize<I6v8sm60vvkmk7>;
    /**
     *An account was replaced in the candidate list by another one.
     */
    "CandidateReplaced": Anonymize<I9ubb2kqevnu6t>;
    /**
     *An account was unable to be added to the Invulnerables because they did not have keys
     *registered. Other Invulnerables may have been set.
     */
    "InvalidInvulnerableSkipped": Anonymize<I6v8sm60vvkmk7>;
}>;
export type I39t01nnod9109 = {
    "invulnerables": Anonymize<Ia2lhg7l2hilo3>;
};
export type Ia2lhg7l2hilo3 = Array<SS58String>;
export type I6v8sm60vvkmk7 = {
    "account_id": SS58String;
};
export type I1qmtmbe5so8r3 = {
    "desired_candidates": number;
};
export type Ih99m6ehpcar7 = {
    "bond_amount": bigint;
};
export type Idgorhsbgdq2ap = {
    "account_id": SS58String;
    "deposit": bigint;
};
export type I9ubb2kqevnu6t = {
    "old": SS58String;
    "new": SS58String;
    "deposit": bigint;
};
export type SessionEvent = Enum<{
    /**
     *New session has happened. Note that the argument is the session index, not the
     *block number as the type might suggest.
     */
    "NewSession": Anonymize<I2hq50pu2kdjpo>;
}>;
export declare const SessionEvent: GetEnum<SessionEvent>;
export type I2hq50pu2kdjpo = {
    "session_index": number;
};
export type Idsqc7mhp6nnle = AnonymousEnum<{
    /**
     *An HRMP message was sent to a sibling parachain.
     */
    "XcmpMessageSent": Anonymize<I137t1cld92pod>;
}>;
export type I137t1cld92pod = {
    "message_hash": FixedSizeBinary<32>;
};
export type I5ce1ru810vv9d = AnonymousEnum<{
    /**
     *Execution of an XCM message was attempted.
     */
    "Attempted": Anonymize<I2aatv5i0cb96a>;
    /**
     *A XCM message was sent.
     */
    "Sent": Anonymize<Ib9msr5sr8t3dn>;
    /**
     *Query response received which does not match a registered query. This may be because a
     *matching query was never registered, it may be because it is a duplicate response, or
     *because the query timed out.
     */
    "UnexpectedResponse": Anonymize<I3le5tr7ugg6l2>;
    /**
     *Query response has been received and is ready for taking with `take_response`. There is
     *no registered notification call.
     */
    "ResponseReady": Anonymize<I3iun9sig164po>;
    /**
     *Query response has been received and query is removed. The registered notification has
     *been dispatched and executed successfully.
     */
    "Notified": Anonymize<I2uqmls7kcdnii>;
    /**
     *Query response has been received and query is removed. The registered notification
     *could not be dispatched because the dispatch weight is greater than the maximum weight
     *originally budgeted by this runtime for the query result.
     */
    "NotifyOverweight": Anonymize<Idg69klialbkb8>;
    /**
     *Query response has been received and query is removed. There was a general error with
     *dispatching the notification call.
     */
    "NotifyDispatchError": Anonymize<I2uqmls7kcdnii>;
    /**
     *Query response has been received and query is removed. The dispatch was unable to be
     *decoded into a `Call`; this might be due to dispatch function having a signature which
     *is not `(origin, QueryId, Response)`.
     */
    "NotifyDecodeFailed": Anonymize<I2uqmls7kcdnii>;
    /**
     *Expected query response has been received but the origin location of the response does
     *not match that expected. The query remains registered for a later, valid, response to
     *be received and acted upon.
     */
    "InvalidResponder": Anonymize<I13jboebjcbglr>;
    /**
     *Expected query response has been received but the expected origin location placed in
     *storage by this runtime previously cannot be decoded. The query remains registered.
     *
     *This is unexpected (since a location placed in storage in a previously executing
     *runtime should be readable prior to query timeout) and dangerous since the possibly
     *valid response will be dropped. Manual governance intervention is probably going to be
     *needed.
     */
    "InvalidResponderVersion": Anonymize<I3le5tr7ugg6l2>;
    /**
     *Received query response has been read and removed.
     */
    "ResponseTaken": Anonymize<I30pg328m00nr3>;
    /**
     *Some assets have been placed in an asset trap.
     */
    "AssetsTrapped": Anonymize<I381dkhrurdhrs>;
    /**
     *An XCM version change notification message has been attempted to be sent.
     *
     *The cost of sending it (borne by the chain) is included.
     */
    "VersionChangeNotified": Anonymize<Ic8hi3qr11vngc>;
    /**
     *The supported version of a location has been changed. This might be through an
     *automatic notification or a manual intervention.
     */
    "SupportedVersionChanged": Anonymize<Iabk8ljl5g8c86>;
    /**
     *A given location which had a version change subscription was dropped owing to an error
     *sending the notification to it.
     */
    "NotifyTargetSendFail": Anonymize<Ibjdlecumfu7q7>;
    /**
     *A given location which had a version change subscription was dropped owing to an error
     *migrating the location to our new XCM format.
     */
    "NotifyTargetMigrationFail": Anonymize<Ia9ems1kg7laoc>;
    /**
     *Expected query response has been received but the expected querier location placed in
     *storage by this runtime previously cannot be decoded. The query remains registered.
     *
     *This is unexpected (since a location placed in storage in a previously executing
     *runtime should be readable prior to query timeout) and dangerous since the possibly
     *valid response will be dropped. Manual governance intervention is probably going to be
     *needed.
     */
    "InvalidQuerierVersion": Anonymize<I3le5tr7ugg6l2>;
    /**
     *Expected query response has been received but the querier location of the response does
     *not match the expected. The query remains registered for a later, valid, response to
     *be received and acted upon.
     */
    "InvalidQuerier": Anonymize<I92fq0fa45vi3>;
    /**
     *A remote has requested XCM version change notification from us and we have honored it.
     *A version information message is sent to them and its cost is included.
     */
    "VersionNotifyStarted": Anonymize<Id01dpp0dn2cj0>;
    /**
     *We have requested that a remote chain send us XCM version change notifications.
     */
    "VersionNotifyRequested": Anonymize<Id01dpp0dn2cj0>;
    /**
     *We have requested that a remote chain stops sending us XCM version change
     *notifications.
     */
    "VersionNotifyUnrequested": Anonymize<Id01dpp0dn2cj0>;
    /**
     *Fees were paid from a location for an operation (often for using `SendXcm`).
     */
    "FeesPaid": Anonymize<I6nu8k62ck9o8o>;
    /**
     *Some assets have been claimed from an asset trap
     */
    "AssetsClaimed": Anonymize<I381dkhrurdhrs>;
    /**
     *A XCM version migration finished.
     */
    "VersionMigrationFinished": Anonymize<I6s1nbislhk619>;
}>;
export type I2aatv5i0cb96a = {
    "outcome": XcmV4TraitsOutcome;
};
export type XcmV4TraitsOutcome = Enum<{
    "Complete": Anonymize<I30iff2d192eu7>;
    "Incomplete": Anonymize<I3q41clmllcihh>;
    "Error": Anonymize<I1n56hooghntl2>;
}>;
export declare const XcmV4TraitsOutcome: GetEnum<XcmV4TraitsOutcome>;
export type I30iff2d192eu7 = {
    "used": Anonymize<I4q39t5hn830vp>;
};
export type I3q41clmllcihh = {
    "used": Anonymize<I4q39t5hn830vp>;
    "error": XcmV3TraitsError;
};
export type XcmV3TraitsError = Enum<{
    "Overflow": undefined;
    "Unimplemented": undefined;
    "UntrustedReserveLocation": undefined;
    "UntrustedTeleportLocation": undefined;
    "LocationFull": undefined;
    "LocationNotInvertible": undefined;
    "BadOrigin": undefined;
    "InvalidLocation": undefined;
    "AssetNotFound": undefined;
    "FailedToTransactAsset": undefined;
    "NotWithdrawable": undefined;
    "LocationCannotHold": undefined;
    "ExceedsMaxMessageSize": undefined;
    "DestinationUnsupported": undefined;
    "Transport": undefined;
    "Unroutable": undefined;
    "UnknownClaim": undefined;
    "FailedToDecode": undefined;
    "MaxWeightInvalid": undefined;
    "NotHoldingFees": undefined;
    "TooExpensive": undefined;
    "Trap": bigint;
    "ExpectationFalse": undefined;
    "PalletNotFound": undefined;
    "NameMismatch": undefined;
    "VersionIncompatible": undefined;
    "HoldingWouldOverflow": undefined;
    "ExportError": undefined;
    "ReanchorFailed": undefined;
    "NoDeal": undefined;
    "FeesNotMet": undefined;
    "LockError": undefined;
    "NoPermission": undefined;
    "Unanchored": undefined;
    "NotDepositable": undefined;
    "UnhandledXcmVersion": undefined;
    "WeightLimitReached": Anonymize<I4q39t5hn830vp>;
    "Barrier": undefined;
    "WeightNotComputable": undefined;
    "ExceedsStackLimit": undefined;
}>;
export declare const XcmV3TraitsError: GetEnum<XcmV3TraitsError>;
export type I1n56hooghntl2 = {
    "error": XcmV3TraitsError;
};
export type Ib9msr5sr8t3dn = {
    "origin": Anonymize<I4c0s5cioidn76>;
    "destination": Anonymize<I4c0s5cioidn76>;
    "message": Anonymize<Iegrepoo0c1jc5>;
    "message_id": FixedSizeBinary<32>;
};
export type Iegrepoo0c1jc5 = Array<XcmV4Instruction>;
export type XcmV4Instruction = Enum<{
    "WithdrawAsset": Anonymize<I50mli3hb64f9b>;
    "ReserveAssetDeposited": Anonymize<I50mli3hb64f9b>;
    "ReceiveTeleportedAsset": Anonymize<I50mli3hb64f9b>;
    "QueryResponse": Anonymize<I9o9uda3nddbna>;
    "TransferAsset": Anonymize<I7s0ar727m8n1j>;
    "TransferReserveAsset": Anonymize<I5bepfv83t9cg7>;
    "Transact": Anonymize<I92p6l5cs3fr50>;
    "HrmpNewChannelOpenRequest": Anonymize<I5uhhrjqfuo4e5>;
    "HrmpChannelAccepted": Anonymize<Ifij4jam0o7sub>;
    "HrmpChannelClosing": Anonymize<Ieeb4svd9i8fji>;
    "ClearOrigin": undefined;
    "DescendOrigin": XcmV3Junctions;
    "ReportError": Anonymize<I4r3v6e91d1qbs>;
    "DepositAsset": Anonymize<Idbqvv6kvph2qq>;
    "DepositReserveAsset": Anonymize<I6epv2jfejmsps>;
    "ExchangeAsset": Anonymize<Ifunmnuvdqirrm>;
    "InitiateReserveWithdraw": Anonymize<Id1994sd13a1fk>;
    "InitiateTeleport": Anonymize<I6epv2jfejmsps>;
    "ReportHolding": Anonymize<I53nvbjei7ovcg>;
    "BuyExecution": Anonymize<I60dnk6pb13k6r>;
    "RefundSurplus": undefined;
    "SetErrorHandler": Anonymize<Iegrepoo0c1jc5>;
    "SetAppendix": Anonymize<Iegrepoo0c1jc5>;
    "ClearError": undefined;
    "ClaimAsset": Anonymize<I39e2979fh1sq0>;
    "Trap": bigint;
    "SubscribeVersion": Anonymize<Ieprdqqu7ildvr>;
    "UnsubscribeVersion": undefined;
    "BurnAsset": Anonymize<I50mli3hb64f9b>;
    "ExpectAsset": Anonymize<I50mli3hb64f9b>;
    "ExpectOrigin"?: Anonymize<Ia9cgf4r40b26h>;
    "ExpectError"?: Anonymize<I7sltvf8v2nure>;
    "ExpectTransactStatus": XcmV3MaybeErrorCode;
    "QueryPallet": Anonymize<Iba5bdbapp16oo>;
    "ExpectPallet": Anonymize<Id7mf37dkpgfjs>;
    "ReportTransactStatus": Anonymize<I4r3v6e91d1qbs>;
    "ClearTransactStatus": undefined;
    "UniversalOrigin": XcmV3Junction;
    "ExportMessage": Anonymize<Idjv4c30koq53t>;
    "LockAsset": Anonymize<Ic2kq28flu5j2f>;
    "UnlockAsset": Anonymize<I63d4j1l5gkla3>;
    "NoteUnlockable": Anonymize<Ibs79g4hs4qcqq>;
    "RequestUnlock": Anonymize<Ifv72gq013neli>;
    "SetFeesMode": Anonymize<I4nae9rsql8fa7>;
    "SetTopic": FixedSizeBinary<32>;
    "ClearTopic": undefined;
    "AliasOrigin": Anonymize<I4c0s5cioidn76>;
    "UnpaidExecution": Anonymize<I40d50jeai33oq>;
}>;
export declare const XcmV4Instruction: GetEnum<XcmV4Instruction>;
export type I50mli3hb64f9b = Array<Anonymize<Ia5l7mu5a6v49o>>;
export type Ia5l7mu5a6v49o = {
    "id": Anonymize<I4c0s5cioidn76>;
    "fun": XcmV3MultiassetFungibility;
};
export type XcmV3MultiassetFungibility = Enum<{
    "Fungible": bigint;
    "NonFungible": XcmV3MultiassetAssetInstance;
}>;
export declare const XcmV3MultiassetFungibility: GetEnum<XcmV3MultiassetFungibility>;
export type XcmV3MultiassetAssetInstance = Enum<{
    "Undefined": undefined;
    "Index": bigint;
    "Array4": FixedSizeBinary<4>;
    "Array8": FixedSizeBinary<8>;
    "Array16": FixedSizeBinary<16>;
    "Array32": FixedSizeBinary<32>;
}>;
export declare const XcmV3MultiassetAssetInstance: GetEnum<XcmV3MultiassetAssetInstance>;
export type I9o9uda3nddbna = {
    "query_id": bigint;
    "response": XcmV4Response;
    "max_weight": Anonymize<I4q39t5hn830vp>;
    "querier"?: Anonymize<Ia9cgf4r40b26h>;
};
export type XcmV4Response = Enum<{
    "Null": undefined;
    "Assets": Anonymize<I50mli3hb64f9b>;
    "ExecutionResult"?: Anonymize<I7sltvf8v2nure>;
    "Version": number;
    "PalletsInfo": Anonymize<I599u7h20b52at>;
    "DispatchResult": XcmV3MaybeErrorCode;
}>;
export declare const XcmV4Response: GetEnum<XcmV4Response>;
export type I7sltvf8v2nure = (Anonymize<Id8ide743umavp>) | undefined;
export type Id8ide743umavp = [number, XcmV3TraitsError];
export type I599u7h20b52at = Array<Anonymize<Ift5r9b1bvoh16>>;
export type Ift5r9b1bvoh16 = {
    "index": number;
    "name": Binary;
    "module_name": Binary;
    "major": number;
    "minor": number;
    "patch": number;
};
export type XcmV3MaybeErrorCode = Enum<{
    "Success": undefined;
    "Error": Binary;
    "TruncatedError": Binary;
}>;
export declare const XcmV3MaybeErrorCode: GetEnum<XcmV3MaybeErrorCode>;
export type Ia9cgf4r40b26h = (Anonymize<I4c0s5cioidn76>) | undefined;
export type I7s0ar727m8n1j = {
    "assets": Anonymize<I50mli3hb64f9b>;
    "beneficiary": Anonymize<I4c0s5cioidn76>;
};
export type I5bepfv83t9cg7 = {
    "assets": Anonymize<I50mli3hb64f9b>;
    "dest": Anonymize<I4c0s5cioidn76>;
    "xcm": Anonymize<Iegrepoo0c1jc5>;
};
export type I92p6l5cs3fr50 = {
    "origin_kind": XcmV2OriginKind;
    "require_weight_at_most": Anonymize<I4q39t5hn830vp>;
    "call": Binary;
};
export type XcmV2OriginKind = Enum<{
    "Native": undefined;
    "SovereignAccount": undefined;
    "Superuser": undefined;
    "Xcm": undefined;
}>;
export declare const XcmV2OriginKind: GetEnum<XcmV2OriginKind>;
export type I5uhhrjqfuo4e5 = {
    "sender": number;
    "max_message_size": number;
    "max_capacity": number;
};
export type Ifij4jam0o7sub = {
    "recipient": number;
};
export type Ieeb4svd9i8fji = {
    "initiator": number;
    "sender": number;
    "recipient": number;
};
export type I4r3v6e91d1qbs = {
    "destination": Anonymize<I4c0s5cioidn76>;
    "query_id": bigint;
    "max_weight": Anonymize<I4q39t5hn830vp>;
};
export type Idbqvv6kvph2qq = {
    "assets": XcmV4AssetAssetFilter;
    "beneficiary": Anonymize<I4c0s5cioidn76>;
};
export type XcmV4AssetAssetFilter = Enum<{
    "Definite": Anonymize<I50mli3hb64f9b>;
    "Wild": XcmV4AssetWildAsset;
}>;
export declare const XcmV4AssetAssetFilter: GetEnum<XcmV4AssetAssetFilter>;
export type XcmV4AssetWildAsset = Enum<{
    "All": undefined;
    "AllOf": Anonymize<I9k109i13ivgac>;
    "AllCounted": number;
    "AllOfCounted": Anonymize<Iano6fp1hcf6vu>;
}>;
export declare const XcmV4AssetWildAsset: GetEnum<XcmV4AssetWildAsset>;
export type I9k109i13ivgac = {
    "id": Anonymize<I4c0s5cioidn76>;
    "fun": XcmV2MultiassetWildFungibility;
};
export type XcmV2MultiassetWildFungibility = Enum<{
    "Fungible": undefined;
    "NonFungible": undefined;
}>;
export declare const XcmV2MultiassetWildFungibility: GetEnum<XcmV2MultiassetWildFungibility>;
export type Iano6fp1hcf6vu = {
    "id": Anonymize<I4c0s5cioidn76>;
    "fun": XcmV2MultiassetWildFungibility;
    "count": number;
};
export type I6epv2jfejmsps = {
    "assets": XcmV4AssetAssetFilter;
    "dest": Anonymize<I4c0s5cioidn76>;
    "xcm": Anonymize<Iegrepoo0c1jc5>;
};
export type Ifunmnuvdqirrm = {
    "give": XcmV4AssetAssetFilter;
    "want": Anonymize<I50mli3hb64f9b>;
    "maximal": boolean;
};
export type Id1994sd13a1fk = {
    "assets": XcmV4AssetAssetFilter;
    "reserve": Anonymize<I4c0s5cioidn76>;
    "xcm": Anonymize<Iegrepoo0c1jc5>;
};
export type I53nvbjei7ovcg = {
    "response_info": Anonymize<I4r3v6e91d1qbs>;
    "assets": XcmV4AssetAssetFilter;
};
export type I60dnk6pb13k6r = {
    "fees": Anonymize<Ia5l7mu5a6v49o>;
    "weight_limit": XcmV3WeightLimit;
};
export type XcmV3WeightLimit = Enum<{
    "Unlimited": undefined;
    "Limited": Anonymize<I4q39t5hn830vp>;
}>;
export declare const XcmV3WeightLimit: GetEnum<XcmV3WeightLimit>;
export type I39e2979fh1sq0 = {
    "assets": Anonymize<I50mli3hb64f9b>;
    "ticket": Anonymize<I4c0s5cioidn76>;
};
export type Ieprdqqu7ildvr = {
    "query_id": bigint;
    "max_response_weight": Anonymize<I4q39t5hn830vp>;
};
export type Iba5bdbapp16oo = {
    "module_name": Binary;
    "response_info": Anonymize<I4r3v6e91d1qbs>;
};
export type Id7mf37dkpgfjs = {
    "index": number;
    "name": Binary;
    "module_name": Binary;
    "crate_major": number;
    "min_crate_minor": number;
};
export type Idjv4c30koq53t = {
    "network": XcmV3JunctionNetworkId;
    "destination": XcmV3Junctions;
    "xcm": Anonymize<Iegrepoo0c1jc5>;
};
export type Ic2kq28flu5j2f = {
    "asset": Anonymize<Ia5l7mu5a6v49o>;
    "unlocker": Anonymize<I4c0s5cioidn76>;
};
export type I63d4j1l5gkla3 = {
    "asset": Anonymize<Ia5l7mu5a6v49o>;
    "target": Anonymize<I4c0s5cioidn76>;
};
export type Ibs79g4hs4qcqq = {
    "asset": Anonymize<Ia5l7mu5a6v49o>;
    "owner": Anonymize<I4c0s5cioidn76>;
};
export type Ifv72gq013neli = {
    "asset": Anonymize<Ia5l7mu5a6v49o>;
    "locker": Anonymize<I4c0s5cioidn76>;
};
export type I4nae9rsql8fa7 = {
    "jit_withdraw": boolean;
};
export type I40d50jeai33oq = {
    "weight_limit": XcmV3WeightLimit;
    "check_origin"?: Anonymize<Ia9cgf4r40b26h>;
};
export type I3le5tr7ugg6l2 = {
    "origin": Anonymize<I4c0s5cioidn76>;
    "query_id": bigint;
};
export type I3iun9sig164po = {
    "query_id": bigint;
    "response": XcmV4Response;
};
export type I2uqmls7kcdnii = {
    "query_id": bigint;
    "pallet_index": number;
    "call_index": number;
};
export type Idg69klialbkb8 = {
    "query_id": bigint;
    "pallet_index": number;
    "call_index": number;
    "actual_weight": Anonymize<I4q39t5hn830vp>;
    "max_budgeted_weight": Anonymize<I4q39t5hn830vp>;
};
export type I13jboebjcbglr = {
    "origin": Anonymize<I4c0s5cioidn76>;
    "query_id": bigint;
    "expected_location"?: Anonymize<Ia9cgf4r40b26h>;
};
export type I30pg328m00nr3 = {
    "query_id": bigint;
};
export type I381dkhrurdhrs = {
    "hash": FixedSizeBinary<32>;
    "origin": Anonymize<I4c0s5cioidn76>;
    "assets": XcmVersionedAssets;
};
export type XcmVersionedAssets = Enum<{
    "V2": Anonymize<I2sllmucln1iic>;
    "V3": Anonymize<Iai6dhqiq3bach>;
    "V4": Anonymize<I50mli3hb64f9b>;
}>;
export declare const XcmVersionedAssets: GetEnum<XcmVersionedAssets>;
export type I2sllmucln1iic = Array<Anonymize<Id8h647t880l31>>;
export type Id8h647t880l31 = {
    "id": XcmV2MultiassetAssetId;
    "fun": XcmV2MultiassetFungibility;
};
export type XcmV2MultiassetAssetId = Enum<{
    "Concrete": Anonymize<I4frqunb5hj2km>;
    "Abstract": Binary;
}>;
export declare const XcmV2MultiassetAssetId: GetEnum<XcmV2MultiassetAssetId>;
export type I4frqunb5hj2km = {
    "parents": number;
    "interior": XcmV2MultilocationJunctions;
};
export type XcmV2MultilocationJunctions = Enum<{
    "Here": undefined;
    "X1": XcmV2Junction;
    "X2": Anonymize<I7tthuukjoks45>;
    "X3": Anonymize<Icpsqle8f7ccnh>;
    "X4": Anonymize<Ifaduechfcq41r>;
    "X5": Anonymize<Ifg30nsfqato4g>;
    "X6": Anonymize<I8s2vh6qelslgu>;
    "X7": Anonymize<I7r6q3396okion>;
    "X8": Anonymize<I1d4fie0b78rtc>;
}>;
export declare const XcmV2MultilocationJunctions: GetEnum<XcmV2MultilocationJunctions>;
export type XcmV2Junction = Enum<{
    "Parachain": number;
    "AccountId32": Anonymize<I6h60jropk90ne>;
    "AccountIndex64": Anonymize<I73mah5ooc6vk>;
    "AccountKey20": Anonymize<I9kkjqh79doku3>;
    "PalletInstance": number;
    "GeneralIndex": bigint;
    "GeneralKey": Binary;
    "OnlyChild": undefined;
    "Plurality": Anonymize<Iaqhvfsgakjhdq>;
}>;
export declare const XcmV2Junction: GetEnum<XcmV2Junction>;
export type I6h60jropk90ne = {
    "network": XcmV2NetworkId;
    "id": FixedSizeBinary<32>;
};
export type XcmV2NetworkId = Enum<{
    "Any": undefined;
    "Named": Binary;
    "Polkadot": undefined;
    "Kusama": undefined;
}>;
export declare const XcmV2NetworkId: GetEnum<XcmV2NetworkId>;
export type I73mah5ooc6vk = {
    "network": XcmV2NetworkId;
    "index": bigint;
};
export type I9kkjqh79doku3 = {
    "network": XcmV2NetworkId;
    "key": FixedSizeBinary<20>;
};
export type Iaqhvfsgakjhdq = {
    "id": XcmV2BodyId;
    "part": XcmV2JunctionBodyPart;
};
export type XcmV2BodyId = Enum<{
    "Unit": undefined;
    "Named": Binary;
    "Index": number;
    "Executive": undefined;
    "Technical": undefined;
    "Legislative": undefined;
    "Judicial": undefined;
    "Defense": undefined;
    "Administration": undefined;
    "Treasury": undefined;
}>;
export declare const XcmV2BodyId: GetEnum<XcmV2BodyId>;
export type I7tthuukjoks45 = FixedSizeArray<2, XcmV2Junction>;
export type Icpsqle8f7ccnh = FixedSizeArray<3, XcmV2Junction>;
export type Ifaduechfcq41r = FixedSizeArray<4, XcmV2Junction>;
export type Ifg30nsfqato4g = FixedSizeArray<5, XcmV2Junction>;
export type I8s2vh6qelslgu = FixedSizeArray<6, XcmV2Junction>;
export type I7r6q3396okion = FixedSizeArray<7, XcmV2Junction>;
export type I1d4fie0b78rtc = FixedSizeArray<8, XcmV2Junction>;
export type XcmV2MultiassetFungibility = Enum<{
    "Fungible": bigint;
    "NonFungible": XcmV2MultiassetAssetInstance;
}>;
export declare const XcmV2MultiassetFungibility: GetEnum<XcmV2MultiassetFungibility>;
export type XcmV2MultiassetAssetInstance = Enum<{
    "Undefined": undefined;
    "Index": bigint;
    "Array4": FixedSizeBinary<4>;
    "Array8": FixedSizeBinary<8>;
    "Array16": FixedSizeBinary<16>;
    "Array32": FixedSizeBinary<32>;
    "Blob": Binary;
}>;
export declare const XcmV2MultiassetAssetInstance: GetEnum<XcmV2MultiassetAssetInstance>;
export type Iai6dhqiq3bach = Array<Anonymize<Idcm24504c8bkk>>;
export type Idcm24504c8bkk = {
    "id": XcmV3MultiassetAssetId;
    "fun": XcmV3MultiassetFungibility;
};
export type XcmV3MultiassetAssetId = Enum<{
    "Concrete": Anonymize<I4c0s5cioidn76>;
    "Abstract": FixedSizeBinary<32>;
}>;
export declare const XcmV3MultiassetAssetId: GetEnum<XcmV3MultiassetAssetId>;
export type Ic8hi3qr11vngc = {
    "destination": Anonymize<I4c0s5cioidn76>;
    "result": number;
    "cost": Anonymize<I50mli3hb64f9b>;
    "message_id": FixedSizeBinary<32>;
};
export type Iabk8ljl5g8c86 = {
    "location": Anonymize<I4c0s5cioidn76>;
    "version": number;
};
export type Ibjdlecumfu7q7 = {
    "location": Anonymize<I4c0s5cioidn76>;
    "query_id": bigint;
    "error": XcmV3TraitsError;
};
export type Ia9ems1kg7laoc = {
    "location": XcmVersionedLocation;
    "query_id": bigint;
};
export type XcmVersionedLocation = Enum<{
    "V2": Anonymize<I4frqunb5hj2km>;
    "V3": Anonymize<I4c0s5cioidn76>;
    "V4": Anonymize<I4c0s5cioidn76>;
}>;
export declare const XcmVersionedLocation: GetEnum<XcmVersionedLocation>;
export type I92fq0fa45vi3 = {
    "origin": Anonymize<I4c0s5cioidn76>;
    "query_id": bigint;
    "expected_querier": Anonymize<I4c0s5cioidn76>;
    "maybe_actual_querier"?: Anonymize<Ia9cgf4r40b26h>;
};
export type Id01dpp0dn2cj0 = {
    "destination": Anonymize<I4c0s5cioidn76>;
    "cost": Anonymize<I50mli3hb64f9b>;
    "message_id": FixedSizeBinary<32>;
};
export type I6nu8k62ck9o8o = {
    "paying": Anonymize<I4c0s5cioidn76>;
    "fees": Anonymize<I50mli3hb64f9b>;
};
export type I6s1nbislhk619 = {
    "version": number;
};
export type Ibvp9t1gqae5ct = AnonymousEnum<{
    /**
     *Downward message is invalid XCM.
     *\[ id \]
     */
    "InvalidFormat": FixedSizeBinary<32>;
    /**
     *Downward message is unsupported version of XCM.
     *\[ id \]
     */
    "UnsupportedVersion": FixedSizeBinary<32>;
    /**
     *Downward message executed with the given outcome.
     *\[ id, outcome \]
     */
    "ExecutedDownward": Anonymize<Iea25i7vqm7ot3>;
}>;
export type Iea25i7vqm7ot3 = [FixedSizeBinary<32>, XcmV4TraitsOutcome];
export type I2kosejppk3jon = AnonymousEnum<{
    /**
     *Message discarded due to an error in the `MessageProcessor` (usually a format error).
     */
    "ProcessingFailed": Anonymize<I1rvj4ubaplho0>;
    /**
     *Message is processed.
     */
    "Processed": Anonymize<Ia3uu7lqcc1q1i>;
    /**
     *Message placed in overweight queue.
     */
    "OverweightEnqueued": Anonymize<I7crucfnonitkn>;
    /**
     *This page was reaped.
     */
    "PageReaped": Anonymize<I7tmrp94r9sq4n>;
}>;
export type I1rvj4ubaplho0 = {
    /**
     *The `blake2_256` hash of the message.
     */
    "id": FixedSizeBinary<32>;
    /**
     *The queue of the message.
     */
    "origin": Anonymize<Iejeo53sea6n4q>;
    /**
     *The error that occurred.
     *
     *This error is pretty opaque. More fine-grained errors need to be emitted as events
     *by the `MessageProcessor`.
     */
    "error": Anonymize<I5hhsj7l9obr84>;
};
export type Iejeo53sea6n4q = AnonymousEnum<{
    "Here": undefined;
    "Parent": undefined;
    "Sibling": number;
}>;
export type I5hhsj7l9obr84 = AnonymousEnum<{
    "BadFormat": undefined;
    "Corrupt": undefined;
    "Unsupported": undefined;
    "Overweight": Anonymize<I4q39t5hn830vp>;
    "Yield": undefined;
    "StackLimitReached": undefined;
}>;
export type Ia3uu7lqcc1q1i = {
    /**
     *The `blake2_256` hash of the message.
     */
    "id": FixedSizeBinary<32>;
    /**
     *The queue of the message.
     */
    "origin": Anonymize<Iejeo53sea6n4q>;
    /**
     *How much weight was used to process the message.
     */
    "weight_used": Anonymize<I4q39t5hn830vp>;
    /**
     *Whether the message was processed.
     *
     *Note that this does not mean that the underlying `MessageProcessor` was internally
     *successful. It *solely* means that the MQ pallet will treat this as a success
     *condition and discard the message. Any internal error needs to be emitted as events
     *by the `MessageProcessor`.
     */
    "success": boolean;
};
export type I7crucfnonitkn = {
    /**
     *The `blake2_256` hash of the message.
     */
    "id": FixedSizeBinary<32>;
    /**
     *The queue of the message.
     */
    "origin": Anonymize<Iejeo53sea6n4q>;
    /**
     *The page of the message.
     */
    "page_index": number;
    /**
     *The index of the message within the page.
     */
    "message_index": number;
};
export type I7tmrp94r9sq4n = {
    /**
     *The queue of the page.
     */
    "origin": Anonymize<Iejeo53sea6n4q>;
    /**
     *The index of the page.
     */
    "index": number;
};
export type I45vovbl28u5ob = AnonymousEnum<{
    /**
     *Batch of dispatches did not complete fully. Index of first failing dispatch given, as
     *well as the error.
     */
    "BatchInterrupted": Anonymize<Ia916s7j8ucmdd>;
    /**
     *Batch of dispatches completed fully with no error.
     */
    "BatchCompleted": undefined;
    /**
     *Batch of dispatches completed but has errors.
     */
    "BatchCompletedWithErrors": undefined;
    /**
     *A single item within a Batch of dispatches has completed with no error.
     */
    "ItemCompleted": undefined;
    /**
     *A single item within a Batch of dispatches has completed with error.
     */
    "ItemFailed": Anonymize<I6a0k8t8strmou>;
    /**
     *A call was dispatched.
     */
    "DispatchedAs": Anonymize<Iboobuvtv2hqbg>;
}>;
export type Ia916s7j8ucmdd = {
    "index": number;
    "error": Anonymize<Icogrvf0inr18b>;
};
export type I6a0k8t8strmou = {
    "error": Anonymize<Icogrvf0inr18b>;
};
export type Iboobuvtv2hqbg = {
    "result": Anonymize<I6sjjdpu2cscpe>;
};
export type I6sjjdpu2cscpe = ResultPayload<undefined, Anonymize<Icogrvf0inr18b>>;
export type Icjl5oqk1eo6sb = AnonymousEnum<{
    /**
     *A new multisig operation has begun.
     */
    "NewMultisig": Anonymize<Iep27ialq4a7o7>;
    /**
     *A multisig operation has been approved by someone.
     */
    "MultisigApproval": Anonymize<Iasu5jvoqr43mv>;
    /**
     *A multisig operation has been executed.
     */
    "MultisigExecuted": Anonymize<I5f1j6imiigvdh>;
    /**
     *A multisig operation has been cancelled.
     */
    "MultisigCancelled": Anonymize<I5qolde99acmd1>;
}>;
export type Iep27ialq4a7o7 = {
    "approving": SS58String;
    "multisig": SS58String;
    "call_hash": FixedSizeBinary<32>;
};
export type Iasu5jvoqr43mv = {
    "approving": SS58String;
    "timepoint": Anonymize<Itvprrpb0nm3o>;
    "multisig": SS58String;
    "call_hash": FixedSizeBinary<32>;
};
export type Itvprrpb0nm3o = {
    "height": number;
    "index": number;
};
export type I5f1j6imiigvdh = {
    "approving": SS58String;
    "timepoint": Anonymize<Itvprrpb0nm3o>;
    "multisig": SS58String;
    "call_hash": FixedSizeBinary<32>;
    "result": Anonymize<I6sjjdpu2cscpe>;
};
export type I5qolde99acmd1 = {
    "cancelling": SS58String;
    "timepoint": Anonymize<Itvprrpb0nm3o>;
    "multisig": SS58String;
    "call_hash": FixedSizeBinary<32>;
};
export type I8qme4qa965a0r = AnonymousEnum<{
    /**
     *A proxy was executed correctly, with the given.
     */
    "ProxyExecuted": Anonymize<Iboobuvtv2hqbg>;
    /**
     *A pure account has been created by new proxy with given
     *disambiguation index and proxy type.
     */
    "PureCreated": Anonymize<Ie7cuj84ohvg56>;
    /**
     *An announcement was placed to make a call in the future.
     */
    "Announced": Anonymize<I2ur0oeqg495j8>;
    /**
     *A proxy was added.
     */
    "ProxyAdded": Anonymize<I8ioopvokvl3ud>;
    /**
     *A proxy was removed.
     */
    "ProxyRemoved": Anonymize<I8ioopvokvl3ud>;
}>;
export type Ie7cuj84ohvg56 = {
    "pure": SS58String;
    "who": SS58String;
    "proxy_type": Anonymize<I5ftepkjop3g1u>;
    "disambiguation_index": number;
};
export type I5ftepkjop3g1u = AnonymousEnum<{
    "Any": undefined;
    "NonTransfer": undefined;
    "CancelProxy": undefined;
    "Assets": undefined;
    "AssetOwner": undefined;
    "AssetManager": undefined;
    "Collator": undefined;
}>;
export type I2ur0oeqg495j8 = {
    "real": SS58String;
    "proxy": SS58String;
    "call_hash": FixedSizeBinary<32>;
};
export type I8ioopvokvl3ud = {
    "delegator": SS58String;
    "delegatee": SS58String;
    "proxy_type": Anonymize<I5ftepkjop3g1u>;
    "delay": number;
};
export type I6avancvg8fd05 = AnonymousEnum<{
    /**
     *Some asset class was created.
     */
    "Created": Anonymize<I88ff3u4dpivk>;
    /**
     *Some assets were issued.
     */
    "Issued": Anonymize<I33cp947glv1ks>;
    /**
     *Some assets were transferred.
     */
    "Transferred": Anonymize<Ic9om1gmmqu7rq>;
    /**
     *Some assets were destroyed.
     */
    "Burned": Anonymize<I5hfov2b68ppb6>;
    /**
     *The management team changed.
     */
    "TeamChanged": Anonymize<Ibthhb2m9vneds>;
    /**
     *The owner changed.
     */
    "OwnerChanged": Anonymize<Iaitn5bqfacj7k>;
    /**
     *Some account `who` was frozen.
     */
    "Frozen": Anonymize<If4ebvclj2ugvi>;
    /**
     *Some account `who` was thawed.
     */
    "Thawed": Anonymize<If4ebvclj2ugvi>;
    /**
     *Some asset `asset_id` was frozen.
     */
    "AssetFrozen": Anonymize<Ia5le7udkgbaq9>;
    /**
     *Some asset `asset_id` was thawed.
     */
    "AssetThawed": Anonymize<Ia5le7udkgbaq9>;
    /**
     *Accounts were destroyed for given asset.
     */
    "AccountsDestroyed": Anonymize<Ieduc1e6frq8rb>;
    /**
     *Approvals were destroyed for given asset.
     */
    "ApprovalsDestroyed": Anonymize<I9h6gbtabovtm4>;
    /**
     *An asset class is in the process of being destroyed.
     */
    "DestructionStarted": Anonymize<Ia5le7udkgbaq9>;
    /**
     *An asset class was destroyed.
     */
    "Destroyed": Anonymize<Ia5le7udkgbaq9>;
    /**
     *Some asset class was force-created.
     */
    "ForceCreated": Anonymize<Iaitn5bqfacj7k>;
    /**
     *New metadata has been set for an asset.
     */
    "MetadataSet": Anonymize<Ifnsa0dkkpf465>;
    /**
     *Metadata has been cleared for an asset.
     */
    "MetadataCleared": Anonymize<Ia5le7udkgbaq9>;
    /**
     *(Additional) funds have been approved for transfer to a destination account.
     */
    "ApprovedTransfer": Anonymize<I65dtqr2egjbc3>;
    /**
     *An approval for account `delegate` was cancelled by `owner`.
     */
    "ApprovalCancelled": Anonymize<Ibqj3vg5s5lk0c>;
    /**
     *An `amount` was transferred in its entirety from `owner` to `destination` by
     *the approved `delegate`.
     */
    "TransferredApproved": Anonymize<I6l73u513p8rna>;
    /**
     *An asset has had its attributes changed by the `Force` origin.
     */
    "AssetStatusChanged": Anonymize<Ia5le7udkgbaq9>;
    /**
     *The min_balance of an asset has been updated by the asset owner.
     */
    "AssetMinBalanceChanged": Anonymize<Iefqmt2htu1dlu>;
    /**
     *Some account `who` was created with a deposit from `depositor`.
     */
    "Touched": Anonymize<If8bgtgqrchjtu>;
    /**
     *Some account `who` was blocked.
     */
    "Blocked": Anonymize<If4ebvclj2ugvi>;
    /**
     *Some assets were deposited (e.g. for transaction fees).
     */
    "Deposited": Anonymize<Idusmq77988cmt>;
    /**
     *Some assets were withdrawn from the account (e.g. for transaction fees).
     */
    "Withdrawn": Anonymize<Idusmq77988cmt>;
}>;
export type I88ff3u4dpivk = {
    "asset_id": number;
    "creator": SS58String;
    "owner": SS58String;
};
export type I33cp947glv1ks = {
    "asset_id": number;
    "owner": SS58String;
    "amount": bigint;
};
export type Ic9om1gmmqu7rq = {
    "asset_id": number;
    "from": SS58String;
    "to": SS58String;
    "amount": bigint;
};
export type I5hfov2b68ppb6 = {
    "asset_id": number;
    "owner": SS58String;
    "balance": bigint;
};
export type Ibthhb2m9vneds = {
    "asset_id": number;
    "issuer": SS58String;
    "admin": SS58String;
    "freezer": SS58String;
};
export type Iaitn5bqfacj7k = {
    "asset_id": number;
    "owner": SS58String;
};
export type If4ebvclj2ugvi = {
    "asset_id": number;
    "who": SS58String;
};
export type Ia5le7udkgbaq9 = {
    "asset_id": number;
};
export type Ieduc1e6frq8rb = {
    "asset_id": number;
    "accounts_destroyed": number;
    "accounts_remaining": number;
};
export type I9h6gbtabovtm4 = {
    "asset_id": number;
    "approvals_destroyed": number;
    "approvals_remaining": number;
};
export type Ifnsa0dkkpf465 = {
    "asset_id": number;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
    "is_frozen": boolean;
};
export type I65dtqr2egjbc3 = {
    "asset_id": number;
    "source": SS58String;
    "delegate": SS58String;
    "amount": bigint;
};
export type Ibqj3vg5s5lk0c = {
    "asset_id": number;
    "owner": SS58String;
    "delegate": SS58String;
};
export type I6l73u513p8rna = {
    "asset_id": number;
    "owner": SS58String;
    "delegate": SS58String;
    "destination": SS58String;
    "amount": bigint;
};
export type Iefqmt2htu1dlu = {
    "asset_id": number;
    "new_min_balance": bigint;
};
export type If8bgtgqrchjtu = {
    "asset_id": number;
    "who": SS58String;
    "depositor": SS58String;
};
export type Idusmq77988cmt = {
    "asset_id": number;
    "who": SS58String;
    "amount": bigint;
};
export type Ia0j71vjrjqu9p = AnonymousEnum<{
    /**
     *A `collection` was created.
     */
    "Created": Anonymize<I9gqanbbbe917p>;
    /**
     *A `collection` was force-created.
     */
    "ForceCreated": Anonymize<Id1m1230297f7a>;
    /**
     *A `collection` was destroyed.
     */
    "Destroyed": Anonymize<I6cu7obfo0rr0o>;
    /**
     *An `item` was issued.
     */
    "Issued": Anonymize<Ifvb1p5munhhv4>;
    /**
     *An `item` was transferred.
     */
    "Transferred": Anonymize<I46h83ilqeed3g>;
    /**
     *An `item` was destroyed.
     */
    "Burned": Anonymize<Ifvb1p5munhhv4>;
    /**
     *Some `item` was frozen.
     */
    "Frozen": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Some `item` was thawed.
     */
    "Thawed": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Some `collection` was frozen.
     */
    "CollectionFrozen": Anonymize<I6cu7obfo0rr0o>;
    /**
     *Some `collection` was thawed.
     */
    "CollectionThawed": Anonymize<I6cu7obfo0rr0o>;
    /**
     *The owner changed.
     */
    "OwnerChanged": Anonymize<Icahse3uoi76n7>;
    /**
     *The management team changed.
     */
    "TeamChanged": Anonymize<I75sj3uv7gnemk>;
    /**
     *An `item` of a `collection` has been approved by the `owner` for transfer by
     *a `delegate`.
     */
    "ApprovedTransfer": Anonymize<I5fjkvcb5vr6nb>;
    /**
     *An approval for a `delegate` account to transfer the `item` of an item
     *`collection` was cancelled by its `owner`.
     */
    "ApprovalCancelled": Anonymize<I5fjkvcb5vr6nb>;
    /**
     *A `collection` has had its attributes changed by the `Force` origin.
     */
    "ItemStatusChanged": Anonymize<I6cu7obfo0rr0o>;
    /**
     *New metadata has been set for a `collection`.
     */
    "CollectionMetadataSet": Anonymize<I9viqhmdtuof5e>;
    /**
     *Metadata has been cleared for a `collection`.
     */
    "CollectionMetadataCleared": Anonymize<I6cu7obfo0rr0o>;
    /**
     *New metadata has been set for an item.
     */
    "MetadataSet": Anonymize<Iceq9fmmp9aeqv>;
    /**
     *Metadata has been cleared for an item.
     */
    "MetadataCleared": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Metadata has been cleared for an item.
     */
    "Redeposited": Anonymize<I2gr1toekv86b9>;
    /**
     *New attribute metadata has been set for a `collection` or `item`.
     */
    "AttributeSet": Anonymize<I5tvvgui05tn6e>;
    /**
     *Attribute metadata has been cleared for a `collection` or `item`.
     */
    "AttributeCleared": Anonymize<Ibal0joadvdc2h>;
    /**
     *Ownership acceptance has changed for an account.
     */
    "OwnershipAcceptanceChanged": Anonymize<I2v2ikqt2trp52>;
    /**
     *Max supply has been set for a collection.
     */
    "CollectionMaxSupplySet": Anonymize<I6h88h8vba22v8>;
    /**
     *The price was set for the instance.
     */
    "ItemPriceSet": Anonymize<If3057hi1g5qlo>;
    /**
     *The price for the instance was removed.
     */
    "ItemPriceRemoved": Anonymize<Iafkqus0ohh6l6>;
    /**
     *An item was bought.
     */
    "ItemBought": Anonymize<Iaii5qf41d5n3d>;
}>;
export type I9gqanbbbe917p = {
    "collection": number;
    "creator": SS58String;
    "owner": SS58String;
};
export type Id1m1230297f7a = {
    "collection": number;
    "owner": SS58String;
};
export type I6cu7obfo0rr0o = {
    "collection": number;
};
export type Ifvb1p5munhhv4 = {
    "collection": number;
    "item": number;
    "owner": SS58String;
};
export type I46h83ilqeed3g = {
    "collection": number;
    "item": number;
    "from": SS58String;
    "to": SS58String;
};
export type Iafkqus0ohh6l6 = {
    "collection": number;
    "item": number;
};
export type Icahse3uoi76n7 = {
    "collection": number;
    "new_owner": SS58String;
};
export type I75sj3uv7gnemk = {
    "collection": number;
    "issuer": SS58String;
    "admin": SS58String;
    "freezer": SS58String;
};
export type I5fjkvcb5vr6nb = {
    "collection": number;
    "item": number;
    "owner": SS58String;
    "delegate": SS58String;
};
export type I9viqhmdtuof5e = {
    "collection": number;
    "data": Binary;
    "is_frozen": boolean;
};
export type Iceq9fmmp9aeqv = {
    "collection": number;
    "item": number;
    "data": Binary;
    "is_frozen": boolean;
};
export type I2gr1toekv86b9 = {
    "collection": number;
    "successful_items": Anonymize<Icgljjb6j82uhn>;
};
export type Icgljjb6j82uhn = Array<number>;
export type I5tvvgui05tn6e = {
    "collection": number;
    "maybe_item"?: Anonymize<I4arjljr6dpflb>;
    "key": Binary;
    "value": Binary;
};
export type I4arjljr6dpflb = (number) | undefined;
export type Ibal0joadvdc2h = {
    "collection": number;
    "maybe_item"?: Anonymize<I4arjljr6dpflb>;
    "key": Binary;
};
export type I2v2ikqt2trp52 = {
    "who": SS58String;
    "maybe_collection"?: Anonymize<I4arjljr6dpflb>;
};
export type I6h88h8vba22v8 = {
    "collection": number;
    "max_supply": number;
};
export type If3057hi1g5qlo = {
    "collection": number;
    "item": number;
    "price": bigint;
    "whitelisted_buyer"?: Anonymize<Ihfphjolmsqq1>;
};
export type Ihfphjolmsqq1 = (SS58String) | undefined;
export type Iaii5qf41d5n3d = {
    "collection": number;
    "item": number;
    "price": bigint;
    "seller": SS58String;
    "buyer": SS58String;
};
export type I6qicn8jn4fftj = AnonymousEnum<{
    /**
     *A `collection` was created.
     */
    "Created": Anonymize<I9gqanbbbe917p>;
    /**
     *A `collection` was force-created.
     */
    "ForceCreated": Anonymize<Id1m1230297f7a>;
    /**
     *A `collection` was destroyed.
     */
    "Destroyed": Anonymize<I6cu7obfo0rr0o>;
    /**
     *An `item` was issued.
     */
    "Issued": Anonymize<Ifvb1p5munhhv4>;
    /**
     *An `item` was transferred.
     */
    "Transferred": Anonymize<I46h83ilqeed3g>;
    /**
     *An `item` was destroyed.
     */
    "Burned": Anonymize<Ifvb1p5munhhv4>;
    /**
     *An `item` became non-transferable.
     */
    "ItemTransferLocked": Anonymize<Iafkqus0ohh6l6>;
    /**
     *An `item` became transferable.
     */
    "ItemTransferUnlocked": Anonymize<Iafkqus0ohh6l6>;
    /**
     *`item` metadata or attributes were locked.
     */
    "ItemPropertiesLocked": Anonymize<I1jj31tn29ie3c>;
    /**
     *Some `collection` was locked.
     */
    "CollectionLocked": Anonymize<I6cu7obfo0rr0o>;
    /**
     *The owner changed.
     */
    "OwnerChanged": Anonymize<Icahse3uoi76n7>;
    /**
     *The management team changed.
     */
    "TeamChanged": Anonymize<Ico8bnjc6taa27>;
    /**
     *An `item` of a `collection` has been approved by the `owner` for transfer by
     *a `delegate`.
     */
    "TransferApproved": Anonymize<I78i1bvlonei69>;
    /**
     *An approval for a `delegate` account to transfer the `item` of an item
     *`collection` was cancelled by its `owner`.
     */
    "ApprovalCancelled": Anonymize<I5fjkvcb5vr6nb>;
    /**
     *All approvals of an item got cancelled.
     */
    "AllApprovalsCancelled": Anonymize<Ifvb1p5munhhv4>;
    /**
     *A `collection` has had its config changed by the `Force` origin.
     */
    "CollectionConfigChanged": Anonymize<I6cu7obfo0rr0o>;
    /**
     *New metadata has been set for a `collection`.
     */
    "CollectionMetadataSet": Anonymize<I78u60nqh0etah>;
    /**
     *Metadata has been cleared for a `collection`.
     */
    "CollectionMetadataCleared": Anonymize<I6cu7obfo0rr0o>;
    /**
     *New metadata has been set for an item.
     */
    "ItemMetadataSet": Anonymize<Icrkms46uh8tpb>;
    /**
     *Metadata has been cleared for an item.
     */
    "ItemMetadataCleared": Anonymize<Iafkqus0ohh6l6>;
    /**
     *The deposit for a set of `item`s within a `collection` has been updated.
     */
    "Redeposited": Anonymize<I2gr1toekv86b9>;
    /**
     *New attribute metadata has been set for a `collection` or `item`.
     */
    "AttributeSet": Anonymize<I5llu6o6a0go5i>;
    /**
     *Attribute metadata has been cleared for a `collection` or `item`.
     */
    "AttributeCleared": Anonymize<I93r2effh7od84>;
    /**
     *A new approval to modify item attributes was added.
     */
    "ItemAttributesApprovalAdded": Anonymize<I9i1f9mrso1hmf>;
    /**
     *A new approval to modify item attributes was removed.
     */
    "ItemAttributesApprovalRemoved": Anonymize<I9i1f9mrso1hmf>;
    /**
     *Ownership acceptance has changed for an account.
     */
    "OwnershipAcceptanceChanged": Anonymize<I2v2ikqt2trp52>;
    /**
     *Max supply has been set for a collection.
     */
    "CollectionMaxSupplySet": Anonymize<I6h88h8vba22v8>;
    /**
     *Mint settings for a collection had changed.
     */
    "CollectionMintSettingsUpdated": Anonymize<I6cu7obfo0rr0o>;
    /**
     *Event gets emitted when the `NextCollectionId` gets incremented.
     */
    "NextCollectionIdIncremented": Anonymize<I9ksla2si91s56>;
    /**
     *The price was set for the item.
     */
    "ItemPriceSet": Anonymize<If3057hi1g5qlo>;
    /**
     *The price for the item was removed.
     */
    "ItemPriceRemoved": Anonymize<Iafkqus0ohh6l6>;
    /**
     *An item was bought.
     */
    "ItemBought": Anonymize<Iaii5qf41d5n3d>;
    /**
     *A tip was sent.
     */
    "TipSent": Anonymize<Id9j7b85otvjru>;
    /**
     *An `item` swap intent was created.
     */
    "SwapCreated": Anonymize<Iaihk9pek2ajl9>;
    /**
     *The swap was cancelled.
     */
    "SwapCancelled": Anonymize<Iaihk9pek2ajl9>;
    /**
     *The swap has been claimed.
     */
    "SwapClaimed": Anonymize<Id9av23h47ufb2>;
    /**
     *New attributes have been set for an `item` of the `collection`.
     */
    "PreSignedAttributesSet": Anonymize<Ib4kpnijas4jqp>;
    /**
     *A new attribute in the `Pallet` namespace was set for the `collection` or an `item`
     *within that `collection`.
     */
    "PalletAttributeSet": Anonymize<I2vnu5k0u1i65h>;
}>;
export type I1jj31tn29ie3c = {
    "collection": number;
    "item": number;
    "lock_metadata": boolean;
    "lock_attributes": boolean;
};
export type Ico8bnjc6taa27 = {
    "collection": number;
    "issuer"?: Anonymize<Ihfphjolmsqq1>;
    "admin"?: Anonymize<Ihfphjolmsqq1>;
    "freezer"?: Anonymize<Ihfphjolmsqq1>;
};
export type I78i1bvlonei69 = {
    "collection": number;
    "item": number;
    "owner": SS58String;
    "delegate": SS58String;
    "deadline"?: Anonymize<I4arjljr6dpflb>;
};
export type I78u60nqh0etah = {
    "collection": number;
    "data": Binary;
};
export type Icrkms46uh8tpb = {
    "collection": number;
    "item": number;
    "data": Binary;
};
export type I5llu6o6a0go5i = {
    "collection": number;
    "maybe_item"?: Anonymize<I4arjljr6dpflb>;
    "key": Binary;
    "value": Binary;
    "namespace": Anonymize<If3jjadhmug6qc>;
};
export type If3jjadhmug6qc = AnonymousEnum<{
    "Pallet": undefined;
    "CollectionOwner": undefined;
    "ItemOwner": undefined;
    "Account": SS58String;
}>;
export type I93r2effh7od84 = {
    "collection": number;
    "maybe_item"?: Anonymize<I4arjljr6dpflb>;
    "key": Binary;
    "namespace": Anonymize<If3jjadhmug6qc>;
};
export type I9i1f9mrso1hmf = {
    "collection": number;
    "item": number;
    "delegate": SS58String;
};
export type I9ksla2si91s56 = {
    "next_id"?: Anonymize<I4arjljr6dpflb>;
};
export type Id9j7b85otvjru = {
    "collection": number;
    "item": number;
    "sender": SS58String;
    "receiver": SS58String;
    "amount": bigint;
};
export type Iaihk9pek2ajl9 = {
    "offered_collection": number;
    "offered_item": number;
    "desired_collection": number;
    "desired_item"?: Anonymize<I4arjljr6dpflb>;
    "price"?: Anonymize<I6oogc1jbmmi81>;
    "deadline": number;
};
export type I6oogc1jbmmi81 = (Anonymize<I9b1jgmi22enn5>) | undefined;
export type I9b1jgmi22enn5 = {
    "amount": bigint;
    "direction": Anonymize<I1p7rj0j3gmh73>;
};
export type I1p7rj0j3gmh73 = AnonymousEnum<{
    "Send": undefined;
    "Receive": undefined;
}>;
export type Id9av23h47ufb2 = {
    "sent_collection": number;
    "sent_item": number;
    "sent_item_owner": SS58String;
    "received_collection": number;
    "received_item": number;
    "received_item_owner": SS58String;
    "price"?: Anonymize<I6oogc1jbmmi81>;
    "deadline": number;
};
export type Ib4kpnijas4jqp = {
    "collection": number;
    "item": number;
    "namespace": Anonymize<If3jjadhmug6qc>;
};
export type I2vnu5k0u1i65h = {
    "collection": number;
    "item"?: Anonymize<I4arjljr6dpflb>;
    "attribute": Anonymize<I75km45qj0eg5n>;
    "value": Binary;
};
export type I75km45qj0eg5n = AnonymousEnum<{
    "UsedToClaim": number;
    "TransferDisabled": undefined;
}>;
export type I81i2fkdo6nple = AnonymousEnum<{
    /**
     *Some asset class was created.
     */
    "Created": Anonymize<I36h211fbvstks>;
    /**
     *Some assets were issued.
     */
    "Issued": Anonymize<I2k9iu40qhp841>;
    /**
     *Some assets were transferred.
     */
    "Transferred": Anonymize<I3dufa2gr145hf>;
    /**
     *Some assets were destroyed.
     */
    "Burned": Anonymize<Ie66s9cr50m7sr>;
    /**
     *The management team changed.
     */
    "TeamChanged": Anonymize<I3msvtljqnu799>;
    /**
     *The owner changed.
     */
    "OwnerChanged": Anonymize<I467a79vcdbrec>;
    /**
     *Some account `who` was frozen.
     */
    "Frozen": Anonymize<Ia8imt144v3n25>;
    /**
     *Some account `who` was thawed.
     */
    "Thawed": Anonymize<Ia8imt144v3n25>;
    /**
     *Some asset `asset_id` was frozen.
     */
    "AssetFrozen": Anonymize<I35uvf5ij009e8>;
    /**
     *Some asset `asset_id` was thawed.
     */
    "AssetThawed": Anonymize<I35uvf5ij009e8>;
    /**
     *Accounts were destroyed for given asset.
     */
    "AccountsDestroyed": Anonymize<I1mmtcsmkng8nj>;
    /**
     *Approvals were destroyed for given asset.
     */
    "ApprovalsDestroyed": Anonymize<I30qmuqbs4i8i4>;
    /**
     *An asset class is in the process of being destroyed.
     */
    "DestructionStarted": Anonymize<I35uvf5ij009e8>;
    /**
     *An asset class was destroyed.
     */
    "Destroyed": Anonymize<I35uvf5ij009e8>;
    /**
     *Some asset class was force-created.
     */
    "ForceCreated": Anonymize<I467a79vcdbrec>;
    /**
     *New metadata has been set for an asset.
     */
    "MetadataSet": Anonymize<Iarmm62t3lm37e>;
    /**
     *Metadata has been cleared for an asset.
     */
    "MetadataCleared": Anonymize<I35uvf5ij009e8>;
    /**
     *(Additional) funds have been approved for transfer to a destination account.
     */
    "ApprovedTransfer": Anonymize<I9nm7qticlhmgl>;
    /**
     *An approval for account `delegate` was cancelled by `owner`.
     */
    "ApprovalCancelled": Anonymize<Iev4iv86ng02ck>;
    /**
     *An `amount` was transferred in its entirety from `owner` to `destination` by
     *the approved `delegate`.
     */
    "TransferredApproved": Anonymize<I5s8p7gejoudvh>;
    /**
     *An asset has had its attributes changed by the `Force` origin.
     */
    "AssetStatusChanged": Anonymize<I35uvf5ij009e8>;
    /**
     *The min_balance of an asset has been updated by the asset owner.
     */
    "AssetMinBalanceChanged": Anonymize<If4jtj68r1gabq>;
    /**
     *Some account `who` was created with a deposit from `depositor`.
     */
    "Touched": Anonymize<I8s66oebjsgqga>;
    /**
     *Some account `who` was blocked.
     */
    "Blocked": Anonymize<Ia8imt144v3n25>;
    /**
     *Some assets were deposited (e.g. for transaction fees).
     */
    "Deposited": Anonymize<I42gee3b9iotl3>;
    /**
     *Some assets were withdrawn from the account (e.g. for transaction fees).
     */
    "Withdrawn": Anonymize<I42gee3b9iotl3>;
}>;
export type I36h211fbvstks = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "creator": SS58String;
    "owner": SS58String;
};
export type I2k9iu40qhp841 = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "owner": SS58String;
    "amount": bigint;
};
export type I3dufa2gr145hf = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "from": SS58String;
    "to": SS58String;
    "amount": bigint;
};
export type Ie66s9cr50m7sr = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "owner": SS58String;
    "balance": bigint;
};
export type I3msvtljqnu799 = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "issuer": SS58String;
    "admin": SS58String;
    "freezer": SS58String;
};
export type I467a79vcdbrec = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "owner": SS58String;
};
export type Ia8imt144v3n25 = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "who": SS58String;
};
export type I35uvf5ij009e8 = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
};
export type I1mmtcsmkng8nj = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "accounts_destroyed": number;
    "accounts_remaining": number;
};
export type I30qmuqbs4i8i4 = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "approvals_destroyed": number;
    "approvals_remaining": number;
};
export type Iarmm62t3lm37e = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
    "is_frozen": boolean;
};
export type I9nm7qticlhmgl = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "source": SS58String;
    "delegate": SS58String;
    "amount": bigint;
};
export type Iev4iv86ng02ck = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "owner": SS58String;
    "delegate": SS58String;
};
export type I5s8p7gejoudvh = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "owner": SS58String;
    "delegate": SS58String;
    "destination": SS58String;
    "amount": bigint;
};
export type If4jtj68r1gabq = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "new_min_balance": bigint;
};
export type I8s66oebjsgqga = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "who": SS58String;
    "depositor": SS58String;
};
export type I42gee3b9iotl3 = {
    "asset_id": Anonymize<I4c0s5cioidn76>;
    "who": SS58String;
    "amount": bigint;
};
export type I31lqq0fjfmnfv = AnonymousEnum<{
    /**
     *A successful call of the `CreatePool` extrinsic will create this event.
     */
    "PoolCreated": Anonymize<I9eo7u28un09g0>;
    /**
     *A successful call of the `AddLiquidity` extrinsic will create this event.
     */
    "LiquidityAdded": Anonymize<I99d21a0mjv4oo>;
    /**
     *A successful call of the `RemoveLiquidity` extrinsic will create this event.
     */
    "LiquidityRemoved": Anonymize<I6l4cdn6bhfq84>;
    /**
     *Assets have been converted from one to another. Both `SwapExactTokenForToken`
     *and `SwapTokenForExactToken` will generate this event.
     */
    "SwapExecuted": Anonymize<Iduk3pajm13p5c>;
    /**
     *Assets have been converted from one to another.
     */
    "SwapCreditExecuted": Anonymize<I9cgel74dg00ig>;
    /**
     *Pool has been touched in order to fulfill operational requirements.
     */
    "Touched": Anonymize<Ibkbs6pj6cn1hv>;
}>;
export type I9eo7u28un09g0 = {
    /**
     *The account that created the pool.
     */
    "creator": SS58String;
    /**
     *The pool id associated with the pool. Note that the order of the assets may not be
     *the same as the order specified in the create pool extrinsic.
     */
    "pool_id": Anonymize<Id0as9l3s817qs>;
    /**
     *The account ID of the pool.
     */
    "pool_account": SS58String;
    /**
     *The id of the liquidity tokens that will be minted when assets are added to this
     *pool.
     */
    "lp_token": number;
};
export type Id0as9l3s817qs = FixedSizeArray<2, Anonymize<I4c0s5cioidn76>>;
export type I99d21a0mjv4oo = {
    /**
     *The account that the liquidity was taken from.
     */
    "who": SS58String;
    /**
     *The account that the liquidity tokens were minted to.
     */
    "mint_to": SS58String;
    /**
     *The pool id of the pool that the liquidity was added to.
     */
    "pool_id": Anonymize<Id0as9l3s817qs>;
    /**
     *The amount of the first asset that was added to the pool.
     */
    "amount1_provided": bigint;
    /**
     *The amount of the second asset that was added to the pool.
     */
    "amount2_provided": bigint;
    /**
     *The id of the lp token that was minted.
     */
    "lp_token": number;
    /**
     *The amount of lp tokens that were minted of that id.
     */
    "lp_token_minted": bigint;
};
export type I6l4cdn6bhfq84 = {
    /**
     *The account that the liquidity tokens were burned from.
     */
    "who": SS58String;
    /**
     *The account that the assets were transferred to.
     */
    "withdraw_to": SS58String;
    /**
     *The pool id that the liquidity was removed from.
     */
    "pool_id": Anonymize<Id0as9l3s817qs>;
    /**
     *The amount of the first asset that was removed from the pool.
     */
    "amount1": bigint;
    /**
     *The amount of the second asset that was removed from the pool.
     */
    "amount2": bigint;
    /**
     *The id of the lp token that was burned.
     */
    "lp_token": number;
    /**
     *The amount of lp tokens that were burned of that id.
     */
    "lp_token_burned": bigint;
    /**
     *Liquidity withdrawal fee (%).
     */
    "withdrawal_fee": number;
};
export type Iduk3pajm13p5c = {
    /**
     *Which account was the instigator of the swap.
     */
    "who": SS58String;
    /**
     *The account that the assets were transferred to.
     */
    "send_to": SS58String;
    /**
     *The amount of the first asset that was swapped.
     */
    "amount_in": bigint;
    /**
     *The amount of the second asset that was received.
     */
    "amount_out": bigint;
    /**
     *The route of asset IDs with amounts that the swap went through.
     *E.g. (A, amount_in) -> (Dot, amount_out) -> (B, amount_out)
     */
    "path": Anonymize<Ibirh7ova056d>;
};
export type Ibirh7ova056d = Array<Anonymize<Iadrpn9mhdu2rp>>;
export type Iadrpn9mhdu2rp = [Anonymize<I4c0s5cioidn76>, bigint];
export type I9cgel74dg00ig = {
    /**
     *The amount of the first asset that was swapped.
     */
    "amount_in": bigint;
    /**
     *The amount of the second asset that was received.
     */
    "amount_out": bigint;
    /**
     *The route of asset IDs with amounts that the swap went through.
     *E.g. (A, amount_in) -> (Dot, amount_out) -> (B, amount_out)
     */
    "path": Anonymize<Ibirh7ova056d>;
};
export type Ibkbs6pj6cn1hv = {
    /**
     *The ID of the pool.
     */
    "pool_id": Anonymize<Id0as9l3s817qs>;
    /**
     *The account initiating the touch.
     */
    "who": SS58String;
};
export type Ic5m5lp1oioo8r = Array<FixedSizeBinary<32>>;
export type I95g6i7ilua7lq = Array<Anonymize<I9jd27rnpm8ttv>>;
export type I9jd27rnpm8ttv = FixedSizeArray<2, number>;
export type Ieniouoqkq4icf = {
    "spec_version": number;
    "spec_name": string;
};
export type I1v7jbnil3tjns = Array<Anonymize<Ifv73m0cjq92it>>;
export type Ifv73m0cjq92it = {
    "used_bandwidth": Anonymize<Ieafp1gui1o4cl>;
    "para_head_hash"?: Anonymize<I4s6vifaf8k998>;
    "consumed_go_ahead_signal"?: Anonymize<Iav8k1edbj86k7>;
};
export type Ieafp1gui1o4cl = {
    "ump_msg_count": number;
    "ump_total_bytes": number;
    "hrmp_outgoing": Anonymize<I68brng9hc4b57>;
};
export type I68brng9hc4b57 = Array<Anonymize<I2hfpgo4vigap7>>;
export type I2hfpgo4vigap7 = [number, Anonymize<I37lfg356jmoof>];
export type I37lfg356jmoof = {
    "msg_count": number;
    "total_bytes": number;
};
export type Iav8k1edbj86k7 = (UpgradeGoAhead) | undefined;
export type UpgradeGoAhead = Enum<{
    "Abort": undefined;
    "GoAhead": undefined;
}>;
export declare const UpgradeGoAhead: GetEnum<UpgradeGoAhead>;
export type I8jgj1nhcr2dg8 = {
    "used_bandwidth": Anonymize<Ieafp1gui1o4cl>;
    "hrmp_watermark"?: Anonymize<I4arjljr6dpflb>;
    "consumed_go_ahead_signal"?: Anonymize<Iav8k1edbj86k7>;
};
export type Ifn6q3equiq9qi = {
    "parent_head": Binary;
    "relay_parent_number": number;
    "relay_parent_storage_root": FixedSizeBinary<32>;
    "max_pov_size": number;
};
export type Ia3sb0vgvovhtg = (UpgradeRestriction) | undefined;
export type UpgradeRestriction = Enum<{
    "Present": undefined;
}>;
export declare const UpgradeRestriction: GetEnum<UpgradeRestriction>;
export type Itom7fk49o0c9 = Array<Binary>;
export type I4i91h98n3cv1b = {
    "dmq_mqc_head": FixedSizeBinary<32>;
    "relay_dispatch_queue_remaining_capacity": Anonymize<I3j1v1c2btq4bd>;
    "ingress_channels": Anonymize<I2d966pi8ko0ts>;
    "egress_channels": Anonymize<I2d966pi8ko0ts>;
};
export type I3j1v1c2btq4bd = {
    "remaining_count": number;
    "remaining_size": number;
};
export type I2d966pi8ko0ts = Array<Anonymize<Ib4li5mtsch8a1>>;
export type Ib4li5mtsch8a1 = [number, Anonymize<Ivvvdad7teq4e>];
export type Ivvvdad7teq4e = {
    "max_capacity": number;
    "max_total_size": number;
    "max_message_size": number;
    "msg_count": number;
    "total_size": number;
    "mqc_head"?: Anonymize<I4s6vifaf8k998>;
};
export type I4iumukclgj8ej = {
    "max_code_size": number;
    "max_head_data_size": number;
    "max_upward_queue_count": number;
    "max_upward_queue_size": number;
    "max_upward_message_size": number;
    "max_upward_message_num_per_candidate": number;
    "hrmp_max_message_num_per_candidate": number;
    "validation_upgrade_cooldown": number;
    "validation_upgrade_delay": number;
    "async_backing_params": Anonymize<Iavuvfkop6318c>;
};
export type Iavuvfkop6318c = {
    "max_candidate_depth": number;
    "allowed_ancestry_len": number;
};
export type Iqnbvitf7a7l3 = Array<Anonymize<I4p5t2krb1gmvp>>;
export type I4p5t2krb1gmvp = [number, FixedSizeBinary<32>];
export type I6r5cbv8ttrb09 = Array<Anonymize<I958l48g4qg5rf>>;
export type I958l48g4qg5rf = {
    "recipient": number;
    "data": Binary;
};
export type I8ds64oj6581v0 = Array<Anonymize<Ifd60g9ld04ljn>>;
export type Ifd60g9ld04ljn = {
    "id": FixedSizeBinary<8>;
    "amount": bigint;
    "reasons": BalancesTypesReasons;
};
export type BalancesTypesReasons = Enum<{
    "Fee": undefined;
    "Misc": undefined;
    "All": undefined;
}>;
export declare const BalancesTypesReasons: GetEnum<BalancesTypesReasons>;
export type Ia7pdug7cdsg8g = Array<Anonymize<I1basc5up2fk73>>;
export type I1basc5up2fk73 = {
    "id": FixedSizeBinary<8>;
    "amount": bigint;
};
export type I9bin2jc70qt6q = Array<Anonymize<I3qt1hgg4djhgb>>;
export type TransactionPaymentReleases = Enum<{
    "V1Ancient": undefined;
    "V2": undefined;
}>;
export declare const TransactionPaymentReleases: GetEnum<TransactionPaymentReleases>;
export type Ifble4juuml5ig = Array<Anonymize<I4aro1m78pdrtt>>;
export type I4aro1m78pdrtt = {
    "locked": bigint;
    "per_block": bigint;
    "starting_block": number;
};
export type Version = Enum<{
    "V0": undefined;
    "V1": undefined;
}>;
export declare const Version: GetEnum<Version>;
export type Ifi4da1gej1fri = Array<Anonymize<Iep1lmt6q3s6r3>>;
export type Iep1lmt6q3s6r3 = {
    "who": SS58String;
    "deposit": bigint;
};
export type Ifvgo9568rpmqc = Array<Anonymize<I8uo3fpd3bcc6f>>;
export type I8uo3fpd3bcc6f = [SS58String, FixedSizeBinary<32>];
export type I6cs1itejju2vv = [bigint, number];
export type Ib77b0fp1a6mjr = Array<Anonymize<I1tbd609kokm4d>>;
export type I1tbd609kokm4d = {
    "recipient": number;
    "state": Anonymize<Ic2gg6ldfq068e>;
    "signals_exist": boolean;
    "first_index": number;
    "last_index": number;
};
export type Ic2gg6ldfq068e = AnonymousEnum<{
    "Ok": undefined;
    "Suspended": undefined;
}>;
export type I5g2vv0ckl2m8b = [number, number];
export type Ifup3lg9ro8a0f = {
    "suspend_threshold": number;
    "drop_threshold": number;
    "resume_threshold": number;
};
export type XcmPalletQueryStatus = Enum<{
    "Pending": Anonymize<I9cig2tff0h7a2>;
    "VersionNotifier": Anonymize<I5c2ss6qk7lue3>;
    "Ready": Anonymize<I2rikk3g9dnfdf>;
}>;
export declare const XcmPalletQueryStatus: GetEnum<XcmPalletQueryStatus>;
export type I9cig2tff0h7a2 = {
    "responder": XcmVersionedLocation;
    "maybe_match_querier"?: Anonymize<Ichrhugqpl0jbb>;
    "maybe_notify"?: Anonymize<I1faufi0iffstp>;
    "timeout": number;
};
export type Ichrhugqpl0jbb = (XcmVersionedLocation) | undefined;
export type I1faufi0iffstp = (FixedSizeBinary<2>) | undefined;
export type I5c2ss6qk7lue3 = {
    "origin": XcmVersionedLocation;
    "is_active": boolean;
};
export type I2rikk3g9dnfdf = {
    "response": XcmVersionedResponse;
    "at": number;
};
export type XcmVersionedResponse = Enum<{
    "V2": XcmV2Response;
    "V3": XcmV3Response;
    "V4": XcmV4Response;
}>;
export declare const XcmVersionedResponse: GetEnum<XcmVersionedResponse>;
export type XcmV2Response = Enum<{
    "Null": undefined;
    "Assets": Anonymize<I2sllmucln1iic>;
    "ExecutionResult"?: Anonymize<Ic6k45vtgiaa1s>;
    "Version": number;
}>;
export declare const XcmV2Response: GetEnum<XcmV2Response>;
export type Ic6k45vtgiaa1s = (Anonymize<Ifg18rrvb5cqli>) | undefined;
export type Ifg18rrvb5cqli = [number, XcmV2TraitsError];
export type XcmV2TraitsError = Enum<{
    "Overflow": undefined;
    "Unimplemented": undefined;
    "UntrustedReserveLocation": undefined;
    "UntrustedTeleportLocation": undefined;
    "MultiLocationFull": undefined;
    "MultiLocationNotInvertible": undefined;
    "BadOrigin": undefined;
    "InvalidLocation": undefined;
    "AssetNotFound": undefined;
    "FailedToTransactAsset": undefined;
    "NotWithdrawable": undefined;
    "LocationCannotHold": undefined;
    "ExceedsMaxMessageSize": undefined;
    "DestinationUnsupported": undefined;
    "Transport": undefined;
    "Unroutable": undefined;
    "UnknownClaim": undefined;
    "FailedToDecode": undefined;
    "MaxWeightInvalid": undefined;
    "NotHoldingFees": undefined;
    "TooExpensive": undefined;
    "Trap": bigint;
    "UnhandledXcmVersion": undefined;
    "WeightLimitReached": bigint;
    "Barrier": undefined;
    "WeightNotComputable": undefined;
}>;
export declare const XcmV2TraitsError: GetEnum<XcmV2TraitsError>;
export type XcmV3Response = Enum<{
    "Null": undefined;
    "Assets": Anonymize<Iai6dhqiq3bach>;
    "ExecutionResult"?: Anonymize<I7sltvf8v2nure>;
    "Version": number;
    "PalletsInfo": Anonymize<I599u7h20b52at>;
    "DispatchResult": XcmV3MaybeErrorCode;
}>;
export declare const XcmV3Response: GetEnum<XcmV3Response>;
export type Ic4qvh5df9s5gp = [number, XcmVersionedLocation];
export type I7vlvrrl2pnbgk = [bigint, Anonymize<I4q39t5hn830vp>, number];
export type I50sjs3s5lud21 = Array<Anonymize<I6vu59hrif6rva>>;
export type I6vu59hrif6rva = [XcmVersionedLocation, number];
export type XcmPalletVersionMigrationStage = Enum<{
    "MigrateSupportedVersion": undefined;
    "MigrateVersionNotifiers": undefined;
    "NotifyCurrentTargets"?: Anonymize<Iabpgqcjikia83>;
    "MigrateAndNotifyOldTargets": undefined;
}>;
export declare const XcmPalletVersionMigrationStage: GetEnum<XcmPalletVersionMigrationStage>;
export type Iabpgqcjikia83 = (Binary) | undefined;
export type I50qp0ij7h62g2 = {
    "amount": bigint;
    "owner": XcmVersionedLocation;
    "locker": XcmVersionedLocation;
    "consumers": Anonymize<I2ia97v5nng96b>;
};
export type I2ia97v5nng96b = Array<Anonymize<I2a3me3o6q76s8>>;
export type I2a3me3o6q76s8 = [undefined, bigint];
export type Iteuj23is2ed5 = [number, SS58String, XcmVersionedAssetId];
export type XcmVersionedAssetId = Enum<{
    "V3": XcmV3MultiassetAssetId;
    "V4": Anonymize<I4c0s5cioidn76>;
}>;
export declare const XcmVersionedAssetId: GetEnum<XcmVersionedAssetId>;
export type I3rp19gb4dadaa = Array<Anonymize<I4arq5fbf241mq>>;
export type I4arq5fbf241mq = [bigint, XcmVersionedLocation];
export type I7f4alf2hnuu8s = {
    "delivery_fee_factor": bigint;
    "is_congested": boolean;
};
export type Idh2ug6ou4a8og = {
    "begin": number;
    "end": number;
    "count": number;
    "ready_neighbours"?: Anonymize<Ignpjhsnd42fu>;
    "message_count": bigint;
    "size": bigint;
};
export type Ignpjhsnd42fu = (Anonymize<I9d2uml1gs7v8>) | undefined;
export type I9d2uml1gs7v8 = {
    "prev": Anonymize<Iejeo53sea6n4q>;
    "next": Anonymize<Iejeo53sea6n4q>;
};
export type I53esa2ms463bk = {
    "remaining": number;
    "remaining_size": number;
    "first_index": number;
    "first": number;
    "last": number;
    "heap": Binary;
};
export type Ib4jhb8tt3uung = [Anonymize<Iejeo53sea6n4q>, number];
export type Iag146hmjgqfgj = {
    "when": Anonymize<Itvprrpb0nm3o>;
    "deposit": bigint;
    "depositor": SS58String;
    "approvals": Anonymize<Ia2lhg7l2hilo3>;
};
export type I32or1mos65f9o = [Anonymize<I8r6bfjpbrc70c>, bigint];
export type I8r6bfjpbrc70c = Array<Anonymize<I5temii03lnchi>>;
export type I5temii03lnchi = {
    "delegate": SS58String;
    "proxy_type": Anonymize<I5ftepkjop3g1u>;
    "delay": number;
};
export type I9p9lq3rej5bhc = [Anonymize<Ie1hjkhaoshr67>, bigint];
export type Ie1hjkhaoshr67 = Array<Anonymize<I70eqajm9p2sc5>>;
export type I70eqajm9p2sc5 = {
    "real": SS58String;
    "call_hash": FixedSizeBinary<32>;
    "height": number;
};
export type I3qklfjubrljqh = {
    "owner": SS58String;
    "issuer": SS58String;
    "admin": SS58String;
    "freezer": SS58String;
    "supply": bigint;
    "deposit": bigint;
    "min_balance": bigint;
    "is_sufficient": boolean;
    "accounts": number;
    "sufficients": number;
    "approvals": number;
    "status": Anonymize<I3sd59779ndgs3>;
};
export type I3sd59779ndgs3 = AnonymousEnum<{
    "Live": undefined;
    "Frozen": undefined;
    "Destroying": undefined;
}>;
export type Iag3f1hum3p4c8 = {
    "balance": bigint;
    "status": Anonymize<Icvjt1ogfma62c>;
    "reason": Anonymize<Ia34prnt421tan>;
};
export type Icvjt1ogfma62c = AnonymousEnum<{
    "Liquid": undefined;
    "Frozen": undefined;
    "Blocked": undefined;
}>;
export type Ia34prnt421tan = AnonymousEnum<{
    "Consumer": undefined;
    "Sufficient": undefined;
    "DepositHeld": bigint;
    "DepositRefunded": undefined;
    "DepositFrom": Anonymize<I95l2k9b1re95f>;
}>;
export type I95l2k9b1re95f = [SS58String, bigint];
export type I7svnfko10tq2e = [number, SS58String];
export type I4s6jkha20aoh0 = {
    "amount": bigint;
    "deposit": bigint;
};
export type I2brm5b9jij1st = [number, SS58String, SS58String];
export type I78s05f59eoi8b = {
    "deposit": bigint;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
    "is_frozen": boolean;
};
export type Ianufjuplcj6u4 = {
    "owner": SS58String;
    "issuer": SS58String;
    "admin": SS58String;
    "freezer": SS58String;
    "total_deposit": bigint;
    "free_holding": boolean;
    "items": number;
    "item_metadatas": number;
    "attributes": number;
    "is_frozen": boolean;
};
export type Id32h28hjj1tch = [SS58String, number, number];
export type I6ouflveob4eli = [SS58String, number];
export type I2mv9dvsaj3kcr = {
    "owner": SS58String;
    "approved"?: Anonymize<Ihfphjolmsqq1>;
    "is_frozen": boolean;
    "deposit": bigint;
};
export type I7781vnk0rm9eq = {
    "deposit": bigint;
    "data": Binary;
    "is_frozen": boolean;
};
export type Ie2iqtdb0stqo1 = [Binary, bigint];
export type I5irutptk105do = [number, Anonymize<I4arjljr6dpflb>, Binary];
export type Ic9nev69d8grv1 = [bigint, Anonymize<Ihfphjolmsqq1>];
export type I18m6a0sc4k7s9 = {
    "owner": SS58String;
    "owner_deposit": bigint;
    "items": number;
    "item_metadatas": number;
    "item_configs": number;
    "attributes": number;
};
export type Ic9iokm15iigt6 = {
    "owner": SS58String;
    "approvals": Anonymize<I4m61c4hi7qpuv>;
    "deposit": Anonymize<Ic262ibdoec56a>;
};
export type I4m61c4hi7qpuv = Array<Anonymize<I2bebbvuje4ra8>>;
export type I2bebbvuje4ra8 = [SS58String, Anonymize<I4arjljr6dpflb>];
export type I35m96p3u4vl0p = {
    "deposit": bigint;
    "data": Binary;
};
export type Iapmji0h53pmkn = {
    "deposit": Anonymize<I6e70ge7ubff75>;
    "data": Binary;
};
export type I6e70ge7ubff75 = {
    "account"?: Anonymize<Ihfphjolmsqq1>;
    "amount": bigint;
};
export type Idrr42svup341f = [Binary, Anonymize<I6e70ge7ubff75>];
export type I4ugih6gb4fmug = [number, Anonymize<I4arjljr6dpflb>, Anonymize<If3jjadhmug6qc>, Binary];
export type Idac0t49lnd4ls = {
    "desired_collection": number;
    "desired_item"?: Anonymize<I4arjljr6dpflb>;
    "price"?: Anonymize<I6oogc1jbmmi81>;
    "deadline": number;
};
export type I72ndo6phms8ik = {
    "settings": bigint;
    "max_supply"?: Anonymize<I4arjljr6dpflb>;
    "mint_settings": Anonymize<Ia3s8qquibn97v>;
};
export type Ia3s8qquibn97v = {
    "mint_type": Anonymize<I41p72ko7duf22>;
    "price"?: Anonymize<I35p85j063s0il>;
    "start_block"?: Anonymize<I4arjljr6dpflb>;
    "end_block"?: Anonymize<I4arjljr6dpflb>;
    "default_item_settings": bigint;
};
export type I41p72ko7duf22 = AnonymousEnum<{
    "Issuer": undefined;
    "Public": undefined;
    "HolderOf": number;
}>;
export type I35p85j063s0il = (bigint) | undefined;
export type I7rv8d2nr55kkq = [Anonymize<I4c0s5cioidn76>, SS58String];
export type I6lh06el3bdfqq = [Anonymize<I4c0s5cioidn76>, SS58String, SS58String];
export type In7a38730s6qs = {
    "base_block": Anonymize<I4q39t5hn830vp>;
    "max_block": Anonymize<I4q39t5hn830vp>;
    "per_class": Anonymize<I79te2qqsklnbd>;
};
export type I79te2qqsklnbd = {
    "normal": Anonymize<Ia78ef0a3p5958>;
    "operational": Anonymize<Ia78ef0a3p5958>;
    "mandatory": Anonymize<Ia78ef0a3p5958>;
};
export type Ia78ef0a3p5958 = {
    "base_extrinsic": Anonymize<I4q39t5hn830vp>;
    "max_extrinsic"?: Anonymize<Iasb8k6ash5mjn>;
    "max_total"?: Anonymize<Iasb8k6ash5mjn>;
    "reserved"?: Anonymize<Iasb8k6ash5mjn>;
};
export type Iasb8k6ash5mjn = (Anonymize<I4q39t5hn830vp>) | undefined;
export type If15el53dd76v9 = {
    "normal": number;
    "operational": number;
    "mandatory": number;
};
export type I9s0ave7t0vnrk = {
    "read": bigint;
    "write": bigint;
};
export type Ic6nglu2db2c36 = {
    "spec_name": string;
    "impl_name": string;
    "authoring_version": number;
    "spec_version": number;
    "impl_version": number;
    "apis": Anonymize<Ic9hg6pp5pkea5>;
    "transaction_version": number;
    "state_version": number;
};
export type Ic9hg6pp5pkea5 = Array<Anonymize<I85u3mm1me217a>>;
export type I85u3mm1me217a = [FixedSizeBinary<8>, number];
export type Iekve0i6djpd9f = AnonymousEnum<{
    /**
     *Make some on-chain remark.
     *
     *Can be executed by every `origin`.
     */
    "remark": Anonymize<I8ofcg5rbj0g2c>;
    /**
     *Set the number of pages in the WebAssembly environment's heap.
     */
    "set_heap_pages": Anonymize<I4adgbll7gku4i>;
    /**
     *Set the new runtime code.
     */
    "set_code": Anonymize<I6pjjpfvhvcfru>;
    /**
     *Set the new runtime code without doing any checks of the given `code`.
     *
     *Note that runtime upgrades will not run if this is called with a not-increasing spec
     *version!
     */
    "set_code_without_checks": Anonymize<I6pjjpfvhvcfru>;
    /**
     *Set some items of storage.
     */
    "set_storage": Anonymize<I9pj91mj79qekl>;
    /**
     *Kill some items from storage.
     */
    "kill_storage": Anonymize<I39uah9nss64h9>;
    /**
     *Kill all storage items with a key that starts with the given prefix.
     *
     ***NOTE:** We rely on the Root origin to provide us the number of subkeys under
     *the prefix we are removing to accurately calculate the weight of this function.
     */
    "kill_prefix": Anonymize<Ik64dknsq7k08>;
    /**
     *Make some on-chain remark and emit event.
     */
    "remark_with_event": Anonymize<I8ofcg5rbj0g2c>;
    /**
     *Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied
     *later.
     *
     *This call requires Root origin.
     */
    "authorize_upgrade": Anonymize<Ib51vk42m1po4n>;
    /**
     *Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied
     *later.
     *
     *WARNING: This authorizes an upgrade that will take place without any safety checks, for
     *example that the spec name remains the same and that the version number increases. Not
     *recommended for normal use. Use `authorize_upgrade` instead.
     *
     *This call requires Root origin.
     */
    "authorize_upgrade_without_checks": Anonymize<Ib51vk42m1po4n>;
    /**
     *Provide the preimage (runtime binary) `code` for an upgrade that has been authorized.
     *
     *If the authorization required a version check, this call will ensure the spec name
     *remains unchanged and that the spec version has increased.
     *
     *Depending on the runtime's `OnSetCode` configuration, this function may directly apply
     *the new `code` in the same block or attempt to schedule the upgrade.
     *
     *All origins are allowed.
     */
    "apply_authorized_upgrade": Anonymize<I6pjjpfvhvcfru>;
}>;
export type I8ofcg5rbj0g2c = {
    "remark": Binary;
};
export type I4adgbll7gku4i = {
    "pages": bigint;
};
export type I6pjjpfvhvcfru = {
    "code": Binary;
};
export type I9pj91mj79qekl = {
    "items": Anonymize<I6pi5ou8r1hblk>;
};
export type I6pi5ou8r1hblk = Array<Anonymize<Idkbvh6dahk1v7>>;
export type Idkbvh6dahk1v7 = FixedSizeArray<2, Binary>;
export type I39uah9nss64h9 = {
    "keys": Anonymize<Itom7fk49o0c9>;
};
export type Ik64dknsq7k08 = {
    "prefix": Binary;
    "subkeys": number;
};
export type Ib51vk42m1po4n = {
    "code_hash": FixedSizeBinary<32>;
};
export type I3jmip7qjlcqot = AnonymousEnum<{
    /**
     *Set the current validation data.
     *
     *This should be invoked exactly once per block. It will panic at the finalization
     *phase if the call was not invoked.
     *
     *The dispatch origin for this call must be `Inherent`
     *
     *As a side effect, this function upgrades the current validation function
     *if the appropriate time has come.
     */
    "set_validation_data": Anonymize<I60v7bikk54tpu>;
    "sudo_send_upward_message": Anonymize<Ifpj261e8s63m3>;
    /**
     *Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied
     *later.
     *
     *The `check_version` parameter sets a boolean flag for whether or not the runtime's spec
     *version and name should be verified on upgrade. Since the authorization only has a hash,
     *it cannot actually perform the verification.
     *
     *This call requires Root origin.
     */
    "authorize_upgrade": Anonymize<Ibgl04rn6nbfm6>;
    /**
     *Provide the preimage (runtime binary) `code` for an upgrade that has been authorized.
     *
     *If the authorization required a version check, this call will ensure the spec name
     *remains unchanged and that the spec version has increased.
     *
     *Note that this function will not apply the new `code`, but only attempt to schedule the
     *upgrade with the Relay Chain.
     *
     *All origins are allowed.
     */
    "enact_authorized_upgrade": Anonymize<I6pjjpfvhvcfru>;
}>;
export type I60v7bikk54tpu = {
    "data": Anonymize<I1c673c4up9l62>;
};
export type I1c673c4up9l62 = {
    "validation_data": Anonymize<Ifn6q3equiq9qi>;
    "relay_chain_state": Anonymize<Itom7fk49o0c9>;
    "downward_messages": Anonymize<I6ljjd4b5fa4ov>;
    "horizontal_messages": Anonymize<I2pf0b05mc7sdr>;
};
export type I6ljjd4b5fa4ov = Array<Anonymize<I60847k37jfcc6>>;
export type I60847k37jfcc6 = {
    "sent_at": number;
    "msg": Binary;
};
export type I2pf0b05mc7sdr = Array<Anonymize<I9hvej6h53dqj0>>;
export type I9hvej6h53dqj0 = [number, Anonymize<Iev3u09i2vqn93>];
export type Iev3u09i2vqn93 = Array<Anonymize<I409qo0sfkbh16>>;
export type I409qo0sfkbh16 = {
    "sent_at": number;
    "data": Binary;
};
export type Ifpj261e8s63m3 = {
    "message": Binary;
};
export type I7d75gqfg6jh9c = AnonymousEnum<{
    /**
     *Set the current time.
     *
     *This call should be invoked exactly once per block. It will panic at the finalization
     *phase, if this call hasn't been invoked by that time.
     *
     *The timestamp should be greater than the previous one by the amount specified by
     *[`Config::MinimumPeriod`].
     *
     *The dispatch origin for this call must be _None_.
     *
     *This dispatch class is _Mandatory_ to ensure it gets executed in the block. Be aware
     *that changing the complexity of this call could result exhausting the resources in a
     *block to execute any other calls.
     *
     *## Complexity
     *- `O(1)` (Note that implementations of `OnTimestampSet` must also be `O(1)`)
     *- 1 storage read and 1 storage mutation (codec `O(1)` because of `DidUpdate::take` in
     *  `on_finalize`)
     *- 1 event handler `on_timestamp_set`. Must be `O(1)`.
     */
    "set": Anonymize<Idcr6u6361oad9>;
}>;
export type Idcr6u6361oad9 = {
    "now": bigint;
};
export type I9svldsp29mh87 = AnonymousEnum<{
    /**
     *Transfer some liquid free balance to another account.
     *
     *`transfer_allow_death` will set the `FreeBalance` of the sender and receiver.
     *If the sender's account is below the existential deposit as a result
     *of the transfer, the account will be reaped.
     *
     *The dispatch origin for this call must be `Signed` by the transactor.
     */
    "transfer_allow_death": Anonymize<I4ktuaksf5i1gk>;
    /**
     *Exactly as `transfer_allow_death`, except the origin must be root and the source account
     *may be specified.
     */
    "force_transfer": Anonymize<I9bqtpv2ii35mp>;
    /**
     *Same as the [`transfer_allow_death`] call, but with a check that the transfer will not
     *kill the origin account.
     *
     *99% of the time you want [`transfer_allow_death`] instead.
     *
     *[`transfer_allow_death`]: struct.Pallet.html#method.transfer
     */
    "transfer_keep_alive": Anonymize<I4ktuaksf5i1gk>;
    /**
     *Transfer the entire transferable balance from the caller account.
     *
     *NOTE: This function only attempts to transfer _transferable_ balances. This means that
     *any locked, reserved, or existential deposits (when `keep_alive` is `true`), will not be
     *transferred by this function. To ensure that this function results in a killed account,
     *you might need to prepare the account by removing any reference counters, storage
     *deposits, etc...
     *
     *The dispatch origin of this call must be Signed.
     *
     *- `dest`: The recipient of the transfer.
     *- `keep_alive`: A boolean to determine if the `transfer_all` operation should send all
     *  of the funds the account has, causing the sender account to be killed (false), or
     *  transfer everything except at least the existential deposit, which will guarantee to
     *  keep the sender account alive (true).
     */
    "transfer_all": Anonymize<I9j7pagd6d4bda>;
    /**
     *Unreserve some balance from a user by force.
     *
     *Can only be called by ROOT.
     */
    "force_unreserve": Anonymize<I2h9pmio37r7fb>;
    /**
     *Upgrade a specified account.
     *
     *- `origin`: Must be `Signed`.
     *- `who`: The account to be upgraded.
     *
     *This will waive the transaction fee if at least all but 10% of the accounts needed to
     *be upgraded. (We let some not have to be upgraded just in order to allow for the
     *possibility of churn).
     */
    "upgrade_accounts": Anonymize<Ibmr18suc9ikh9>;
    /**
     *Set the regular balance of a given account.
     *
     *The dispatch origin for this call is `root`.
     */
    "force_set_balance": Anonymize<I9iq22t0burs89>;
    /**
     *Adjust the total issuance in a saturating way.
     *
     *Can only be called by root and always needs a positive `delta`.
     *
     *# Example
     */
    "force_adjust_total_issuance": Anonymize<I5u8olqbbvfnvf>;
    /**
     *Burn the specified liquid free balance from the origin account.
     *
     *If the origin's account ends up below the existential deposit as a result
     *of the burn and `keep_alive` is false, the account will be reaped.
     *
     *Unlike sending funds to a _burn_ address, which merely makes the funds inaccessible,
     *this `burn` operation will reduce total issuance by the amount _burned_.
     */
    "burn": Anonymize<I5utcetro501ir>;
}>;
export type I4ktuaksf5i1gk = {
    "dest": MultiAddress;
    "value": bigint;
};
export type MultiAddress = Enum<{
    "Id": SS58String;
    "Index": undefined;
    "Raw": Binary;
    "Address32": FixedSizeBinary<32>;
    "Address20": FixedSizeBinary<20>;
}>;
export declare const MultiAddress: GetEnum<MultiAddress>;
export type I9bqtpv2ii35mp = {
    "source": MultiAddress;
    "dest": MultiAddress;
    "value": bigint;
};
export type I9j7pagd6d4bda = {
    "dest": MultiAddress;
    "keep_alive": boolean;
};
export type I2h9pmio37r7fb = {
    "who": MultiAddress;
    "amount": bigint;
};
export type Ibmr18suc9ikh9 = {
    "who": Anonymize<Ia2lhg7l2hilo3>;
};
export type I9iq22t0burs89 = {
    "who": MultiAddress;
    "new_free": bigint;
};
export type I5u8olqbbvfnvf = {
    "direction": BalancesAdjustmentDirection;
    "delta": bigint;
};
export type BalancesAdjustmentDirection = Enum<{
    "Increase": undefined;
    "Decrease": undefined;
}>;
export declare const BalancesAdjustmentDirection: GetEnum<BalancesAdjustmentDirection>;
export type I5utcetro501ir = {
    "value": bigint;
    "keep_alive": boolean;
};
export type Icgf8vmtkbnu4u = AnonymousEnum<{
    /**
     *Unlock any vested funds of the sender account.
     *
     *The dispatch origin for this call must be _Signed_ and the sender must have funds still
     *locked under this pallet.
     *
     *Emits either `VestingCompleted` or `VestingUpdated`.
     *
     *## Complexity
     *- `O(1)`.
     */
    "vest": undefined;
    /**
     *Unlock any vested funds of a `target` account.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `target`: The account whose vested funds should be unlocked. Must have funds still
     *locked under this pallet.
     *
     *Emits either `VestingCompleted` or `VestingUpdated`.
     *
     *## Complexity
     *- `O(1)`.
     */
    "vest_other": Anonymize<Id9uqtigc0il3v>;
    /**
     *Create a vested transfer.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `target`: The account receiving the vested funds.
     *- `schedule`: The vesting schedule attached to the transfer.
     *
     *Emits `VestingCreated`.
     *
     *NOTE: This will unlock all schedules through the current block.
     *
     *## Complexity
     *- `O(1)`.
     */
    "vested_transfer": Anonymize<Iaa2o6cgjdpdn5>;
    /**
     *Force a vested transfer.
     *
     *The dispatch origin for this call must be _Root_.
     *
     *- `source`: The account whose funds should be transferred.
     *- `target`: The account that should be transferred the vested funds.
     *- `schedule`: The vesting schedule attached to the transfer.
     *
     *Emits `VestingCreated`.
     *
     *NOTE: This will unlock all schedules through the current block.
     *
     *## Complexity
     *- `O(1)`.
     */
    "force_vested_transfer": Anonymize<Iam6hrl7ptd85l>;
    /**
     *Merge two vesting schedules together, creating a new vesting schedule that unlocks over
     *the highest possible start and end blocks. If both schedules have already started the
     *current block will be used as the schedule start; with the caveat that if one schedule
     *is finished by the current block, the other will be treated as the new merged schedule,
     *unmodified.
     *
     *NOTE: If `schedule1_index == schedule2_index` this is a no-op.
     *NOTE: This will unlock all schedules through the current block prior to merging.
     *NOTE: If both schedules have ended by the current block, no new schedule will be created
     *and both will be removed.
     *
     *Merged schedule attributes:
     *- `starting_block`: `MAX(schedule1.starting_block, scheduled2.starting_block,
     *  current_block)`.
     *- `ending_block`: `MAX(schedule1.ending_block, schedule2.ending_block)`.
     *- `locked`: `schedule1.locked_at(current_block) + schedule2.locked_at(current_block)`.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `schedule1_index`: index of the first schedule to merge.
     *- `schedule2_index`: index of the second schedule to merge.
     */
    "merge_schedules": Anonymize<Ict9ivhr2c5hv0>;
    /**
     *Force remove a vesting schedule
     *
     *The dispatch origin for this call must be _Root_.
     *
     *- `target`: An account that has a vesting schedule
     *- `schedule_index`: The vesting schedule index that should be removed
     */
    "force_remove_vesting_schedule": Anonymize<I8t4vv03357lk9>;
}>;
export type Id9uqtigc0il3v = {
    "target": MultiAddress;
};
export type Iaa2o6cgjdpdn5 = {
    "target": MultiAddress;
    "schedule": Anonymize<I4aro1m78pdrtt>;
};
export type Iam6hrl7ptd85l = {
    "source": MultiAddress;
    "target": MultiAddress;
    "schedule": Anonymize<I4aro1m78pdrtt>;
};
export type Ict9ivhr2c5hv0 = {
    "schedule1_index": number;
    "schedule2_index": number;
};
export type I8t4vv03357lk9 = {
    "target": MultiAddress;
    "schedule_index": number;
};
export type I9dpq5287dur8b = AnonymousEnum<{
    /**
     *Set the list of invulnerable (fixed) collators. These collators must do some
     *preparation, namely to have registered session keys.
     *
     *The call will remove any accounts that have not registered keys from the set. That is,
     *it is non-atomic; the caller accepts all `AccountId`s passed in `new` _individually_ as
     *acceptable Invulnerables, and is not proposing a _set_ of new Invulnerables.
     *
     *This call does not maintain mutual exclusivity of `Invulnerables` and `Candidates`. It
     *is recommended to use a batch of `add_invulnerable` and `remove_invulnerable` instead. A
     *`batch_all` can also be used to enforce atomicity. If any candidates are included in
     *`new`, they should be removed with `remove_invulnerable_candidate` after execution.
     *
     *Must be called by the `UpdateOrigin`.
     */
    "set_invulnerables": Anonymize<Ifccifqltb5obi>;
    /**
     *Set the ideal number of non-invulnerable collators. If lowering this number, then the
     *number of running collators could be higher than this figure. Aside from that edge case,
     *there should be no other way to have more candidates than the desired number.
     *
     *The origin for this call must be the `UpdateOrigin`.
     */
    "set_desired_candidates": Anonymize<Iadtsfv699cq8b>;
    /**
     *Set the candidacy bond amount.
     *
     *If the candidacy bond is increased by this call, all current candidates which have a
     *deposit lower than the new bond will be kicked from the list and get their deposits
     *back.
     *
     *The origin for this call must be the `UpdateOrigin`.
     */
    "set_candidacy_bond": Anonymize<Ialpmgmhr3gk5r>;
    /**
     *Register this account as a collator candidate. The account must (a) already have
     *registered session keys and (b) be able to reserve the `CandidacyBond`.
     *
     *This call is not available to `Invulnerable` collators.
     */
    "register_as_candidate": undefined;
    /**
     *Deregister `origin` as a collator candidate. Note that the collator can only leave on
     *session change. The `CandidacyBond` will be unreserved immediately.
     *
     *This call will fail if the total number of candidates would drop below
     *`MinEligibleCollators`.
     */
    "leave_intent": undefined;
    /**
     *Add a new account `who` to the list of `Invulnerables` collators. `who` must have
     *registered session keys. If `who` is a candidate, they will be removed.
     *
     *The origin for this call must be the `UpdateOrigin`.
     */
    "add_invulnerable": Anonymize<I4cbvqmqadhrea>;
    /**
     *Remove an account `who` from the list of `Invulnerables` collators. `Invulnerables` must
     *be sorted.
     *
     *The origin for this call must be the `UpdateOrigin`.
     */
    "remove_invulnerable": Anonymize<I4cbvqmqadhrea>;
    /**
     *Update the candidacy bond of collator candidate `origin` to a new amount `new_deposit`.
     *
     *Setting a `new_deposit` that is lower than the current deposit while `origin` is
     *occupying a top-`DesiredCandidates` slot is not allowed.
     *
     *This call will fail if `origin` is not a collator candidate, the updated bond is lower
     *than the minimum candidacy bond, and/or the amount cannot be reserved.
     */
    "update_bond": Anonymize<I3sdol54kg5jaq>;
    /**
     *The caller `origin` replaces a candidate `target` in the collator candidate list by
     *reserving `deposit`. The amount `deposit` reserved by the caller must be greater than
     *the existing bond of the target it is trying to replace.
     *
     *This call will fail if the caller is already a collator candidate or invulnerable, the
     *caller does not have registered session keys, the target is not a collator candidate,
     *and/or the `deposit` amount cannot be reserved.
     */
    "take_candidate_slot": Anonymize<I8fougodaj6di6>;
}>;
export type Ifccifqltb5obi = {
    "new": Anonymize<Ia2lhg7l2hilo3>;
};
export type Iadtsfv699cq8b = {
    "max": number;
};
export type Ialpmgmhr3gk5r = {
    "bond": bigint;
};
export type I3sdol54kg5jaq = {
    "new_deposit": bigint;
};
export type I8fougodaj6di6 = {
    "deposit": bigint;
    "target": SS58String;
};
export type I77dda7hps0u37 = AnonymousEnum<{
    /**
     *Sets the session key(s) of the function caller to `keys`.
     *Allows an account to set its session key prior to becoming a validator.
     *This doesn't take effect until the next session.
     *
     *The dispatch origin of this function must be signed.
     *
     *## Complexity
     *- `O(1)`. Actual cost depends on the number of length of `T::Keys::key_ids()` which is
     *  fixed.
     */
    "set_keys": Anonymize<I81vt5eq60l4b6>;
    /**
     *Removes any session key(s) of the function caller.
     *
     *This doesn't take effect until the next session.
     *
     *The dispatch origin of this function must be Signed and the account must be either be
     *convertible to a validator ID using the chain's typical addressing system (this usually
     *means being a controller account) or directly convertible into a validator ID (which
     *usually means being a stash account).
     *
     *## Complexity
     *- `O(1)` in number of key types. Actual cost depends on the number of length of
     *  `T::Keys::key_ids()` which is fixed.
     */
    "purge_keys": undefined;
}>;
export type I81vt5eq60l4b6 = {
    "keys": FixedSizeBinary<32>;
    "proof": Binary;
};
export type Ib7tahn20bvsep = AnonymousEnum<{
    /**
     *Suspends all XCM executions for the XCMP queue, regardless of the sender's origin.
     *
     *- `origin`: Must pass `ControllerOrigin`.
     */
    "suspend_xcm_execution": undefined;
    /**
     *Resumes all XCM executions for the XCMP queue.
     *
     *Note that this function doesn't change the status of the in/out bound channels.
     *
     *- `origin`: Must pass `ControllerOrigin`.
     */
    "resume_xcm_execution": undefined;
    /**
     *Overwrites the number of pages which must be in the queue for the other side to be
     *told to suspend their sending.
     *
     *- `origin`: Must pass `Root`.
     *- `new`: Desired value for `QueueConfigData.suspend_value`
     */
    "update_suspend_threshold": Anonymize<I3vh014cqgmrfd>;
    /**
     *Overwrites the number of pages which must be in the queue after which we drop any
     *further messages from the channel.
     *
     *- `origin`: Must pass `Root`.
     *- `new`: Desired value for `QueueConfigData.drop_threshold`
     */
    "update_drop_threshold": Anonymize<I3vh014cqgmrfd>;
    /**
     *Overwrites the number of pages which the queue must be reduced to before it signals
     *that message sending may recommence after it has been suspended.
     *
     *- `origin`: Must pass `Root`.
     *- `new`: Desired value for `QueueConfigData.resume_threshold`
     */
    "update_resume_threshold": Anonymize<I3vh014cqgmrfd>;
}>;
export type I3vh014cqgmrfd = {
    "new": number;
};
export type I9nbjvlrb9bp1g = AnonymousEnum<{
    "send": Anonymize<I9paqujeb1fpv6>;
    /**
     *Teleport some assets from the local chain to some destination chain.
     *
     ***This function is deprecated: Use `limited_teleport_assets` instead.**
     *
     *Fee payment on the destination side is made from the asset in the `assets` vector of
     *index `fee_asset_item`. The weight limit for fees is not provided and thus is unlimited,
     *with all fees taken as needed from the asset.
     *
     *- `origin`: Must be capable of withdrawing the `assets` and executing XCM.
     *- `dest`: Destination context for the assets. Will typically be `[Parent,
     *  Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
     *  relay to parachain.
     *- `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
     *  generally be an `AccountId32` value.
     *- `assets`: The assets to be withdrawn. This should include the assets used to pay the
     *  fee on the `dest` chain.
     *- `fee_asset_item`: The index into `assets` of the item which should be used to pay
     *  fees.
     */
    "teleport_assets": Anonymize<Iakevv83i18n4r>;
    /**
     *Transfer some assets from the local chain to the destination chain through their local,
     *destination or remote reserve.
     *
     *`assets` must have same reserve location and may not be teleportable to `dest`.
     * - `assets` have local reserve: transfer assets to sovereign account of destination
     *   chain and forward a notification XCM to `dest` to mint and deposit reserve-based
     *   assets to `beneficiary`.
     * - `assets` have destination reserve: burn local assets and forward a notification to
     *   `dest` chain to withdraw the reserve assets from this chain's sovereign account and
     *   deposit them to `beneficiary`.
     * - `assets` have remote reserve: burn local assets, forward XCM to reserve chain to move
     *   reserves from this chain's SA to `dest` chain's SA, and forward another XCM to `dest`
     *   to mint and deposit reserve-based assets to `beneficiary`.
     *
     ***This function is deprecated: Use `limited_reserve_transfer_assets` instead.**
     *
     *Fee payment on the destination side is made from the asset in the `assets` vector of
     *index `fee_asset_item`. The weight limit for fees is not provided and thus is unlimited,
     *with all fees taken as needed from the asset.
     *
     *- `origin`: Must be capable of withdrawing the `assets` and executing XCM.
     *- `dest`: Destination context for the assets. Will typically be `[Parent,
     *  Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
     *  relay to parachain.
     *- `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
     *  generally be an `AccountId32` value.
     *- `assets`: The assets to be withdrawn. This should include the assets used to pay the
     *  fee on the `dest` (and possibly reserve) chains.
     *- `fee_asset_item`: The index into `assets` of the item which should be used to pay
     *  fees.
     */
    "reserve_transfer_assets": Anonymize<Iakevv83i18n4r>;
    /**
     *Execute an XCM message from a local, signed, origin.
     *
     *An event is deposited indicating whether `msg` could be executed completely or only
     *partially.
     *
     *No more than `max_weight` will be used in its attempted execution. If this is less than
     *the maximum amount of weight that the message could take to be executed, then no
     *execution attempt will be made.
     */
    "execute": Anonymize<If2ssl12kcglhg>;
    /**
     *Extoll that a particular destination can be communicated with through a particular
     *version of XCM.
     *
     *- `origin`: Must be an origin specified by AdminOrigin.
     *- `location`: The destination that is being described.
     *- `xcm_version`: The latest version of XCM that `location` supports.
     */
    "force_xcm_version": Anonymize<Iabk8ljl5g8c86>;
    /**
     *Set a safe XCM version (the version that XCM should be encoded with if the most recent
     *version a destination can accept is unknown).
     *
     *- `origin`: Must be an origin specified by AdminOrigin.
     *- `maybe_xcm_version`: The default XCM encoding version, or `None` to disable.
     */
    "force_default_xcm_version": Anonymize<Ic76kfh5ebqkpl>;
    /**
     *Ask a location to notify us regarding their XCM version and any changes to it.
     *
     *- `origin`: Must be an origin specified by AdminOrigin.
     *- `location`: The location to which we should subscribe for XCM version notifications.
     */
    "force_subscribe_version_notify": Anonymize<Icrujen33bbibf>;
    /**
     *Require that a particular destination should no longer notify us regarding any XCM
     *version changes.
     *
     *- `origin`: Must be an origin specified by AdminOrigin.
     *- `location`: The location to which we are currently subscribed for XCM version
     *  notifications which we no longer desire.
     */
    "force_unsubscribe_version_notify": Anonymize<Icrujen33bbibf>;
    /**
     *Transfer some assets from the local chain to the destination chain through their local,
     *destination or remote reserve.
     *
     *`assets` must have same reserve location and may not be teleportable to `dest`.
     * - `assets` have local reserve: transfer assets to sovereign account of destination
     *   chain and forward a notification XCM to `dest` to mint and deposit reserve-based
     *   assets to `beneficiary`.
     * - `assets` have destination reserve: burn local assets and forward a notification to
     *   `dest` chain to withdraw the reserve assets from this chain's sovereign account and
     *   deposit them to `beneficiary`.
     * - `assets` have remote reserve: burn local assets, forward XCM to reserve chain to move
     *   reserves from this chain's SA to `dest` chain's SA, and forward another XCM to `dest`
     *   to mint and deposit reserve-based assets to `beneficiary`.
     *
     *Fee payment on the destination side is made from the asset in the `assets` vector of
     *index `fee_asset_item`, up to enough to pay for `weight_limit` of weight. If more weight
     *is needed than `weight_limit`, then the operation will fail and the sent assets may be
     *at risk.
     *
     *- `origin`: Must be capable of withdrawing the `assets` and executing XCM.
     *- `dest`: Destination context for the assets. Will typically be `[Parent,
     *  Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
     *  relay to parachain.
     *- `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
     *  generally be an `AccountId32` value.
     *- `assets`: The assets to be withdrawn. This should include the assets used to pay the
     *  fee on the `dest` (and possibly reserve) chains.
     *- `fee_asset_item`: The index into `assets` of the item which should be used to pay
     *  fees.
     *- `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
     */
    "limited_reserve_transfer_assets": Anonymize<I5gi8h3e5lkbeq>;
    /**
     *Teleport some assets from the local chain to some destination chain.
     *
     *Fee payment on the destination side is made from the asset in the `assets` vector of
     *index `fee_asset_item`, up to enough to pay for `weight_limit` of weight. If more weight
     *is needed than `weight_limit`, then the operation will fail and the sent assets may be
     *at risk.
     *
     *- `origin`: Must be capable of withdrawing the `assets` and executing XCM.
     *- `dest`: Destination context for the assets. Will typically be `[Parent,
     *  Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
     *  relay to parachain.
     *- `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
     *  generally be an `AccountId32` value.
     *- `assets`: The assets to be withdrawn. This should include the assets used to pay the
     *  fee on the `dest` chain.
     *- `fee_asset_item`: The index into `assets` of the item which should be used to pay
     *  fees.
     *- `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
     */
    "limited_teleport_assets": Anonymize<I5gi8h3e5lkbeq>;
    /**
     *Set or unset the global suspension state of the XCM executor.
     *
     *- `origin`: Must be an origin specified by AdminOrigin.
     *- `suspended`: `true` to suspend, `false` to resume.
     */
    "force_suspension": Anonymize<Ibgm4rnf22lal1>;
    /**
     *Transfer some assets from the local chain to the destination chain through their local,
     *destination or remote reserve, or through teleports.
     *
     *Fee payment on the destination side is made from the asset in the `assets` vector of
     *index `fee_asset_item` (hence referred to as `fees`), up to enough to pay for
     *`weight_limit` of weight. If more weight is needed than `weight_limit`, then the
     *operation will fail and the sent assets may be at risk.
     *
     *`assets` (excluding `fees`) must have same reserve location or otherwise be teleportable
     *to `dest`, no limitations imposed on `fees`.
     * - for local reserve: transfer assets to sovereign account of destination chain and
     *   forward a notification XCM to `dest` to mint and deposit reserve-based assets to
     *   `beneficiary`.
     * - for destination reserve: burn local assets and forward a notification to `dest` chain
     *   to withdraw the reserve assets from this chain's sovereign account and deposit them
     *   to `beneficiary`.
     * - for remote reserve: burn local assets, forward XCM to reserve chain to move reserves
     *   from this chain's SA to `dest` chain's SA, and forward another XCM to `dest` to mint
     *   and deposit reserve-based assets to `beneficiary`.
     * - for teleports: burn local assets and forward XCM to `dest` chain to mint/teleport
     *   assets and deposit them to `beneficiary`.
     *
     *- `origin`: Must be capable of withdrawing the `assets` and executing XCM.
     *- `dest`: Destination context for the assets. Will typically be `X2(Parent,
     *  Parachain(..))` to send from parachain to parachain, or `X1(Parachain(..))` to send
     *  from relay to parachain.
     *- `beneficiary`: A beneficiary location for the assets in the context of `dest`. Will
     *  generally be an `AccountId32` value.
     *- `assets`: The assets to be withdrawn. This should include the assets used to pay the
     *  fee on the `dest` (and possibly reserve) chains.
     *- `fee_asset_item`: The index into `assets` of the item which should be used to pay
     *  fees.
     *- `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
     */
    "transfer_assets": Anonymize<I5gi8h3e5lkbeq>;
    /**
     *Claims assets trapped on this pallet because of leftover assets during XCM execution.
     *
     *- `origin`: Anyone can call this extrinsic.
     *- `assets`: The exact assets that were trapped. Use the version to specify what version
     *was the latest when they were trapped.
     *- `beneficiary`: The location/account where the claimed assets will be deposited.
     */
    "claim_assets": Anonymize<I8mmaab8je28oo>;
    /**
     *Transfer assets from the local chain to the destination chain using explicit transfer
     *types for assets and fees.
     *
     *`assets` must have same reserve location or may be teleportable to `dest`. Caller must
     *provide the `assets_transfer_type` to be used for `assets`:
     * - `TransferType::LocalReserve`: transfer assets to sovereign account of destination
     *   chain and forward a notification XCM to `dest` to mint and deposit reserve-based
     *   assets to `beneficiary`.
     * - `TransferType::DestinationReserve`: burn local assets and forward a notification to
     *   `dest` chain to withdraw the reserve assets from this chain's sovereign account and
     *   deposit them to `beneficiary`.
     * - `TransferType::RemoteReserve(reserve)`: burn local assets, forward XCM to `reserve`
     *   chain to move reserves from this chain's SA to `dest` chain's SA, and forward another
     *   XCM to `dest` to mint and deposit reserve-based assets to `beneficiary`. Typically
     *   the remote `reserve` is Asset Hub.
     * - `TransferType::Teleport`: burn local assets and forward XCM to `dest` chain to
     *   mint/teleport assets and deposit them to `beneficiary`.
     *
     *On the destination chain, as well as any intermediary hops, `BuyExecution` is used to
     *buy execution using transferred `assets` identified by `remote_fees_id`.
     *Make sure enough of the specified `remote_fees_id` asset is included in the given list
     *of `assets`. `remote_fees_id` should be enough to pay for `weight_limit`. If more weight
     *is needed than `weight_limit`, then the operation will fail and the sent assets may be
     *at risk.
     *
     *`remote_fees_id` may use different transfer type than rest of `assets` and can be
     *specified through `fees_transfer_type`.
     *
     *The caller needs to specify what should happen to the transferred assets once they reach
     *the `dest` chain. This is done through the `custom_xcm_on_dest` parameter, which
     *contains the instructions to execute on `dest` as a final step.
     *  This is usually as simple as:
     *  `Xcm(vec![DepositAsset { assets: Wild(AllCounted(assets.len())), beneficiary }])`,
     *  but could be something more exotic like sending the `assets` even further.
     *
     *- `origin`: Must be capable of withdrawing the `assets` and executing XCM.
     *- `dest`: Destination context for the assets. Will typically be `[Parent,
     *  Parachain(..)]` to send from parachain to parachain, or `[Parachain(..)]` to send from
     *  relay to parachain, or `(parents: 2, (GlobalConsensus(..), ..))` to send from
     *  parachain across a bridge to another ecosystem destination.
     *- `assets`: The assets to be withdrawn. This should include the assets used to pay the
     *  fee on the `dest` (and possibly reserve) chains.
     *- `assets_transfer_type`: The XCM `TransferType` used to transfer the `assets`.
     *- `remote_fees_id`: One of the included `assets` to be used to pay fees.
     *- `fees_transfer_type`: The XCM `TransferType` used to transfer the `fees` assets.
     *- `custom_xcm_on_dest`: The XCM to be executed on `dest` chain as the last step of the
     *  transfer, which also determines what happens to the assets on the destination chain.
     *- `weight_limit`: The remote-side weight limit, if any, for the XCM fee purchase.
     */
    "transfer_assets_using_type_and_then": Anonymize<I6r0pr82pbiftt>;
}>;
export type I9paqujeb1fpv6 = {
    "dest": XcmVersionedLocation;
    "message": XcmVersionedXcm;
};
export type XcmVersionedXcm = Enum<{
    "V2": Anonymize<Iemqgk0vect4v7>;
    "V3": Anonymize<Ianvng4e08j9ii>;
    "V4": Anonymize<Iegrepoo0c1jc5>;
}>;
export declare const XcmVersionedXcm: GetEnum<XcmVersionedXcm>;
export type Iemqgk0vect4v7 = Array<XcmV2Instruction>;
export type XcmV2Instruction = Enum<{
    "WithdrawAsset": Anonymize<I2sllmucln1iic>;
    "ReserveAssetDeposited": Anonymize<I2sllmucln1iic>;
    "ReceiveTeleportedAsset": Anonymize<I2sllmucln1iic>;
    "QueryResponse": Anonymize<I1n70k431nr92>;
    "TransferAsset": Anonymize<I800n35601gllq>;
    "TransferReserveAsset": Anonymize<I4ahfnfo1h39ng>;
    "Transact": Anonymize<Icoi0hvjidego7>;
    "HrmpNewChannelOpenRequest": Anonymize<I5uhhrjqfuo4e5>;
    "HrmpChannelAccepted": Anonymize<Ifij4jam0o7sub>;
    "HrmpChannelClosing": Anonymize<Ieeb4svd9i8fji>;
    "ClearOrigin": undefined;
    "DescendOrigin": XcmV2MultilocationJunctions;
    "ReportError": Anonymize<I9ts0mtbeaq84a>;
    "DepositAsset": Anonymize<Ias146869ruhho>;
    "DepositReserveAsset": Anonymize<I1upba6ju0ujgo>;
    "ExchangeAsset": Anonymize<Id2jloidb259tk>;
    "InitiateReserveWithdraw": Anonymize<I4dks21gdu9pr2>;
    "InitiateTeleport": Anonymize<I4mu8vn87cfdeb>;
    "QueryHolding": Anonymize<Ib0pr3c4bd0b1s>;
    "BuyExecution": Anonymize<Id8o97c8tt042k>;
    "RefundSurplus": undefined;
    "SetErrorHandler": Anonymize<Iemqgk0vect4v7>;
    "SetAppendix": Anonymize<Iemqgk0vect4v7>;
    "ClearError": undefined;
    "ClaimAsset": Anonymize<I2i62b6lp2e74f>;
    "Trap": bigint;
    "SubscribeVersion": Anonymize<Ido2s48ntevurj>;
    "UnsubscribeVersion": undefined;
}>;
export declare const XcmV2Instruction: GetEnum<XcmV2Instruction>;
export type I1n70k431nr92 = {
    "query_id": bigint;
    "response": XcmV2Response;
    "max_weight": bigint;
};
export type I800n35601gllq = {
    "assets": Anonymize<I2sllmucln1iic>;
    "beneficiary": Anonymize<I4frqunb5hj2km>;
};
export type I4ahfnfo1h39ng = {
    "assets": Anonymize<I2sllmucln1iic>;
    "dest": Anonymize<I4frqunb5hj2km>;
    "xcm": Anonymize<Iemqgk0vect4v7>;
};
export type Icoi0hvjidego7 = {
    "origin_type": XcmV2OriginKind;
    "require_weight_at_most": bigint;
    "call": Binary;
};
export type I9ts0mtbeaq84a = {
    "query_id": bigint;
    "dest": Anonymize<I4frqunb5hj2km>;
    "max_response_weight": bigint;
};
export type Ias146869ruhho = {
    "assets": XcmV2MultiAssetFilter;
    "max_assets": number;
    "beneficiary": Anonymize<I4frqunb5hj2km>;
};
export type XcmV2MultiAssetFilter = Enum<{
    "Definite": Anonymize<I2sllmucln1iic>;
    "Wild": XcmV2MultiassetWildMultiAsset;
}>;
export declare const XcmV2MultiAssetFilter: GetEnum<XcmV2MultiAssetFilter>;
export type XcmV2MultiassetWildMultiAsset = Enum<{
    "All": undefined;
    "AllOf": Anonymize<I8ojnukqr6c3j6>;
}>;
export declare const XcmV2MultiassetWildMultiAsset: GetEnum<XcmV2MultiassetWildMultiAsset>;
export type I8ojnukqr6c3j6 = {
    "id": XcmV2MultiassetAssetId;
    "fun": XcmV2MultiassetWildFungibility;
};
export type I1upba6ju0ujgo = {
    "assets": XcmV2MultiAssetFilter;
    "max_assets": number;
    "dest": Anonymize<I4frqunb5hj2km>;
    "xcm": Anonymize<Iemqgk0vect4v7>;
};
export type Id2jloidb259tk = {
    "give": XcmV2MultiAssetFilter;
    "receive": Anonymize<I2sllmucln1iic>;
};
export type I4dks21gdu9pr2 = {
    "assets": XcmV2MultiAssetFilter;
    "reserve": Anonymize<I4frqunb5hj2km>;
    "xcm": Anonymize<Iemqgk0vect4v7>;
};
export type I4mu8vn87cfdeb = {
    "assets": XcmV2MultiAssetFilter;
    "dest": Anonymize<I4frqunb5hj2km>;
    "xcm": Anonymize<Iemqgk0vect4v7>;
};
export type Ib0pr3c4bd0b1s = {
    "query_id": bigint;
    "dest": Anonymize<I4frqunb5hj2km>;
    "assets": XcmV2MultiAssetFilter;
    "max_response_weight": bigint;
};
export type Id8o97c8tt042k = {
    "fees": Anonymize<Id8h647t880l31>;
    "weight_limit": XcmV2WeightLimit;
};
export type XcmV2WeightLimit = Enum<{
    "Unlimited": undefined;
    "Limited": bigint;
}>;
export declare const XcmV2WeightLimit: GetEnum<XcmV2WeightLimit>;
export type I2i62b6lp2e74f = {
    "assets": Anonymize<I2sllmucln1iic>;
    "ticket": Anonymize<I4frqunb5hj2km>;
};
export type Ido2s48ntevurj = {
    "query_id": bigint;
    "max_response_weight": bigint;
};
export type Ianvng4e08j9ii = Array<XcmV3Instruction>;
export type XcmV3Instruction = Enum<{
    "WithdrawAsset": Anonymize<Iai6dhqiq3bach>;
    "ReserveAssetDeposited": Anonymize<Iai6dhqiq3bach>;
    "ReceiveTeleportedAsset": Anonymize<Iai6dhqiq3bach>;
    "QueryResponse": Anonymize<I6g12ltekg2vaj>;
    "TransferAsset": Anonymize<I8d6ni89sh0qmn>;
    "TransferReserveAsset": Anonymize<Ib2euffogp56pp>;
    "Transact": Anonymize<I92p6l5cs3fr50>;
    "HrmpNewChannelOpenRequest": Anonymize<I5uhhrjqfuo4e5>;
    "HrmpChannelAccepted": Anonymize<Ifij4jam0o7sub>;
    "HrmpChannelClosing": Anonymize<Ieeb4svd9i8fji>;
    "ClearOrigin": undefined;
    "DescendOrigin": XcmV3Junctions;
    "ReportError": Anonymize<I4r3v6e91d1qbs>;
    "DepositAsset": Anonymize<Ia848euuv1lip6>;
    "DepositReserveAsset": Anonymize<I3m8e0mi6lq6fj>;
    "ExchangeAsset": Anonymize<Ich3d4125568vq>;
    "InitiateReserveWithdraw": Anonymize<I3k3ia72gehj6b>;
    "InitiateTeleport": Anonymize<I3m8e0mi6lq6fj>;
    "ReportHolding": Anonymize<I4qgd1h8m3umqc>;
    "BuyExecution": Anonymize<I9ff02md5rmeur>;
    "RefundSurplus": undefined;
    "SetErrorHandler": Anonymize<Ianvng4e08j9ii>;
    "SetAppendix": Anonymize<Ianvng4e08j9ii>;
    "ClearError": undefined;
    "ClaimAsset": Anonymize<I8pu3j74el68mi>;
    "Trap": bigint;
    "SubscribeVersion": Anonymize<Ieprdqqu7ildvr>;
    "UnsubscribeVersion": undefined;
    "BurnAsset": Anonymize<Iai6dhqiq3bach>;
    "ExpectAsset": Anonymize<Iai6dhqiq3bach>;
    "ExpectOrigin"?: Anonymize<Ia9cgf4r40b26h>;
    "ExpectError"?: Anonymize<I7sltvf8v2nure>;
    "ExpectTransactStatus": XcmV3MaybeErrorCode;
    "QueryPallet": Anonymize<Iba5bdbapp16oo>;
    "ExpectPallet": Anonymize<Id7mf37dkpgfjs>;
    "ReportTransactStatus": Anonymize<I4r3v6e91d1qbs>;
    "ClearTransactStatus": undefined;
    "UniversalOrigin": XcmV3Junction;
    "ExportMessage": Anonymize<I8up5nu6gcp077>;
    "LockAsset": Anonymize<I2ieo5vo1bi5a0>;
    "UnlockAsset": Anonymize<I3u52dm5pikv6l>;
    "NoteUnlockable": Anonymize<Idu2tro9aukpp8>;
    "RequestUnlock": Anonymize<Iarqpt33435e7r>;
    "SetFeesMode": Anonymize<I4nae9rsql8fa7>;
    "SetTopic": FixedSizeBinary<32>;
    "ClearTopic": undefined;
    "AliasOrigin": Anonymize<I4c0s5cioidn76>;
    "UnpaidExecution": Anonymize<I40d50jeai33oq>;
}>;
export declare const XcmV3Instruction: GetEnum<XcmV3Instruction>;
export type I6g12ltekg2vaj = {
    "query_id": bigint;
    "response": XcmV3Response;
    "max_weight": Anonymize<I4q39t5hn830vp>;
    "querier"?: Anonymize<Ia9cgf4r40b26h>;
};
export type I8d6ni89sh0qmn = {
    "assets": Anonymize<Iai6dhqiq3bach>;
    "beneficiary": Anonymize<I4c0s5cioidn76>;
};
export type Ib2euffogp56pp = {
    "assets": Anonymize<Iai6dhqiq3bach>;
    "dest": Anonymize<I4c0s5cioidn76>;
    "xcm": Anonymize<Ianvng4e08j9ii>;
};
export type Ia848euuv1lip6 = {
    "assets": XcmV3MultiassetMultiAssetFilter;
    "beneficiary": Anonymize<I4c0s5cioidn76>;
};
export type XcmV3MultiassetMultiAssetFilter = Enum<{
    "Definite": Anonymize<Iai6dhqiq3bach>;
    "Wild": XcmV3MultiassetWildMultiAsset;
}>;
export declare const XcmV3MultiassetMultiAssetFilter: GetEnum<XcmV3MultiassetMultiAssetFilter>;
export type XcmV3MultiassetWildMultiAsset = Enum<{
    "All": undefined;
    "AllOf": Anonymize<Iemi0m9547o42b>;
    "AllCounted": number;
    "AllOfCounted": Anonymize<I2ii8gjc2m1ca3>;
}>;
export declare const XcmV3MultiassetWildMultiAsset: GetEnum<XcmV3MultiassetWildMultiAsset>;
export type Iemi0m9547o42b = {
    "id": XcmV3MultiassetAssetId;
    "fun": XcmV2MultiassetWildFungibility;
};
export type I2ii8gjc2m1ca3 = {
    "id": XcmV3MultiassetAssetId;
    "fun": XcmV2MultiassetWildFungibility;
    "count": number;
};
export type I3m8e0mi6lq6fj = {
    "assets": XcmV3MultiassetMultiAssetFilter;
    "dest": Anonymize<I4c0s5cioidn76>;
    "xcm": Anonymize<Ianvng4e08j9ii>;
};
export type Ich3d4125568vq = {
    "give": XcmV3MultiassetMultiAssetFilter;
    "want": Anonymize<Iai6dhqiq3bach>;
    "maximal": boolean;
};
export type I3k3ia72gehj6b = {
    "assets": XcmV3MultiassetMultiAssetFilter;
    "reserve": Anonymize<I4c0s5cioidn76>;
    "xcm": Anonymize<Ianvng4e08j9ii>;
};
export type I4qgd1h8m3umqc = {
    "response_info": Anonymize<I4r3v6e91d1qbs>;
    "assets": XcmV3MultiassetMultiAssetFilter;
};
export type I9ff02md5rmeur = {
    "fees": Anonymize<Idcm24504c8bkk>;
    "weight_limit": XcmV3WeightLimit;
};
export type I8pu3j74el68mi = {
    "assets": Anonymize<Iai6dhqiq3bach>;
    "ticket": Anonymize<I4c0s5cioidn76>;
};
export type I8up5nu6gcp077 = {
    "network": XcmV3JunctionNetworkId;
    "destination": XcmV3Junctions;
    "xcm": Anonymize<Ianvng4e08j9ii>;
};
export type I2ieo5vo1bi5a0 = {
    "asset": Anonymize<Idcm24504c8bkk>;
    "unlocker": Anonymize<I4c0s5cioidn76>;
};
export type I3u52dm5pikv6l = {
    "asset": Anonymize<Idcm24504c8bkk>;
    "target": Anonymize<I4c0s5cioidn76>;
};
export type Idu2tro9aukpp8 = {
    "asset": Anonymize<Idcm24504c8bkk>;
    "owner": Anonymize<I4c0s5cioidn76>;
};
export type Iarqpt33435e7r = {
    "asset": Anonymize<Idcm24504c8bkk>;
    "locker": Anonymize<I4c0s5cioidn76>;
};
export type Iakevv83i18n4r = {
    "dest": XcmVersionedLocation;
    "beneficiary": XcmVersionedLocation;
    "assets": XcmVersionedAssets;
    "fee_asset_item": number;
};
export type If2ssl12kcglhg = {
    "message": XcmVersionedXcm;
    "max_weight": Anonymize<I4q39t5hn830vp>;
};
export type Ic76kfh5ebqkpl = {
    "maybe_xcm_version"?: Anonymize<I4arjljr6dpflb>;
};
export type Icrujen33bbibf = {
    "location": XcmVersionedLocation;
};
export type I5gi8h3e5lkbeq = {
    "dest": XcmVersionedLocation;
    "beneficiary": XcmVersionedLocation;
    "assets": XcmVersionedAssets;
    "fee_asset_item": number;
    "weight_limit": XcmV3WeightLimit;
};
export type Ibgm4rnf22lal1 = {
    "suspended": boolean;
};
export type I8mmaab8je28oo = {
    "assets": XcmVersionedAssets;
    "beneficiary": XcmVersionedLocation;
};
export type I6r0pr82pbiftt = {
    "dest": XcmVersionedLocation;
    "assets": XcmVersionedAssets;
    "assets_transfer_type": Anonymize<Ifkg2rgjl54s88>;
    "remote_fees_id": XcmVersionedAssetId;
    "fees_transfer_type": Anonymize<Ifkg2rgjl54s88>;
    "custom_xcm_on_dest": XcmVersionedXcm;
    "weight_limit": XcmV3WeightLimit;
};
export type Ifkg2rgjl54s88 = AnonymousEnum<{
    "Teleport": undefined;
    "LocalReserve": undefined;
    "DestinationReserve": undefined;
    "RemoteReserve": XcmVersionedLocation;
}>;
export type I6epb28bkd5aqn = AnonymousEnum<{
    /**
     *Notification about congested bridge queue.
     */
    "report_bridge_status": Anonymize<Idlampfle3vh6q>;
}>;
export type Idlampfle3vh6q = {
    "bridge_id": FixedSizeBinary<32>;
    "is_congested": boolean;
};
export type Ic2uoe7jdksosp = AnonymousEnum<{
    /**
     *Remove a page which has no more messages remaining to be processed or is stale.
     */
    "reap_page": Anonymize<I40pqum1mu8qg3>;
    /**
     *Execute an overweight message.
     *
     *Temporary processing errors will be propagated whereas permanent errors are treated
     *as success condition.
     *
     *- `origin`: Must be `Signed`.
     *- `message_origin`: The origin from which the message to be executed arrived.
     *- `page`: The page in the queue in which the message to be executed is sitting.
     *- `index`: The index into the queue of the message to be executed.
     *- `weight_limit`: The maximum amount of weight allowed to be consumed in the execution
     *  of the message.
     *
     *Benchmark complexity considerations: O(index + weight_limit).
     */
    "execute_overweight": Anonymize<I1r4c2ghbtvjuc>;
}>;
export type I40pqum1mu8qg3 = {
    "message_origin": Anonymize<Iejeo53sea6n4q>;
    "page_index": number;
};
export type I1r4c2ghbtvjuc = {
    "message_origin": Anonymize<Iejeo53sea6n4q>;
    "page": number;
    "index": number;
    "weight_limit": Anonymize<I4q39t5hn830vp>;
};
export type I8ikgojd2kp4nr = AnonymousEnum<{
    /**
     *Send a batch of dispatch calls.
     *
     *May be called from any origin except `None`.
     *
     *- `calls`: The calls to be dispatched from the same origin. The number of call must not
     *  exceed the constant: `batched_calls_limit` (available in constant metadata).
     *
     *If origin is root then the calls are dispatched without checking origin filter. (This
     *includes bypassing `frame_system::Config::BaseCallFilter`).
     *
     *## Complexity
     *- O(C) where C is the number of calls to be batched.
     *
     *This will return `Ok` in all circumstances. To determine the success of the batch, an
     *event is deposited. If a call failed and the batch was interrupted, then the
     *`BatchInterrupted` event is deposited, along with the number of successful calls made
     *and the error of the failed call. If all were successful, then the `BatchCompleted`
     *event is deposited.
     */
    "batch": Anonymize<Ia6kc29epld8oe>;
    /**
     *Send a call through an indexed pseudonym of the sender.
     *
     *Filter from origin are passed along. The call will be dispatched with an origin which
     *use the same filter as the origin of this call.
     *
     *NOTE: If you need to ensure that any account-based filtering is not honored (i.e.
     *because you expect `proxy` to have been used prior in the call stack and you do not want
     *the call restrictions to apply to any sub-accounts), then use `as_multi_threshold_1`
     *in the Multisig pallet instead.
     *
     *NOTE: Prior to version *12, this was called `as_limited_sub`.
     *
     *The dispatch origin for this call must be _Signed_.
     */
    "as_derivative": Anonymize<Icjjfgkss9ab50>;
    /**
     *Send a batch of dispatch calls and atomically execute them.
     *The whole transaction will rollback and fail if any of the calls failed.
     *
     *May be called from any origin except `None`.
     *
     *- `calls`: The calls to be dispatched from the same origin. The number of call must not
     *  exceed the constant: `batched_calls_limit` (available in constant metadata).
     *
     *If origin is root then the calls are dispatched without checking origin filter. (This
     *includes bypassing `frame_system::Config::BaseCallFilter`).
     *
     *## Complexity
     *- O(C) where C is the number of calls to be batched.
     */
    "batch_all": Anonymize<Ia6kc29epld8oe>;
    /**
     *Dispatches a function call with a provided origin.
     *
     *The dispatch origin for this call must be _Root_.
     *
     *## Complexity
     *- O(1).
     */
    "dispatch_as": Anonymize<Ifabdf8qm932q0>;
    /**
     *Send a batch of dispatch calls.
     *Unlike `batch`, it allows errors and won't interrupt.
     *
     *May be called from any origin except `None`.
     *
     *- `calls`: The calls to be dispatched from the same origin. The number of call must not
     *  exceed the constant: `batched_calls_limit` (available in constant metadata).
     *
     *If origin is root then the calls are dispatch without checking origin filter. (This
     *includes bypassing `frame_system::Config::BaseCallFilter`).
     *
     *## Complexity
     *- O(C) where C is the number of calls to be batched.
     */
    "force_batch": Anonymize<Ia6kc29epld8oe>;
    /**
     *Dispatch a function call with a specified weight.
     *
     *This function does not check the weight of the call, and instead allows the
     *Root origin to specify the weight of the call.
     *
     *The dispatch origin for this call must be _Root_.
     */
    "with_weight": Anonymize<I4u9de6jls8otm>;
}>;
export type Ia6kc29epld8oe = {
    "calls": Anonymize<Ifhubbh45t5b6a>;
};
export type Ifhubbh45t5b6a = Array<TxCallData>;
export type Icjjfgkss9ab50 = {
    "index": number;
    "call": TxCallData;
};
export type Ifabdf8qm932q0 = {
    "as_origin": Anonymize<I48v5riethqckl>;
    "call": TxCallData;
};
export type I48v5riethqckl = AnonymousEnum<{
    "system": DispatchRawOrigin;
    "PolkadotXcm": XcmPalletOrigin;
    "CumulusXcm": Anonymize<I3in0d0lb61qi8>;
    "Void": undefined;
}>;
export type DispatchRawOrigin = Enum<{
    "Root": undefined;
    "Signed": SS58String;
    "None": undefined;
}>;
export declare const DispatchRawOrigin: GetEnum<DispatchRawOrigin>;
export type XcmPalletOrigin = Enum<{
    "Xcm": Anonymize<I4c0s5cioidn76>;
    "Response": Anonymize<I4c0s5cioidn76>;
}>;
export declare const XcmPalletOrigin: GetEnum<XcmPalletOrigin>;
export type I3in0d0lb61qi8 = AnonymousEnum<{
    "Relay": undefined;
    "SiblingParachain": number;
}>;
export type I4u9de6jls8otm = {
    "call": TxCallData;
    "weight": Anonymize<I4q39t5hn830vp>;
};
export type I2i3jnq078uco0 = AnonymousEnum<{
    /**
     *Immediately dispatch a multi-signature call using a single approval from the caller.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `other_signatories`: The accounts (other than the sender) who are part of the
     *multi-signature, but do not participate in the approval process.
     *- `call`: The call to be executed.
     *
     *Result is equivalent to the dispatched result.
     *
     *## Complexity
     *O(Z + C) where Z is the length of the call and C its execution weight.
     */
    "as_multi_threshold_1": Anonymize<I9rge57146rvbl>;
    /**
     *Register approval for a dispatch to be made from a deterministic composite account if
     *approved by a total of `threshold - 1` of `other_signatories`.
     *
     *If there are enough, then dispatch the call.
     *
     *Payment: `DepositBase` will be reserved if this is the first approval, plus
     *`threshold` times `DepositFactor`. It is returned once this dispatch happens or
     *is cancelled.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `threshold`: The total number of approvals for this dispatch before it is executed.
     *- `other_signatories`: The accounts (other than the sender) who can approve this
     *dispatch. May not be empty.
     *- `maybe_timepoint`: If this is the first approval, then this must be `None`. If it is
     *not the first approval, then it must be `Some`, with the timepoint (block number and
     *transaction index) of the first approval transaction.
     *- `call`: The call to be executed.
     *
     *NOTE: Unless this is the final approval, you will generally want to use
     *`approve_as_multi` instead, since it only requires a hash of the call.
     *
     *Result is equivalent to the dispatched result if `threshold` is exactly `1`. Otherwise
     *on success, result is `Ok` and the result from the interior call, if it was executed,
     *may be found in the deposited `MultisigExecuted` event.
     *
     *## Complexity
     *- `O(S + Z + Call)`.
     *- Up to one balance-reserve or unreserve operation.
     *- One passthrough operation, one insert, both `O(S)` where `S` is the number of
     *  signatories. `S` is capped by `MaxSignatories`, with weight being proportional.
     *- One call encode & hash, both of complexity `O(Z)` where `Z` is tx-len.
     *- One encode & hash, both of complexity `O(S)`.
     *- Up to one binary search and insert (`O(logS + S)`).
     *- I/O: 1 read `O(S)`, up to 1 mutate `O(S)`. Up to one remove.
     *- One event.
     *- The weight of the `call`.
     *- Storage: inserts one item, value size bounded by `MaxSignatories`, with a deposit
     *  taken for its lifetime of `DepositBase + threshold * DepositFactor`.
     */
    "as_multi": Anonymize<Id5a43kc4r5p31>;
    /**
     *Register approval for a dispatch to be made from a deterministic composite account if
     *approved by a total of `threshold - 1` of `other_signatories`.
     *
     *Payment: `DepositBase` will be reserved if this is the first approval, plus
     *`threshold` times `DepositFactor`. It is returned once this dispatch happens or
     *is cancelled.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `threshold`: The total number of approvals for this dispatch before it is executed.
     *- `other_signatories`: The accounts (other than the sender) who can approve this
     *dispatch. May not be empty.
     *- `maybe_timepoint`: If this is the first approval, then this must be `None`. If it is
     *not the first approval, then it must be `Some`, with the timepoint (block number and
     *transaction index) of the first approval transaction.
     *- `call_hash`: The hash of the call to be executed.
     *
     *NOTE: If this is the final approval, you will want to use `as_multi` instead.
     *
     *## Complexity
     *- `O(S)`.
     *- Up to one balance-reserve or unreserve operation.
     *- One passthrough operation, one insert, both `O(S)` where `S` is the number of
     *  signatories. `S` is capped by `MaxSignatories`, with weight being proportional.
     *- One encode & hash, both of complexity `O(S)`.
     *- Up to one binary search and insert (`O(logS + S)`).
     *- I/O: 1 read `O(S)`, up to 1 mutate `O(S)`. Up to one remove.
     *- One event.
     *- Storage: inserts one item, value size bounded by `MaxSignatories`, with a deposit
     *  taken for its lifetime of `DepositBase + threshold * DepositFactor`.
     */
    "approve_as_multi": Anonymize<Ideaemvoneh309>;
    /**
     *Cancel a pre-existing, on-going multisig transaction. Any deposit reserved previously
     *for this operation will be unreserved on success.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *- `threshold`: The total number of approvals for this dispatch before it is executed.
     *- `other_signatories`: The accounts (other than the sender) who can approve this
     *dispatch. May not be empty.
     *- `timepoint`: The timepoint (block number and transaction index) of the first approval
     *transaction for this dispatch.
     *- `call_hash`: The hash of the call to be executed.
     *
     *## Complexity
     *- `O(S)`.
     *- Up to one balance-reserve or unreserve operation.
     *- One passthrough operation, one insert, both `O(S)` where `S` is the number of
     *  signatories. `S` is capped by `MaxSignatories`, with weight being proportional.
     *- One encode & hash, both of complexity `O(S)`.
     *- One event.
     *- I/O: 1 read `O(S)`, one remove.
     *- Storage: removes one item.
     */
    "cancel_as_multi": Anonymize<I3d9o9d7epp66v>;
}>;
export type I9rge57146rvbl = {
    "other_signatories": Anonymize<Ia2lhg7l2hilo3>;
    "call": TxCallData;
};
export type Id5a43kc4r5p31 = {
    "threshold": number;
    "other_signatories": Anonymize<Ia2lhg7l2hilo3>;
    "maybe_timepoint"?: Anonymize<I95jfd8j5cr5eh>;
    "call": TxCallData;
    "max_weight": Anonymize<I4q39t5hn830vp>;
};
export type I95jfd8j5cr5eh = (Anonymize<Itvprrpb0nm3o>) | undefined;
export type Ideaemvoneh309 = {
    "threshold": number;
    "other_signatories": Anonymize<Ia2lhg7l2hilo3>;
    "maybe_timepoint"?: Anonymize<I95jfd8j5cr5eh>;
    "call_hash": FixedSizeBinary<32>;
    "max_weight": Anonymize<I4q39t5hn830vp>;
};
export type I3d9o9d7epp66v = {
    "threshold": number;
    "other_signatories": Anonymize<Ia2lhg7l2hilo3>;
    "timepoint": Anonymize<Itvprrpb0nm3o>;
    "call_hash": FixedSizeBinary<32>;
};
export type I6qfut29tv8are = AnonymousEnum<{
    /**
     *Dispatch the given `call` from an account that the sender is authorised for through
     *`add_proxy`.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *Parameters:
     *- `real`: The account that the proxy will make a call on behalf of.
     *- `force_proxy_type`: Specify the exact proxy type to be used and checked for this call.
     *- `call`: The call to be made by the `real` account.
     */
    "proxy": Anonymize<I3mbtn2eb315ar>;
    /**
     *Register a proxy account for the sender that is able to make calls on its behalf.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *Parameters:
     *- `proxy`: The account that the `caller` would like to make a proxy.
     *- `proxy_type`: The permissions allowed for this proxy account.
     *- `delay`: The announcement period required of the initial proxy. Will generally be
     *zero.
     */
    "add_proxy": Anonymize<Iovrcu9bfelfq>;
    /**
     *Unregister a proxy account for the sender.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *Parameters:
     *- `proxy`: The account that the `caller` would like to remove as a proxy.
     *- `proxy_type`: The permissions currently enabled for the removed proxy account.
     */
    "remove_proxy": Anonymize<Iovrcu9bfelfq>;
    /**
     *Unregister all proxy accounts for the sender.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *WARNING: This may be called on accounts created by `pure`, however if done, then
     *the unreserved fees will be inaccessible. **All access to this account will be lost.**
     */
    "remove_proxies": undefined;
    /**
     *Spawn a fresh new account that is guaranteed to be otherwise inaccessible, and
     *initialize it with a proxy of `proxy_type` for `origin` sender.
     *
     *Requires a `Signed` origin.
     *
     *- `proxy_type`: The type of the proxy that the sender will be registered as over the
     *new account. This will almost always be the most permissive `ProxyType` possible to
     *allow for maximum flexibility.
     *- `index`: A disambiguation index, in case this is called multiple times in the same
     *transaction (e.g. with `utility::batch`). Unless you're using `batch` you probably just
     *want to use `0`.
     *- `delay`: The announcement period required of the initial proxy. Will generally be
     *zero.
     *
     *Fails with `Duplicate` if this has already been called in this transaction, from the
     *same sender, with the same parameters.
     *
     *Fails if there are insufficient funds to pay for deposit.
     */
    "create_pure": Anonymize<Iefr8jgtgfk8um>;
    /**
     *Removes a previously spawned pure proxy.
     *
     *WARNING: **All access to this account will be lost.** Any funds held in it will be
     *inaccessible.
     *
     *Requires a `Signed` origin, and the sender account must have been created by a call to
     *`pure` with corresponding parameters.
     *
     *- `spawner`: The account that originally called `pure` to create this account.
     *- `index`: The disambiguation index originally passed to `pure`. Probably `0`.
     *- `proxy_type`: The proxy type originally passed to `pure`.
     *- `height`: The height of the chain when the call to `pure` was processed.
     *- `ext_index`: The extrinsic index in which the call to `pure` was processed.
     *
     *Fails with `NoPermission` in case the caller is not a previously created pure
     *account whose `pure` call has corresponding parameters.
     */
    "kill_pure": Anonymize<I3j05hul54uj7q>;
    /**
     *Publish the hash of a proxy-call that will be made in the future.
     *
     *This must be called some number of blocks before the corresponding `proxy` is attempted
     *if the delay associated with the proxy relationship is greater than zero.
     *
     *No more than `MaxPending` announcements may be made at any one time.
     *
     *This will take a deposit of `AnnouncementDepositFactor` as well as
     *`AnnouncementDepositBase` if there are no other pending announcements.
     *
     *The dispatch origin for this call must be _Signed_ and a proxy of `real`.
     *
     *Parameters:
     *- `real`: The account that the proxy will make a call on behalf of.
     *- `call_hash`: The hash of the call to be made by the `real` account.
     */
    "announce": Anonymize<I2eb501t8s6hsq>;
    /**
     *Remove a given announcement.
     *
     *May be called by a proxy account to remove a call they previously announced and return
     *the deposit.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *Parameters:
     *- `real`: The account that the proxy will make a call on behalf of.
     *- `call_hash`: The hash of the call to be made by the `real` account.
     */
    "remove_announcement": Anonymize<I2eb501t8s6hsq>;
    /**
     *Remove the given announcement of a delegate.
     *
     *May be called by a target (proxied) account to remove a call that one of their delegates
     *(`delegate`) has announced they want to execute. The deposit is returned.
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *Parameters:
     *- `delegate`: The account that previously announced the call.
     *- `call_hash`: The hash of the call to be made.
     */
    "reject_announcement": Anonymize<Ianmuoljk2sk1u>;
    /**
     *Dispatch the given `call` from an account that the sender is authorized for through
     *`add_proxy`.
     *
     *Removes any corresponding announcement(s).
     *
     *The dispatch origin for this call must be _Signed_.
     *
     *Parameters:
     *- `real`: The account that the proxy will make a call on behalf of.
     *- `force_proxy_type`: Specify the exact proxy type to be used and checked for this call.
     *- `call`: The call to be made by the `real` account.
     */
    "proxy_announced": Anonymize<Iem4jetr2c8nf8>;
}>;
export type I3mbtn2eb315ar = {
    "real": MultiAddress;
    "force_proxy_type"?: Anonymize<I7rk1n3vg3et43>;
    "call": TxCallData;
};
export type I7rk1n3vg3et43 = (Anonymize<I5ftepkjop3g1u>) | undefined;
export type Iovrcu9bfelfq = {
    "delegate": MultiAddress;
    "proxy_type": Anonymize<I5ftepkjop3g1u>;
    "delay": number;
};
export type Iefr8jgtgfk8um = {
    "proxy_type": Anonymize<I5ftepkjop3g1u>;
    "delay": number;
    "index": number;
};
export type I3j05hul54uj7q = {
    "spawner": MultiAddress;
    "proxy_type": Anonymize<I5ftepkjop3g1u>;
    "index": number;
    "height": number;
    "ext_index": number;
};
export type I2eb501t8s6hsq = {
    "real": MultiAddress;
    "call_hash": FixedSizeBinary<32>;
};
export type Ianmuoljk2sk1u = {
    "delegate": MultiAddress;
    "call_hash": FixedSizeBinary<32>;
};
export type Iem4jetr2c8nf8 = {
    "delegate": MultiAddress;
    "real": MultiAddress;
    "force_proxy_type"?: Anonymize<I7rk1n3vg3et43>;
    "call": TxCallData;
};
export type Ideusanoto4b1j = AnonymousEnum<{
    /**
     *Issue a new class of fungible assets from a public origin.
     *
     *This new asset class has no assets initially and its owner is the origin.
     *
     *The origin must conform to the configured `CreateOrigin` and have sufficient funds free.
     *
     *Funds of sender are reserved by `AssetDeposit`.
     *
     *Parameters:
     *- `id`: The identifier of the new asset. This must not be currently in use to identify
     *an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
     *- `admin`: The admin of this class of assets. The admin is the initial address of each
     *member of the asset class's admin team.
     *- `min_balance`: The minimum balance of this new asset that any single account must
     *have. If an account's balance is reduced below this, then it collapses to zero.
     *
     *Emits `Created` event when successful.
     *
     *Weight: `O(1)`
     */
    "create": Anonymize<Ic357tcepuvo5c>;
    /**
     *Issue a new class of fungible assets from a privileged origin.
     *
     *This new asset class has no assets initially.
     *
     *The origin must conform to `ForceOrigin`.
     *
     *Unlike `create`, no funds are reserved.
     *
     *- `id`: The identifier of the new asset. This must not be currently in use to identify
     *an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
     *- `owner`: The owner of this class of assets. The owner has full superuser permissions
     *over this asset, but may later change and configure the permissions using
     *`transfer_ownership` and `set_team`.
     *- `min_balance`: The minimum balance of this new asset that any single account must
     *have. If an account's balance is reduced below this, then it collapses to zero.
     *
     *Emits `ForceCreated` event when successful.
     *
     *Weight: `O(1)`
     */
    "force_create": Anonymize<I2rnoam876ruhj>;
    /**
     *Start the process of destroying a fungible asset class.
     *
     *`start_destroy` is the first in a series of extrinsics that should be called, to allow
     *destruction of an asset class.
     *
     *The origin must conform to `ForceOrigin` or must be `Signed` by the asset's `owner`.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *The asset class must be frozen before calling `start_destroy`.
     */
    "start_destroy": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Destroy all accounts associated with a given asset.
     *
     *`destroy_accounts` should only be called after `start_destroy` has been called, and the
     *asset is in a `Destroying` state.
     *
     *Due to weight restrictions, this function may need to be called multiple times to fully
     *destroy all accounts. It will destroy `RemoveItemsLimit` accounts at a time.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *Each call emits the `Event::DestroyedAccounts` event.
     */
    "destroy_accounts": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Destroy all approvals associated with a given asset up to the max (T::RemoveItemsLimit).
     *
     *`destroy_approvals` should only be called after `start_destroy` has been called, and the
     *asset is in a `Destroying` state.
     *
     *Due to weight restrictions, this function may need to be called multiple times to fully
     *destroy all approvals. It will destroy `RemoveItemsLimit` approvals at a time.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *Each call emits the `Event::DestroyedApprovals` event.
     */
    "destroy_approvals": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Complete destroying asset and unreserve currency.
     *
     *`finish_destroy` should only be called after `start_destroy` has been called, and the
     *asset is in a `Destroying` state. All accounts or approvals should be destroyed before
     *hand.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *Each successful call emits the `Event::Destroyed` event.
     */
    "finish_destroy": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Mint assets of a particular class.
     *
     *The origin must be Signed and the sender must be the Issuer of the asset `id`.
     *
     *- `id`: The identifier of the asset to have some amount minted.
     *- `beneficiary`: The account to be credited with the minted assets.
     *- `amount`: The amount of the asset to be minted.
     *
     *Emits `Issued` event when successful.
     *
     *Weight: `O(1)`
     *Modes: Pre-existing balance of `beneficiary`; Account pre-existence of `beneficiary`.
     */
    "mint": Anonymize<Ib3qnc19gu633c>;
    /**
     *Reduce the balance of `who` by as much as possible up to `amount` assets of `id`.
     *
     *Origin must be Signed and the sender should be the Manager of the asset `id`.
     *
     *Bails with `NoAccount` if the `who` is already dead.
     *
     *- `id`: The identifier of the asset to have some amount burned.
     *- `who`: The account to be debited from.
     *- `amount`: The maximum amount by which `who`'s balance should be reduced.
     *
     *Emits `Burned` with the actual amount burned. If this takes the balance to below the
     *minimum for the asset, then the amount burned is increased to take it to zero.
     *
     *Weight: `O(1)`
     *Modes: Post-existence of `who`; Pre & post Zombie-status of `who`.
     */
    "burn": Anonymize<Ifira6u9hi7cu1>;
    /**
     *Move some assets from the sender account to another.
     *
     *Origin must be Signed.
     *
     *- `id`: The identifier of the asset to have some amount transferred.
     *- `target`: The account to be credited.
     *- `amount`: The amount by which the sender's balance of assets should be reduced and
     *`target`'s balance increased. The amount actually transferred may be slightly greater in
     *the case that the transfer would otherwise take the sender balance above zero but below
     *the minimum balance. Must be greater than zero.
     *
     *Emits `Transferred` with the actual amount transferred. If this takes the source balance
     *to below the minimum for the asset, then the amount transferred is increased to take it
     *to zero.
     *
     *Weight: `O(1)`
     *Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
     *`target`.
     */
    "transfer": Anonymize<I72tqocvdoqfff>;
    /**
     *Move some assets from the sender account to another, keeping the sender account alive.
     *
     *Origin must be Signed.
     *
     *- `id`: The identifier of the asset to have some amount transferred.
     *- `target`: The account to be credited.
     *- `amount`: The amount by which the sender's balance of assets should be reduced and
     *`target`'s balance increased. The amount actually transferred may be slightly greater in
     *the case that the transfer would otherwise take the sender balance above zero but below
     *the minimum balance. Must be greater than zero.
     *
     *Emits `Transferred` with the actual amount transferred. If this takes the source balance
     *to below the minimum for the asset, then the amount transferred is increased to take it
     *to zero.
     *
     *Weight: `O(1)`
     *Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
     *`target`.
     */
    "transfer_keep_alive": Anonymize<I72tqocvdoqfff>;
    /**
     *Move some assets from one account to another.
     *
     *Origin must be Signed and the sender should be the Admin of the asset `id`.
     *
     *- `id`: The identifier of the asset to have some amount transferred.
     *- `source`: The account to be debited.
     *- `dest`: The account to be credited.
     *- `amount`: The amount by which the `source`'s balance of assets should be reduced and
     *`dest`'s balance increased. The amount actually transferred may be slightly greater in
     *the case that the transfer would otherwise take the `source` balance above zero but
     *below the minimum balance. Must be greater than zero.
     *
     *Emits `Transferred` with the actual amount transferred. If this takes the source balance
     *to below the minimum for the asset, then the amount transferred is increased to take it
     *to zero.
     *
     *Weight: `O(1)`
     *Modes: Pre-existence of `dest`; Post-existence of `source`; Account pre-existence of
     *`dest`.
     */
    "force_transfer": Anonymize<I2i27f3sfmvc05>;
    /**
     *Disallow further unprivileged transfers of an asset `id` from an account `who`. `who`
     *must already exist as an entry in `Account`s of the asset. If you want to freeze an
     *account that does not have an entry, use `touch_other` first.
     *
     *Origin must be Signed and the sender should be the Freezer of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *- `who`: The account to be frozen.
     *
     *Emits `Frozen`.
     *
     *Weight: `O(1)`
     */
    "freeze": Anonymize<I1nlrtd1epki2d>;
    /**
     *Allow unprivileged transfers to and from an account again.
     *
     *Origin must be Signed and the sender should be the Admin of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *- `who`: The account to be unfrozen.
     *
     *Emits `Thawed`.
     *
     *Weight: `O(1)`
     */
    "thaw": Anonymize<I1nlrtd1epki2d>;
    /**
     *Disallow further unprivileged transfers for the asset class.
     *
     *Origin must be Signed and the sender should be the Freezer of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *
     *Emits `Frozen`.
     *
     *Weight: `O(1)`
     */
    "freeze_asset": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Allow unprivileged transfers for the asset again.
     *
     *Origin must be Signed and the sender should be the Admin of the asset `id`.
     *
     *- `id`: The identifier of the asset to be thawed.
     *
     *Emits `Thawed`.
     *
     *Weight: `O(1)`
     */
    "thaw_asset": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Change the Owner of an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *- `id`: The identifier of the asset.
     *- `owner`: The new Owner of this asset.
     *
     *Emits `OwnerChanged`.
     *
     *Weight: `O(1)`
     */
    "transfer_ownership": Anonymize<I3abtumcmempjs>;
    /**
     *Change the Issuer, Admin and Freezer of an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *- `issuer`: The new Issuer of this asset.
     *- `admin`: The new Admin of this asset.
     *- `freezer`: The new Freezer of this asset.
     *
     *Emits `TeamChanged`.
     *
     *Weight: `O(1)`
     */
    "set_team": Anonymize<Id81m8flopt8ha>;
    /**
     *Set the metadata for an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *Funds of sender are reserved according to the formula:
     *`MetadataDepositBase + MetadataDepositPerByte * (name.len + symbol.len)` taking into
     *account any already reserved funds.
     *
     *- `id`: The identifier of the asset to update.
     *- `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
     *- `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
     *- `decimals`: The number of decimals this asset uses to represent one unit.
     *
     *Emits `MetadataSet`.
     *
     *Weight: `O(1)`
     */
    "set_metadata": Anonymize<I8hff7chabggkd>;
    /**
     *Clear the metadata for an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *Any deposit is freed for the asset owner.
     *
     *- `id`: The identifier of the asset to clear.
     *
     *Emits `MetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_metadata": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Force the metadata for an asset to some value.
     *
     *Origin must be ForceOrigin.
     *
     *Any deposit is left alone.
     *
     *- `id`: The identifier of the asset to update.
     *- `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
     *- `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
     *- `decimals`: The number of decimals this asset uses to represent one unit.
     *
     *Emits `MetadataSet`.
     *
     *Weight: `O(N + S)` where N and S are the length of the name and symbol respectively.
     */
    "force_set_metadata": Anonymize<I49i39mtj1ivbs>;
    /**
     *Clear the metadata for an asset.
     *
     *Origin must be ForceOrigin.
     *
     *Any deposit is returned.
     *
     *- `id`: The identifier of the asset to clear.
     *
     *Emits `MetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "force_clear_metadata": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Alter the attributes of a given asset.
     *
     *Origin must be `ForceOrigin`.
     *
     *- `id`: The identifier of the asset.
     *- `owner`: The new Owner of this asset.
     *- `issuer`: The new Issuer of this asset.
     *- `admin`: The new Admin of this asset.
     *- `freezer`: The new Freezer of this asset.
     *- `min_balance`: The minimum balance of this new asset that any single account must
     *have. If an account's balance is reduced below this, then it collapses to zero.
     *- `is_sufficient`: Whether a non-zero balance of this asset is deposit of sufficient
     *value to account for the state bloat associated with its balance storage. If set to
     *`true`, then non-zero balances may be stored without a `consumer` reference (and thus
     *an ED in the Balances pallet or whatever else is used to control user-account state
     *growth).
     *- `is_frozen`: Whether this asset class is frozen except for permissioned/admin
     *instructions.
     *
     *Emits `AssetStatusChanged` with the identity of the asset.
     *
     *Weight: `O(1)`
     */
    "force_asset_status": Anonymize<Ifkr2kcak2vto1>;
    /**
     *Approve an amount of asset for transfer by a delegated third-party account.
     *
     *Origin must be Signed.
     *
     *Ensures that `ApprovalDeposit` worth of `Currency` is reserved from signing account
     *for the purpose of holding the approval. If some non-zero amount of assets is already
     *approved from signing account to `delegate`, then it is topped up or unreserved to
     *meet the right value.
     *
     *NOTE: The signing account does not need to own `amount` of assets at the point of
     *making this call.
     *
     *- `id`: The identifier of the asset.
     *- `delegate`: The account to delegate permission to transfer asset.
     *- `amount`: The amount of asset that may be transferred by `delegate`. If there is
     *already an approval in place, then this acts additively.
     *
     *Emits `ApprovedTransfer` on success.
     *
     *Weight: `O(1)`
     */
    "approve_transfer": Anonymize<I1ju6r8q0cs9jt>;
    /**
     *Cancel all of some asset approved for delegated transfer by a third-party account.
     *
     *Origin must be Signed and there must be an approval in place between signer and
     *`delegate`.
     *
     *Unreserves any deposit previously reserved by `approve_transfer` for the approval.
     *
     *- `id`: The identifier of the asset.
     *- `delegate`: The account delegated permission to transfer asset.
     *
     *Emits `ApprovalCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "cancel_approval": Anonymize<I4kpeq6j7cd5bu>;
    /**
     *Cancel all of some asset approved for delegated transfer by a third-party account.
     *
     *Origin must be either ForceOrigin or Signed origin with the signer being the Admin
     *account of the asset `id`.
     *
     *Unreserves any deposit previously reserved by `approve_transfer` for the approval.
     *
     *- `id`: The identifier of the asset.
     *- `delegate`: The account delegated permission to transfer asset.
     *
     *Emits `ApprovalCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "force_cancel_approval": Anonymize<I5na1ka76k6811>;
    /**
     *Transfer some asset balance from a previously delegated account to some third-party
     *account.
     *
     *Origin must be Signed and there must be an approval in place by the `owner` to the
     *signer.
     *
     *If the entire amount approved for transfer is transferred, then any deposit previously
     *reserved by `approve_transfer` is unreserved.
     *
     *- `id`: The identifier of the asset.
     *- `owner`: The account which previously approved for a transfer of at least `amount` and
     *from which the asset balance will be withdrawn.
     *- `destination`: The account to which the asset balance of `amount` will be transferred.
     *- `amount`: The amount of assets to transfer.
     *
     *Emits `TransferredApproved` on success.
     *
     *Weight: `O(1)`
     */
    "transfer_approved": Anonymize<I59mhdb9omdqfa>;
    /**
     *Create an asset account for non-provider assets.
     *
     *A deposit will be taken from the signer account.
     *
     *- `origin`: Must be Signed; the signer account must have sufficient funds for a deposit
     *  to be taken.
     *- `id`: The identifier of the asset for the account to be created.
     *
     *Emits `Touched` event when successful.
     */
    "touch": Anonymize<Ic5b47dj4coa3r>;
    /**
     *Return the deposit (if any) of an asset account or a consumer reference (if any) of an
     *account.
     *
     *The origin must be Signed.
     *
     *- `id`: The identifier of the asset for which the caller would like the deposit
     *  refunded.
     *- `allow_burn`: If `true` then assets may be destroyed in order to complete the refund.
     *
     *Emits `Refunded` event when successful.
     */
    "refund": Anonymize<I9vl5kpk0fpakt>;
    /**
     *Sets the minimum balance of an asset.
     *
     *Only works if there aren't any accounts that are holding the asset or if
     *the new value of `min_balance` is less than the old one.
     *
     *Origin must be Signed and the sender has to be the Owner of the
     *asset `id`.
     *
     *- `id`: The identifier of the asset.
     *- `min_balance`: The new value of `min_balance`.
     *
     *Emits `AssetMinBalanceChanged` event when successful.
     */
    "set_min_balance": Anonymize<I717jt61hu19b4>;
    /**
     *Create an asset account for `who`.
     *
     *A deposit will be taken from the signer account.
     *
     *- `origin`: Must be Signed by `Freezer` or `Admin` of the asset `id`; the signer account
     *  must have sufficient funds for a deposit to be taken.
     *- `id`: The identifier of the asset for the account to be created.
     *- `who`: The account to be created.
     *
     *Emits `Touched` event when successful.
     */
    "touch_other": Anonymize<I1nlrtd1epki2d>;
    /**
     *Return the deposit (if any) of a target asset account. Useful if you are the depositor.
     *
     *The origin must be Signed and either the account owner, depositor, or asset `Admin`. In
     *order to burn a non-zero balance of the asset, the caller must be the account and should
     *use `refund`.
     *
     *- `id`: The identifier of the asset for the account holding a deposit.
     *- `who`: The account to refund.
     *
     *Emits `Refunded` event when successful.
     */
    "refund_other": Anonymize<I1nlrtd1epki2d>;
    /**
     *Disallow further unprivileged transfers of an asset `id` to and from an account `who`.
     *
     *Origin must be Signed and the sender should be the Freezer of the asset `id`.
     *
     *- `id`: The identifier of the account's asset.
     *- `who`: The account to be unblocked.
     *
     *Emits `Blocked`.
     *
     *Weight: `O(1)`
     */
    "block": Anonymize<I1nlrtd1epki2d>;
}>;
export type Ic357tcepuvo5c = {
    "id": number;
    "admin": MultiAddress;
    "min_balance": bigint;
};
export type I2rnoam876ruhj = {
    "id": number;
    "owner": MultiAddress;
    "is_sufficient": boolean;
    "min_balance": bigint;
};
export type Ic5b47dj4coa3r = {
    "id": number;
};
export type Ib3qnc19gu633c = {
    "id": number;
    "beneficiary": MultiAddress;
    "amount": bigint;
};
export type Ifira6u9hi7cu1 = {
    "id": number;
    "who": MultiAddress;
    "amount": bigint;
};
export type I72tqocvdoqfff = {
    "id": number;
    "target": MultiAddress;
    "amount": bigint;
};
export type I2i27f3sfmvc05 = {
    "id": number;
    "source": MultiAddress;
    "dest": MultiAddress;
    "amount": bigint;
};
export type I1nlrtd1epki2d = {
    "id": number;
    "who": MultiAddress;
};
export type I3abtumcmempjs = {
    "id": number;
    "owner": MultiAddress;
};
export type Id81m8flopt8ha = {
    "id": number;
    "issuer": MultiAddress;
    "admin": MultiAddress;
    "freezer": MultiAddress;
};
export type I8hff7chabggkd = {
    "id": number;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
};
export type I49i39mtj1ivbs = {
    "id": number;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
    "is_frozen": boolean;
};
export type Ifkr2kcak2vto1 = {
    "id": number;
    "owner": MultiAddress;
    "issuer": MultiAddress;
    "admin": MultiAddress;
    "freezer": MultiAddress;
    "min_balance": bigint;
    "is_sufficient": boolean;
    "is_frozen": boolean;
};
export type I1ju6r8q0cs9jt = {
    "id": number;
    "delegate": MultiAddress;
    "amount": bigint;
};
export type I4kpeq6j7cd5bu = {
    "id": number;
    "delegate": MultiAddress;
};
export type I5na1ka76k6811 = {
    "id": number;
    "owner": MultiAddress;
    "delegate": MultiAddress;
};
export type I59mhdb9omdqfa = {
    "id": number;
    "owner": MultiAddress;
    "destination": MultiAddress;
    "amount": bigint;
};
export type I9vl5kpk0fpakt = {
    "id": number;
    "allow_burn": boolean;
};
export type I717jt61hu19b4 = {
    "id": number;
    "min_balance": bigint;
};
export type Icu49uv7rfej74 = AnonymousEnum<{
    /**
     *Issue a new collection of non-fungible items from a public origin.
     *
     *This new collection has no items initially and its owner is the origin.
     *
     *The origin must conform to the configured `CreateOrigin` and have sufficient funds free.
     *
     *`ItemDeposit` funds of sender are reserved.
     *
     *Parameters:
     *- `collection`: The identifier of the new collection. This must not be currently in use.
     *- `admin`: The admin of this collection. The admin is the initial address of each
     *member of the collection's admin team.
     *
     *Emits `Created` event when successful.
     *
     *Weight: `O(1)`
     */
    "create": Anonymize<If66ivi02f7256>;
    /**
     *Issue a new collection of non-fungible items from a privileged origin.
     *
     *This new collection has no items initially.
     *
     *The origin must conform to `ForceOrigin`.
     *
     *Unlike `create`, no funds are reserved.
     *
     *- `collection`: The identifier of the new item. This must not be currently in use.
     *- `owner`: The owner of this collection of items. The owner has full superuser
     *  permissions
     *over this item, but may later change and configure the permissions using
     *`transfer_ownership` and `set_team`.
     *
     *Emits `ForceCreated` event when successful.
     *
     *Weight: `O(1)`
     */
    "force_create": Anonymize<I223jtcatlfkrc>;
    /**
     *Destroy a collection of fungible items.
     *
     *The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
     *owner of the `collection`.
     *
     *- `collection`: The identifier of the collection to be destroyed.
     *- `witness`: Information on the items minted in the collection. This must be
     *correct.
     *
     *Emits `Destroyed` event when successful.
     *
     *Weight: `O(n + m)` where:
     *- `n = witness.items`
     *- `m = witness.item_metadatas`
     *- `a = witness.attributes`
     */
    "destroy": Anonymize<I223jg78mng8hq>;
    /**
     *Mint an item of a particular collection.
     *
     *The origin must be Signed and the sender must be the Issuer of the `collection`.
     *
     *- `collection`: The collection of the item to be minted.
     *- `item`: The item value of the item to be minted.
     *- `beneficiary`: The initial owner of the minted item.
     *
     *Emits `Issued` event when successful.
     *
     *Weight: `O(1)`
     */
    "mint": Anonymize<I4iiuiftkpq3fd>;
    /**
     *Destroy a single item.
     *
     *Origin must be Signed and the signing account must be either:
     *- the Admin of the `collection`;
     *- the Owner of the `item`;
     *
     *- `collection`: The collection of the item to be burned.
     *- `item`: The item of the item to be burned.
     *- `check_owner`: If `Some` then the operation will fail with `WrongOwner` unless the
     *  item is owned by this value.
     *
     *Emits `Burned` with the actual amount burned.
     *
     *Weight: `O(1)`
     *Modes: `check_owner.is_some()`.
     */
    "burn": Anonymize<Ibra6533h92c0a>;
    /**
     *Move an item from the sender account to another.
     *
     *This resets the approved account of the item.
     *
     *Origin must be Signed and the signing account must be either:
     *- the Admin of the `collection`;
     *- the Owner of the `item`;
     *- the approved delegate for the `item` (in this case, the approval is reset).
     *
     *Arguments:
     *- `collection`: The collection of the item to be transferred.
     *- `item`: The item of the item to be transferred.
     *- `dest`: The account to receive ownership of the item.
     *
     *Emits `Transferred`.
     *
     *Weight: `O(1)`
     */
    "transfer": Anonymize<Ibgvkh96s68a66>;
    /**
     *Reevaluate the deposits on some items.
     *
     *Origin must be Signed and the sender should be the Owner of the `collection`.
     *
     *- `collection`: The collection to be frozen.
     *- `items`: The items of the collection whose deposits will be reevaluated.
     *
     *NOTE: This exists as a best-effort function. Any items which are unknown or
     *in the case that the owner account does not have reservable funds to pay for a
     *deposit increase are ignored. Generally the owner isn't going to call this on items
     *whose existing deposit is less than the refreshed deposit as it would only cost them,
     *so it's of little consequence.
     *
     *It will still return an error in the case that the collection is unknown of the signer
     *is not permitted to call it.
     *
     *Weight: `O(items.len())`
     */
    "redeposit": Anonymize<If9vko7pv0231m>;
    /**
     *Disallow further unprivileged transfer of an item.
     *
     *Origin must be Signed and the sender should be the Freezer of the `collection`.
     *
     *- `collection`: The collection of the item to be frozen.
     *- `item`: The item of the item to be frozen.
     *
     *Emits `Frozen`.
     *
     *Weight: `O(1)`
     */
    "freeze": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Re-allow unprivileged transfer of an item.
     *
     *Origin must be Signed and the sender should be the Freezer of the `collection`.
     *
     *- `collection`: The collection of the item to be thawed.
     *- `item`: The item of the item to be thawed.
     *
     *Emits `Thawed`.
     *
     *Weight: `O(1)`
     */
    "thaw": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Disallow further unprivileged transfers for a whole collection.
     *
     *Origin must be Signed and the sender should be the Freezer of the `collection`.
     *
     *- `collection`: The collection to be frozen.
     *
     *Emits `CollectionFrozen`.
     *
     *Weight: `O(1)`
     */
    "freeze_collection": Anonymize<I6cu7obfo0rr0o>;
    /**
     *Re-allow unprivileged transfers for a whole collection.
     *
     *Origin must be Signed and the sender should be the Admin of the `collection`.
     *
     *- `collection`: The collection to be thawed.
     *
     *Emits `CollectionThawed`.
     *
     *Weight: `O(1)`
     */
    "thaw_collection": Anonymize<I6cu7obfo0rr0o>;
    /**
     *Change the Owner of a collection.
     *
     *Origin must be Signed and the sender should be the Owner of the `collection`.
     *
     *- `collection`: The collection whose owner should be changed.
     *- `owner`: The new Owner of this collection. They must have called
     *  `set_accept_ownership` with `collection` in order for this operation to succeed.
     *
     *Emits `OwnerChanged`.
     *
     *Weight: `O(1)`
     */
    "transfer_ownership": Anonymize<I736lv5q9m5bot>;
    /**
     *Change the Issuer, Admin and Freezer of a collection.
     *
     *Origin must be Signed and the sender should be the Owner of the `collection`.
     *
     *- `collection`: The collection whose team should be changed.
     *- `issuer`: The new Issuer of this collection.
     *- `admin`: The new Admin of this collection.
     *- `freezer`: The new Freezer of this collection.
     *
     *Emits `TeamChanged`.
     *
     *Weight: `O(1)`
     */
    "set_team": Anonymize<I1ap9tlenhr44l>;
    /**
     *Approve an item to be transferred by a delegated third-party account.
     *
     *The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be
     *either the owner of the `item` or the admin of the collection.
     *
     *- `collection`: The collection of the item to be approved for delegated transfer.
     *- `item`: The item of the item to be approved for delegated transfer.
     *- `delegate`: The account to delegate permission to transfer the item.
     *
     *Important NOTE: The `approved` account gets reset after each transfer.
     *
     *Emits `ApprovedTransfer` on success.
     *
     *Weight: `O(1)`
     */
    "approve_transfer": Anonymize<Ib92t90p616grb>;
    /**
     *Cancel the prior approval for the transfer of an item by a delegate.
     *
     *Origin must be either:
     *- the `Force` origin;
     *- `Signed` with the signer being the Admin of the `collection`;
     *- `Signed` with the signer being the Owner of the `item`;
     *
     *Arguments:
     *- `collection`: The collection of the item of whose approval will be cancelled.
     *- `item`: The item of the item of whose approval will be cancelled.
     *- `maybe_check_delegate`: If `Some` will ensure that the given account is the one to
     *  which permission of transfer is delegated.
     *
     *Emits `ApprovalCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "cancel_approval": Anonymize<Ieipuujd6879do>;
    /**
     *Alter the attributes of a given item.
     *
     *Origin must be `ForceOrigin`.
     *
     *- `collection`: The identifier of the item.
     *- `owner`: The new Owner of this item.
     *- `issuer`: The new Issuer of this item.
     *- `admin`: The new Admin of this item.
     *- `freezer`: The new Freezer of this item.
     *- `free_holding`: Whether a deposit is taken for holding an item of this collection.
     *- `is_frozen`: Whether this collection is frozen except for permissioned/admin
     *instructions.
     *
     *Emits `ItemStatusChanged` with the identity of the item.
     *
     *Weight: `O(1)`
     */
    "force_item_status": Anonymize<Ie56eq9sg1rsoc>;
    /**
     *Set an attribute for a collection or item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *`collection`.
     *
     *If the origin is Signed, then funds of signer are reserved according to the formula:
     *`MetadataDepositBase + DepositPerByte * (key.len + value.len)` taking into
     *account any already reserved funds.
     *
     *- `collection`: The identifier of the collection whose item's metadata to set.
     *- `maybe_item`: The identifier of the item whose metadata to set.
     *- `key`: The key of the attribute.
     *- `value`: The value to which to set the attribute.
     *
     *Emits `AttributeSet`.
     *
     *Weight: `O(1)`
     */
    "set_attribute": Anonymize<I5tvvgui05tn6e>;
    /**
     *Clear an attribute for a collection or item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *`collection`.
     *
     *Any deposit is freed for the collection's owner.
     *
     *- `collection`: The identifier of the collection whose item's metadata to clear.
     *- `maybe_item`: The identifier of the item whose metadata to clear.
     *- `key`: The key of the attribute.
     *
     *Emits `AttributeCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_attribute": Anonymize<Ibal0joadvdc2h>;
    /**
     *Set the metadata for an item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *`collection`.
     *
     *If the origin is Signed, then funds of signer are reserved according to the formula:
     *`MetadataDepositBase + DepositPerByte * data.len` taking into
     *account any already reserved funds.
     *
     *- `collection`: The identifier of the collection whose item's metadata to set.
     *- `item`: The identifier of the item whose metadata to set.
     *- `data`: The general information of this item. Limited in length by `StringLimit`.
     *- `is_frozen`: Whether the metadata should be frozen against further changes.
     *
     *Emits `MetadataSet`.
     *
     *Weight: `O(1)`
     */
    "set_metadata": Anonymize<Iceq9fmmp9aeqv>;
    /**
     *Clear the metadata for an item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *`item`.
     *
     *Any deposit is freed for the collection's owner.
     *
     *- `collection`: The identifier of the collection whose item's metadata to clear.
     *- `item`: The identifier of the item whose metadata to clear.
     *
     *Emits `MetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_metadata": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Set the metadata for a collection.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
     *the `collection`.
     *
     *If the origin is `Signed`, then funds of signer are reserved according to the formula:
     *`MetadataDepositBase + DepositPerByte * data.len` taking into
     *account any already reserved funds.
     *
     *- `collection`: The identifier of the item whose metadata to update.
     *- `data`: The general information of this item. Limited in length by `StringLimit`.
     *- `is_frozen`: Whether the metadata should be frozen against further changes.
     *
     *Emits `CollectionMetadataSet`.
     *
     *Weight: `O(1)`
     */
    "set_collection_metadata": Anonymize<I9viqhmdtuof5e>;
    /**
     *Clear the metadata for a collection.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
     *the `collection`.
     *
     *Any deposit is freed for the collection's owner.
     *
     *- `collection`: The identifier of the collection whose metadata to clear.
     *
     *Emits `CollectionMetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_collection_metadata": Anonymize<I6cu7obfo0rr0o>;
    /**
     *Set (or reset) the acceptance of ownership for a particular account.
     *
     *Origin must be `Signed` and if `maybe_collection` is `Some`, then the signer must have a
     *provider reference.
     *
     *- `maybe_collection`: The identifier of the collection whose ownership the signer is
     *  willing to accept, or if `None`, an indication that the signer is willing to accept no
     *  ownership transferal.
     *
     *Emits `OwnershipAcceptanceChanged`.
     */
    "set_accept_ownership": Anonymize<Ibqooroq6rr5kr>;
    /**
     *Set the maximum amount of items a collection could have.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
     *the `collection`.
     *
     *Note: This function can only succeed once per collection.
     *
     *- `collection`: The identifier of the collection to change.
     *- `max_supply`: The maximum amount of items a collection could have.
     *
     *Emits `CollectionMaxSupplySet` event when successful.
     */
    "set_collection_max_supply": Anonymize<I6h88h8vba22v8>;
    /**
     *Set (or reset) the price for an item.
     *
     *Origin must be Signed and must be the owner of the asset `item`.
     *
     *- `collection`: The collection of the item.
     *- `item`: The item to set the price for.
     *- `price`: The price for the item. Pass `None`, to reset the price.
     *- `buyer`: Restricts the buy operation to a specific account.
     *
     *Emits `ItemPriceSet` on success if the price is not `None`.
     *Emits `ItemPriceRemoved` on success if the price is `None`.
     */
    "set_price": Anonymize<Ia9cd4jqb5eecb>;
    /**
     *Allows to buy an item if it's up for sale.
     *
     *Origin must be Signed and must not be the owner of the `item`.
     *
     *- `collection`: The collection of the item.
     *- `item`: The item the sender wants to buy.
     *- `bid_price`: The price the sender is willing to pay.
     *
     *Emits `ItemBought` on success.
     */
    "buy_item": Anonymize<I19jiel1ftbcce>;
}>;
export type If66ivi02f7256 = {
    "collection": number;
    "admin": MultiAddress;
};
export type I223jtcatlfkrc = {
    "collection": number;
    "owner": MultiAddress;
    "free_holding": boolean;
};
export type I223jg78mng8hq = {
    "collection": number;
    "witness": Anonymize<I59th026dnaruk>;
};
export type I59th026dnaruk = {
    "items": number;
    "item_metadatas": number;
    "attributes": number;
};
export type I4iiuiftkpq3fd = {
    "collection": number;
    "item": number;
    "owner": MultiAddress;
};
export type Ibra6533h92c0a = {
    "collection": number;
    "item": number;
    "check_owner"?: Anonymize<Ia0jlc0rcbskuk>;
};
export type Ia0jlc0rcbskuk = (MultiAddress) | undefined;
export type Ibgvkh96s68a66 = {
    "collection": number;
    "item": number;
    "dest": MultiAddress;
};
export type If9vko7pv0231m = {
    "collection": number;
    "items": Anonymize<Icgljjb6j82uhn>;
};
export type I736lv5q9m5bot = {
    "collection": number;
    "new_owner": MultiAddress;
};
export type I1ap9tlenhr44l = {
    "collection": number;
    "issuer": MultiAddress;
    "admin": MultiAddress;
    "freezer": MultiAddress;
};
export type Ib92t90p616grb = {
    "collection": number;
    "item": number;
    "delegate": MultiAddress;
};
export type Ieipuujd6879do = {
    "collection": number;
    "item": number;
    "maybe_check_delegate"?: Anonymize<Ia0jlc0rcbskuk>;
};
export type Ie56eq9sg1rsoc = {
    "collection": number;
    "owner": MultiAddress;
    "issuer": MultiAddress;
    "admin": MultiAddress;
    "freezer": MultiAddress;
    "free_holding": boolean;
    "is_frozen": boolean;
};
export type Ibqooroq6rr5kr = {
    "maybe_collection"?: Anonymize<I4arjljr6dpflb>;
};
export type Ia9cd4jqb5eecb = {
    "collection": number;
    "item": number;
    "price"?: Anonymize<I35p85j063s0il>;
    "whitelisted_buyer"?: Anonymize<Ia0jlc0rcbskuk>;
};
export type I19jiel1ftbcce = {
    "collection": number;
    "item": number;
    "bid_price": bigint;
};
export type I1k4il7i5elhc7 = AnonymousEnum<{
    /**
     *Issue a new collection of non-fungible items from a public origin.
     *
     *This new collection has no items initially and its owner is the origin.
     *
     *The origin must be Signed and the sender must have sufficient funds free.
     *
     *`CollectionDeposit` funds of sender are reserved.
     *
     *Parameters:
     *- `admin`: The admin of this collection. The admin is the initial address of each
     *member of the collection's admin team.
     *
     *Emits `Created` event when successful.
     *
     *Weight: `O(1)`
     */
    "create": Anonymize<I43aobns89nbkh>;
    /**
     *Issue a new collection of non-fungible items from a privileged origin.
     *
     *This new collection has no items initially.
     *
     *The origin must conform to `ForceOrigin`.
     *
     *Unlike `create`, no funds are reserved.
     *
     *- `owner`: The owner of this collection of items. The owner has full superuser
     *  permissions over this item, but may later change and configure the permissions using
     *  `transfer_ownership` and `set_team`.
     *
     *Emits `ForceCreated` event when successful.
     *
     *Weight: `O(1)`
     */
    "force_create": Anonymize<Iamd7rovec1hfb>;
    /**
     *Destroy a collection of fungible items.
     *
     *The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
     *owner of the `collection`.
     *
     *NOTE: The collection must have 0 items to be destroyed.
     *
     *- `collection`: The identifier of the collection to be destroyed.
     *- `witness`: Information on the items minted in the collection. This must be
     *correct.
     *
     *Emits `Destroyed` event when successful.
     *
     *Weight: `O(m + c + a)` where:
     *- `m = witness.item_metadatas`
     *- `c = witness.item_configs`
     *- `a = witness.attributes`
     */
    "destroy": Anonymize<I77ie723ncd4co>;
    /**
     *Mint an item of a particular collection.
     *
     *The origin must be Signed and the sender must comply with the `mint_settings` rules.
     *
     *- `collection`: The collection of the item to be minted.
     *- `item`: An identifier of the new item.
     *- `mint_to`: Account into which the item will be minted.
     *- `witness_data`: When the mint type is `HolderOf(collection_id)`, then the owned
     *  item_id from that collection needs to be provided within the witness data object. If
     *  the mint price is set, then it should be additionally confirmed in the `witness_data`.
     *
     *Note: the deposit will be taken from the `origin` and not the `owner` of the `item`.
     *
     *Emits `Issued` event when successful.
     *
     *Weight: `O(1)`
     */
    "mint": Anonymize<Ieebloeahma3ke>;
    /**
     *Mint an item of a particular collection from a privileged origin.
     *
     *The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
     *Issuer of the `collection`.
     *
     *- `collection`: The collection of the item to be minted.
     *- `item`: An identifier of the new item.
     *- `mint_to`: Account into which the item will be minted.
     *- `item_config`: A config of the new item.
     *
     *Emits `Issued` event when successful.
     *
     *Weight: `O(1)`
     */
    "force_mint": Anonymize<I4mbtpf4pu3rec>;
    /**
     *Destroy a single item.
     *
     *The origin must conform to `ForceOrigin` or must be Signed and the signing account must
     *be the owner of the `item`.
     *
     *- `collection`: The collection of the item to be burned.
     *- `item`: The item to be burned.
     *
     *Emits `Burned`.
     *
     *Weight: `O(1)`
     */
    "burn": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Move an item from the sender account to another.
     *
     *Origin must be Signed and the signing account must be either:
     *- the Owner of the `item`;
     *- the approved delegate for the `item` (in this case, the approval is reset).
     *
     *Arguments:
     *- `collection`: The collection of the item to be transferred.
     *- `item`: The item to be transferred.
     *- `dest`: The account to receive ownership of the item.
     *
     *Emits `Transferred`.
     *
     *Weight: `O(1)`
     */
    "transfer": Anonymize<Ibgvkh96s68a66>;
    /**
     *Re-evaluate the deposits on some items.
     *
     *Origin must be Signed and the sender should be the Owner of the `collection`.
     *
     *- `collection`: The collection of the items to be reevaluated.
     *- `items`: The items of the collection whose deposits will be reevaluated.
     *
     *NOTE: This exists as a best-effort function. Any items which are unknown or
     *in the case that the owner account does not have reservable funds to pay for a
     *deposit increase are ignored. Generally the owner isn't going to call this on items
     *whose existing deposit is less than the refreshed deposit as it would only cost them,
     *so it's of little consequence.
     *
     *It will still return an error in the case that the collection is unknown or the signer
     *is not permitted to call it.
     *
     *Weight: `O(items.len())`
     */
    "redeposit": Anonymize<If9vko7pv0231m>;
    /**
     *Disallow further unprivileged transfer of an item.
     *
     *Origin must be Signed and the sender should be the Freezer of the `collection`.
     *
     *- `collection`: The collection of the item to be changed.
     *- `item`: The item to become non-transferable.
     *
     *Emits `ItemTransferLocked`.
     *
     *Weight: `O(1)`
     */
    "lock_item_transfer": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Re-allow unprivileged transfer of an item.
     *
     *Origin must be Signed and the sender should be the Freezer of the `collection`.
     *
     *- `collection`: The collection of the item to be changed.
     *- `item`: The item to become transferable.
     *
     *Emits `ItemTransferUnlocked`.
     *
     *Weight: `O(1)`
     */
    "unlock_item_transfer": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Disallows specified settings for the whole collection.
     *
     *Origin must be Signed and the sender should be the Owner of the `collection`.
     *
     *- `collection`: The collection to be locked.
     *- `lock_settings`: The settings to be locked.
     *
     *Note: it's possible to only lock(set) the setting, but not to unset it.
     *
     *Emits `CollectionLocked`.
     *
     *Weight: `O(1)`
     */
    "lock_collection": Anonymize<I1ahf3pvgsgbu>;
    /**
     *Change the Owner of a collection.
     *
     *Origin must be Signed and the sender should be the Owner of the `collection`.
     *
     *- `collection`: The collection whose owner should be changed.
     *- `owner`: The new Owner of this collection. They must have called
     *  `set_accept_ownership` with `collection` in order for this operation to succeed.
     *
     *Emits `OwnerChanged`.
     *
     *Weight: `O(1)`
     */
    "transfer_ownership": Anonymize<I736lv5q9m5bot>;
    /**
     *Change the Issuer, Admin and Freezer of a collection.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *`collection`.
     *
     *Note: by setting the role to `None` only the `ForceOrigin` will be able to change it
     *after to `Some(account)`.
     *
     *- `collection`: The collection whose team should be changed.
     *- `issuer`: The new Issuer of this collection.
     *- `admin`: The new Admin of this collection.
     *- `freezer`: The new Freezer of this collection.
     *
     *Emits `TeamChanged`.
     *
     *Weight: `O(1)`
     */
    "set_team": Anonymize<I9uapdn16emsti>;
    /**
     *Change the Owner of a collection.
     *
     *Origin must be `ForceOrigin`.
     *
     *- `collection`: The identifier of the collection.
     *- `owner`: The new Owner of this collection.
     *
     *Emits `OwnerChanged`.
     *
     *Weight: `O(1)`
     */
    "force_collection_owner": Anonymize<Ie5i0q2glmr0md>;
    /**
     *Change the config of a collection.
     *
     *Origin must be `ForceOrigin`.
     *
     *- `collection`: The identifier of the collection.
     *- `config`: The new config of this collection.
     *
     *Emits `CollectionConfigChanged`.
     *
     *Weight: `O(1)`
     */
    "force_collection_config": Anonymize<I97qcg6i3l8gee>;
    /**
     *Approve an item to be transferred by a delegated third-party account.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *`item`.
     *
     *- `collection`: The collection of the item to be approved for delegated transfer.
     *- `item`: The item to be approved for delegated transfer.
     *- `delegate`: The account to delegate permission to transfer the item.
     *- `maybe_deadline`: Optional deadline for the approval. Specified by providing the
     *	number of blocks after which the approval will expire
     *
     *Emits `TransferApproved` on success.
     *
     *Weight: `O(1)`
     */
    "approve_transfer": Anonymize<Ib5udrahak005b>;
    /**
     *Cancel one of the transfer approvals for a specific item.
     *
     *Origin must be either:
     *- the `Force` origin;
     *- `Signed` with the signer being the Owner of the `item`;
     *
     *Arguments:
     *- `collection`: The collection of the item of whose approval will be cancelled.
     *- `item`: The item of the collection of whose approval will be cancelled.
     *- `delegate`: The account that is going to loose their approval.
     *
     *Emits `ApprovalCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "cancel_approval": Anonymize<Ib92t90p616grb>;
    /**
     *Cancel all the approvals of a specific item.
     *
     *Origin must be either:
     *- the `Force` origin;
     *- `Signed` with the signer being the Owner of the `item`;
     *
     *Arguments:
     *- `collection`: The collection of the item of whose approvals will be cleared.
     *- `item`: The item of the collection of whose approvals will be cleared.
     *
     *Emits `AllApprovalsCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "clear_all_transfer_approvals": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Disallows changing the metadata or attributes of the item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Admin
     *of the `collection`.
     *
     *- `collection`: The collection if the `item`.
     *- `item`: An item to be locked.
     *- `lock_metadata`: Specifies whether the metadata should be locked.
     *- `lock_attributes`: Specifies whether the attributes in the `CollectionOwner` namespace
     *  should be locked.
     *
     *Note: `lock_attributes` affects the attributes in the `CollectionOwner` namespace only.
     *When the metadata or attributes are locked, it won't be possible the unlock them.
     *
     *Emits `ItemPropertiesLocked`.
     *
     *Weight: `O(1)`
     */
    "lock_item_properties": Anonymize<I1jj31tn29ie3c>;
    /**
     *Set an attribute for a collection or item.
     *
     *Origin must be Signed and must conform to the namespace ruleset:
     *- `CollectionOwner` namespace could be modified by the `collection` Admin only;
     *- `ItemOwner` namespace could be modified by the `maybe_item` owner only. `maybe_item`
     *  should be set in that case;
     *- `Account(AccountId)` namespace could be modified only when the `origin` was given a
     *  permission to do so;
     *
     *The funds of `origin` are reserved according to the formula:
     *`AttributeDepositBase + DepositPerByte * (key.len + value.len)` taking into
     *account any already reserved funds.
     *
     *- `collection`: The identifier of the collection whose item's metadata to set.
     *- `maybe_item`: The identifier of the item whose metadata to set.
     *- `namespace`: Attribute's namespace.
     *- `key`: The key of the attribute.
     *- `value`: The value to which to set the attribute.
     *
     *Emits `AttributeSet`.
     *
     *Weight: `O(1)`
     */
    "set_attribute": Anonymize<I5llu6o6a0go5i>;
    /**
     *Force-set an attribute for a collection or item.
     *
     *Origin must be `ForceOrigin`.
     *
     *If the attribute already exists and it was set by another account, the deposit
     *will be returned to the previous owner.
     *
     *- `set_as`: An optional owner of the attribute.
     *- `collection`: The identifier of the collection whose item's metadata to set.
     *- `maybe_item`: The identifier of the item whose metadata to set.
     *- `namespace`: Attribute's namespace.
     *- `key`: The key of the attribute.
     *- `value`: The value to which to set the attribute.
     *
     *Emits `AttributeSet`.
     *
     *Weight: `O(1)`
     */
    "force_set_attribute": Anonymize<Ic8b8561e6t9ie>;
    /**
     *Clear an attribute for a collection or item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
     *attribute.
     *
     *Any deposit is freed for the collection's owner.
     *
     *- `collection`: The identifier of the collection whose item's metadata to clear.
     *- `maybe_item`: The identifier of the item whose metadata to clear.
     *- `namespace`: Attribute's namespace.
     *- `key`: The key of the attribute.
     *
     *Emits `AttributeCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_attribute": Anonymize<I93r2effh7od84>;
    /**
     *Approve item's attributes to be changed by a delegated third-party account.
     *
     *Origin must be Signed and must be an owner of the `item`.
     *
     *- `collection`: A collection of the item.
     *- `item`: The item that holds attributes.
     *- `delegate`: The account to delegate permission to change attributes of the item.
     *
     *Emits `ItemAttributesApprovalAdded` on success.
     */
    "approve_item_attributes": Anonymize<Ib92t90p616grb>;
    /**
     *Cancel the previously provided approval to change item's attributes.
     *All the previously set attributes by the `delegate` will be removed.
     *
     *Origin must be Signed and must be an owner of the `item`.
     *
     *- `collection`: Collection that the item is contained within.
     *- `item`: The item that holds attributes.
     *- `delegate`: The previously approved account to remove.
     *
     *Emits `ItemAttributesApprovalRemoved` on success.
     */
    "cancel_item_attributes_approval": Anonymize<I6afd7fllr8otc>;
    /**
     *Set the metadata for an item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Admin of the
     *`collection`.
     *
     *If the origin is Signed, then funds of signer are reserved according to the formula:
     *`MetadataDepositBase + DepositPerByte * data.len` taking into
     *account any already reserved funds.
     *
     *- `collection`: The identifier of the collection whose item's metadata to set.
     *- `item`: The identifier of the item whose metadata to set.
     *- `data`: The general information of this item. Limited in length by `StringLimit`.
     *
     *Emits `ItemMetadataSet`.
     *
     *Weight: `O(1)`
     */
    "set_metadata": Anonymize<Icrkms46uh8tpb>;
    /**
     *Clear the metadata for an item.
     *
     *Origin must be either `ForceOrigin` or Signed and the sender should be the Admin of the
     *`collection`.
     *
     *Any deposit is freed for the collection's owner.
     *
     *- `collection`: The identifier of the collection whose item's metadata to clear.
     *- `item`: The identifier of the item whose metadata to clear.
     *
     *Emits `ItemMetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_metadata": Anonymize<Iafkqus0ohh6l6>;
    /**
     *Set the metadata for a collection.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Admin of
     *the `collection`.
     *
     *If the origin is `Signed`, then funds of signer are reserved according to the formula:
     *`MetadataDepositBase + DepositPerByte * data.len` taking into
     *account any already reserved funds.
     *
     *- `collection`: The identifier of the item whose metadata to update.
     *- `data`: The general information of this item. Limited in length by `StringLimit`.
     *
     *Emits `CollectionMetadataSet`.
     *
     *Weight: `O(1)`
     */
    "set_collection_metadata": Anonymize<I78u60nqh0etah>;
    /**
     *Clear the metadata for a collection.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Admin of
     *the `collection`.
     *
     *Any deposit is freed for the collection's owner.
     *
     *- `collection`: The identifier of the collection whose metadata to clear.
     *
     *Emits `CollectionMetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_collection_metadata": Anonymize<I6cu7obfo0rr0o>;
    /**
     *Set (or reset) the acceptance of ownership for a particular account.
     *
     *Origin must be `Signed` and if `maybe_collection` is `Some`, then the signer must have a
     *provider reference.
     *
     *- `maybe_collection`: The identifier of the collection whose ownership the signer is
     *  willing to accept, or if `None`, an indication that the signer is willing to accept no
     *  ownership transferal.
     *
     *Emits `OwnershipAcceptanceChanged`.
     */
    "set_accept_ownership": Anonymize<Ibqooroq6rr5kr>;
    /**
     *Set the maximum number of items a collection could have.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
     *the `collection`.
     *
     *- `collection`: The identifier of the collection to change.
     *- `max_supply`: The maximum number of items a collection could have.
     *
     *Emits `CollectionMaxSupplySet` event when successful.
     */
    "set_collection_max_supply": Anonymize<I6h88h8vba22v8>;
    /**
     *Update mint settings.
     *
     *Origin must be either `ForceOrigin` or `Signed` and the sender should be the Issuer
     *of the `collection`.
     *
     *- `collection`: The identifier of the collection to change.
     *- `mint_settings`: The new mint settings.
     *
     *Emits `CollectionMintSettingsUpdated` event when successful.
     */
    "update_mint_settings": Anonymize<I1lso3vlgherue>;
    /**
     *Set (or reset) the price for an item.
     *
     *Origin must be Signed and must be the owner of the `item`.
     *
     *- `collection`: The collection of the item.
     *- `item`: The item to set the price for.
     *- `price`: The price for the item. Pass `None`, to reset the price.
     *- `buyer`: Restricts the buy operation to a specific account.
     *
     *Emits `ItemPriceSet` on success if the price is not `None`.
     *Emits `ItemPriceRemoved` on success if the price is `None`.
     */
    "set_price": Anonymize<Ia9cd4jqb5eecb>;
    /**
     *Allows to buy an item if it's up for sale.
     *
     *Origin must be Signed and must not be the owner of the `item`.
     *
     *- `collection`: The collection of the item.
     *- `item`: The item the sender wants to buy.
     *- `bid_price`: The price the sender is willing to pay.
     *
     *Emits `ItemBought` on success.
     */
    "buy_item": Anonymize<I19jiel1ftbcce>;
    /**
     *Allows to pay the tips.
     *
     *Origin must be Signed.
     *
     *- `tips`: Tips array.
     *
     *Emits `TipSent` on every tip transfer.
     */
    "pay_tips": Anonymize<I26c8p47106toa>;
    /**
     *Register a new atomic swap, declaring an intention to send an `item` in exchange for
     *`desired_item` from origin to target on the current blockchain.
     *The target can execute the swap during the specified `duration` of blocks (if set).
     *Additionally, the price could be set for the desired `item`.
     *
     *Origin must be Signed and must be an owner of the `item`.
     *
     *- `collection`: The collection of the item.
     *- `item`: The item an owner wants to give.
     *- `desired_collection`: The collection of the desired item.
     *- `desired_item`: The desired item an owner wants to receive.
     *- `maybe_price`: The price an owner is willing to pay or receive for the desired `item`.
     *- `duration`: A deadline for the swap. Specified by providing the number of blocks
     *	after which the swap will expire.
     *
     *Emits `SwapCreated` on success.
     */
    "create_swap": Anonymize<Iq82b3qvf20ne>;
    /**
     *Cancel an atomic swap.
     *
     *Origin must be Signed.
     *Origin must be an owner of the `item` if the deadline hasn't expired.
     *
     *- `collection`: The collection of the item.
     *- `item`: The item an owner wants to give.
     *
     *Emits `SwapCancelled` on success.
     */
    "cancel_swap": Anonymize<Ic3j8ku6mbsms4>;
    /**
     *Claim an atomic swap.
     *This method executes a pending swap, that was created by a counterpart before.
     *
     *Origin must be Signed and must be an owner of the `item`.
     *
     *- `send_collection`: The collection of the item to be sent.
     *- `send_item`: The item to be sent.
     *- `receive_collection`: The collection of the item to be received.
     *- `receive_item`: The item to be received.
     *- `witness_price`: A price that was previously agreed on.
     *
     *Emits `SwapClaimed` on success.
     */
    "claim_swap": Anonymize<I3nvoqsi8f05ph>;
    /**
     *Mint an item by providing the pre-signed approval.
     *
     *Origin must be Signed.
     *
     *- `mint_data`: The pre-signed approval that consists of the information about the item,
     *  its metadata, attributes, who can mint it (`None` for anyone) and until what block
     *  number.
     *- `signature`: The signature of the `data` object.
     *- `signer`: The `data` object's signer. Should be an Issuer of the collection.
     *
     *Emits `Issued` on success.
     *Emits `AttributeSet` if the attributes were provided.
     *Emits `ItemMetadataSet` if the metadata was not empty.
     */
    "mint_pre_signed": Anonymize<I3eoft5md071do>;
    /**
     *Set attributes for an item by providing the pre-signed approval.
     *
     *Origin must be Signed and must be an owner of the `data.item`.
     *
     *- `data`: The pre-signed approval that consists of the information about the item,
     *  attributes to update and until what block number.
     *- `signature`: The signature of the `data` object.
     *- `signer`: The `data` object's signer. Should be an Admin of the collection for the
     *  `CollectionOwner` namespace.
     *
     *Emits `AttributeSet` for each provided attribute.
     *Emits `ItemAttributesApprovalAdded` if the approval wasn't set before.
     *Emits `PreSignedAttributesSet` on success.
     */
    "set_attributes_pre_signed": Anonymize<I923eug653ra0o>;
}>;
export type I43aobns89nbkh = {
    "admin": MultiAddress;
    "config": Anonymize<I72ndo6phms8ik>;
};
export type Iamd7rovec1hfb = {
    "owner": MultiAddress;
    "config": Anonymize<I72ndo6phms8ik>;
};
export type I77ie723ncd4co = {
    "collection": number;
    "witness": Anonymize<Idqhe2sslgfeu8>;
};
export type Idqhe2sslgfeu8 = {
    "item_metadatas": number;
    "item_configs": number;
    "attributes": number;
};
export type Ieebloeahma3ke = {
    "collection": number;
    "item": number;
    "mint_to": MultiAddress;
    "witness_data"?: Anonymize<Ib0113vv89gbic>;
};
export type Ib0113vv89gbic = (Anonymize<Ia2e23n2425vqn>) | undefined;
export type Ia2e23n2425vqn = {
    "owned_item"?: Anonymize<I4arjljr6dpflb>;
    "mint_price"?: Anonymize<I35p85j063s0il>;
};
export type I4mbtpf4pu3rec = {
    "collection": number;
    "item": number;
    "mint_to": MultiAddress;
    "item_config": bigint;
};
export type I1ahf3pvgsgbu = {
    "collection": number;
    "lock_settings": bigint;
};
export type I9uapdn16emsti = {
    "collection": number;
    "issuer"?: Anonymize<Ia0jlc0rcbskuk>;
    "admin"?: Anonymize<Ia0jlc0rcbskuk>;
    "freezer"?: Anonymize<Ia0jlc0rcbskuk>;
};
export type Ie5i0q2glmr0md = {
    "collection": number;
    "owner": MultiAddress;
};
export type I97qcg6i3l8gee = {
    "collection": number;
    "config": Anonymize<I72ndo6phms8ik>;
};
export type Ib5udrahak005b = {
    "collection": number;
    "item": number;
    "delegate": MultiAddress;
    "maybe_deadline"?: Anonymize<I4arjljr6dpflb>;
};
export type Ic8b8561e6t9ie = {
    "set_as"?: Anonymize<Ihfphjolmsqq1>;
    "collection": number;
    "maybe_item"?: Anonymize<I4arjljr6dpflb>;
    "namespace": Anonymize<If3jjadhmug6qc>;
    "key": Binary;
    "value": Binary;
};
export type I6afd7fllr8otc = {
    "collection": number;
    "item": number;
    "delegate": MultiAddress;
    "witness": number;
};
export type I1lso3vlgherue = {
    "collection": number;
    "mint_settings": Anonymize<Ia3s8qquibn97v>;
};
export type I26c8p47106toa = {
    "tips": Anonymize<I73vqjhh9uvase>;
};
export type I73vqjhh9uvase = Array<Anonymize<I21hhoccptr6ko>>;
export type I21hhoccptr6ko = {
    "collection": number;
    "item": number;
    "receiver": SS58String;
    "amount": bigint;
};
export type Iq82b3qvf20ne = {
    "offered_collection": number;
    "offered_item": number;
    "desired_collection": number;
    "maybe_desired_item"?: Anonymize<I4arjljr6dpflb>;
    "maybe_price"?: Anonymize<I6oogc1jbmmi81>;
    "duration": number;
};
export type Ic3j8ku6mbsms4 = {
    "offered_collection": number;
    "offered_item": number;
};
export type I3nvoqsi8f05ph = {
    "send_collection": number;
    "send_item": number;
    "receive_collection": number;
    "receive_item": number;
    "witness_price"?: Anonymize<I6oogc1jbmmi81>;
};
export type I3eoft5md071do = {
    "mint_data": Anonymize<Icu0bim1kiuj19>;
    "signature": MultiSignature;
    "signer": SS58String;
};
export type Icu0bim1kiuj19 = {
    "collection": number;
    "item": number;
    "attributes": Anonymize<I6pi5ou8r1hblk>;
    "metadata": Binary;
    "only_account"?: Anonymize<Ihfphjolmsqq1>;
    "deadline": number;
    "mint_price"?: Anonymize<I35p85j063s0il>;
};
export type MultiSignature = Enum<{
    "Ed25519": FixedSizeBinary<64>;
    "Sr25519": FixedSizeBinary<64>;
    "Ecdsa": FixedSizeBinary<65>;
}>;
export declare const MultiSignature: GetEnum<MultiSignature>;
export type I923eug653ra0o = {
    "data": Anonymize<Id9tges27r8atl>;
    "signature": MultiSignature;
    "signer": SS58String;
};
export type Id9tges27r8atl = {
    "collection": number;
    "item": number;
    "attributes": Anonymize<I6pi5ou8r1hblk>;
    "namespace": Anonymize<If3jjadhmug6qc>;
    "deadline": number;
};
export type I2clougp67ufee = AnonymousEnum<{
    /**
     *Issue a new class of fungible assets from a public origin.
     *
     *This new asset class has no assets initially and its owner is the origin.
     *
     *The origin must conform to the configured `CreateOrigin` and have sufficient funds free.
     *
     *Funds of sender are reserved by `AssetDeposit`.
     *
     *Parameters:
     *- `id`: The identifier of the new asset. This must not be currently in use to identify
     *an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
     *- `admin`: The admin of this class of assets. The admin is the initial address of each
     *member of the asset class's admin team.
     *- `min_balance`: The minimum balance of this new asset that any single account must
     *have. If an account's balance is reduced below this, then it collapses to zero.
     *
     *Emits `Created` event when successful.
     *
     *Weight: `O(1)`
     */
    "create": Anonymize<I7p44cr9g492tc>;
    /**
     *Issue a new class of fungible assets from a privileged origin.
     *
     *This new asset class has no assets initially.
     *
     *The origin must conform to `ForceOrigin`.
     *
     *Unlike `create`, no funds are reserved.
     *
     *- `id`: The identifier of the new asset. This must not be currently in use to identify
     *an existing asset. If [`NextAssetId`] is set, then this must be equal to it.
     *- `owner`: The owner of this class of assets. The owner has full superuser permissions
     *over this asset, but may later change and configure the permissions using
     *`transfer_ownership` and `set_team`.
     *- `min_balance`: The minimum balance of this new asset that any single account must
     *have. If an account's balance is reduced below this, then it collapses to zero.
     *
     *Emits `ForceCreated` event when successful.
     *
     *Weight: `O(1)`
     */
    "force_create": Anonymize<Ibn8gm2jugarek>;
    /**
     *Start the process of destroying a fungible asset class.
     *
     *`start_destroy` is the first in a series of extrinsics that should be called, to allow
     *destruction of an asset class.
     *
     *The origin must conform to `ForceOrigin` or must be `Signed` by the asset's `owner`.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *The asset class must be frozen before calling `start_destroy`.
     */
    "start_destroy": Anonymize<Iekg0q69obfi0f>;
    /**
     *Destroy all accounts associated with a given asset.
     *
     *`destroy_accounts` should only be called after `start_destroy` has been called, and the
     *asset is in a `Destroying` state.
     *
     *Due to weight restrictions, this function may need to be called multiple times to fully
     *destroy all accounts. It will destroy `RemoveItemsLimit` accounts at a time.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *Each call emits the `Event::DestroyedAccounts` event.
     */
    "destroy_accounts": Anonymize<Iekg0q69obfi0f>;
    /**
     *Destroy all approvals associated with a given asset up to the max (T::RemoveItemsLimit).
     *
     *`destroy_approvals` should only be called after `start_destroy` has been called, and the
     *asset is in a `Destroying` state.
     *
     *Due to weight restrictions, this function may need to be called multiple times to fully
     *destroy all approvals. It will destroy `RemoveItemsLimit` approvals at a time.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *Each call emits the `Event::DestroyedApprovals` event.
     */
    "destroy_approvals": Anonymize<Iekg0q69obfi0f>;
    /**
     *Complete destroying asset and unreserve currency.
     *
     *`finish_destroy` should only be called after `start_destroy` has been called, and the
     *asset is in a `Destroying` state. All accounts or approvals should be destroyed before
     *hand.
     *
     *- `id`: The identifier of the asset to be destroyed. This must identify an existing
     *  asset.
     *
     *Each successful call emits the `Event::Destroyed` event.
     */
    "finish_destroy": Anonymize<Iekg0q69obfi0f>;
    /**
     *Mint assets of a particular class.
     *
     *The origin must be Signed and the sender must be the Issuer of the asset `id`.
     *
     *- `id`: The identifier of the asset to have some amount minted.
     *- `beneficiary`: The account to be credited with the minted assets.
     *- `amount`: The amount of the asset to be minted.
     *
     *Emits `Issued` event when successful.
     *
     *Weight: `O(1)`
     *Modes: Pre-existing balance of `beneficiary`; Account pre-existence of `beneficiary`.
     */
    "mint": Anonymize<I8dh2oimnihksg>;
    /**
     *Reduce the balance of `who` by as much as possible up to `amount` assets of `id`.
     *
     *Origin must be Signed and the sender should be the Manager of the asset `id`.
     *
     *Bails with `NoAccount` if the `who` is already dead.
     *
     *- `id`: The identifier of the asset to have some amount burned.
     *- `who`: The account to be debited from.
     *- `amount`: The maximum amount by which `who`'s balance should be reduced.
     *
     *Emits `Burned` with the actual amount burned. If this takes the balance to below the
     *minimum for the asset, then the amount burned is increased to take it to zero.
     *
     *Weight: `O(1)`
     *Modes: Post-existence of `who`; Pre & post Zombie-status of `who`.
     */
    "burn": Anonymize<Ib8mfkapk4u9hs>;
    /**
     *Move some assets from the sender account to another.
     *
     *Origin must be Signed.
     *
     *- `id`: The identifier of the asset to have some amount transferred.
     *- `target`: The account to be credited.
     *- `amount`: The amount by which the sender's balance of assets should be reduced and
     *`target`'s balance increased. The amount actually transferred may be slightly greater in
     *the case that the transfer would otherwise take the sender balance above zero but below
     *the minimum balance. Must be greater than zero.
     *
     *Emits `Transferred` with the actual amount transferred. If this takes the source balance
     *to below the minimum for the asset, then the amount transferred is increased to take it
     *to zero.
     *
     *Weight: `O(1)`
     *Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
     *`target`.
     */
    "transfer": Anonymize<Ikm68gg7akl51>;
    /**
     *Move some assets from the sender account to another, keeping the sender account alive.
     *
     *Origin must be Signed.
     *
     *- `id`: The identifier of the asset to have some amount transferred.
     *- `target`: The account to be credited.
     *- `amount`: The amount by which the sender's balance of assets should be reduced and
     *`target`'s balance increased. The amount actually transferred may be slightly greater in
     *the case that the transfer would otherwise take the sender balance above zero but below
     *the minimum balance. Must be greater than zero.
     *
     *Emits `Transferred` with the actual amount transferred. If this takes the source balance
     *to below the minimum for the asset, then the amount transferred is increased to take it
     *to zero.
     *
     *Weight: `O(1)`
     *Modes: Pre-existence of `target`; Post-existence of sender; Account pre-existence of
     *`target`.
     */
    "transfer_keep_alive": Anonymize<Ikm68gg7akl51>;
    /**
     *Move some assets from one account to another.
     *
     *Origin must be Signed and the sender should be the Admin of the asset `id`.
     *
     *- `id`: The identifier of the asset to have some amount transferred.
     *- `source`: The account to be debited.
     *- `dest`: The account to be credited.
     *- `amount`: The amount by which the `source`'s balance of assets should be reduced and
     *`dest`'s balance increased. The amount actually transferred may be slightly greater in
     *the case that the transfer would otherwise take the `source` balance above zero but
     *below the minimum balance. Must be greater than zero.
     *
     *Emits `Transferred` with the actual amount transferred. If this takes the source balance
     *to below the minimum for the asset, then the amount transferred is increased to take it
     *to zero.
     *
     *Weight: `O(1)`
     *Modes: Pre-existence of `dest`; Post-existence of `source`; Account pre-existence of
     *`dest`.
     */
    "force_transfer": Anonymize<If3csb5ben9n1v>;
    /**
     *Disallow further unprivileged transfers of an asset `id` from an account `who`. `who`
     *must already exist as an entry in `Account`s of the asset. If you want to freeze an
     *account that does not have an entry, use `touch_other` first.
     *
     *Origin must be Signed and the sender should be the Freezer of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *- `who`: The account to be frozen.
     *
     *Emits `Frozen`.
     *
     *Weight: `O(1)`
     */
    "freeze": Anonymize<If90dk6l9lmtfv>;
    /**
     *Allow unprivileged transfers to and from an account again.
     *
     *Origin must be Signed and the sender should be the Admin of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *- `who`: The account to be unfrozen.
     *
     *Emits `Thawed`.
     *
     *Weight: `O(1)`
     */
    "thaw": Anonymize<If90dk6l9lmtfv>;
    /**
     *Disallow further unprivileged transfers for the asset class.
     *
     *Origin must be Signed and the sender should be the Freezer of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *
     *Emits `Frozen`.
     *
     *Weight: `O(1)`
     */
    "freeze_asset": Anonymize<Iekg0q69obfi0f>;
    /**
     *Allow unprivileged transfers for the asset again.
     *
     *Origin must be Signed and the sender should be the Admin of the asset `id`.
     *
     *- `id`: The identifier of the asset to be thawed.
     *
     *Emits `Thawed`.
     *
     *Weight: `O(1)`
     */
    "thaw_asset": Anonymize<Iekg0q69obfi0f>;
    /**
     *Change the Owner of an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *- `id`: The identifier of the asset.
     *- `owner`: The new Owner of this asset.
     *
     *Emits `OwnerChanged`.
     *
     *Weight: `O(1)`
     */
    "transfer_ownership": Anonymize<Ifoahm8m43v9q2>;
    /**
     *Change the Issuer, Admin and Freezer of an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *- `id`: The identifier of the asset to be frozen.
     *- `issuer`: The new Issuer of this asset.
     *- `admin`: The new Admin of this asset.
     *- `freezer`: The new Freezer of this asset.
     *
     *Emits `TeamChanged`.
     *
     *Weight: `O(1)`
     */
    "set_team": Anonymize<I1rrgcjpoiot5q>;
    /**
     *Set the metadata for an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *Funds of sender are reserved according to the formula:
     *`MetadataDepositBase + MetadataDepositPerByte * (name.len + symbol.len)` taking into
     *account any already reserved funds.
     *
     *- `id`: The identifier of the asset to update.
     *- `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
     *- `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
     *- `decimals`: The number of decimals this asset uses to represent one unit.
     *
     *Emits `MetadataSet`.
     *
     *Weight: `O(1)`
     */
    "set_metadata": Anonymize<I2hc61n7o8dso4>;
    /**
     *Clear the metadata for an asset.
     *
     *Origin must be Signed and the sender should be the Owner of the asset `id`.
     *
     *Any deposit is freed for the asset owner.
     *
     *- `id`: The identifier of the asset to clear.
     *
     *Emits `MetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "clear_metadata": Anonymize<Iekg0q69obfi0f>;
    /**
     *Force the metadata for an asset to some value.
     *
     *Origin must be ForceOrigin.
     *
     *Any deposit is left alone.
     *
     *- `id`: The identifier of the asset to update.
     *- `name`: The user friendly name of this asset. Limited in length by `StringLimit`.
     *- `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`.
     *- `decimals`: The number of decimals this asset uses to represent one unit.
     *
     *Emits `MetadataSet`.
     *
     *Weight: `O(N + S)` where N and S are the length of the name and symbol respectively.
     */
    "force_set_metadata": Anonymize<I5787kv2d05f94>;
    /**
     *Clear the metadata for an asset.
     *
     *Origin must be ForceOrigin.
     *
     *Any deposit is returned.
     *
     *- `id`: The identifier of the asset to clear.
     *
     *Emits `MetadataCleared`.
     *
     *Weight: `O(1)`
     */
    "force_clear_metadata": Anonymize<Iekg0q69obfi0f>;
    /**
     *Alter the attributes of a given asset.
     *
     *Origin must be `ForceOrigin`.
     *
     *- `id`: The identifier of the asset.
     *- `owner`: The new Owner of this asset.
     *- `issuer`: The new Issuer of this asset.
     *- `admin`: The new Admin of this asset.
     *- `freezer`: The new Freezer of this asset.
     *- `min_balance`: The minimum balance of this new asset that any single account must
     *have. If an account's balance is reduced below this, then it collapses to zero.
     *- `is_sufficient`: Whether a non-zero balance of this asset is deposit of sufficient
     *value to account for the state bloat associated with its balance storage. If set to
     *`true`, then non-zero balances may be stored without a `consumer` reference (and thus
     *an ED in the Balances pallet or whatever else is used to control user-account state
     *growth).
     *- `is_frozen`: Whether this asset class is frozen except for permissioned/admin
     *instructions.
     *
     *Emits `AssetStatusChanged` with the identity of the asset.
     *
     *Weight: `O(1)`
     */
    "force_asset_status": Anonymize<Ia8g1imc1kclf4>;
    /**
     *Approve an amount of asset for transfer by a delegated third-party account.
     *
     *Origin must be Signed.
     *
     *Ensures that `ApprovalDeposit` worth of `Currency` is reserved from signing account
     *for the purpose of holding the approval. If some non-zero amount of assets is already
     *approved from signing account to `delegate`, then it is topped up or unreserved to
     *meet the right value.
     *
     *NOTE: The signing account does not need to own `amount` of assets at the point of
     *making this call.
     *
     *- `id`: The identifier of the asset.
     *- `delegate`: The account to delegate permission to transfer asset.
     *- `amount`: The amount of asset that may be transferred by `delegate`. If there is
     *already an approval in place, then this acts additively.
     *
     *Emits `ApprovedTransfer` on success.
     *
     *Weight: `O(1)`
     */
    "approve_transfer": Anonymize<Id26ouo5lt2551>;
    /**
     *Cancel all of some asset approved for delegated transfer by a third-party account.
     *
     *Origin must be Signed and there must be an approval in place between signer and
     *`delegate`.
     *
     *Unreserves any deposit previously reserved by `approve_transfer` for the approval.
     *
     *- `id`: The identifier of the asset.
     *- `delegate`: The account delegated permission to transfer asset.
     *
     *Emits `ApprovalCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "cancel_approval": Anonymize<Iap1up3prsbtvg>;
    /**
     *Cancel all of some asset approved for delegated transfer by a third-party account.
     *
     *Origin must be either ForceOrigin or Signed origin with the signer being the Admin
     *account of the asset `id`.
     *
     *Unreserves any deposit previously reserved by `approve_transfer` for the approval.
     *
     *- `id`: The identifier of the asset.
     *- `delegate`: The account delegated permission to transfer asset.
     *
     *Emits `ApprovalCancelled` on success.
     *
     *Weight: `O(1)`
     */
    "force_cancel_approval": Anonymize<I8m5mvhifj6pm>;
    /**
     *Transfer some asset balance from a previously delegated account to some third-party
     *account.
     *
     *Origin must be Signed and there must be an approval in place by the `owner` to the
     *signer.
     *
     *If the entire amount approved for transfer is transferred, then any deposit previously
     *reserved by `approve_transfer` is unreserved.
     *
     *- `id`: The identifier of the asset.
     *- `owner`: The account which previously approved for a transfer of at least `amount` and
     *from which the asset balance will be withdrawn.
     *- `destination`: The account to which the asset balance of `amount` will be transferred.
     *- `amount`: The amount of assets to transfer.
     *
     *Emits `TransferredApproved` on success.
     *
     *Weight: `O(1)`
     */
    "transfer_approved": Anonymize<I8ucc4915s9qvj>;
    /**
     *Create an asset account for non-provider assets.
     *
     *A deposit will be taken from the signer account.
     *
     *- `origin`: Must be Signed; the signer account must have sufficient funds for a deposit
     *  to be taken.
     *- `id`: The identifier of the asset for the account to be created.
     *
     *Emits `Touched` event when successful.
     */
    "touch": Anonymize<Iekg0q69obfi0f>;
    /**
     *Return the deposit (if any) of an asset account or a consumer reference (if any) of an
     *account.
     *
     *The origin must be Signed.
     *
     *- `id`: The identifier of the asset for which the caller would like the deposit
     *  refunded.
     *- `allow_burn`: If `true` then assets may be destroyed in order to complete the refund.
     *
     *Emits `Refunded` event when successful.
     */
    "refund": Anonymize<I1pjcv2ha0997v>;
    /**
     *Sets the minimum balance of an asset.
     *
     *Only works if there aren't any accounts that are holding the asset or if
     *the new value of `min_balance` is less than the old one.
     *
     *Origin must be Signed and the sender has to be the Owner of the
     *asset `id`.
     *
     *- `id`: The identifier of the asset.
     *- `min_balance`: The new value of `min_balance`.
     *
     *Emits `AssetMinBalanceChanged` event when successful.
     */
    "set_min_balance": Anonymize<Ifnm6nai2i47ar>;
    /**
     *Create an asset account for `who`.
     *
     *A deposit will be taken from the signer account.
     *
     *- `origin`: Must be Signed by `Freezer` or `Admin` of the asset `id`; the signer account
     *  must have sufficient funds for a deposit to be taken.
     *- `id`: The identifier of the asset for the account to be created.
     *- `who`: The account to be created.
     *
     *Emits `Touched` event when successful.
     */
    "touch_other": Anonymize<If90dk6l9lmtfv>;
    /**
     *Return the deposit (if any) of a target asset account. Useful if you are the depositor.
     *
     *The origin must be Signed and either the account owner, depositor, or asset `Admin`. In
     *order to burn a non-zero balance of the asset, the caller must be the account and should
     *use `refund`.
     *
     *- `id`: The identifier of the asset for the account holding a deposit.
     *- `who`: The account to refund.
     *
     *Emits `Refunded` event when successful.
     */
    "refund_other": Anonymize<If90dk6l9lmtfv>;
    /**
     *Disallow further unprivileged transfers of an asset `id` to and from an account `who`.
     *
     *Origin must be Signed and the sender should be the Freezer of the asset `id`.
     *
     *- `id`: The identifier of the account's asset.
     *- `who`: The account to be unblocked.
     *
     *Emits `Blocked`.
     *
     *Weight: `O(1)`
     */
    "block": Anonymize<If90dk6l9lmtfv>;
}>;
export type I7p44cr9g492tc = {
    "id": Anonymize<I4c0s5cioidn76>;
    "admin": MultiAddress;
    "min_balance": bigint;
};
export type Ibn8gm2jugarek = {
    "id": Anonymize<I4c0s5cioidn76>;
    "owner": MultiAddress;
    "is_sufficient": boolean;
    "min_balance": bigint;
};
export type Iekg0q69obfi0f = {
    "id": Anonymize<I4c0s5cioidn76>;
};
export type I8dh2oimnihksg = {
    "id": Anonymize<I4c0s5cioidn76>;
    "beneficiary": MultiAddress;
    "amount": bigint;
};
export type Ib8mfkapk4u9hs = {
    "id": Anonymize<I4c0s5cioidn76>;
    "who": MultiAddress;
    "amount": bigint;
};
export type Ikm68gg7akl51 = {
    "id": Anonymize<I4c0s5cioidn76>;
    "target": MultiAddress;
    "amount": bigint;
};
export type If3csb5ben9n1v = {
    "id": Anonymize<I4c0s5cioidn76>;
    "source": MultiAddress;
    "dest": MultiAddress;
    "amount": bigint;
};
export type If90dk6l9lmtfv = {
    "id": Anonymize<I4c0s5cioidn76>;
    "who": MultiAddress;
};
export type Ifoahm8m43v9q2 = {
    "id": Anonymize<I4c0s5cioidn76>;
    "owner": MultiAddress;
};
export type I1rrgcjpoiot5q = {
    "id": Anonymize<I4c0s5cioidn76>;
    "issuer": MultiAddress;
    "admin": MultiAddress;
    "freezer": MultiAddress;
};
export type I2hc61n7o8dso4 = {
    "id": Anonymize<I4c0s5cioidn76>;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
};
export type I5787kv2d05f94 = {
    "id": Anonymize<I4c0s5cioidn76>;
    "name": Binary;
    "symbol": Binary;
    "decimals": number;
    "is_frozen": boolean;
};
export type Ia8g1imc1kclf4 = {
    "id": Anonymize<I4c0s5cioidn76>;
    "owner": MultiAddress;
    "issuer": MultiAddress;
    "admin": MultiAddress;
    "freezer": MultiAddress;
    "min_balance": bigint;
    "is_sufficient": boolean;
    "is_frozen": boolean;
};
export type Id26ouo5lt2551 = {
    "id": Anonymize<I4c0s5cioidn76>;
    "delegate": MultiAddress;
    "amount": bigint;
};
export type Iap1up3prsbtvg = {
    "id": Anonymize<I4c0s5cioidn76>;
    "delegate": MultiAddress;
};
export type I8m5mvhifj6pm = {
    "id": Anonymize<I4c0s5cioidn76>;
    "owner": MultiAddress;
    "delegate": MultiAddress;
};
export type I8ucc4915s9qvj = {
    "id": Anonymize<I4c0s5cioidn76>;
    "owner": MultiAddress;
    "destination": MultiAddress;
    "amount": bigint;
};
export type I1pjcv2ha0997v = {
    "id": Anonymize<I4c0s5cioidn76>;
    "allow_burn": boolean;
};
export type Ifnm6nai2i47ar = {
    "id": Anonymize<I4c0s5cioidn76>;
    "min_balance": bigint;
};
export type I9eemk0c7gip8o = AnonymousEnum<{
    /**
     *Creates an empty liquidity pool and an associated new `lp_token` asset
     *(the id of which is returned in the `Event::PoolCreated` event).
     *
     *Once a pool is created, someone may [`Pallet::add_liquidity`] to it.
     */
    "create_pool": Anonymize<I8eoqk45hnet27>;
    /**
     *Provide liquidity into the pool of `asset1` and `asset2`.
     *NOTE: an optimal amount of asset1 and asset2 will be calculated and
     *might be different than the provided `amount1_desired`/`amount2_desired`
     *thus you should provide the min amount you're happy to provide.
     *Params `amount1_min`/`amount2_min` represent that.
     *`mint_to` will be sent the liquidity tokens that represent this share of the pool.
     *
     *NOTE: when encountering an incorrect exchange rate and non-withdrawable pool liquidity,
     *batch an atomic call with [`Pallet::add_liquidity`] and
     *[`Pallet::swap_exact_tokens_for_tokens`] or [`Pallet::swap_tokens_for_exact_tokens`]
     *calls to render the liquidity withdrawable and rectify the exchange rate.
     *
     *Once liquidity is added, someone may successfully call
     *[`Pallet::swap_exact_tokens_for_tokens`] successfully.
     */
    "add_liquidity": Anonymize<Iddvk596rbl31l>;
    /**
     *Allows you to remove liquidity by providing the `lp_token_burn` tokens that will be
     *burned in the process. With the usage of `amount1_min_receive`/`amount2_min_receive`
     *it's possible to control the min amount of returned tokens you're happy with.
     */
    "remove_liquidity": Anonymize<I3iap9ri572kjf>;
    /**
     *Swap the exact amount of `asset1` into `asset2`.
     *`amount_out_min` param allows you to specify the min amount of the `asset2`
     *you're happy to receive.
     *
     *[`AssetConversionApi::quote_price_exact_tokens_for_tokens`] runtime call can be called
     *for a quote.
     */
    "swap_exact_tokens_for_tokens": Anonymize<I48iqqqmt2pr38>;
    /**
     *Swap any amount of `asset1` to get the exact amount of `asset2`.
     *`amount_in_max` param allows to specify the max amount of the `asset1`
     *you're happy to provide.
     *
     *[`AssetConversionApi::quote_price_tokens_for_exact_tokens`] runtime call can be called
     *for a quote.
     */
    "swap_tokens_for_exact_tokens": Anonymize<I90ob4vr51rue4>;
    /**
     *Touch an existing pool to fulfill prerequisites before providing liquidity, such as
     *ensuring that the pool's accounts are in place. It is typically useful when a pool
     *creator removes the pool's accounts and does not provide a liquidity. This action may
     *involve holding assets from the caller as a deposit for creating the pool's accounts.
     *
     *The origin must be Signed.
     *
     *- `asset1`: The asset ID of an existing pool with a pair (asset1, asset2).
     *- `asset2`: The asset ID of an existing pool with a pair (asset1, asset2).
     *
     *Emits `Touched` event when successful.
     */
    "touch": Anonymize<I8eoqk45hnet27>;
}>;
export type I8eoqk45hnet27 = {
    "asset1": Anonymize<I4c0s5cioidn76>;
    "asset2": Anonymize<I4c0s5cioidn76>;
};
export type Iddvk596rbl31l = {
    "asset1": Anonymize<I4c0s5cioidn76>;
    "asset2": Anonymize<I4c0s5cioidn76>;
    "amount1_desired": bigint;
    "amount2_desired": bigint;
    "amount1_min": bigint;
    "amount2_min": bigint;
    "mint_to": SS58String;
};
export type I3iap9ri572kjf = {
    "asset1": Anonymize<I4c0s5cioidn76>;
    "asset2": Anonymize<I4c0s5cioidn76>;
    "lp_token_burn": bigint;
    "amount1_min_receive": bigint;
    "amount2_min_receive": bigint;
    "withdraw_to": SS58String;
};
export type I48iqqqmt2pr38 = {
    "path": Anonymize<Ia88a8r9e89e2p>;
    "amount_in": bigint;
    "amount_out_min": bigint;
    "send_to": SS58String;
    "keep_alive": boolean;
};
export type Ia88a8r9e89e2p = Array<Anonymize<I4c0s5cioidn76>>;
export type I90ob4vr51rue4 = {
    "path": Anonymize<Ia88a8r9e89e2p>;
    "amount_out": bigint;
    "amount_in_max": bigint;
    "send_to": SS58String;
    "keep_alive": boolean;
};
export type Iaqet9jc3ihboe = {
    "header": Anonymize<Ic952bubvq4k7d>;
    "extrinsics": Anonymize<Itom7fk49o0c9>;
};
export type Ic952bubvq4k7d = {
    "parent_hash": FixedSizeBinary<32>;
    "number": number;
    "state_root": FixedSizeBinary<32>;
    "extrinsics_root": FixedSizeBinary<32>;
    "digest": Anonymize<I4mddgoa69c0a2>;
};
export type I2v50gu3s1aqk6 = AnonymousEnum<{
    "AllExtrinsics": undefined;
    "OnlyInherents": undefined;
}>;
export type Iai7icf56nsvk8 = ResultPayload<Anonymize<I6sjjdpu2cscpe>, TransactionValidityError>;
export type TransactionValidityError = Enum<{
    "Invalid": TransactionValidityInvalidTransaction;
    "Unknown": TransactionValidityUnknownTransaction;
}>;
export declare const TransactionValidityError: GetEnum<TransactionValidityError>;
export type TransactionValidityInvalidTransaction = Enum<{
    "Call": undefined;
    "Payment": undefined;
    "Future": undefined;
    "Stale": undefined;
    "BadProof": undefined;
    "AncientBirthBlock": undefined;
    "ExhaustsResources": undefined;
    "Custom": number;
    "BadMandatory": undefined;
    "MandatoryValidation": undefined;
    "BadSigner": undefined;
}>;
export declare const TransactionValidityInvalidTransaction: GetEnum<TransactionValidityInvalidTransaction>;
export type TransactionValidityUnknownTransaction = Enum<{
    "CannotLookup": undefined;
    "NoUnsignedValidator": undefined;
    "Custom": number;
}>;
export declare const TransactionValidityUnknownTransaction: GetEnum<TransactionValidityUnknownTransaction>;
export type If7uv525tdvv7a = Array<Anonymize<I76hdjk9qh40no>>;
export type I76hdjk9qh40no = [FixedSizeBinary<8>, Binary];
export type I2an1fs2eiebjp = {
    "okay": boolean;
    "fatal_error": boolean;
    "errors": Anonymize<If7uv525tdvv7a>;
};
export type TransactionValidityTransactionSource = Enum<{
    "InBlock": undefined;
    "Local": undefined;
    "External": undefined;
}>;
export declare const TransactionValidityTransactionSource: GetEnum<TransactionValidityTransactionSource>;
export type Iajbob6uln5jct = ResultPayload<Anonymize<I6g5lcd9vf2cr0>, TransactionValidityError>;
export type I6g5lcd9vf2cr0 = {
    "priority": bigint;
    "requires": Anonymize<Itom7fk49o0c9>;
    "provides": Anonymize<Itom7fk49o0c9>;
    "longevity": bigint;
    "propagate": boolean;
};
export type Icerf8h8pdu8ss = (Anonymize<I66iuq7l8se39>) | undefined;
export type I66iuq7l8se39 = Array<Anonymize<I9tmff36km6vjg>>;
export type I9tmff36km6vjg = [Binary, FixedSizeBinary<4>];
export type I6spmpef2c7svf = {
    "weight": Anonymize<I4q39t5hn830vp>;
    "class": DispatchClass;
    "partial_fee": bigint;
};
export type Iei2mvq0mjvt81 = {
    "inclusion_fee"?: Anonymize<Id37fum600qfau>;
    "tip": bigint;
};
export type Id37fum600qfau = (Anonymize<I246faqtjrsnee>) | undefined;
export type I246faqtjrsnee = {
    "base_fee": bigint;
    "len_fee": bigint;
    "adjusted_weight_fee": bigint;
};
export type I2g5nrfnsbr9n0 = AnonymousEnum<{
    "System": Anonymize<Iekve0i6djpd9f>;
    "ParachainSystem": Anonymize<I3jmip7qjlcqot>;
    "Timestamp": Anonymize<I7d75gqfg6jh9c>;
    "ParachainInfo": undefined;
    "Balances": Anonymize<I9svldsp29mh87>;
    "Vesting": Anonymize<Icgf8vmtkbnu4u>;
    "CollatorSelection": Anonymize<I9dpq5287dur8b>;
    "Session": Anonymize<I77dda7hps0u37>;
    "XcmpQueue": Anonymize<Ib7tahn20bvsep>;
    "PolkadotXcm": Anonymize<I9nbjvlrb9bp1g>;
    "CumulusXcm": undefined;
    "ToKusamaXcmRouter": Anonymize<I6epb28bkd5aqn>;
    "MessageQueue": Anonymize<Ic2uoe7jdksosp>;
    "Utility": Anonymize<I8ikgojd2kp4nr>;
    "Multisig": Anonymize<I2i3jnq078uco0>;
    "Proxy": Anonymize<I6qfut29tv8are>;
    "Assets": Anonymize<Ideusanoto4b1j>;
    "Uniques": Anonymize<Icu49uv7rfej74>;
    "Nfts": Anonymize<I1k4il7i5elhc7>;
    "ForeignAssets": Anonymize<I2clougp67ufee>;
    "PoolAssets": Anonymize<Ideusanoto4b1j>;
    "AssetConversion": Anonymize<I9eemk0c7gip8o>;
}>;
export type I1p1369d52j8jd = ResultPayload<Anonymize<I66cvqflm1qj24>, Anonymize<Iavct6f844hfju>>;
export type I66cvqflm1qj24 = Array<XcmVersionedAssetId>;
export type Iavct6f844hfju = AnonymousEnum<{
    "Unimplemented": undefined;
    "VersionedConversionFailed": undefined;
    "WeightNotComputable": undefined;
    "UnhandledXcmVersion": undefined;
    "AssetNotFound": undefined;
    "Unroutable": undefined;
}>;
export type Ic0c3req3mlc1l = ResultPayload<Anonymize<I4q39t5hn830vp>, Anonymize<Iavct6f844hfju>>;
export type I7ocn4njqde3v5 = ResultPayload<bigint, Anonymize<Iavct6f844hfju>>;
export type I5rlt6h8ph553n = ResultPayload<XcmVersionedAssets, Anonymize<Iavct6f844hfju>>;
export type Id5e0bqoki0bb0 = ResultPayload<Anonymize<I2b61r7oveqvlt>, Anonymize<I55ku9c5gk50hb>>;
export type I2b61r7oveqvlt = {
    "execution_result": Anonymize<Ic6s0p82uhoidt>;
    "emitted_events": Anonymize<I6ulg2ml1s5o2p>;
    "local_xcm"?: Anonymize<I3i0ce56p044d2>;
    "forwarded_xcms": Anonymize<I47tkk5e5nm6g7>;
};
export type Ic6s0p82uhoidt = ResultPayload<Anonymize<Ia1u1r3n74r13c>, Anonymize<I3n1v5i2efq6rh>>;
export type Ia1u1r3n74r13c = {
    "actual_weight"?: Anonymize<Iasb8k6ash5mjn>;
    "pays_fee": Anonymize<Iehg04bj71rkd>;
};
export type I3n1v5i2efq6rh = {
    "post_info": Anonymize<Ia1u1r3n74r13c>;
    "error": Anonymize<Icogrvf0inr18b>;
};
export type I6ulg2ml1s5o2p = Array<Anonymize<I668na8k863p14>>;
export type I3i0ce56p044d2 = (XcmVersionedXcm) | undefined;
export type I47tkk5e5nm6g7 = Array<Anonymize<I60vv2hvlt348b>>;
export type I60vv2hvlt348b = [XcmVersionedLocation, Anonymize<I7ao2ct6q454mu>];
export type I7ao2ct6q454mu = Array<XcmVersionedXcm>;
export type I55ku9c5gk50hb = AnonymousEnum<{
    "Unimplemented": undefined;
    "VersionedConversionFailed": undefined;
}>;
export type I6sn3ln0su7un5 = ResultPayload<Anonymize<I16uv813m3c1lh>, Anonymize<I55ku9c5gk50hb>>;
export type I16uv813m3c1lh = {
    "execution_result": XcmV4TraitsOutcome;
    "emitted_events": Anonymize<I6ulg2ml1s5o2p>;
    "forwarded_xcms": Anonymize<I47tkk5e5nm6g7>;
};
export type Ieh6nis3hdbtgi = ResultPayload<SS58String, Anonymize<Ibaohq34aedndv>>;
export type Ibaohq34aedndv = AnonymousEnum<{
    "Unsupported": undefined;
    "VersionedConversionFailed": undefined;
}>;
export type I93k1anhb5gs2q = ResultPayload<XcmVersionedAssets, Anonymize<I5tspd7e422fr9>>;
export type I5tspd7e422fr9 = AnonymousEnum<{
    "AssetIdConversionFailed": undefined;
    "AmountToBalanceConversionFailed": undefined;
}>;
export type Ic1d4u2opv3fst = {
    "upward_messages": Anonymize<Itom7fk49o0c9>;
    "horizontal_messages": Anonymize<I6r5cbv8ttrb09>;
    "new_validation_code"?: Anonymize<Iabpgqcjikia83>;
    "processed_downward_messages": number;
    "hrmp_watermark": number;
    "head_data": Binary;
};
export type Ie9sr1iqcg3cgm = ResultPayload<undefined, string>;
export type I1mqgk2tmnn9i2 = (string) | undefined;
export type I6lr8sctk0bi4e = Array<string>;
export type I5vv5n03oo8gas = (Anonymize<I200n1ov5tbcvr>) | undefined;
export type I200n1ov5tbcvr = FixedSizeArray<2, bigint>;
export {};
