// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import "@polkadot/types/types/registry"

import type {
  BasiliskRuntimeOpaqueSessionKeys,
  BasiliskRuntimeOriginCaller,
  BasiliskRuntimeRuntime,
  CommonRuntimeAssetLocation,
  CommonRuntimeProxyType,
  CumulusPalletDmpQueueCall,
  CumulusPalletDmpQueueConfigData,
  CumulusPalletDmpQueueError,
  CumulusPalletDmpQueueEvent,
  CumulusPalletDmpQueuePageIndexData,
  CumulusPalletParachainSystemCall,
  CumulusPalletParachainSystemError,
  CumulusPalletParachainSystemEvent,
  CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot,
  CumulusPalletXcmCall,
  CumulusPalletXcmError,
  CumulusPalletXcmEvent,
  CumulusPalletXcmOrigin,
  CumulusPalletXcmpQueueError,
  CumulusPalletXcmpQueueEvent,
  CumulusPalletXcmpQueueInboundChannelDetails,
  CumulusPalletXcmpQueueInboundState,
  CumulusPalletXcmpQueueOutboundChannelDetails,
  CumulusPalletXcmpQueueOutboundState,
  CumulusPalletXcmpQueueQueueConfigData,
  CumulusPrimitivesParachainInherentParachainInherentData,
  FrameSupportDispatchRawOrigin,
  FrameSupportPalletId,
  FrameSupportScheduleLookupError,
  FrameSupportScheduleMaybeHashed,
  FrameSupportTokensMiscBalanceStatus,
  FrameSupportWeightsDispatchClass,
  FrameSupportWeightsDispatchInfo,
  FrameSupportWeightsPays,
  FrameSupportWeightsPerDispatchClassU32,
  FrameSupportWeightsPerDispatchClassU64,
  FrameSupportWeightsPerDispatchClassWeightsPerClass,
  FrameSupportWeightsRuntimeDbWeight,
  FrameSupportWeightsWeightToFeeCoefficient,
  FrameSystemAccountInfo,
  FrameSystemCall,
  FrameSystemError,
  FrameSystemEvent,
  FrameSystemEventRecord,
  FrameSystemExtensionsCheckGenesis,
  FrameSystemExtensionsCheckNonce,
  FrameSystemExtensionsCheckSpecVersion,
  FrameSystemExtensionsCheckTxVersion,
  FrameSystemExtensionsCheckWeight,
  FrameSystemLastRuntimeUpgradeInfo,
  FrameSystemLimitsBlockLength,
  FrameSystemLimitsBlockWeights,
  FrameSystemLimitsWeightsPerClass,
  FrameSystemPhase,
  OrmlCurrenciesModuleCall,
  OrmlCurrenciesModuleError,
  OrmlCurrenciesModuleEvent,
  OrmlTokensAccountData,
  OrmlTokensBalanceLock,
  OrmlTokensModuleCall,
  OrmlTokensModuleError,
  OrmlTokensModuleEvent,
  OrmlUnknownTokensModuleError,
  OrmlUnknownTokensModuleEvent,
  OrmlVestingModuleCall,
  OrmlVestingModuleError,
  OrmlVestingModuleEvent,
  OrmlVestingVestingSchedule,
  OrmlXcmModuleCall,
  OrmlXcmModuleError,
  OrmlXcmModuleEvent,
  OrmlXtokensModuleCall,
  OrmlXtokensModuleError,
  OrmlXtokensModuleEvent,
  PalletAssetRegistryAssetDetails,
  PalletAssetRegistryAssetMetadata,
  PalletAssetRegistryAssetType,
  PalletAssetRegistryCall,
  PalletAssetRegistryError,
  PalletAssetRegistryEvent,
  PalletAuthorshipCall,
  PalletAuthorshipError,
  PalletAuthorshipUncleEntryItem,
  PalletBalancesAccountData,
  PalletBalancesBalanceLock,
  PalletBalancesCall,
  PalletBalancesError,
  PalletBalancesEvent,
  PalletBalancesReasons,
  PalletBalancesReleases,
  PalletBalancesReserveData,
  PalletCollatorSelectionCall,
  PalletCollatorSelectionCandidateInfo,
  PalletCollatorSelectionError,
  PalletCollatorSelectionEvent,
  PalletCollectiveCall,
  PalletCollectiveError,
  PalletCollectiveEvent,
  PalletCollectiveRawOrigin,
  PalletCollectiveVotes,
  PalletDemocracyCall,
  PalletDemocracyConviction,
  PalletDemocracyDelegations,
  PalletDemocracyError,
  PalletDemocracyEvent,
  PalletDemocracyPreimageStatus,
  PalletDemocracyReferendumInfo,
  PalletDemocracyReferendumStatus,
  PalletDemocracyReleases,
  PalletDemocracyTally,
  PalletDemocracyVoteAccountVote,
  PalletDemocracyVotePriorLock,
  PalletDemocracyVoteThreshold,
  PalletDemocracyVoteVoting,
  PalletDusterCall,
  PalletDusterError,
  PalletDusterEvent,
  PalletElectionsPhragmenCall,
  PalletElectionsPhragmenError,
  PalletElectionsPhragmenEvent,
  PalletElectionsPhragmenRenouncing,
  PalletElectionsPhragmenSeatHolder,
  PalletElectionsPhragmenVoter,
  PalletExchangeCall,
  PalletExchangeError,
  PalletExchangeEvent,
  PalletIdentityBitFlags,
  PalletIdentityCall,
  PalletIdentityError,
  PalletIdentityEvent,
  PalletIdentityIdentityField,
  PalletIdentityIdentityInfo,
  PalletIdentityJudgement,
  PalletIdentityRegistrarInfo,
  PalletIdentityRegistration,
  PalletLbpCall,
  PalletLbpError,
  PalletLbpEvent,
  PalletLbpPool,
  PalletLbpWeightCurveType,
  PalletMarketplaceCall,
  PalletMarketplaceError,
  PalletMarketplaceEvent,
  PalletMarketplaceOffer,
  PalletMarketplaceRoyalty,
  PalletMultisigCall,
  PalletMultisigError,
  PalletMultisigEvent,
  PalletMultisigMultisig,
  PalletMultisigTimepoint,
  PalletNftCall,
  PalletNftClassInfo,
  PalletNftError,
  PalletNftEvent,
  PalletNftInstanceInfo,
  PalletPreimageCall,
  PalletPreimageError,
  PalletPreimageEvent,
  PalletPreimageRequestStatus,
  PalletProxyAnnouncement,
  PalletProxyCall,
  PalletProxyError,
  PalletProxyEvent,
  PalletProxyProxyDefinition,
  PalletRelaychainInfoError,
  PalletRelaychainInfoEvent,
  PalletSchedulerCall,
  PalletSchedulerError,
  PalletSchedulerEvent,
  PalletSchedulerScheduledV3,
  PalletSessionCall,
  PalletSessionError,
  PalletSessionEvent,
  PalletTimestampCall,
  PalletTipsCall,
  PalletTipsError,
  PalletTipsEvent,
  PalletTipsOpenTip,
  PalletTransactionMultiPaymentCall,
  PalletTransactionMultiPaymentCurrencyBalanceCheck,
  PalletTransactionMultiPaymentError,
  PalletTransactionMultiPaymentEvent,
  PalletTransactionPauseCall,
  PalletTransactionPauseError,
  PalletTransactionPauseEvent,
  PalletTransactionPaymentChargeTransactionPayment,
  PalletTransactionPaymentReleases,
  PalletTreasuryCall,
  PalletTreasuryError,
  PalletTreasuryEvent,
  PalletTreasuryProposal,
  PalletUniquesCall,
  PalletUniquesClassDetails,
  PalletUniquesClassMetadata,
  PalletUniquesDestroyWitness,
  PalletUniquesError,
  PalletUniquesEvent,
  PalletUniquesInstanceDetails,
  PalletUniquesInstanceMetadata,
  PalletUtilityCall,
  PalletUtilityError,
  PalletUtilityEvent,
  PalletXcmCall,
  PalletXcmError,
  PalletXcmEvent,
  PalletXcmOrigin,
  PalletXcmQueryStatus,
  PalletXcmVersionMigrationStage,
  PalletXykCall,
  PalletXykError,
  PalletXykEvent,
  PolkadotCorePrimitivesInboundDownwardMessage,
  PolkadotCorePrimitivesInboundHrmpMessage,
  PolkadotCorePrimitivesOutboundHrmpMessage,
  PolkadotParachainPrimitivesXcmpMessageFormat,
  PolkadotPrimitivesV1AbridgedHostConfiguration,
  PolkadotPrimitivesV1AbridgedHrmpChannel,
  PolkadotPrimitivesV1PersistedValidationData,
  PolkadotPrimitivesV1UpgradeRestriction,
  PrimitivesAssetAssetPair,
  PrimitivesExchangeIntention,
  PrimitivesIntentionType,
  PrimitivesNftClassType,
  SpConsensusAuraSr25519AppSr25519Public,
  SpCoreCryptoKeyTypeId,
  SpCoreEcdsaSignature,
  SpCoreEd25519Signature,
  SpCoreSr25519Public,
  SpCoreSr25519Signature,
  SpCoreVoid,
  SpRuntimeArithmeticError,
  SpRuntimeBlakeTwo256,
  SpRuntimeDigest,
  SpRuntimeDigestDigestItem,
  SpRuntimeDispatchError,
  SpRuntimeHeader,
  SpRuntimeModuleError,
  SpRuntimeMultiSignature,
  SpRuntimeTokenError,
  SpTrieStorageProof,
  SpVersionRuntimeVersion,
  XcmDoubleEncoded,
  XcmV0Junction,
  XcmV0JunctionBodyId,
  XcmV0JunctionBodyPart,
  XcmV0JunctionNetworkId,
  XcmV0MultiAsset,
  XcmV0MultiLocation,
  XcmV0Order,
  XcmV0OriginKind,
  XcmV0Response,
  XcmV0Xcm,
  XcmV1Junction,
  XcmV1MultiAsset,
  XcmV1MultiLocation,
  XcmV1MultiassetAssetId,
  XcmV1MultiassetAssetInstance,
  XcmV1MultiassetFungibility,
  XcmV1MultiassetMultiAssetFilter,
  XcmV1MultiassetMultiAssets,
  XcmV1MultiassetWildFungibility,
  XcmV1MultiassetWildMultiAsset,
  XcmV1MultilocationJunctions,
  XcmV1Order,
  XcmV1Response,
  XcmV1Xcm,
  XcmV2Instruction,
  XcmV2Response,
  XcmV2TraitsError,
  XcmV2TraitsOutcome,
  XcmV2WeightLimit,
  XcmV2Xcm,
  XcmVersionedMultiAsset,
  XcmVersionedMultiAssets,
  XcmVersionedMultiLocation,
  XcmVersionedResponse,
  XcmVersionedXcm,
} from "@polkadot/types/lookup"

