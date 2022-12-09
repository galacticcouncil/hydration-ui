// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import "@polkadot/types/types/registry"

import type {
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
  FrameSupportWeightsPerDispatchClassWeight,
  FrameSupportWeightsPerDispatchClassWeightsPerClass,
  FrameSupportWeightsRuntimeDbWeight,
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
  OrmlTokensAccountData,
  OrmlTokensBalanceLock,
  OrmlTokensModuleCall,
  OrmlTokensModuleError,
  OrmlTokensModuleEvent,
  OrmlTokensReserveData,
  OrmlUnknownTokensModuleCall,
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
  PalletClaimsCall,
  PalletClaimsEcdsaSignature,
  PalletClaimsError,
  PalletClaimsEthereumAddress,
  PalletClaimsEvent,
  PalletCollatorRewardsError,
  PalletCollatorRewardsEvent,
  PalletCollatorSelectionCall,
  PalletCollatorSelectionCandidateInfo,
  PalletCollatorSelectionError,
  PalletCollatorSelectionEvent,
  PalletCollectiveCall,
  PalletCollectiveError,
  PalletCollectiveEvent,
  PalletCollectiveRawOrigin,
  PalletCollectiveVotes,
  PalletCurrenciesModuleCall,
  PalletCurrenciesModuleError,
  PalletCurrenciesModuleEvent,
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
  PalletElectionsPhragmenCall,
  PalletElectionsPhragmenError,
  PalletElectionsPhragmenEvent,
  PalletElectionsPhragmenRenouncing,
  PalletElectionsPhragmenSeatHolder,
  PalletElectionsPhragmenVoter,
  PalletGenesisHistoryCall,
  PalletGenesisHistoryChain,
  PalletIdentityBitFlags,
  PalletIdentityCall,
  PalletIdentityError,
  PalletIdentityEvent,
  PalletIdentityIdentityField,
  PalletIdentityIdentityInfo,
  PalletIdentityJudgement,
  PalletIdentityRegistrarInfo,
  PalletIdentityRegistration,
  PalletMultisigCall,
  PalletMultisigError,
  PalletMultisigEvent,
  PalletMultisigMultisig,
  PalletMultisigTimepoint,
  PalletOmnipoolAssetState,
  PalletOmnipoolCall,
  PalletOmnipoolError,
  PalletOmnipoolEvent,
  PalletOmnipoolPosition,
  PalletOmnipoolSimpleImbalance,
  PalletOmnipoolTradability,
  PalletPreimageCall,
  PalletPreimageError,
  PalletPreimageEvent,
  PalletPreimageRequestStatus,
  PalletProxyAnnouncement,
  PalletProxyCall,
  PalletProxyError,
  PalletProxyEvent,
  PalletProxyProxyDefinition,
  PalletRelaychainInfoCall,
  PalletRelaychainInfoError,
  PalletRelaychainInfoEvent,
  PalletSchedulerCall,
  PalletSchedulerError,
  PalletSchedulerEvent,
  PalletSchedulerScheduledV3,
  PalletSessionCall,
  PalletSessionError,
  PalletSessionEvent,
  PalletSudoCall,
  PalletSudoError,
  PalletSudoEvent,
  PalletTimestampCall,
  PalletTipsCall,
  PalletTipsError,
  PalletTipsEvent,
  PalletTipsOpenTip,
  PalletTransactionMultiPaymentCall,
  PalletTransactionMultiPaymentError,
  PalletTransactionMultiPaymentEvent,
  PalletTransactionPauseCall,
  PalletTransactionPauseError,
  PalletTransactionPauseEvent,
  PalletTransactionPaymentChargeTransactionPayment,
  PalletTransactionPaymentEvent,
  PalletTransactionPaymentReleases,
  PalletTreasuryCall,
  PalletTreasuryError,
  PalletTreasuryEvent,
  PalletTreasuryProposal,
  PalletUniquesCall,
  PalletUniquesCollectionDetails,
  PalletUniquesCollectionMetadata,
  PalletUniquesDestroyWitness,
  PalletUniquesError,
  PalletUniquesEvent,
  PalletUniquesItemDetails,
  PalletUniquesItemMetadata,
  PalletUtilityCall,
  PalletUtilityError,
  PalletUtilityEvent,
  PalletXcmCall,
  PalletXcmError,
  PalletXcmEvent,
  PalletXcmOrigin,
  PalletXcmQueryStatus,
  PalletXcmVersionMigrationStage,
  ParachainInfoCall,
  PolkadotCorePrimitivesInboundDownwardMessage,
  PolkadotCorePrimitivesInboundHrmpMessage,
  PolkadotCorePrimitivesOutboundHrmpMessage,
  PolkadotParachainPrimitivesXcmpMessageFormat,
  PolkadotPrimitivesV2AbridgedHostConfiguration,
  PolkadotPrimitivesV2AbridgedHrmpChannel,
  PolkadotPrimitivesV2PersistedValidationData,
  PolkadotPrimitivesV2UpgradeRestriction,
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
  SpRuntimeTransactionalError,
  SpTrieStorageProof,
  SpVersionRuntimeVersion,
  TestingHydradxRuntimeAssetLocation,
  TestingHydradxRuntimeOpaqueSessionKeys,
  TestingHydradxRuntimeOriginCaller,
  TestingHydradxRuntimeRuntime,
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
    FrameSupportWeightsPerDispatchClassWeight: FrameSupportWeightsPerDispatchClassWeight
    FrameSupportWeightsPerDispatchClassWeightsPerClass: FrameSupportWeightsPerDispatchClassWeightsPerClass
    FrameSupportWeightsRuntimeDbWeight: FrameSupportWeightsRuntimeDbWeight
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
    OrmlTokensAccountData: OrmlTokensAccountData
    OrmlTokensBalanceLock: OrmlTokensBalanceLock
    OrmlTokensModuleCall: OrmlTokensModuleCall
    OrmlTokensModuleError: OrmlTokensModuleError
    OrmlTokensModuleEvent: OrmlTokensModuleEvent
    OrmlTokensReserveData: OrmlTokensReserveData
    OrmlUnknownTokensModuleCall: OrmlUnknownTokensModuleCall
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
    PalletClaimsCall: PalletClaimsCall
    PalletClaimsEcdsaSignature: PalletClaimsEcdsaSignature
    PalletClaimsError: PalletClaimsError
    PalletClaimsEthereumAddress: PalletClaimsEthereumAddress
    PalletClaimsEvent: PalletClaimsEvent
    PalletCollatorRewardsError: PalletCollatorRewardsError
    PalletCollatorRewardsEvent: PalletCollatorRewardsEvent
    PalletCollatorSelectionCall: PalletCollatorSelectionCall
    PalletCollatorSelectionCandidateInfo: PalletCollatorSelectionCandidateInfo
    PalletCollatorSelectionError: PalletCollatorSelectionError
    PalletCollatorSelectionEvent: PalletCollatorSelectionEvent
    PalletCollectiveCall: PalletCollectiveCall
    PalletCollectiveError: PalletCollectiveError
    PalletCollectiveEvent: PalletCollectiveEvent
    PalletCollectiveRawOrigin: PalletCollectiveRawOrigin
    PalletCollectiveVotes: PalletCollectiveVotes
    PalletCurrenciesModuleCall: PalletCurrenciesModuleCall
    PalletCurrenciesModuleError: PalletCurrenciesModuleError
    PalletCurrenciesModuleEvent: PalletCurrenciesModuleEvent
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
    PalletElectionsPhragmenCall: PalletElectionsPhragmenCall
    PalletElectionsPhragmenError: PalletElectionsPhragmenError
    PalletElectionsPhragmenEvent: PalletElectionsPhragmenEvent
    PalletElectionsPhragmenRenouncing: PalletElectionsPhragmenRenouncing
    PalletElectionsPhragmenSeatHolder: PalletElectionsPhragmenSeatHolder
    PalletElectionsPhragmenVoter: PalletElectionsPhragmenVoter
    PalletGenesisHistoryCall: PalletGenesisHistoryCall
    PalletGenesisHistoryChain: PalletGenesisHistoryChain
    PalletIdentityBitFlags: PalletIdentityBitFlags
    PalletIdentityCall: PalletIdentityCall
    PalletIdentityError: PalletIdentityError
    PalletIdentityEvent: PalletIdentityEvent
    PalletIdentityIdentityField: PalletIdentityIdentityField
    PalletIdentityIdentityInfo: PalletIdentityIdentityInfo
    PalletIdentityJudgement: PalletIdentityJudgement
    PalletIdentityRegistrarInfo: PalletIdentityRegistrarInfo
    PalletIdentityRegistration: PalletIdentityRegistration
    PalletMultisigCall: PalletMultisigCall
    PalletMultisigError: PalletMultisigError
    PalletMultisigEvent: PalletMultisigEvent
    PalletMultisigMultisig: PalletMultisigMultisig
    PalletMultisigTimepoint: PalletMultisigTimepoint
    PalletOmnipoolAssetState: PalletOmnipoolAssetState
    PalletOmnipoolCall: PalletOmnipoolCall
    PalletOmnipoolError: PalletOmnipoolError
    PalletOmnipoolEvent: PalletOmnipoolEvent
    PalletOmnipoolPosition: PalletOmnipoolPosition
    PalletOmnipoolSimpleImbalance: PalletOmnipoolSimpleImbalance
    PalletOmnipoolTradability: PalletOmnipoolTradability
    PalletPreimageCall: PalletPreimageCall
    PalletPreimageError: PalletPreimageError
    PalletPreimageEvent: PalletPreimageEvent
    PalletPreimageRequestStatus: PalletPreimageRequestStatus
    PalletProxyAnnouncement: PalletProxyAnnouncement
    PalletProxyCall: PalletProxyCall
    PalletProxyError: PalletProxyError
    PalletProxyEvent: PalletProxyEvent
    PalletProxyProxyDefinition: PalletProxyProxyDefinition
    PalletRelaychainInfoCall: PalletRelaychainInfoCall
    PalletRelaychainInfoError: PalletRelaychainInfoError
    PalletRelaychainInfoEvent: PalletRelaychainInfoEvent
    PalletSchedulerCall: PalletSchedulerCall
    PalletSchedulerError: PalletSchedulerError
    PalletSchedulerEvent: PalletSchedulerEvent
    PalletSchedulerScheduledV3: PalletSchedulerScheduledV3
    PalletSessionCall: PalletSessionCall
    PalletSessionError: PalletSessionError
    PalletSessionEvent: PalletSessionEvent
    PalletSudoCall: PalletSudoCall
    PalletSudoError: PalletSudoError
    PalletSudoEvent: PalletSudoEvent
    PalletTimestampCall: PalletTimestampCall
    PalletTipsCall: PalletTipsCall
    PalletTipsError: PalletTipsError
    PalletTipsEvent: PalletTipsEvent
    PalletTipsOpenTip: PalletTipsOpenTip
    PalletTransactionMultiPaymentCall: PalletTransactionMultiPaymentCall
    PalletTransactionMultiPaymentError: PalletTransactionMultiPaymentError
    PalletTransactionMultiPaymentEvent: PalletTransactionMultiPaymentEvent
    PalletTransactionPauseCall: PalletTransactionPauseCall
    PalletTransactionPauseError: PalletTransactionPauseError
    PalletTransactionPauseEvent: PalletTransactionPauseEvent
    PalletTransactionPaymentChargeTransactionPayment: PalletTransactionPaymentChargeTransactionPayment
    PalletTransactionPaymentEvent: PalletTransactionPaymentEvent
    PalletTransactionPaymentReleases: PalletTransactionPaymentReleases
    PalletTreasuryCall: PalletTreasuryCall
    PalletTreasuryError: PalletTreasuryError
    PalletTreasuryEvent: PalletTreasuryEvent
    PalletTreasuryProposal: PalletTreasuryProposal
    PalletUniquesCall: PalletUniquesCall
    PalletUniquesCollectionDetails: PalletUniquesCollectionDetails
    PalletUniquesCollectionMetadata: PalletUniquesCollectionMetadata
    PalletUniquesDestroyWitness: PalletUniquesDestroyWitness
    PalletUniquesError: PalletUniquesError
    PalletUniquesEvent: PalletUniquesEvent
    PalletUniquesItemDetails: PalletUniquesItemDetails
    PalletUniquesItemMetadata: PalletUniquesItemMetadata
    PalletUtilityCall: PalletUtilityCall
    PalletUtilityError: PalletUtilityError
    PalletUtilityEvent: PalletUtilityEvent
    PalletXcmCall: PalletXcmCall
    PalletXcmError: PalletXcmError
    PalletXcmEvent: PalletXcmEvent
    PalletXcmOrigin: PalletXcmOrigin
    PalletXcmQueryStatus: PalletXcmQueryStatus
    PalletXcmVersionMigrationStage: PalletXcmVersionMigrationStage
    ParachainInfoCall: ParachainInfoCall
    PolkadotCorePrimitivesInboundDownwardMessage: PolkadotCorePrimitivesInboundDownwardMessage
    PolkadotCorePrimitivesInboundHrmpMessage: PolkadotCorePrimitivesInboundHrmpMessage
    PolkadotCorePrimitivesOutboundHrmpMessage: PolkadotCorePrimitivesOutboundHrmpMessage
    PolkadotParachainPrimitivesXcmpMessageFormat: PolkadotParachainPrimitivesXcmpMessageFormat
    PolkadotPrimitivesV2AbridgedHostConfiguration: PolkadotPrimitivesV2AbridgedHostConfiguration
    PolkadotPrimitivesV2AbridgedHrmpChannel: PolkadotPrimitivesV2AbridgedHrmpChannel
    PolkadotPrimitivesV2PersistedValidationData: PolkadotPrimitivesV2PersistedValidationData
    PolkadotPrimitivesV2UpgradeRestriction: PolkadotPrimitivesV2UpgradeRestriction
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
    SpRuntimeTransactionalError: SpRuntimeTransactionalError
    SpTrieStorageProof: SpTrieStorageProof
    SpVersionRuntimeVersion: SpVersionRuntimeVersion
    TestingHydradxRuntimeAssetLocation: TestingHydradxRuntimeAssetLocation
    TestingHydradxRuntimeOpaqueSessionKeys: TestingHydradxRuntimeOpaqueSessionKeys
    TestingHydradxRuntimeOriginCaller: TestingHydradxRuntimeOriginCaller
    TestingHydradxRuntimeRuntime: TestingHydradxRuntimeRuntime
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