declare module "@polkadot/types/types/registry" {
  interface InterfaceTypes {
    BasiliskRuntimeOpaqueSessionKeys: BasiliskRuntimeOpaqueSessionKeys
    BasiliskRuntimeOriginCaller: BasiliskRuntimeOriginCaller
    BasiliskRuntimeRuntime: BasiliskRuntimeRuntime
    CommonRuntimeAssetLocation: CommonRuntimeAssetLocation
    CommonRuntimeProxyType: CommonRuntimeProxyType
    CumulusPalletDmpQueueCall: CumulusPalletDmpQueueCall
    CumulusPalletDmpQueueConfigData: CumulusPalletDmpQueueConfigData
    CumulusPalletDmpQueueError: CumulusPalletDmpQueueError
    CumulusPalletDmpQueueEvent: CumulusPalletDmpQueueEvent
    CumulusPalletDmpQueuePageIndexData: CumulusPalletDmpQueuePageIndexData
    CumulusPalletParachainSystemCall: CumulusPalletParachainSystemCall
    CumulusPalletParachainSystemError: CumulusPalletParachainSystemError
    CumulusPalletParachainSystemEvent: CumulusPalletParachainSystemEvent
    CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot: CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot
    CumulusPalletXcmCall: CumulusPalletXcmCall
    CumulusPalletXcmError: CumulusPalletXcmError
    CumulusPalletXcmEvent: CumulusPalletXcmEvent
    CumulusPalletXcmOrigin: CumulusPalletXcmOrigin
    CumulusPalletXcmpQueueError: CumulusPalletXcmpQueueError
    CumulusPalletXcmpQueueEvent: CumulusPalletXcmpQueueEvent
    CumulusPalletXcmpQueueInboundChannelDetails: CumulusPalletXcmpQueueInboundChannelDetails
    CumulusPalletXcmpQueueInboundState: CumulusPalletXcmpQueueInboundState
    CumulusPalletXcmpQueueOutboundChannelDetails: CumulusPalletXcmpQueueOutboundChannelDetails
    CumulusPalletXcmpQueueOutboundState: CumulusPalletXcmpQueueOutboundState
    CumulusPalletXcmpQueueQueueConfigData: CumulusPalletXcmpQueueQueueConfigData
    CumulusPrimitivesParachainInherentParachainInherentData: CumulusPrimitivesParachainInherentParachainInherentData
    FrameSupportDispatchRawOrigin: FrameSupportDispatchRawOrigin
    FrameSupportPalletId: FrameSupportPalletId
    FrameSupportScheduleLookupError: FrameSupportScheduleLookupError
    FrameSupportScheduleMaybeHashed: FrameSupportScheduleMaybeHashed
    FrameSupportTokensMiscBalanceStatus: FrameSupportTokensMiscBalanceStatus
    FrameSupportWeightsDispatchClass: FrameSupportWeightsDispatchClass
    FrameSupportWeightsDispatchInfo: FrameSupportWeightsDispatchInfo
    FrameSupportWeightsPays: FrameSupportWeightsPays
    FrameSupportWeightsPerDispatchClassU32: FrameSupportWeightsPerDispatchClassU32
    FrameSupportWeightsPerDispatchClassU64: FrameSupportWeightsPerDispatchClassU64
    FrameSupportWeightsPerDispatchClassWeightsPerClass: FrameSupportWeightsPerDispatchClassWeightsPerClass
    FrameSupportWeightsRuntimeDbWeight: FrameSupportWeightsRuntimeDbWeight
    FrameSupportWeightsWeightToFeeCoefficient: FrameSupportWeightsWeightToFeeCoefficient
    FrameSystemAccountInfo: FrameSystemAccountInfo
    FrameSystemCall: FrameSystemCall
    FrameSystemError: FrameSystemError
    FrameSystemEvent: FrameSystemEvent
    FrameSystemEventRecord: FrameSystemEventRecord
    FrameSystemExtensionsCheckGenesis: FrameSystemExtensionsCheckGenesis
    FrameSystemExtensionsCheckNonce: FrameSystemExtensionsCheckNonce
    FrameSystemExtensionsCheckSpecVersion: FrameSystemExtensionsCheckSpecVersion
    FrameSystemExtensionsCheckTxVersion: FrameSystemExtensionsCheckTxVersion
    FrameSystemExtensionsCheckWeight: FrameSystemExtensionsCheckWeight
    FrameSystemLastRuntimeUpgradeInfo: FrameSystemLastRuntimeUpgradeInfo
    FrameSystemLimitsBlockLength: FrameSystemLimitsBlockLength
    FrameSystemLimitsBlockWeights: FrameSystemLimitsBlockWeights
    FrameSystemLimitsWeightsPerClass: FrameSystemLimitsWeightsPerClass
    FrameSystemPhase: FrameSystemPhase
    OrmlCurrenciesModuleCall: OrmlCurrenciesModuleCall
    OrmlCurrenciesModuleError: OrmlCurrenciesModuleError
    OrmlCurrenciesModuleEvent: OrmlCurrenciesModuleEvent
    OrmlTokensAccountData: OrmlTokensAccountData
    OrmlTokensBalanceLock: OrmlTokensBalanceLock
    OrmlTokensModuleCall: OrmlTokensModuleCall
    OrmlTokensModuleError: OrmlTokensModuleError
    OrmlTokensModuleEvent: OrmlTokensModuleEvent
    OrmlUnknownTokensModuleError: OrmlUnknownTokensModuleError
    OrmlUnknownTokensModuleEvent: OrmlUnknownTokensModuleEvent
    OrmlVestingModuleCall: OrmlVestingModuleCall
    OrmlVestingModuleError: OrmlVestingModuleError
    OrmlVestingModuleEvent: OrmlVestingModuleEvent
    OrmlVestingVestingSchedule: OrmlVestingVestingSchedule
    OrmlXcmModuleCall: OrmlXcmModuleCall
    OrmlXcmModuleError: OrmlXcmModuleError
    OrmlXcmModuleEvent: OrmlXcmModuleEvent
    OrmlXtokensModuleCall: OrmlXtokensModuleCall
    OrmlXtokensModuleError: OrmlXtokensModuleError
    OrmlXtokensModuleEvent: OrmlXtokensModuleEvent
    PalletAssetRegistryAssetDetails: PalletAssetRegistryAssetDetails
    PalletAssetRegistryAssetMetadata: PalletAssetRegistryAssetMetadata
    PalletAssetRegistryAssetType: PalletAssetRegistryAssetType
    PalletAssetRegistryCall: PalletAssetRegistryCall
    PalletAssetRegistryError: PalletAssetRegistryError
    PalletAssetRegistryEvent: PalletAssetRegistryEvent
    PalletAuthorshipCall: PalletAuthorshipCall
    PalletAuthorshipError: PalletAuthorshipError
    PalletAuthorshipUncleEntryItem: PalletAuthorshipUncleEntryItem
    PalletBalancesAccountData: PalletBalancesAccountData
    PalletBalancesBalanceLock: PalletBalancesBalanceLock
    PalletBalancesCall: PalletBalancesCall
    PalletBalancesError: PalletBalancesError
    PalletBalancesEvent: PalletBalancesEvent
    PalletBalancesReasons: PalletBalancesReasons
    PalletBalancesReleases: PalletBalancesReleases
    PalletBalancesReserveData: PalletBalancesReserveData
    PalletCollatorSelectionCall: PalletCollatorSelectionCall
    PalletCollatorSelectionCandidateInfo: PalletCollatorSelectionCandidateInfo
    PalletCollatorSelectionError: PalletCollatorSelectionError
    PalletCollatorSelectionEvent: PalletCollatorSelectionEvent
    PalletCollectiveCall: PalletCollectiveCall
    PalletCollectiveError: PalletCollectiveError
    PalletCollectiveEvent: PalletCollectiveEvent
    PalletCollectiveRawOrigin: PalletCollectiveRawOrigin
    PalletCollectiveVotes: PalletCollectiveVotes
    PalletDemocracyCall: PalletDemocracyCall
    PalletDemocracyConviction: PalletDemocracyConviction
    PalletDemocracyDelegations: PalletDemocracyDelegations
    PalletDemocracyError: PalletDemocracyError
    PalletDemocracyEvent: PalletDemocracyEvent
    PalletDemocracyPreimageStatus: PalletDemocracyPreimageStatus
    PalletDemocracyReferendumInfo: PalletDemocracyReferendumInfo
    PalletDemocracyReferendumStatus: PalletDemocracyReferendumStatus
    PalletDemocracyReleases: PalletDemocracyReleases
    PalletDemocracyTally: PalletDemocracyTally
    PalletDemocracyVoteAccountVote: PalletDemocracyVoteAccountVote
    PalletDemocracyVotePriorLock: PalletDemocracyVotePriorLock
    PalletDemocracyVoteThreshold: PalletDemocracyVoteThreshold
    PalletDemocracyVoteVoting: PalletDemocracyVoteVoting
    PalletDusterCall: PalletDusterCall
    PalletDusterError: PalletDusterError
    PalletDusterEvent: PalletDusterEvent
    PalletElectionsPhragmenCall: PalletElectionsPhragmenCall
    PalletElectionsPhragmenError: PalletElectionsPhragmenError
    PalletElectionsPhragmenEvent: PalletElectionsPhragmenEvent
    PalletElectionsPhragmenRenouncing: PalletElectionsPhragmenRenouncing
    PalletElectionsPhragmenSeatHolder: PalletElectionsPhragmenSeatHolder
    PalletElectionsPhragmenVoter: PalletElectionsPhragmenVoter
    PalletExchangeCall: PalletExchangeCall
    PalletExchangeError: PalletExchangeError
    PalletExchangeEvent: PalletExchangeEvent
    PalletIdentityBitFlags: PalletIdentityBitFlags
    PalletIdentityCall: PalletIdentityCall
    PalletIdentityError: PalletIdentityError
    PalletIdentityEvent: PalletIdentityEvent
    PalletIdentityIdentityField: PalletIdentityIdentityField
    PalletIdentityIdentityInfo: PalletIdentityIdentityInfo
    PalletIdentityJudgement: PalletIdentityJudgement
    PalletIdentityRegistrarInfo: PalletIdentityRegistrarInfo
    PalletIdentityRegistration: PalletIdentityRegistration
    PalletLbpCall: PalletLbpCall
    PalletLbpError: PalletLbpError
    PalletLbpEvent: PalletLbpEvent
    PalletLbpPool: PalletLbpPool
    PalletLbpWeightCurveType: PalletLbpWeightCurveType
    PalletMarketplaceCall: PalletMarketplaceCall
    PalletMarketplaceError: PalletMarketplaceError
    PalletMarketplaceEvent: PalletMarketplaceEvent
    PalletMarketplaceOffer: PalletMarketplaceOffer
    PalletMarketplaceRoyalty: PalletMarketplaceRoyalty
    PalletMultisigCall: PalletMultisigCall
    PalletMultisigError: PalletMultisigError
    PalletMultisigEvent: PalletMultisigEvent
    PalletMultisigMultisig: PalletMultisigMultisig
    PalletMultisigTimepoint: PalletMultisigTimepoint
    PalletNftCall: PalletNftCall
    PalletNftClassInfo: PalletNftClassInfo
    PalletNftError: PalletNftError
    PalletNftEvent: PalletNftEvent
    PalletNftInstanceInfo: PalletNftInstanceInfo
    PalletPreimageCall: PalletPreimageCall
    PalletPreimageError: PalletPreimageError
    PalletPreimageEvent: PalletPreimageEvent
    PalletPreimageRequestStatus: PalletPreimageRequestStatus
    PalletProxyAnnouncement: PalletProxyAnnouncement
    PalletProxyCall: PalletProxyCall
    PalletProxyError: PalletProxyError
    PalletProxyEvent: PalletProxyEvent
    PalletProxyProxyDefinition: PalletProxyProxyDefinition
    PalletRelaychainInfoError: PalletRelaychainInfoError
    PalletRelaychainInfoEvent: PalletRelaychainInfoEvent
    PalletSchedulerCall: PalletSchedulerCall
    PalletSchedulerError: PalletSchedulerError
    PalletSchedulerEvent: PalletSchedulerEvent
    PalletSchedulerScheduledV3: PalletSchedulerScheduledV3
    PalletSessionCall: PalletSessionCall
    PalletSessionError: PalletSessionError
    PalletSessionEvent: PalletSessionEvent
    PalletTimestampCall: PalletTimestampCall
    PalletTipsCall: PalletTipsCall
    PalletTipsError: PalletTipsError
    PalletTipsEvent: PalletTipsEvent
    PalletTipsOpenTip: PalletTipsOpenTip
    PalletTransactionMultiPaymentCall: PalletTransactionMultiPaymentCall
    PalletTransactionMultiPaymentCurrencyBalanceCheck: PalletTransactionMultiPaymentCurrencyBalanceCheck
    PalletTransactionMultiPaymentError: PalletTransactionMultiPaymentError
    PalletTransactionMultiPaymentEvent: PalletTransactionMultiPaymentEvent
    PalletTransactionPauseCall: PalletTransactionPauseCall
    PalletTransactionPauseError: PalletTransactionPauseError
    PalletTransactionPauseEvent: PalletTransactionPauseEvent
    PalletTransactionPaymentChargeTransactionPayment: PalletTransactionPaymentChargeTransactionPayment
    PalletTransactionPaymentReleases: PalletTransactionPaymentReleases
    PalletTreasuryCall: PalletTreasuryCall
    PalletTreasuryError: PalletTreasuryError
    PalletTreasuryEvent: PalletTreasuryEvent
    PalletTreasuryProposal: PalletTreasuryProposal
    PalletUniquesCall: PalletUniquesCall
    PalletUniquesClassDetails: PalletUniquesClassDetails
    PalletUniquesClassMetadata: PalletUniquesClassMetadata
    PalletUniquesDestroyWitness: PalletUniquesDestroyWitness
    PalletUniquesError: PalletUniquesError
    PalletUniquesEvent: PalletUniquesEvent
    PalletUniquesInstanceDetails: PalletUniquesInstanceDetails
    PalletUniquesInstanceMetadata: PalletUniquesInstanceMetadata
    PalletUtilityCall: PalletUtilityCall
    PalletUtilityError: PalletUtilityError
    PalletUtilityEvent: PalletUtilityEvent
    PalletXcmCall: PalletXcmCall
    PalletXcmError: PalletXcmError
    PalletXcmEvent: PalletXcmEvent
    PalletXcmOrigin: PalletXcmOrigin
    PalletXcmQueryStatus: PalletXcmQueryStatus
    PalletXcmVersionMigrationStage: PalletXcmVersionMigrationStage
    PalletXykCall: PalletXykCall
    PalletXykError: PalletXykError
    PalletXykEvent: PalletXykEvent
    PolkadotCorePrimitivesInboundDownwardMessage: PolkadotCorePrimitivesInboundDownwardMessage
    PolkadotCorePrimitivesInboundHrmpMessage: PolkadotCorePrimitivesInboundHrmpMessage
    PolkadotCorePrimitivesOutboundHrmpMessage: PolkadotCorePrimitivesOutboundHrmpMessage
    PolkadotParachainPrimitivesXcmpMessageFormat: PolkadotParachainPrimitivesXcmpMessageFormat
    PolkadotPrimitivesV1AbridgedHostConfiguration: PolkadotPrimitivesV1AbridgedHostConfiguration
    PolkadotPrimitivesV1AbridgedHrmpChannel: PolkadotPrimitivesV1AbridgedHrmpChannel
    PolkadotPrimitivesV1PersistedValidationData: PolkadotPrimitivesV1PersistedValidationData
    PolkadotPrimitivesV1UpgradeRestriction: PolkadotPrimitivesV1UpgradeRestriction
    PrimitivesAssetAssetPair: PrimitivesAssetAssetPair
    PrimitivesExchangeIntention: PrimitivesExchangeIntention
    PrimitivesIntentionType: PrimitivesIntentionType
    PrimitivesNftClassType: PrimitivesNftClassType
    SpConsensusAuraSr25519AppSr25519Public: SpConsensusAuraSr25519AppSr25519Public
    SpCoreCryptoKeyTypeId: SpCoreCryptoKeyTypeId
    SpCoreEcdsaSignature: SpCoreEcdsaSignature
    SpCoreEd25519Signature: SpCoreEd25519Signature
    SpCoreSr25519Public: SpCoreSr25519Public
    SpCoreSr25519Signature: SpCoreSr25519Signature
    SpCoreVoid: SpCoreVoid
    SpRuntimeArithmeticError: SpRuntimeArithmeticError
    SpRuntimeBlakeTwo256: SpRuntimeBlakeTwo256
    SpRuntimeDigest: SpRuntimeDigest
    SpRuntimeDigestDigestItem: SpRuntimeDigestDigestItem
    SpRuntimeDispatchError: SpRuntimeDispatchError
    SpRuntimeHeader: SpRuntimeHeader
    SpRuntimeModuleError: SpRuntimeModuleError
    SpRuntimeMultiSignature: SpRuntimeMultiSignature
    SpRuntimeTokenError: SpRuntimeTokenError
    SpTrieStorageProof: SpTrieStorageProof
    SpVersionRuntimeVersion: SpVersionRuntimeVersion
    XcmDoubleEncoded: XcmDoubleEncoded
    XcmV0Junction: XcmV0Junction
    XcmV0JunctionBodyId: XcmV0JunctionBodyId
    XcmV0JunctionBodyPart: XcmV0JunctionBodyPart
    XcmV0JunctionNetworkId: XcmV0JunctionNetworkId
    XcmV0MultiAsset: XcmV0MultiAsset
    XcmV0MultiLocation: XcmV0MultiLocation
    XcmV0Order: XcmV0Order
    XcmV0OriginKind: XcmV0OriginKind
    XcmV0Response: XcmV0Response
    XcmV0Xcm: XcmV0Xcm
    XcmV1Junction: XcmV1Junction
    XcmV1MultiAsset: XcmV1MultiAsset
    XcmV1MultiLocation: XcmV1MultiLocation
    XcmV1MultiassetAssetId: XcmV1MultiassetAssetId
    XcmV1MultiassetAssetInstance: XcmV1MultiassetAssetInstance
    XcmV1MultiassetFungibility: XcmV1MultiassetFungibility
    XcmV1MultiassetMultiAssetFilter: XcmV1MultiassetMultiAssetFilter
    XcmV1MultiassetMultiAssets: XcmV1MultiassetMultiAssets
    XcmV1MultiassetWildFungibility: XcmV1MultiassetWildFungibility
    XcmV1MultiassetWildMultiAsset: XcmV1MultiassetWildMultiAsset
    XcmV1MultilocationJunctions: XcmV1MultilocationJunctions
    XcmV1Order: XcmV1Order
    XcmV1Response: XcmV1Response
    XcmV1Xcm: XcmV1Xcm
    XcmV2Instruction: XcmV2Instruction
    XcmV2Response: XcmV2Response
    XcmV2TraitsError: XcmV2TraitsError
    XcmV2TraitsOutcome: XcmV2TraitsOutcome
    XcmV2WeightLimit: XcmV2WeightLimit
    XcmV2Xcm: XcmV2Xcm
    XcmVersionedMultiAsset: XcmVersionedMultiAsset
    XcmVersionedMultiAssets: XcmVersionedMultiAssets
    XcmVersionedMultiLocation: XcmVersionedMultiLocation
    XcmVersionedResponse: XcmVersionedResponse
    XcmVersionedXcm: XcmVersionedXcm
  } // InterfaceTypes
} // declare module
