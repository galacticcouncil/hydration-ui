// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

/* eslint-disable sort-keys */

export default {
  /**
   * Lookup3: frame_system::AccountInfo<Index, pallet_balances::AccountData<Balance>>
   **/
  FrameSystemAccountInfo: {
    nonce: "u32",
    consumers: "u32",
    providers: "u32",
    sufficients: "u32",
    data: "PalletBalancesAccountData",
  },
  /**
   * Lookup5: pallet_balances::AccountData<Balance>
   **/
  PalletBalancesAccountData: {
    free: "u128",
    reserved: "u128",
    miscFrozen: "u128",
    feeFrozen: "u128",
  },
  /**
   * Lookup7: frame_support::weights::PerDispatchClass<T>
   **/
  FrameSupportWeightsPerDispatchClassU64: {
    normal: "u64",
    operational: "u64",
    mandatory: "u64",
  },
  /**
   * Lookup11: sp_runtime::generic::digest::Digest
   **/
  SpRuntimeDigest: {
    logs: "Vec<SpRuntimeDigestDigestItem>",
  },
  /**
   * Lookup13: sp_runtime::generic::digest::DigestItem
   **/
  SpRuntimeDigestDigestItem: {
    _enum: {
      Other: "Bytes",
      __Unused1: "Null",
      __Unused2: "Null",
      __Unused3: "Null",
      Consensus: "([u8;4],Bytes)",
      Seal: "([u8;4],Bytes)",
      PreRuntime: "([u8;4],Bytes)",
      __Unused7: "Null",
      RuntimeEnvironmentUpdated: "Null",
    },
  },
  /**
   * Lookup16: frame_system::EventRecord<testing_hydradx_runtime::Event, primitive_types::H256>
   **/
  FrameSystemEventRecord: {
    phase: "FrameSystemPhase",
    event: "Event",
    topics: "Vec<H256>",
  },
  /**
   * Lookup18: frame_system::pallet::Event<T>
   **/
  FrameSystemEvent: {
    _enum: {
      ExtrinsicSuccess: {
        dispatchInfo: "FrameSupportWeightsDispatchInfo",
      },
      ExtrinsicFailed: {
        dispatchError: "SpRuntimeDispatchError",
        dispatchInfo: "FrameSupportWeightsDispatchInfo",
      },
      CodeUpdated: "Null",
      NewAccount: {
        account: "AccountId32",
      },
      KilledAccount: {
        account: "AccountId32",
      },
      Remarked: {
        _alias: {
          hash_: "hash",
        },
        sender: "AccountId32",
        hash_: "H256",
      },
    },
  },
  /**
   * Lookup19: frame_support::weights::DispatchInfo
   **/
  FrameSupportWeightsDispatchInfo: {
    weight: "u64",
    class: "FrameSupportWeightsDispatchClass",
    paysFee: "FrameSupportWeightsPays",
  },
  /**
   * Lookup20: frame_support::weights::DispatchClass
   **/
  FrameSupportWeightsDispatchClass: {
    _enum: ["Normal", "Operational", "Mandatory"],
  },
  /**
   * Lookup21: frame_support::weights::Pays
   **/
  FrameSupportWeightsPays: {
    _enum: ["Yes", "No"],
  },
  /**
   * Lookup22: sp_runtime::DispatchError
   **/
  SpRuntimeDispatchError: {
    _enum: {
      Other: "Null",
      CannotLookup: "Null",
      BadOrigin: "Null",
      Module: "SpRuntimeModuleError",
      ConsumerRemaining: "Null",
      NoProviders: "Null",
      TooManyConsumers: "Null",
      Token: "SpRuntimeTokenError",
      Arithmetic: "SpRuntimeArithmeticError",
      Transactional: "SpRuntimeTransactionalError",
    },
  },
  /**
   * Lookup23: sp_runtime::ModuleError
   **/
  SpRuntimeModuleError: {
    index: "u8",
    error: "[u8;4]",
  },
  /**
   * Lookup24: sp_runtime::TokenError
   **/
  SpRuntimeTokenError: {
    _enum: [
      "NoFunds",
      "WouldDie",
      "BelowMinimum",
      "CannotCreate",
      "UnknownAsset",
      "Frozen",
      "Unsupported",
    ],
  },
  /**
   * Lookup25: sp_runtime::ArithmeticError
   **/
  SpRuntimeArithmeticError: {
    _enum: ["Underflow", "Overflow", "DivisionByZero"],
  },
  /**
   * Lookup26: sp_runtime::TransactionalError
   **/
  SpRuntimeTransactionalError: {
    _enum: ["LimitReached", "NoLayer"],
  },
  /**
   * Lookup27: pallet_scheduler::pallet::Event<T>
   **/
  PalletSchedulerEvent: {
    _enum: {
      Scheduled: {
        when: "u32",
        index: "u32",
      },
      Canceled: {
        when: "u32",
        index: "u32",
      },
      Dispatched: {
        task: "(u32,u32)",
        id: "Option<Bytes>",
        result: "Result<Null, SpRuntimeDispatchError>",
      },
      CallLookupFailed: {
        task: "(u32,u32)",
        id: "Option<Bytes>",
        error: "FrameSupportScheduleLookupError",
      },
    },
  },
  /**
   * Lookup32: frame_support::traits::schedule::LookupError
   **/
  FrameSupportScheduleLookupError: {
    _enum: ["Unknown", "BadFormat"],
  },
  /**
   * Lookup33: pallet_balances::pallet::Event<T, I>
   **/
  PalletBalancesEvent: {
    _enum: {
      Endowed: {
        account: "AccountId32",
        freeBalance: "u128",
      },
      DustLost: {
        account: "AccountId32",
        amount: "u128",
      },
      Transfer: {
        from: "AccountId32",
        to: "AccountId32",
        amount: "u128",
      },
      BalanceSet: {
        who: "AccountId32",
        free: "u128",
        reserved: "u128",
      },
      Reserved: {
        who: "AccountId32",
        amount: "u128",
      },
      Unreserved: {
        who: "AccountId32",
        amount: "u128",
      },
      ReserveRepatriated: {
        from: "AccountId32",
        to: "AccountId32",
        amount: "u128",
        destinationStatus: "FrameSupportTokensMiscBalanceStatus",
      },
      Deposit: {
        who: "AccountId32",
        amount: "u128",
      },
      Withdraw: {
        who: "AccountId32",
        amount: "u128",
      },
      Slashed: {
        who: "AccountId32",
        amount: "u128",
      },
    },
  },
  /**
   * Lookup34: frame_support::traits::tokens::misc::BalanceStatus
   **/
  FrameSupportTokensMiscBalanceStatus: {
    _enum: ["Free", "Reserved"],
  },
  /**
   * Lookup35: pallet_transaction_payment::pallet::Event<T>
   **/
  PalletTransactionPaymentEvent: {
    _enum: {
      TransactionFeePaid: {
        who: "AccountId32",
        actualFee: "u128",
        tip: "u128",
      },
    },
  },
  /**
   * Lookup36: pallet_treasury::pallet::Event<T, I>
   **/
  PalletTreasuryEvent: {
    _enum: {
      Proposed: {
        proposalIndex: "u32",
      },
      Spending: {
        budgetRemaining: "u128",
      },
      Awarded: {
        proposalIndex: "u32",
        award: "u128",
        account: "AccountId32",
      },
      Rejected: {
        proposalIndex: "u32",
        slashed: "u128",
      },
      Burnt: {
        burntFunds: "u128",
      },
      Rollover: {
        rolloverBalance: "u128",
      },
      Deposit: {
        value: "u128",
      },
      SpendApproved: {
        proposalIndex: "u32",
        amount: "u128",
        beneficiary: "AccountId32",
      },
    },
  },
  /**
   * Lookup37: pallet_utility::pallet::Event
   **/
  PalletUtilityEvent: {
    _enum: {
      BatchInterrupted: {
        index: "u32",
        error: "SpRuntimeDispatchError",
      },
      BatchCompleted: "Null",
      BatchCompletedWithErrors: "Null",
      ItemCompleted: "Null",
      ItemFailed: {
        error: "SpRuntimeDispatchError",
      },
      DispatchedAs: {
        result: "Result<Null, SpRuntimeDispatchError>",
      },
    },
  },
  /**
   * Lookup38: pallet_preimage::pallet::Event<T>
   **/
  PalletPreimageEvent: {
    _enum: {
      Noted: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
      Requested: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
      Cleared: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
    },
  },
  /**
   * Lookup39: pallet_identity::pallet::Event<T>
   **/
  PalletIdentityEvent: {
    _enum: {
      IdentitySet: {
        who: "AccountId32",
      },
      IdentityCleared: {
        who: "AccountId32",
        deposit: "u128",
      },
      IdentityKilled: {
        who: "AccountId32",
        deposit: "u128",
      },
      JudgementRequested: {
        who: "AccountId32",
        registrarIndex: "u32",
      },
      JudgementUnrequested: {
        who: "AccountId32",
        registrarIndex: "u32",
      },
      JudgementGiven: {
        target: "AccountId32",
        registrarIndex: "u32",
      },
      RegistrarAdded: {
        registrarIndex: "u32",
      },
      SubIdentityAdded: {
        sub: "AccountId32",
        main: "AccountId32",
        deposit: "u128",
      },
      SubIdentityRemoved: {
        sub: "AccountId32",
        main: "AccountId32",
        deposit: "u128",
      },
      SubIdentityRevoked: {
        sub: "AccountId32",
        main: "AccountId32",
        deposit: "u128",
      },
    },
  },
  /**
   * Lookup40: pallet_democracy::pallet::Event<T>
   **/
  PalletDemocracyEvent: {
    _enum: {
      Proposed: {
        proposalIndex: "u32",
        deposit: "u128",
      },
      Tabled: {
        proposalIndex: "u32",
        deposit: "u128",
        depositors: "Vec<AccountId32>",
      },
      ExternalTabled: "Null",
      Started: {
        refIndex: "u32",
        threshold: "PalletDemocracyVoteThreshold",
      },
      Passed: {
        refIndex: "u32",
      },
      NotPassed: {
        refIndex: "u32",
      },
      Cancelled: {
        refIndex: "u32",
      },
      Executed: {
        refIndex: "u32",
        result: "Result<Null, SpRuntimeDispatchError>",
      },
      Delegated: {
        who: "AccountId32",
        target: "AccountId32",
      },
      Undelegated: {
        account: "AccountId32",
      },
      Vetoed: {
        who: "AccountId32",
        proposalHash: "H256",
        until: "u32",
      },
      PreimageNoted: {
        proposalHash: "H256",
        who: "AccountId32",
        deposit: "u128",
      },
      PreimageUsed: {
        proposalHash: "H256",
        provider: "AccountId32",
        deposit: "u128",
      },
      PreimageInvalid: {
        proposalHash: "H256",
        refIndex: "u32",
      },
      PreimageMissing: {
        proposalHash: "H256",
        refIndex: "u32",
      },
      PreimageReaped: {
        proposalHash: "H256",
        provider: "AccountId32",
        deposit: "u128",
        reaper: "AccountId32",
      },
      Blacklisted: {
        proposalHash: "H256",
      },
      Voted: {
        voter: "AccountId32",
        refIndex: "u32",
        vote: "PalletDemocracyVoteAccountVote",
      },
      Seconded: {
        seconder: "AccountId32",
        propIndex: "u32",
      },
      ProposalCanceled: {
        propIndex: "u32",
      },
    },
  },
  /**
   * Lookup42: pallet_democracy::vote_threshold::VoteThreshold
   **/
  PalletDemocracyVoteThreshold: {
    _enum: ["SuperMajorityApprove", "SuperMajorityAgainst", "SimpleMajority"],
  },
  /**
   * Lookup43: pallet_democracy::vote::AccountVote<Balance>
   **/
  PalletDemocracyVoteAccountVote: {
    _enum: {
      Standard: {
        vote: "Vote",
        balance: "u128",
      },
      Split: {
        aye: "u128",
        nay: "u128",
      },
    },
  },
  /**
   * Lookup45: pallet_elections_phragmen::pallet::Event<T>
   **/
  PalletElectionsPhragmenEvent: {
    _enum: {
      NewTerm: {
        newMembers: "Vec<(AccountId32,u128)>",
      },
      EmptyTerm: "Null",
      ElectionError: "Null",
      MemberKicked: {
        member: "AccountId32",
      },
      Renounced: {
        candidate: "AccountId32",
      },
      CandidateSlashed: {
        candidate: "AccountId32",
        amount: "u128",
      },
      SeatHolderSlashed: {
        seatHolder: "AccountId32",
        amount: "u128",
      },
    },
  },
  /**
   * Lookup48: pallet_collective::pallet::Event<T, I>
   **/
  PalletCollectiveEvent: {
    _enum: {
      Proposed: {
        account: "AccountId32",
        proposalIndex: "u32",
        proposalHash: "H256",
        threshold: "u32",
      },
      Voted: {
        account: "AccountId32",
        proposalHash: "H256",
        voted: "bool",
        yes: "u32",
        no: "u32",
      },
      Approved: {
        proposalHash: "H256",
      },
      Disapproved: {
        proposalHash: "H256",
      },
      Executed: {
        proposalHash: "H256",
        result: "Result<Null, SpRuntimeDispatchError>",
      },
      MemberExecuted: {
        proposalHash: "H256",
        result: "Result<Null, SpRuntimeDispatchError>",
      },
      Closed: {
        proposalHash: "H256",
        yes: "u32",
        no: "u32",
      },
    },
  },
  /**
   * Lookup51: pallet_tips::pallet::Event<T, I>
   **/
  PalletTipsEvent: {
    _enum: {
      NewTip: {
        tipHash: "H256",
      },
      TipClosing: {
        tipHash: "H256",
      },
      TipClosed: {
        tipHash: "H256",
        who: "AccountId32",
        payout: "u128",
      },
      TipRetracted: {
        tipHash: "H256",
      },
      TipSlashed: {
        tipHash: "H256",
        finder: "AccountId32",
        deposit: "u128",
      },
    },
  },
  /**
   * Lookup52: pallet_proxy::pallet::Event<T>
   **/
  PalletProxyEvent: {
    _enum: {
      ProxyExecuted: {
        result: "Result<Null, SpRuntimeDispatchError>",
      },
      AnonymousCreated: {
        anonymous: "AccountId32",
        who: "AccountId32",
        proxyType: "CommonRuntimeProxyType",
        disambiguationIndex: "u16",
      },
      Announced: {
        real: "AccountId32",
        proxy: "AccountId32",
        callHash: "H256",
      },
      ProxyAdded: {
        delegator: "AccountId32",
        delegatee: "AccountId32",
        proxyType: "CommonRuntimeProxyType",
        delay: "u32",
      },
      ProxyRemoved: {
        delegator: "AccountId32",
        delegatee: "AccountId32",
        proxyType: "CommonRuntimeProxyType",
        delay: "u32",
      },
    },
  },
  /**
   * Lookup53: common_runtime::ProxyType
   **/
  CommonRuntimeProxyType: {
    _enum: ["Any", "CancelProxy", "Governance", "Transfer"],
  },
  /**
   * Lookup55: pallet_multisig::pallet::Event<T>
   **/
  PalletMultisigEvent: {
    _enum: {
      NewMultisig: {
        approving: "AccountId32",
        multisig: "AccountId32",
        callHash: "[u8;32]",
      },
      MultisigApproval: {
        approving: "AccountId32",
        timepoint: "PalletMultisigTimepoint",
        multisig: "AccountId32",
        callHash: "[u8;32]",
      },
      MultisigExecuted: {
        approving: "AccountId32",
        timepoint: "PalletMultisigTimepoint",
        multisig: "AccountId32",
        callHash: "[u8;32]",
        result: "Result<Null, SpRuntimeDispatchError>",
      },
      MultisigCancelled: {
        cancelling: "AccountId32",
        timepoint: "PalletMultisigTimepoint",
        multisig: "AccountId32",
        callHash: "[u8;32]",
      },
    },
  },
  /**
   * Lookup56: pallet_multisig::Timepoint<BlockNumber>
   **/
  PalletMultisigTimepoint: {
    height: "u32",
    index: "u32",
  },
  /**
   * Lookup57: pallet_uniques::pallet::Event<T, I>
   **/
  PalletUniquesEvent: {
    _enum: {
      Created: {
        collection: "u128",
        creator: "AccountId32",
        owner: "AccountId32",
      },
      ForceCreated: {
        collection: "u128",
        owner: "AccountId32",
      },
      Destroyed: {
        collection: "u128",
      },
      Issued: {
        collection: "u128",
        item: "u128",
        owner: "AccountId32",
      },
      Transferred: {
        collection: "u128",
        item: "u128",
        from: "AccountId32",
        to: "AccountId32",
      },
      Burned: {
        collection: "u128",
        item: "u128",
        owner: "AccountId32",
      },
      Frozen: {
        collection: "u128",
        item: "u128",
      },
      Thawed: {
        collection: "u128",
        item: "u128",
      },
      CollectionFrozen: {
        collection: "u128",
      },
      CollectionThawed: {
        collection: "u128",
      },
      OwnerChanged: {
        collection: "u128",
        newOwner: "AccountId32",
      },
      TeamChanged: {
        collection: "u128",
        issuer: "AccountId32",
        admin: "AccountId32",
        freezer: "AccountId32",
      },
      ApprovedTransfer: {
        collection: "u128",
        item: "u128",
        owner: "AccountId32",
        delegate: "AccountId32",
      },
      ApprovalCancelled: {
        collection: "u128",
        item: "u128",
        owner: "AccountId32",
        delegate: "AccountId32",
      },
      ItemStatusChanged: {
        collection: "u128",
      },
      CollectionMetadataSet: {
        collection: "u128",
        data: "Bytes",
        isFrozen: "bool",
      },
      CollectionMetadataCleared: {
        collection: "u128",
      },
      MetadataSet: {
        collection: "u128",
        item: "u128",
        data: "Bytes",
        isFrozen: "bool",
      },
      MetadataCleared: {
        collection: "u128",
        item: "u128",
      },
      Redeposited: {
        collection: "u128",
        successfulItems: "Vec<u128>",
      },
      AttributeSet: {
        collection: "u128",
        maybeItem: "Option<u128>",
        key: "Bytes",
        value: "Bytes",
      },
      AttributeCleared: {
        collection: "u128",
        maybeItem: "Option<u128>",
        key: "Bytes",
      },
      OwnershipAcceptanceChanged: {
        who: "AccountId32",
        maybeCollection: "Option<u128>",
      },
      CollectionMaxSupplySet: {
        collection: "u128",
        maxSupply: "u32",
      },
      NextCollectionIdIncremented: {
        nextId: "u128",
      },
      ItemPriceSet: {
        collection: "u128",
        item: "u128",
        price: "u128",
        whitelistedBuyer: "Option<AccountId32>",
      },
      ItemPriceRemoved: {
        collection: "u128",
        item: "u128",
      },
      ItemBought: {
        collection: "u128",
        item: "u128",
        price: "u128",
        seller: "AccountId32",
        buyer: "AccountId32",
      },
    },
  },
  /**
   * Lookup64: pallet_asset_registry::pallet::Event<T>
   **/
  PalletAssetRegistryEvent: {
    _enum: {
      Registered: {
        assetId: "u32",
        assetName: "Bytes",
        assetType: "PalletAssetRegistryAssetType",
      },
      Updated: {
        assetId: "u32",
        assetName: "Bytes",
        assetType: "PalletAssetRegistryAssetType",
      },
      MetadataSet: {
        assetId: "u32",
        symbol: "Bytes",
        decimals: "u8",
      },
      LocationSet: {
        assetId: "u32",
        location: "TestingHydradxRuntimeAssetLocation",
      },
    },
  },
  /**
   * Lookup66: pallet_asset_registry::types::AssetType<AssetId>
   **/
  PalletAssetRegistryAssetType: {
    _enum: {
      Token: "Null",
      PoolShare: "(u32,u32)",
    },
  },
  /**
   * Lookup67: testing_hydradx_runtime::AssetLocation
   **/
  TestingHydradxRuntimeAssetLocation: "XcmV1MultiLocation",
  /**
   * Lookup68: xcm::v1::multilocation::MultiLocation
   **/
  XcmV1MultiLocation: {
    parents: "u8",
    interior: "XcmV1MultilocationJunctions",
  },
  /**
   * Lookup69: xcm::v1::multilocation::Junctions
   **/
  XcmV1MultilocationJunctions: {
    _enum: {
      Here: "Null",
      X1: "XcmV1Junction",
      X2: "(XcmV1Junction,XcmV1Junction)",
      X3: "(XcmV1Junction,XcmV1Junction,XcmV1Junction)",
      X4: "(XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction)",
      X5: "(XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction)",
      X6: "(XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction)",
      X7: "(XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction)",
      X8: "(XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction,XcmV1Junction)",
    },
  },
  /**
   * Lookup70: xcm::v1::junction::Junction
   **/
  XcmV1Junction: {
    _enum: {
      Parachain: "Compact<u32>",
      AccountId32: {
        network: "XcmV0JunctionNetworkId",
        id: "[u8;32]",
      },
      AccountIndex64: {
        network: "XcmV0JunctionNetworkId",
        index: "Compact<u64>",
      },
      AccountKey20: {
        network: "XcmV0JunctionNetworkId",
        key: "[u8;20]",
      },
      PalletInstance: "u8",
      GeneralIndex: "Compact<u128>",
      GeneralKey: "Bytes",
      OnlyChild: "Null",
      Plurality: {
        id: "XcmV0JunctionBodyId",
        part: "XcmV0JunctionBodyPart",
      },
    },
  },
  /**
   * Lookup72: xcm::v0::junction::NetworkId
   **/
  XcmV0JunctionNetworkId: {
    _enum: {
      Any: "Null",
      Named: "Bytes",
      Polkadot: "Null",
      Kusama: "Null",
    },
  },
  /**
   * Lookup77: xcm::v0::junction::BodyId
   **/
  XcmV0JunctionBodyId: {
    _enum: {
      Unit: "Null",
      Named: "Bytes",
      Index: "Compact<u32>",
      Executive: "Null",
      Technical: "Null",
      Legislative: "Null",
      Judicial: "Null",
    },
  },
  /**
   * Lookup78: xcm::v0::junction::BodyPart
   **/
  XcmV0JunctionBodyPart: {
    _enum: {
      Voice: "Null",
      Members: {
        count: "Compact<u32>",
      },
      Fraction: {
        nom: "Compact<u32>",
        denom: "Compact<u32>",
      },
      AtLeastProportion: {
        nom: "Compact<u32>",
        denom: "Compact<u32>",
      },
      MoreThanProportion: {
        nom: "Compact<u32>",
        denom: "Compact<u32>",
      },
    },
  },
  /**
   * Lookup79: pallet_claims::pallet::Event<T>
   **/
  PalletClaimsEvent: {
    _enum: {
      Claim: "(AccountId32,PalletClaimsEthereumAddress,u128)",
    },
  },
  /**
   * Lookup80: pallet_claims::traits::EthereumAddress
   **/
  PalletClaimsEthereumAddress: "[u8;20]",
  /**
   * Lookup81: pallet_collator_rewards::pallet::Event<T>
   **/
  PalletCollatorRewardsEvent: {
    _enum: {
      CollatorRewarded: {
        who: "AccountId32",
        amount: "u128",
        currency: "u32",
      },
    },
  },
  /**
   * Lookup82: pallet_omnipool::pallet::Event<T>
   **/
  PalletOmnipoolEvent: {
    _enum: {
      TokenAdded: {
        assetId: "u32",
        initialAmount: "u128",
        initialPrice: "u128",
      },
      LiquidityAdded: {
        who: "AccountId32",
        assetId: "u32",
        amount: "u128",
        positionId: "u128",
      },
      LiquidityRemoved: {
        who: "AccountId32",
        positionId: "u128",
        assetId: "u32",
        sharesRemoved: "u128",
      },
      SellExecuted: {
        who: "AccountId32",
        assetIn: "u32",
        assetOut: "u32",
        amountIn: "u128",
        amountOut: "u128",
      },
      BuyExecuted: {
        who: "AccountId32",
        assetIn: "u32",
        assetOut: "u32",
        amountIn: "u128",
        amountOut: "u128",
      },
      PositionCreated: {
        positionId: "u128",
        owner: "AccountId32",
        asset: "u32",
        amount: "u128",
        shares: "u128",
        price: "u128",
      },
      PositionDestroyed: {
        positionId: "u128",
        owner: "AccountId32",
      },
      PositionUpdated: {
        positionId: "u128",
        owner: "AccountId32",
        asset: "u32",
        amount: "u128",
        shares: "u128",
        price: "u128",
      },
      TradableStateUpdated: {
        assetId: "u32",
        state: "PalletOmnipoolTradability",
      },
      AssetRefunded: {
        assetId: "u32",
        amount: "u128",
        recipient: "AccountId32",
      },
      AssetWeightCapUpdated: {
        assetId: "u32",
        cap: "Permill",
      },
    },
  },
  /**
   * Lookup84: pallet_omnipool::types::Tradability
   **/
  PalletOmnipoolTradability: {
    bits: "u8",
  },
  /**
   * Lookup86: orml_tokens::module::Event<T>
   **/
  OrmlTokensModuleEvent: {
    _enum: {
      Endowed: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      DustLost: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      Transfer: {
        currencyId: "u32",
        from: "AccountId32",
        to: "AccountId32",
        amount: "u128",
      },
      Reserved: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      Unreserved: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      ReserveRepatriated: {
        currencyId: "u32",
        from: "AccountId32",
        to: "AccountId32",
        amount: "u128",
        status: "FrameSupportTokensMiscBalanceStatus",
      },
      BalanceSet: {
        currencyId: "u32",
        who: "AccountId32",
        free: "u128",
        reserved: "u128",
      },
      TotalIssuanceSet: {
        currencyId: "u32",
        amount: "u128",
      },
      Withdrawn: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      Slashed: {
        currencyId: "u32",
        who: "AccountId32",
        freeAmount: "u128",
        reservedAmount: "u128",
      },
      Deposited: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      LockSet: {
        lockId: "[u8;8]",
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      LockRemoved: {
        lockId: "[u8;8]",
        currencyId: "u32",
        who: "AccountId32",
      },
    },
  },
  /**
   * Lookup88: pallet_currencies::module::Event<T>
   **/
  PalletCurrenciesModuleEvent: {
    _enum: {
      Transferred: {
        currencyId: "u32",
        from: "AccountId32",
        to: "AccountId32",
        amount: "u128",
      },
      BalanceUpdated: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "i128",
      },
      Deposited: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
      Withdrawn: {
        currencyId: "u32",
        who: "AccountId32",
        amount: "u128",
      },
    },
  },
  /**
   * Lookup90: orml_vesting::module::Event<T>
   **/
  OrmlVestingModuleEvent: {
    _enum: {
      VestingScheduleAdded: {
        from: "AccountId32",
        to: "AccountId32",
        vestingSchedule: "OrmlVestingVestingSchedule",
      },
      Claimed: {
        who: "AccountId32",
        amount: "u128",
      },
      VestingSchedulesUpdated: {
        who: "AccountId32",
      },
    },
  },
  /**
   * Lookup91: orml_vesting::VestingSchedule<BlockNumber, Balance>
   **/
  OrmlVestingVestingSchedule: {
    start: "u32",
    period: "u32",
    periodCount: "u32",
    perPeriod: "Compact<u128>",
  },
  /**
   * Lookup92: cumulus_pallet_parachain_system::pallet::Event<T>
   **/
  CumulusPalletParachainSystemEvent: {
    _enum: {
      ValidationFunctionStored: "Null",
      ValidationFunctionApplied: {
        relayChainBlockNum: "u32",
      },
      ValidationFunctionDiscarded: "Null",
      UpgradeAuthorized: {
        codeHash: "H256",
      },
      DownwardMessagesReceived: {
        count: "u32",
      },
      DownwardMessagesProcessed: {
        weightUsed: "u64",
        dmqHead: "H256",
      },
    },
  },
  /**
   * Lookup93: pallet_xcm::pallet::Event<T>
   **/
  PalletXcmEvent: {
    _enum: {
      Attempted: "XcmV2TraitsOutcome",
      Sent: "(XcmV1MultiLocation,XcmV1MultiLocation,XcmV2Xcm)",
      UnexpectedResponse: "(XcmV1MultiLocation,u64)",
      ResponseReady: "(u64,XcmV2Response)",
      Notified: "(u64,u8,u8)",
      NotifyOverweight: "(u64,u8,u8,u64,u64)",
      NotifyDispatchError: "(u64,u8,u8)",
      NotifyDecodeFailed: "(u64,u8,u8)",
      InvalidResponder: "(XcmV1MultiLocation,u64,Option<XcmV1MultiLocation>)",
      InvalidResponderVersion: "(XcmV1MultiLocation,u64)",
      ResponseTaken: "u64",
      AssetsTrapped: "(H256,XcmV1MultiLocation,XcmVersionedMultiAssets)",
      VersionChangeNotified: "(XcmV1MultiLocation,u32)",
      SupportedVersionChanged: "(XcmV1MultiLocation,u32)",
      NotifyTargetSendFail: "(XcmV1MultiLocation,u64,XcmV2TraitsError)",
      NotifyTargetMigrationFail: "(XcmVersionedMultiLocation,u64)",
    },
  },
  /**
   * Lookup94: xcm::v2::traits::Outcome
   **/
  XcmV2TraitsOutcome: {
    _enum: {
      Complete: "u64",
      Incomplete: "(u64,XcmV2TraitsError)",
      Error: "XcmV2TraitsError",
    },
  },
  /**
   * Lookup95: xcm::v2::traits::Error
   **/
  XcmV2TraitsError: {
    _enum: {
      Overflow: "Null",
      Unimplemented: "Null",
      UntrustedReserveLocation: "Null",
      UntrustedTeleportLocation: "Null",
      MultiLocationFull: "Null",
      MultiLocationNotInvertible: "Null",
      BadOrigin: "Null",
      InvalidLocation: "Null",
      AssetNotFound: "Null",
      FailedToTransactAsset: "Null",
      NotWithdrawable: "Null",
      LocationCannotHold: "Null",
      ExceedsMaxMessageSize: "Null",
      DestinationUnsupported: "Null",
      Transport: "Null",
      Unroutable: "Null",
      UnknownClaim: "Null",
      FailedToDecode: "Null",
      MaxWeightInvalid: "Null",
      NotHoldingFees: "Null",
      TooExpensive: "Null",
      Trap: "u64",
      UnhandledXcmVersion: "Null",
      WeightLimitReached: "u64",
      Barrier: "Null",
      WeightNotComputable: "Null",
    },
  },
  /**
   * Lookup96: xcm::v2::Xcm<Call>
   **/
  XcmV2Xcm: "Vec<XcmV2Instruction>",
  /**
   * Lookup98: xcm::v2::Instruction<Call>
   **/
  XcmV2Instruction: {
    _enum: {
      WithdrawAsset: "XcmV1MultiassetMultiAssets",
      ReserveAssetDeposited: "XcmV1MultiassetMultiAssets",
      ReceiveTeleportedAsset: "XcmV1MultiassetMultiAssets",
      QueryResponse: {
        queryId: "Compact<u64>",
        response: "XcmV2Response",
        maxWeight: "Compact<u64>",
      },
      TransferAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        beneficiary: "XcmV1MultiLocation",
      },
      TransferReserveAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        dest: "XcmV1MultiLocation",
        xcm: "XcmV2Xcm",
      },
      Transact: {
        originType: "XcmV0OriginKind",
        requireWeightAtMost: "Compact<u64>",
        call: "XcmDoubleEncoded",
      },
      HrmpNewChannelOpenRequest: {
        sender: "Compact<u32>",
        maxMessageSize: "Compact<u32>",
        maxCapacity: "Compact<u32>",
      },
      HrmpChannelAccepted: {
        recipient: "Compact<u32>",
      },
      HrmpChannelClosing: {
        initiator: "Compact<u32>",
        sender: "Compact<u32>",
        recipient: "Compact<u32>",
      },
      ClearOrigin: "Null",
      DescendOrigin: "XcmV1MultilocationJunctions",
      ReportError: {
        queryId: "Compact<u64>",
        dest: "XcmV1MultiLocation",
        maxResponseWeight: "Compact<u64>",
      },
      DepositAsset: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        maxAssets: "Compact<u32>",
        beneficiary: "XcmV1MultiLocation",
      },
      DepositReserveAsset: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        maxAssets: "Compact<u32>",
        dest: "XcmV1MultiLocation",
        xcm: "XcmV2Xcm",
      },
      ExchangeAsset: {
        give: "XcmV1MultiassetMultiAssetFilter",
        receive: "XcmV1MultiassetMultiAssets",
      },
      InitiateReserveWithdraw: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        reserve: "XcmV1MultiLocation",
        xcm: "XcmV2Xcm",
      },
      InitiateTeleport: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        dest: "XcmV1MultiLocation",
        xcm: "XcmV2Xcm",
      },
      QueryHolding: {
        queryId: "Compact<u64>",
        dest: "XcmV1MultiLocation",
        assets: "XcmV1MultiassetMultiAssetFilter",
        maxResponseWeight: "Compact<u64>",
      },
      BuyExecution: {
        fees: "XcmV1MultiAsset",
        weightLimit: "XcmV2WeightLimit",
      },
      RefundSurplus: "Null",
      SetErrorHandler: "XcmV2Xcm",
      SetAppendix: "XcmV2Xcm",
      ClearError: "Null",
      ClaimAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        ticket: "XcmV1MultiLocation",
      },
      Trap: "Compact<u64>",
      SubscribeVersion: {
        queryId: "Compact<u64>",
        maxResponseWeight: "Compact<u64>",
      },
      UnsubscribeVersion: "Null",
    },
  },
  /**
   * Lookup99: xcm::v1::multiasset::MultiAssets
   **/
  XcmV1MultiassetMultiAssets: "Vec<XcmV1MultiAsset>",
  /**
   * Lookup101: xcm::v1::multiasset::MultiAsset
   **/
  XcmV1MultiAsset: {
    id: "XcmV1MultiassetAssetId",
    fun: "XcmV1MultiassetFungibility",
  },
  /**
   * Lookup102: xcm::v1::multiasset::AssetId
   **/
  XcmV1MultiassetAssetId: {
    _enum: {
      Concrete: "XcmV1MultiLocation",
      Abstract: "Bytes",
    },
  },
  /**
   * Lookup103: xcm::v1::multiasset::Fungibility
   **/
  XcmV1MultiassetFungibility: {
    _enum: {
      Fungible: "Compact<u128>",
      NonFungible: "XcmV1MultiassetAssetInstance",
    },
  },
  /**
   * Lookup104: xcm::v1::multiasset::AssetInstance
   **/
  XcmV1MultiassetAssetInstance: {
    _enum: {
      Undefined: "Null",
      Index: "Compact<u128>",
      Array4: "[u8;4]",
      Array8: "[u8;8]",
      Array16: "[u8;16]",
      Array32: "[u8;32]",
      Blob: "Bytes",
    },
  },
  /**
   * Lookup106: xcm::v2::Response
   **/
  XcmV2Response: {
    _enum: {
      Null: "Null",
      Assets: "XcmV1MultiassetMultiAssets",
      ExecutionResult: "Option<(u32,XcmV2TraitsError)>",
      Version: "u32",
    },
  },
  /**
   * Lookup109: xcm::v0::OriginKind
   **/
  XcmV0OriginKind: {
    _enum: ["Native", "SovereignAccount", "Superuser", "Xcm"],
  },
  /**
   * Lookup110: xcm::double_encoded::DoubleEncoded<T>
   **/
  XcmDoubleEncoded: {
    encoded: "Bytes",
  },
  /**
   * Lookup111: xcm::v1::multiasset::MultiAssetFilter
   **/
  XcmV1MultiassetMultiAssetFilter: {
    _enum: {
      Definite: "XcmV1MultiassetMultiAssets",
      Wild: "XcmV1MultiassetWildMultiAsset",
    },
  },
  /**
   * Lookup112: xcm::v1::multiasset::WildMultiAsset
   **/
  XcmV1MultiassetWildMultiAsset: {
    _enum: {
      All: "Null",
      AllOf: {
        id: "XcmV1MultiassetAssetId",
        fun: "XcmV1MultiassetWildFungibility",
      },
    },
  },
  /**
   * Lookup113: xcm::v1::multiasset::WildFungibility
   **/
  XcmV1MultiassetWildFungibility: {
    _enum: ["Fungible", "NonFungible"],
  },
  /**
   * Lookup114: xcm::v2::WeightLimit
   **/
  XcmV2WeightLimit: {
    _enum: {
      Unlimited: "Null",
      Limited: "Compact<u64>",
    },
  },
  /**
   * Lookup116: xcm::VersionedMultiAssets
   **/
  XcmVersionedMultiAssets: {
    _enum: {
      V0: "Vec<XcmV0MultiAsset>",
      V1: "XcmV1MultiassetMultiAssets",
    },
  },
  /**
   * Lookup118: xcm::v0::multi_asset::MultiAsset
   **/
  XcmV0MultiAsset: {
    _enum: {
      None: "Null",
      All: "Null",
      AllFungible: "Null",
      AllNonFungible: "Null",
      AllAbstractFungible: {
        id: "Bytes",
      },
      AllAbstractNonFungible: {
        class: "Bytes",
      },
      AllConcreteFungible: {
        id: "XcmV0MultiLocation",
      },
      AllConcreteNonFungible: {
        class: "XcmV0MultiLocation",
      },
      AbstractFungible: {
        id: "Bytes",
        amount: "Compact<u128>",
      },
      AbstractNonFungible: {
        class: "Bytes",
        instance: "XcmV1MultiassetAssetInstance",
      },
      ConcreteFungible: {
        id: "XcmV0MultiLocation",
        amount: "Compact<u128>",
      },
      ConcreteNonFungible: {
        class: "XcmV0MultiLocation",
        instance: "XcmV1MultiassetAssetInstance",
      },
    },
  },
  /**
   * Lookup119: xcm::v0::multi_location::MultiLocation
   **/
  XcmV0MultiLocation: {
    _enum: {
      Null: "Null",
      X1: "XcmV0Junction",
      X2: "(XcmV0Junction,XcmV0Junction)",
      X3: "(XcmV0Junction,XcmV0Junction,XcmV0Junction)",
      X4: "(XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction)",
      X5: "(XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction)",
      X6: "(XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction)",
      X7: "(XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction)",
      X8: "(XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction,XcmV0Junction)",
    },
  },
  /**
   * Lookup120: xcm::v0::junction::Junction
   **/
  XcmV0Junction: {
    _enum: {
      Parent: "Null",
      Parachain: "Compact<u32>",
      AccountId32: {
        network: "XcmV0JunctionNetworkId",
        id: "[u8;32]",
      },
      AccountIndex64: {
        network: "XcmV0JunctionNetworkId",
        index: "Compact<u64>",
      },
      AccountKey20: {
        network: "XcmV0JunctionNetworkId",
        key: "[u8;20]",
      },
      PalletInstance: "u8",
      GeneralIndex: "Compact<u128>",
      GeneralKey: "Bytes",
      OnlyChild: "Null",
      Plurality: {
        id: "XcmV0JunctionBodyId",
        part: "XcmV0JunctionBodyPart",
      },
    },
  },
  /**
   * Lookup121: xcm::VersionedMultiLocation
   **/
  XcmVersionedMultiLocation: {
    _enum: {
      V0: "XcmV0MultiLocation",
      V1: "XcmV1MultiLocation",
    },
  },
  /**
   * Lookup122: cumulus_pallet_xcm::pallet::Event<T>
   **/
  CumulusPalletXcmEvent: {
    _enum: {
      InvalidFormat: "[u8;8]",
      UnsupportedVersion: "[u8;8]",
      ExecutedDownward: "([u8;8],XcmV2TraitsOutcome)",
    },
  },
  /**
   * Lookup123: cumulus_pallet_xcmp_queue::pallet::Event<T>
   **/
  CumulusPalletXcmpQueueEvent: {
    _enum: {
      Success: {
        messageHash: "Option<H256>",
        weight: "u64",
      },
      Fail: {
        messageHash: "Option<H256>",
        error: "XcmV2TraitsError",
        weight: "u64",
      },
      BadVersion: {
        messageHash: "Option<H256>",
      },
      BadFormat: {
        messageHash: "Option<H256>",
      },
      UpwardMessageSent: {
        messageHash: "Option<H256>",
      },
      XcmpMessageSent: {
        messageHash: "Option<H256>",
      },
      OverweightEnqueued: {
        sender: "u32",
        sentAt: "u32",
        index: "u64",
        required: "u64",
      },
      OverweightServiced: {
        index: "u64",
        used: "u64",
      },
    },
  },
  /**
   * Lookup126: cumulus_pallet_dmp_queue::pallet::Event<T>
   **/
  CumulusPalletDmpQueueEvent: {
    _enum: {
      InvalidFormat: {
        messageId: "[u8;32]",
      },
      UnsupportedVersion: {
        messageId: "[u8;32]",
      },
      ExecutedDownward: {
        messageId: "[u8;32]",
        outcome: "XcmV2TraitsOutcome",
      },
      WeightExhausted: {
        messageId: "[u8;32]",
        remainingWeight: "u64",
        requiredWeight: "u64",
      },
      OverweightEnqueued: {
        messageId: "[u8;32]",
        overweightIndex: "u64",
        requiredWeight: "u64",
      },
      OverweightServiced: {
        overweightIndex: "u64",
        weightUsed: "u64",
      },
    },
  },
  /**
   * Lookup127: orml_xcm::module::Event<T>
   **/
  OrmlXcmModuleEvent: {
    _enum: {
      Sent: {
        to: "XcmV1MultiLocation",
        message: "XcmV2Xcm",
      },
    },
  },
  /**
   * Lookup128: orml_xtokens::module::Event<T>
   **/
  OrmlXtokensModuleEvent: {
    _enum: {
      TransferredMultiAssets: {
        sender: "AccountId32",
        assets: "XcmV1MultiassetMultiAssets",
        fee: "XcmV1MultiAsset",
        dest: "XcmV1MultiLocation",
      },
    },
  },
  /**
   * Lookup129: orml_unknown_tokens::module::Event
   **/
  OrmlUnknownTokensModuleEvent: {
    _enum: {
      Deposited: {
        asset: "XcmV1MultiAsset",
        who: "XcmV1MultiLocation",
      },
      Withdrawn: {
        asset: "XcmV1MultiAsset",
        who: "XcmV1MultiLocation",
      },
    },
  },
  /**
   * Lookup130: pallet_collator_selection::pallet::Event<T>
   **/
  PalletCollatorSelectionEvent: {
    _enum: {
      NewInvulnerables: {
        invulnerables: "Vec<AccountId32>",
      },
      NewDesiredCandidates: {
        desiredCandidates: "u32",
      },
      NewCandidacyBond: {
        bondAmount: "u128",
      },
      CandidateAdded: {
        accountId: "AccountId32",
        deposit: "u128",
      },
      CandidateRemoved: {
        accountId: "AccountId32",
      },
    },
  },
  /**
   * Lookup131: pallet_session::pallet::Event
   **/
  PalletSessionEvent: {
    _enum: {
      NewSession: {
        sessionIndex: "u32",
      },
    },
  },
  /**
   * Lookup132: pallet_relaychain_info::pallet::Event<T>
   **/
  PalletRelaychainInfoEvent: {
    _enum: {
      CurrentBlockNumbers: {
        parachainBlockNumber: "u32",
        relaychainBlockNumber: "u32",
      },
    },
  },
  /**
   * Lookup133: pallet_transaction_multi_payment::pallet::Event<T>
   **/
  PalletTransactionMultiPaymentEvent: {
    _enum: {
      CurrencySet: {
        accountId: "AccountId32",
        assetId: "u32",
      },
      CurrencyAdded: {
        assetId: "u32",
      },
      CurrencyRemoved: {
        assetId: "u32",
      },
      FeeWithdrawn: {
        accountId: "AccountId32",
        assetId: "u32",
        nativeFeeAmount: "u128",
        nonNativeFeeAmount: "u128",
        destinationAccountId: "AccountId32",
      },
    },
  },
  /**
   * Lookup134: pallet_sudo::pallet::Event<T>
   **/
  PalletSudoEvent: {
    _enum: {
      Sudid: {
        sudoResult: "Result<Null, SpRuntimeDispatchError>",
      },
      KeyChanged: {
        oldSudoer: "Option<AccountId32>",
      },
      SudoAsDone: {
        sudoResult: "Result<Null, SpRuntimeDispatchError>",
      },
    },
  },
  /**
   * Lookup135: frame_system::Phase
   **/
  FrameSystemPhase: {
    _enum: {
      ApplyExtrinsic: "u32",
      Finalization: "Null",
      Initialization: "Null",
    },
  },
  /**
   * Lookup138: frame_system::LastRuntimeUpgradeInfo
   **/
  FrameSystemLastRuntimeUpgradeInfo: {
    specVersion: "Compact<u32>",
    specName: "Text",
  },
  /**
   * Lookup140: frame_system::pallet::Call<T>
   **/
  FrameSystemCall: {
    _enum: {
      fill_block: {
        ratio: "Perbill",
      },
      remark: {
        remark: "Bytes",
      },
      set_heap_pages: {
        pages: "u64",
      },
      set_code: {
        code: "Bytes",
      },
      set_code_without_checks: {
        code: "Bytes",
      },
      set_storage: {
        items: "Vec<(Bytes,Bytes)>",
      },
      kill_storage: {
        _alias: {
          keys_: "keys",
        },
        keys_: "Vec<Bytes>",
      },
      kill_prefix: {
        prefix: "Bytes",
        subkeys: "u32",
      },
      remark_with_event: {
        remark: "Bytes",
      },
    },
  },
  /**
   * Lookup145: frame_system::limits::BlockWeights
   **/
  FrameSystemLimitsBlockWeights: {
    baseBlock: "u64",
    maxBlock: "u64",
    perClass: "FrameSupportWeightsPerDispatchClassWeightsPerClass",
  },
  /**
   * Lookup146: frame_support::weights::PerDispatchClass<frame_system::limits::WeightsPerClass>
   **/
  FrameSupportWeightsPerDispatchClassWeightsPerClass: {
    normal: "FrameSystemLimitsWeightsPerClass",
    operational: "FrameSystemLimitsWeightsPerClass",
    mandatory: "FrameSystemLimitsWeightsPerClass",
  },
  /**
   * Lookup147: frame_system::limits::WeightsPerClass
   **/
  FrameSystemLimitsWeightsPerClass: {
    baseExtrinsic: "u64",
    maxExtrinsic: "Option<u64>",
    maxTotal: "Option<u64>",
    reserved: "Option<u64>",
  },
  /**
   * Lookup149: frame_system::limits::BlockLength
   **/
  FrameSystemLimitsBlockLength: {
    max: "FrameSupportWeightsPerDispatchClassU32",
  },
  /**
   * Lookup150: frame_support::weights::PerDispatchClass<T>
   **/
  FrameSupportWeightsPerDispatchClassU32: {
    normal: "u32",
    operational: "u32",
    mandatory: "u32",
  },
  /**
   * Lookup151: frame_support::weights::RuntimeDbWeight
   **/
  FrameSupportWeightsRuntimeDbWeight: {
    read: "u64",
    write: "u64",
  },
  /**
   * Lookup152: sp_version::RuntimeVersion
   **/
  SpVersionRuntimeVersion: {
    specName: "Text",
    implName: "Text",
    authoringVersion: "u32",
    specVersion: "u32",
    implVersion: "u32",
    apis: "Vec<([u8;8],u32)>",
    transactionVersion: "u32",
    stateVersion: "u8",
  },
  /**
   * Lookup156: frame_system::pallet::Error<T>
   **/
  FrameSystemError: {
    _enum: [
      "InvalidSpecName",
      "SpecVersionNeedsToIncrease",
      "FailedToExtractRuntimeVersion",
      "NonDefaultComposite",
      "NonZeroRefCount",
      "CallFiltered",
    ],
  },
  /**
   * Lookup157: pallet_timestamp::pallet::Call<T>
   **/
  PalletTimestampCall: {
    _enum: {
      set: {
        now: "Compact<u64>",
      },
    },
  },
  /**
   * Lookup160: pallet_scheduler::ScheduledV3<frame_support::traits::schedule::MaybeHashed<testing_hydradx_runtime::Call, primitive_types::H256>, BlockNumber, testing_hydradx_runtime::OriginCaller, sp_core::crypto::AccountId32>
   **/
  PalletSchedulerScheduledV3: {
    maybeId: "Option<Bytes>",
    priority: "u8",
    call: "FrameSupportScheduleMaybeHashed",
    maybePeriodic: "Option<(u32,u32)>",
    origin: "TestingHydradxRuntimeOriginCaller",
  },
  /**
   * Lookup161: frame_support::traits::schedule::MaybeHashed<testing_hydradx_runtime::Call, primitive_types::H256>
   **/
  FrameSupportScheduleMaybeHashed: {
    _enum: {
      Value: "Call",
      Hash: "H256",
    },
  },
  /**
   * Lookup163: pallet_scheduler::pallet::Call<T>
   **/
  PalletSchedulerCall: {
    _enum: {
      schedule: {
        when: "u32",
        maybePeriodic: "Option<(u32,u32)>",
        priority: "u8",
        call: "FrameSupportScheduleMaybeHashed",
      },
      cancel: {
        when: "u32",
        index: "u32",
      },
      schedule_named: {
        id: "Bytes",
        when: "u32",
        maybePeriodic: "Option<(u32,u32)>",
        priority: "u8",
        call: "FrameSupportScheduleMaybeHashed",
      },
      cancel_named: {
        id: "Bytes",
      },
      schedule_after: {
        after: "u32",
        maybePeriodic: "Option<(u32,u32)>",
        priority: "u8",
        call: "FrameSupportScheduleMaybeHashed",
      },
      schedule_named_after: {
        id: "Bytes",
        after: "u32",
        maybePeriodic: "Option<(u32,u32)>",
        priority: "u8",
        call: "FrameSupportScheduleMaybeHashed",
      },
    },
  },
  /**
   * Lookup165: pallet_balances::pallet::Call<T, I>
   **/
  PalletBalancesCall: {
    _enum: {
      transfer: {
        dest: "AccountId32",
        value: "Compact<u128>",
      },
      set_balance: {
        who: "AccountId32",
        newFree: "Compact<u128>",
        newReserved: "Compact<u128>",
      },
      force_transfer: {
        source: "AccountId32",
        dest: "AccountId32",
        value: "Compact<u128>",
      },
      transfer_keep_alive: {
        dest: "AccountId32",
        value: "Compact<u128>",
      },
      transfer_all: {
        dest: "AccountId32",
        keepAlive: "bool",
      },
      force_unreserve: {
        who: "AccountId32",
        amount: "u128",
      },
    },
  },
  /**
   * Lookup166: pallet_treasury::pallet::Call<T, I>
   **/
  PalletTreasuryCall: {
    _enum: {
      propose_spend: {
        value: "Compact<u128>",
        beneficiary: "AccountId32",
      },
      reject_proposal: {
        proposalId: "Compact<u32>",
      },
      approve_proposal: {
        proposalId: "Compact<u32>",
      },
      spend: {
        amount: "Compact<u128>",
        beneficiary: "AccountId32",
      },
      remove_approval: {
        proposalId: "Compact<u32>",
      },
    },
  },
  /**
   * Lookup167: pallet_utility::pallet::Call<T>
   **/
  PalletUtilityCall: {
    _enum: {
      batch: {
        calls: "Vec<Call>",
      },
      as_derivative: {
        index: "u16",
        call: "Call",
      },
      batch_all: {
        calls: "Vec<Call>",
      },
      dispatch_as: {
        asOrigin: "TestingHydradxRuntimeOriginCaller",
        call: "Call",
      },
      force_batch: {
        calls: "Vec<Call>",
      },
    },
  },
  /**
   * Lookup169: testing_hydradx_runtime::OriginCaller
   **/
  TestingHydradxRuntimeOriginCaller: {
    _enum: {
      __Unused0: "Null",
      system: "FrameSupportDispatchRawOrigin",
      __Unused2: "Null",
      __Unused3: "Null",
      __Unused4: "Null",
      Void: "SpCoreVoid",
      __Unused6: "Null",
      __Unused7: "Null",
      __Unused8: "Null",
      __Unused9: "Null",
      __Unused10: "Null",
      __Unused11: "Null",
      __Unused12: "Null",
      __Unused13: "Null",
      __Unused14: "Null",
      __Unused15: "Null",
      __Unused16: "Null",
      __Unused17: "Null",
      __Unused18: "Null",
      __Unused19: "Null",
      __Unused20: "Null",
      __Unused21: "Null",
      __Unused22: "Null",
      Council: "PalletCollectiveRawOrigin",
      __Unused24: "Null",
      TechnicalCommittee: "PalletCollectiveRawOrigin",
      __Unused26: "Null",
      __Unused27: "Null",
      __Unused28: "Null",
      __Unused29: "Null",
      __Unused30: "Null",
      __Unused31: "Null",
      __Unused32: "Null",
      __Unused33: "Null",
      __Unused34: "Null",
      __Unused35: "Null",
      __Unused36: "Null",
      __Unused37: "Null",
      __Unused38: "Null",
      __Unused39: "Null",
      __Unused40: "Null",
      __Unused41: "Null",
      __Unused42: "Null",
      __Unused43: "Null",
      __Unused44: "Null",
      __Unused45: "Null",
      __Unused46: "Null",
      __Unused47: "Null",
      __Unused48: "Null",
      __Unused49: "Null",
      __Unused50: "Null",
      __Unused51: "Null",
      __Unused52: "Null",
      __Unused53: "Null",
      __Unused54: "Null",
      __Unused55: "Null",
      __Unused56: "Null",
      __Unused57: "Null",
      __Unused58: "Null",
      __Unused59: "Null",
      __Unused60: "Null",
      __Unused61: "Null",
      __Unused62: "Null",
      __Unused63: "Null",
      __Unused64: "Null",
      __Unused65: "Null",
      __Unused66: "Null",
      __Unused67: "Null",
      __Unused68: "Null",
      __Unused69: "Null",
      __Unused70: "Null",
      __Unused71: "Null",
      __Unused72: "Null",
      __Unused73: "Null",
      __Unused74: "Null",
      __Unused75: "Null",
      __Unused76: "Null",
      __Unused77: "Null",
      __Unused78: "Null",
      __Unused79: "Null",
      __Unused80: "Null",
      __Unused81: "Null",
      __Unused82: "Null",
      __Unused83: "Null",
      __Unused84: "Null",
      __Unused85: "Null",
      __Unused86: "Null",
      __Unused87: "Null",
      __Unused88: "Null",
      __Unused89: "Null",
      __Unused90: "Null",
      __Unused91: "Null",
      __Unused92: "Null",
      __Unused93: "Null",
      __Unused94: "Null",
      __Unused95: "Null",
      __Unused96: "Null",
      __Unused97: "Null",
      __Unused98: "Null",
      __Unused99: "Null",
      __Unused100: "Null",
      __Unused101: "Null",
      __Unused102: "Null",
      __Unused103: "Null",
      __Unused104: "Null",
      __Unused105: "Null",
      __Unused106: "Null",
      PolkadotXcm: "PalletXcmOrigin",
      __Unused108: "Null",
      CumulusXcm: "CumulusPalletXcmOrigin",
    },
  },
  /**
   * Lookup170: frame_support::dispatch::RawOrigin<sp_core::crypto::AccountId32>
   **/
  FrameSupportDispatchRawOrigin: {
    _enum: {
      Root: "Null",
      Signed: "AccountId32",
      None: "Null",
    },
  },
  /**
   * Lookup171: pallet_collective::RawOrigin<sp_core::crypto::AccountId32, I>
   **/
  PalletCollectiveRawOrigin: {
    _enum: {
      Members: "(u32,u32)",
      Member: "AccountId32",
      _Phantom: "Null",
    },
  },
  /**
   * Lookup173: pallet_xcm::pallet::Origin
   **/
  PalletXcmOrigin: {
    _enum: {
      Xcm: "XcmV1MultiLocation",
      Response: "XcmV1MultiLocation",
    },
  },
  /**
   * Lookup174: cumulus_pallet_xcm::pallet::Origin
   **/
  CumulusPalletXcmOrigin: {
    _enum: {
      Relay: "Null",
      SiblingParachain: "u32",
    },
  },
  /**
   * Lookup175: sp_core::Void
   **/
  SpCoreVoid: "Null",
  /**
   * Lookup176: pallet_preimage::pallet::Call<T>
   **/
  PalletPreimageCall: {
    _enum: {
      note_preimage: {
        bytes: "Bytes",
      },
      unnote_preimage: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
      request_preimage: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
      unrequest_preimage: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
    },
  },
  /**
   * Lookup177: pallet_identity::pallet::Call<T>
   **/
  PalletIdentityCall: {
    _enum: {
      add_registrar: {
        account: "AccountId32",
      },
      set_identity: {
        info: "PalletIdentityIdentityInfo",
      },
      set_subs: {
        subs: "Vec<(AccountId32,Data)>",
      },
      clear_identity: "Null",
      request_judgement: {
        regIndex: "Compact<u32>",
        maxFee: "Compact<u128>",
      },
      cancel_request: {
        regIndex: "u32",
      },
      set_fee: {
        index: "Compact<u32>",
        fee: "Compact<u128>",
      },
      set_account_id: {
        _alias: {
          new_: "new",
        },
        index: "Compact<u32>",
        new_: "AccountId32",
      },
      set_fields: {
        index: "Compact<u32>",
        fields: "PalletIdentityBitFlags",
      },
      provide_judgement: {
        regIndex: "Compact<u32>",
        target: "AccountId32",
        judgement: "PalletIdentityJudgement",
      },
      kill_identity: {
        target: "AccountId32",
      },
      add_sub: {
        sub: "AccountId32",
        data: "Data",
      },
      rename_sub: {
        sub: "AccountId32",
        data: "Data",
      },
      remove_sub: {
        sub: "AccountId32",
      },
      quit_sub: "Null",
    },
  },
  /**
   * Lookup178: pallet_identity::types::IdentityInfo<FieldLimit>
   **/
  PalletIdentityIdentityInfo: {
    additional: "Vec<(Data,Data)>",
    display: "Data",
    legal: "Data",
    web: "Data",
    riot: "Data",
    email: "Data",
    pgpFingerprint: "Option<[u8;20]>",
    image: "Data",
    twitter: "Data",
  },
  /**
   * Lookup214: pallet_identity::types::BitFlags<pallet_identity::types::IdentityField>
   **/
  PalletIdentityBitFlags: {
    _bitLength: 64,
    Display: 1,
    Legal: 2,
    Web: 4,
    Riot: 8,
    Email: 16,
    PgpFingerprint: 32,
    Image: 64,
    Twitter: 128,
  },
  /**
   * Lookup215: pallet_identity::types::IdentityField
   **/
  PalletIdentityIdentityField: {
    _enum: [
      "__Unused0",
      "Display",
      "Legal",
      "__Unused3",
      "Web",
      "__Unused5",
      "__Unused6",
      "__Unused7",
      "Riot",
      "__Unused9",
      "__Unused10",
      "__Unused11",
      "__Unused12",
      "__Unused13",
      "__Unused14",
      "__Unused15",
      "Email",
      "__Unused17",
      "__Unused18",
      "__Unused19",
      "__Unused20",
      "__Unused21",
      "__Unused22",
      "__Unused23",
      "__Unused24",
      "__Unused25",
      "__Unused26",
      "__Unused27",
      "__Unused28",
      "__Unused29",
      "__Unused30",
      "__Unused31",
      "PgpFingerprint",
      "__Unused33",
      "__Unused34",
      "__Unused35",
      "__Unused36",
      "__Unused37",
      "__Unused38",
      "__Unused39",
      "__Unused40",
      "__Unused41",
      "__Unused42",
      "__Unused43",
      "__Unused44",
      "__Unused45",
      "__Unused46",
      "__Unused47",
      "__Unused48",
      "__Unused49",
      "__Unused50",
      "__Unused51",
      "__Unused52",
      "__Unused53",
      "__Unused54",
      "__Unused55",
      "__Unused56",
      "__Unused57",
      "__Unused58",
      "__Unused59",
      "__Unused60",
      "__Unused61",
      "__Unused62",
      "__Unused63",
      "Image",
      "__Unused65",
      "__Unused66",
      "__Unused67",
      "__Unused68",
      "__Unused69",
      "__Unused70",
      "__Unused71",
      "__Unused72",
      "__Unused73",
      "__Unused74",
      "__Unused75",
      "__Unused76",
      "__Unused77",
      "__Unused78",
      "__Unused79",
      "__Unused80",
      "__Unused81",
      "__Unused82",
      "__Unused83",
      "__Unused84",
      "__Unused85",
      "__Unused86",
      "__Unused87",
      "__Unused88",
      "__Unused89",
      "__Unused90",
      "__Unused91",
      "__Unused92",
      "__Unused93",
      "__Unused94",
      "__Unused95",
      "__Unused96",
      "__Unused97",
      "__Unused98",
      "__Unused99",
      "__Unused100",
      "__Unused101",
      "__Unused102",
      "__Unused103",
      "__Unused104",
      "__Unused105",
      "__Unused106",
      "__Unused107",
      "__Unused108",
      "__Unused109",
      "__Unused110",
      "__Unused111",
      "__Unused112",
      "__Unused113",
      "__Unused114",
      "__Unused115",
      "__Unused116",
      "__Unused117",
      "__Unused118",
      "__Unused119",
      "__Unused120",
      "__Unused121",
      "__Unused122",
      "__Unused123",
      "__Unused124",
      "__Unused125",
      "__Unused126",
      "__Unused127",
      "Twitter",
    ],
  },
  /**
   * Lookup216: pallet_identity::types::Judgement<Balance>
   **/
  PalletIdentityJudgement: {
    _enum: {
      Unknown: "Null",
      FeePaid: "u128",
      Reasonable: "Null",
      KnownGood: "Null",
      OutOfDate: "Null",
      LowQuality: "Null",
      Erroneous: "Null",
    },
  },
  /**
   * Lookup217: pallet_democracy::pallet::Call<T>
   **/
  PalletDemocracyCall: {
    _enum: {
      propose: {
        proposalHash: "H256",
        value: "Compact<u128>",
      },
      second: {
        proposal: "Compact<u32>",
        secondsUpperBound: "Compact<u32>",
      },
      vote: {
        refIndex: "Compact<u32>",
        vote: "PalletDemocracyVoteAccountVote",
      },
      emergency_cancel: {
        refIndex: "u32",
      },
      external_propose: {
        proposalHash: "H256",
      },
      external_propose_majority: {
        proposalHash: "H256",
      },
      external_propose_default: {
        proposalHash: "H256",
      },
      fast_track: {
        proposalHash: "H256",
        votingPeriod: "u32",
        delay: "u32",
      },
      veto_external: {
        proposalHash: "H256",
      },
      cancel_referendum: {
        refIndex: "Compact<u32>",
      },
      cancel_queued: {
        which: "u32",
      },
      delegate: {
        to: "AccountId32",
        conviction: "PalletDemocracyConviction",
        balance: "u128",
      },
      undelegate: "Null",
      clear_public_proposals: "Null",
      note_preimage: {
        encodedProposal: "Bytes",
      },
      note_preimage_operational: {
        encodedProposal: "Bytes",
      },
      note_imminent_preimage: {
        encodedProposal: "Bytes",
      },
      note_imminent_preimage_operational: {
        encodedProposal: "Bytes",
      },
      reap_preimage: {
        proposalHash: "H256",
        proposalLenUpperBound: "Compact<u32>",
      },
      unlock: {
        target: "AccountId32",
      },
      remove_vote: {
        index: "u32",
      },
      remove_other_vote: {
        target: "AccountId32",
        index: "u32",
      },
      enact_proposal: {
        proposalHash: "H256",
        index: "u32",
      },
      blacklist: {
        proposalHash: "H256",
        maybeRefIndex: "Option<u32>",
      },
      cancel_proposal: {
        propIndex: "Compact<u32>",
      },
    },
  },
  /**
   * Lookup218: pallet_democracy::conviction::Conviction
   **/
  PalletDemocracyConviction: {
    _enum: [
      "None",
      "Locked1x",
      "Locked2x",
      "Locked3x",
      "Locked4x",
      "Locked5x",
      "Locked6x",
    ],
  },
  /**
   * Lookup220: pallet_elections_phragmen::pallet::Call<T>
   **/
  PalletElectionsPhragmenCall: {
    _enum: {
      vote: {
        votes: "Vec<AccountId32>",
        value: "Compact<u128>",
      },
      remove_voter: "Null",
      submit_candidacy: {
        candidateCount: "Compact<u32>",
      },
      renounce_candidacy: {
        renouncing: "PalletElectionsPhragmenRenouncing",
      },
      remove_member: {
        who: "AccountId32",
        slashBond: "bool",
        rerunElection: "bool",
      },
      clean_defunct_voters: {
        numVoters: "u32",
        numDefunct: "u32",
      },
    },
  },
  /**
   * Lookup221: pallet_elections_phragmen::Renouncing
   **/
  PalletElectionsPhragmenRenouncing: {
    _enum: {
      Member: "Null",
      RunnerUp: "Null",
      Candidate: "Compact<u32>",
    },
  },
  /**
   * Lookup222: pallet_collective::pallet::Call<T, I>
   **/
  PalletCollectiveCall: {
    _enum: {
      set_members: {
        newMembers: "Vec<AccountId32>",
        prime: "Option<AccountId32>",
        oldCount: "u32",
      },
      execute: {
        proposal: "Call",
        lengthBound: "Compact<u32>",
      },
      propose: {
        threshold: "Compact<u32>",
        proposal: "Call",
        lengthBound: "Compact<u32>",
      },
      vote: {
        proposal: "H256",
        index: "Compact<u32>",
        approve: "bool",
      },
      close: {
        proposalHash: "H256",
        index: "Compact<u32>",
        proposalWeightBound: "Compact<u64>",
        lengthBound: "Compact<u32>",
      },
      disapprove_proposal: {
        proposalHash: "H256",
      },
    },
  },
  /**
   * Lookup224: pallet_tips::pallet::Call<T, I>
   **/
  PalletTipsCall: {
    _enum: {
      report_awesome: {
        reason: "Bytes",
        who: "AccountId32",
      },
      retract_tip: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
      tip_new: {
        reason: "Bytes",
        who: "AccountId32",
        tipValue: "Compact<u128>",
      },
      tip: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
        tipValue: "Compact<u128>",
      },
      close_tip: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
      slash_tip: {
        _alias: {
          hash_: "hash",
        },
        hash_: "H256",
      },
    },
  },
  /**
   * Lookup225: pallet_proxy::pallet::Call<T>
   **/
  PalletProxyCall: {
    _enum: {
      proxy: {
        real: "AccountId32",
        forceProxyType: "Option<CommonRuntimeProxyType>",
        call: "Call",
      },
      add_proxy: {
        delegate: "AccountId32",
        proxyType: "CommonRuntimeProxyType",
        delay: "u32",
      },
      remove_proxy: {
        delegate: "AccountId32",
        proxyType: "CommonRuntimeProxyType",
        delay: "u32",
      },
      remove_proxies: "Null",
      anonymous: {
        proxyType: "CommonRuntimeProxyType",
        delay: "u32",
        index: "u16",
      },
      kill_anonymous: {
        spawner: "AccountId32",
        proxyType: "CommonRuntimeProxyType",
        index: "u16",
        height: "Compact<u32>",
        extIndex: "Compact<u32>",
      },
      announce: {
        real: "AccountId32",
        callHash: "H256",
      },
      remove_announcement: {
        real: "AccountId32",
        callHash: "H256",
      },
      reject_announcement: {
        delegate: "AccountId32",
        callHash: "H256",
      },
      proxy_announced: {
        delegate: "AccountId32",
        real: "AccountId32",
        forceProxyType: "Option<CommonRuntimeProxyType>",
        call: "Call",
      },
    },
  },
  /**
   * Lookup227: pallet_multisig::pallet::Call<T>
   **/
  PalletMultisigCall: {
    _enum: {
      as_multi_threshold_1: {
        otherSignatories: "Vec<AccountId32>",
        call: "Call",
      },
      as_multi: {
        threshold: "u16",
        otherSignatories: "Vec<AccountId32>",
        maybeTimepoint: "Option<PalletMultisigTimepoint>",
        call: "WrapperKeepOpaque<Call>",
        storeCall: "bool",
        maxWeight: "u64",
      },
      approve_as_multi: {
        threshold: "u16",
        otherSignatories: "Vec<AccountId32>",
        maybeTimepoint: "Option<PalletMultisigTimepoint>",
        callHash: "[u8;32]",
        maxWeight: "u64",
      },
      cancel_as_multi: {
        threshold: "u16",
        otherSignatories: "Vec<AccountId32>",
        timepoint: "PalletMultisigTimepoint",
        callHash: "[u8;32]",
      },
    },
  },
  /**
   * Lookup230: pallet_uniques::pallet::Call<T, I>
   **/
  PalletUniquesCall: {
    _enum: {
      create: {
        admin: "AccountId32",
      },
      force_create: {
        owner: "AccountId32",
        freeHolding: "bool",
      },
      try_increment_id: "Null",
      destroy: {
        collection: "u128",
        witness: "PalletUniquesDestroyWitness",
      },
      mint: {
        collection: "u128",
        item: "u128",
        owner: "AccountId32",
      },
      burn: {
        collection: "u128",
        item: "u128",
        checkOwner: "Option<AccountId32>",
      },
      transfer: {
        collection: "u128",
        item: "u128",
        dest: "AccountId32",
      },
      redeposit: {
        collection: "u128",
        items: "Vec<u128>",
      },
      freeze: {
        collection: "u128",
        item: "u128",
      },
      thaw: {
        collection: "u128",
        item: "u128",
      },
      freeze_collection: {
        collection: "u128",
      },
      thaw_collection: {
        collection: "u128",
      },
      transfer_ownership: {
        collection: "u128",
        owner: "AccountId32",
      },
      set_team: {
        collection: "u128",
        issuer: "AccountId32",
        admin: "AccountId32",
        freezer: "AccountId32",
      },
      approve_transfer: {
        collection: "u128",
        item: "u128",
        delegate: "AccountId32",
      },
      cancel_approval: {
        collection: "u128",
        item: "u128",
        maybeCheckDelegate: "Option<AccountId32>",
      },
      force_item_status: {
        collection: "u128",
        owner: "AccountId32",
        issuer: "AccountId32",
        admin: "AccountId32",
        freezer: "AccountId32",
        freeHolding: "bool",
        isFrozen: "bool",
      },
      set_attribute: {
        collection: "u128",
        maybeItem: "Option<u128>",
        key: "Bytes",
        value: "Bytes",
      },
      clear_attribute: {
        collection: "u128",
        maybeItem: "Option<u128>",
        key: "Bytes",
      },
      set_metadata: {
        collection: "u128",
        item: "u128",
        data: "Bytes",
        isFrozen: "bool",
      },
      clear_metadata: {
        collection: "u128",
        item: "u128",
      },
      set_collection_metadata: {
        collection: "u128",
        data: "Bytes",
        isFrozen: "bool",
      },
      clear_collection_metadata: {
        collection: "u128",
      },
      set_accept_ownership: {
        maybeCollection: "Option<u128>",
      },
      set_collection_max_supply: {
        collection: "u128",
        maxSupply: "u32",
      },
      set_price: {
        collection: "u128",
        item: "u128",
        price: "Option<u128>",
        whitelistedBuyer: "Option<AccountId32>",
      },
      buy_item: {
        collection: "u128",
        item: "u128",
        bidPrice: "u128",
      },
    },
  },
  /**
   * Lookup231: pallet_uniques::types::DestroyWitness
   **/
  PalletUniquesDestroyWitness: {
    items: "Compact<u32>",
    itemMetadatas: "Compact<u32>",
    attributes: "Compact<u32>",
  },
  /**
   * Lookup232: pallet_asset_registry::pallet::Call<T>
   **/
  PalletAssetRegistryCall: {
    _enum: {
      register: {
        name: "Bytes",
        assetType: "PalletAssetRegistryAssetType",
        existentialDeposit: "u128",
      },
      update: {
        assetId: "u32",
        name: "Bytes",
        assetType: "PalletAssetRegistryAssetType",
        existentialDeposit: "Option<u128>",
      },
      set_metadata: {
        assetId: "u32",
        symbol: "Bytes",
        decimals: "u8",
      },
      set_location: {
        assetId: "u32",
        location: "TestingHydradxRuntimeAssetLocation",
      },
    },
  },
  /**
   * Lookup233: pallet_claims::pallet::Call<T>
   **/
  PalletClaimsCall: {
    _enum: {
      claim: {
        ethereumSignature: "PalletClaimsEcdsaSignature",
      },
    },
  },
  /**
   * Lookup234: pallet_claims::traits::EcdsaSignature
   **/
  PalletClaimsEcdsaSignature: "[u8;65]",
  /**
   * Lookup236: pallet_genesis_history::pallet::Call<T>
   **/
  PalletGenesisHistoryCall: "Null",
  /**
   * Lookup237: pallet_omnipool::pallet::Call<T>
   **/
  PalletOmnipoolCall: {
    _enum: {
      initialize_pool: {
        stableAssetPrice: "u128",
        nativeAssetPrice: "u128",
        stableWeightCap: "Permill",
        nativeWeightCap: "Permill",
      },
      add_token: {
        asset: "u32",
        initialPrice: "u128",
        weightCap: "Permill",
        positionOwner: "AccountId32",
      },
      add_liquidity: {
        asset: "u32",
        amount: "u128",
      },
      remove_liquidity: {
        positionId: "u128",
        amount: "u128",
      },
      sacrifice_position: {
        positionId: "u128",
      },
      sell: {
        assetIn: "u32",
        assetOut: "u32",
        amount: "u128",
        minBuyAmount: "u128",
      },
      buy: {
        assetOut: "u32",
        assetIn: "u32",
        amount: "u128",
        maxSellAmount: "u128",
      },
      set_asset_tradable_state: {
        assetId: "u32",
        state: "PalletOmnipoolTradability",
      },
      refund_refused_asset: {
        assetId: "u32",
        amount: "u128",
        recipient: "AccountId32",
      },
      set_asset_weight_cap: {
        assetId: "u32",
        cap: "Permill",
      },
    },
  },
  /**
   * Lookup238: orml_tokens::module::Call<T>
   **/
  OrmlTokensModuleCall: {
    _enum: {
      transfer: {
        dest: "AccountId32",
        currencyId: "u32",
        amount: "Compact<u128>",
      },
      transfer_all: {
        dest: "AccountId32",
        currencyId: "u32",
        keepAlive: "bool",
      },
      transfer_keep_alive: {
        dest: "AccountId32",
        currencyId: "u32",
        amount: "Compact<u128>",
      },
      force_transfer: {
        source: "AccountId32",
        dest: "AccountId32",
        currencyId: "u32",
        amount: "Compact<u128>",
      },
      set_balance: {
        who: "AccountId32",
        currencyId: "u32",
        newFree: "Compact<u128>",
        newReserved: "Compact<u128>",
      },
    },
  },
  /**
   * Lookup239: pallet_currencies::module::Call<T>
   **/
  PalletCurrenciesModuleCall: {
    _enum: {
      transfer: {
        dest: "AccountId32",
        currencyId: "u32",
        amount: "Compact<u128>",
      },
      transfer_native_currency: {
        dest: "AccountId32",
        amount: "Compact<u128>",
      },
      update_balance: {
        who: "AccountId32",
        currencyId: "u32",
        amount: "i128",
      },
    },
  },
  /**
   * Lookup240: orml_vesting::module::Call<T>
   **/
  OrmlVestingModuleCall: {
    _enum: {
      claim: "Null",
      vested_transfer: {
        dest: "AccountId32",
        schedule: "OrmlVestingVestingSchedule",
      },
      update_vesting_schedules: {
        who: "AccountId32",
        vestingSchedules: "Vec<OrmlVestingVestingSchedule>",
      },
      claim_for: {
        dest: "AccountId32",
      },
    },
  },
  /**
   * Lookup242: cumulus_pallet_parachain_system::pallet::Call<T>
   **/
  CumulusPalletParachainSystemCall: {
    _enum: {
      set_validation_data: {
        data: "CumulusPrimitivesParachainInherentParachainInherentData",
      },
      sudo_send_upward_message: {
        message: "Bytes",
      },
      authorize_upgrade: {
        codeHash: "H256",
      },
      enact_authorized_upgrade: {
        code: "Bytes",
      },
    },
  },
  /**
   * Lookup243: cumulus_primitives_parachain_inherent::ParachainInherentData
   **/
  CumulusPrimitivesParachainInherentParachainInherentData: {
    validationData: "PolkadotPrimitivesV2PersistedValidationData",
    relayChainState: "SpTrieStorageProof",
    downwardMessages: "Vec<PolkadotCorePrimitivesInboundDownwardMessage>",
    horizontalMessages:
      "BTreeMap<u32, Vec<PolkadotCorePrimitivesInboundHrmpMessage>>",
  },
  /**
   * Lookup244: polkadot_primitives::v2::PersistedValidationData<primitive_types::H256, N>
   **/
  PolkadotPrimitivesV2PersistedValidationData: {
    parentHead: "Bytes",
    relayParentNumber: "u32",
    relayParentStorageRoot: "H256",
    maxPovSize: "u32",
  },
  /**
   * Lookup246: sp_trie::storage_proof::StorageProof
   **/
  SpTrieStorageProof: {
    trieNodes: "BTreeSet<Bytes>",
  },
  /**
   * Lookup249: polkadot_core_primitives::InboundDownwardMessage<BlockNumber>
   **/
  PolkadotCorePrimitivesInboundDownwardMessage: {
    sentAt: "u32",
    msg: "Bytes",
  },
  /**
   * Lookup252: polkadot_core_primitives::InboundHrmpMessage<BlockNumber>
   **/
  PolkadotCorePrimitivesInboundHrmpMessage: {
    sentAt: "u32",
    data: "Bytes",
  },
  /**
   * Lookup255: parachain_info::pallet::Call<T>
   **/
  ParachainInfoCall: "Null",
  /**
   * Lookup256: pallet_xcm::pallet::Call<T>
   **/
  PalletXcmCall: {
    _enum: {
      send: {
        dest: "XcmVersionedMultiLocation",
        message: "XcmVersionedXcm",
      },
      teleport_assets: {
        dest: "XcmVersionedMultiLocation",
        beneficiary: "XcmVersionedMultiLocation",
        assets: "XcmVersionedMultiAssets",
        feeAssetItem: "u32",
      },
      reserve_transfer_assets: {
        dest: "XcmVersionedMultiLocation",
        beneficiary: "XcmVersionedMultiLocation",
        assets: "XcmVersionedMultiAssets",
        feeAssetItem: "u32",
      },
      execute: {
        message: "XcmVersionedXcm",
        maxWeight: "u64",
      },
      force_xcm_version: {
        location: "XcmV1MultiLocation",
        xcmVersion: "u32",
      },
      force_default_xcm_version: {
        maybeXcmVersion: "Option<u32>",
      },
      force_subscribe_version_notify: {
        location: "XcmVersionedMultiLocation",
      },
      force_unsubscribe_version_notify: {
        location: "XcmVersionedMultiLocation",
      },
      limited_reserve_transfer_assets: {
        dest: "XcmVersionedMultiLocation",
        beneficiary: "XcmVersionedMultiLocation",
        assets: "XcmVersionedMultiAssets",
        feeAssetItem: "u32",
        weightLimit: "XcmV2WeightLimit",
      },
      limited_teleport_assets: {
        dest: "XcmVersionedMultiLocation",
        beneficiary: "XcmVersionedMultiLocation",
        assets: "XcmVersionedMultiAssets",
        feeAssetItem: "u32",
        weightLimit: "XcmV2WeightLimit",
      },
    },
  },
  /**
   * Lookup257: xcm::VersionedXcm<Call>
   **/
  XcmVersionedXcm: {
    _enum: {
      V0: "XcmV0Xcm",
      V1: "XcmV1Xcm",
      V2: "XcmV2Xcm",
    },
  },
  /**
   * Lookup258: xcm::v0::Xcm<Call>
   **/
  XcmV0Xcm: {
    _enum: {
      WithdrawAsset: {
        assets: "Vec<XcmV0MultiAsset>",
        effects: "Vec<XcmV0Order>",
      },
      ReserveAssetDeposit: {
        assets: "Vec<XcmV0MultiAsset>",
        effects: "Vec<XcmV0Order>",
      },
      TeleportAsset: {
        assets: "Vec<XcmV0MultiAsset>",
        effects: "Vec<XcmV0Order>",
      },
      QueryResponse: {
        queryId: "Compact<u64>",
        response: "XcmV0Response",
      },
      TransferAsset: {
        assets: "Vec<XcmV0MultiAsset>",
        dest: "XcmV0MultiLocation",
      },
      TransferReserveAsset: {
        assets: "Vec<XcmV0MultiAsset>",
        dest: "XcmV0MultiLocation",
        effects: "Vec<XcmV0Order>",
      },
      Transact: {
        originType: "XcmV0OriginKind",
        requireWeightAtMost: "u64",
        call: "XcmDoubleEncoded",
      },
      HrmpNewChannelOpenRequest: {
        sender: "Compact<u32>",
        maxMessageSize: "Compact<u32>",
        maxCapacity: "Compact<u32>",
      },
      HrmpChannelAccepted: {
        recipient: "Compact<u32>",
      },
      HrmpChannelClosing: {
        initiator: "Compact<u32>",
        sender: "Compact<u32>",
        recipient: "Compact<u32>",
      },
      RelayedFrom: {
        who: "XcmV0MultiLocation",
        message: "XcmV0Xcm",
      },
    },
  },
  /**
   * Lookup260: xcm::v0::order::Order<Call>
   **/
  XcmV0Order: {
    _enum: {
      Null: "Null",
      DepositAsset: {
        assets: "Vec<XcmV0MultiAsset>",
        dest: "XcmV0MultiLocation",
      },
      DepositReserveAsset: {
        assets: "Vec<XcmV0MultiAsset>",
        dest: "XcmV0MultiLocation",
        effects: "Vec<XcmV0Order>",
      },
      ExchangeAsset: {
        give: "Vec<XcmV0MultiAsset>",
        receive: "Vec<XcmV0MultiAsset>",
      },
      InitiateReserveWithdraw: {
        assets: "Vec<XcmV0MultiAsset>",
        reserve: "XcmV0MultiLocation",
        effects: "Vec<XcmV0Order>",
      },
      InitiateTeleport: {
        assets: "Vec<XcmV0MultiAsset>",
        dest: "XcmV0MultiLocation",
        effects: "Vec<XcmV0Order>",
      },
      QueryHolding: {
        queryId: "Compact<u64>",
        dest: "XcmV0MultiLocation",
        assets: "Vec<XcmV0MultiAsset>",
      },
      BuyExecution: {
        fees: "XcmV0MultiAsset",
        weight: "u64",
        debt: "u64",
        haltOnError: "bool",
        xcm: "Vec<XcmV0Xcm>",
      },
    },
  },
  /**
   * Lookup262: xcm::v0::Response
   **/
  XcmV0Response: {
    _enum: {
      Assets: "Vec<XcmV0MultiAsset>",
    },
  },
  /**
   * Lookup263: xcm::v1::Xcm<Call>
   **/
  XcmV1Xcm: {
    _enum: {
      WithdrawAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        effects: "Vec<XcmV1Order>",
      },
      ReserveAssetDeposited: {
        assets: "XcmV1MultiassetMultiAssets",
        effects: "Vec<XcmV1Order>",
      },
      ReceiveTeleportedAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        effects: "Vec<XcmV1Order>",
      },
      QueryResponse: {
        queryId: "Compact<u64>",
        response: "XcmV1Response",
      },
      TransferAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        beneficiary: "XcmV1MultiLocation",
      },
      TransferReserveAsset: {
        assets: "XcmV1MultiassetMultiAssets",
        dest: "XcmV1MultiLocation",
        effects: "Vec<XcmV1Order>",
      },
      Transact: {
        originType: "XcmV0OriginKind",
        requireWeightAtMost: "u64",
        call: "XcmDoubleEncoded",
      },
      HrmpNewChannelOpenRequest: {
        sender: "Compact<u32>",
        maxMessageSize: "Compact<u32>",
        maxCapacity: "Compact<u32>",
      },
      HrmpChannelAccepted: {
        recipient: "Compact<u32>",
      },
      HrmpChannelClosing: {
        initiator: "Compact<u32>",
        sender: "Compact<u32>",
        recipient: "Compact<u32>",
      },
      RelayedFrom: {
        who: "XcmV1MultilocationJunctions",
        message: "XcmV1Xcm",
      },
      SubscribeVersion: {
        queryId: "Compact<u64>",
        maxResponseWeight: "Compact<u64>",
      },
      UnsubscribeVersion: "Null",
    },
  },
  /**
   * Lookup265: xcm::v1::order::Order<Call>
   **/
  XcmV1Order: {
    _enum: {
      Noop: "Null",
      DepositAsset: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        maxAssets: "u32",
        beneficiary: "XcmV1MultiLocation",
      },
      DepositReserveAsset: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        maxAssets: "u32",
        dest: "XcmV1MultiLocation",
        effects: "Vec<XcmV1Order>",
      },
      ExchangeAsset: {
        give: "XcmV1MultiassetMultiAssetFilter",
        receive: "XcmV1MultiassetMultiAssets",
      },
      InitiateReserveWithdraw: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        reserve: "XcmV1MultiLocation",
        effects: "Vec<XcmV1Order>",
      },
      InitiateTeleport: {
        assets: "XcmV1MultiassetMultiAssetFilter",
        dest: "XcmV1MultiLocation",
        effects: "Vec<XcmV1Order>",
      },
      QueryHolding: {
        queryId: "Compact<u64>",
        dest: "XcmV1MultiLocation",
        assets: "XcmV1MultiassetMultiAssetFilter",
      },
      BuyExecution: {
        fees: "XcmV1MultiAsset",
        weight: "u64",
        debt: "u64",
        haltOnError: "bool",
        instructions: "Vec<XcmV1Xcm>",
      },
    },
  },
  /**
   * Lookup267: xcm::v1::Response
   **/
  XcmV1Response: {
    _enum: {
      Assets: "XcmV1MultiassetMultiAssets",
      Version: "u32",
    },
  },
  /**
   * Lookup281: cumulus_pallet_xcm::pallet::Call<T>
   **/
  CumulusPalletXcmCall: "Null",
  /**
   * Lookup282: cumulus_pallet_dmp_queue::pallet::Call<T>
   **/
  CumulusPalletDmpQueueCall: {
    _enum: {
      service_overweight: {
        index: "u64",
        weightLimit: "u64",
      },
    },
  },
  /**
   * Lookup283: orml_xcm::module::Call<T>
   **/
  OrmlXcmModuleCall: {
    _enum: {
      send_as_sovereign: {
        dest: "XcmVersionedMultiLocation",
        message: "XcmVersionedXcm",
      },
    },
  },
  /**
   * Lookup284: orml_xtokens::module::Call<T>
   **/
  OrmlXtokensModuleCall: {
    _enum: {
      transfer: {
        currencyId: "u32",
        amount: "u128",
        dest: "XcmVersionedMultiLocation",
        destWeight: "u64",
      },
      transfer_multiasset: {
        asset: "XcmVersionedMultiAsset",
        dest: "XcmVersionedMultiLocation",
        destWeight: "u64",
      },
      transfer_with_fee: {
        currencyId: "u32",
        amount: "u128",
        fee: "u128",
        dest: "XcmVersionedMultiLocation",
        destWeight: "u64",
      },
      transfer_multiasset_with_fee: {
        asset: "XcmVersionedMultiAsset",
        fee: "XcmVersionedMultiAsset",
        dest: "XcmVersionedMultiLocation",
        destWeight: "u64",
      },
      transfer_multicurrencies: {
        currencies: "Vec<(u32,u128)>",
        feeItem: "u32",
        dest: "XcmVersionedMultiLocation",
        destWeight: "u64",
      },
      transfer_multiassets: {
        assets: "XcmVersionedMultiAssets",
        feeItem: "u32",
        dest: "XcmVersionedMultiLocation",
        destWeight: "u64",
      },
    },
  },
  /**
   * Lookup285: xcm::VersionedMultiAsset
   **/
  XcmVersionedMultiAsset: {
    _enum: {
      V0: "XcmV0MultiAsset",
      V1: "XcmV1MultiAsset",
    },
  },
  /**
   * Lookup288: orml_unknown_tokens::module::Call<T>
   **/
  OrmlUnknownTokensModuleCall: "Null",
  /**
   * Lookup289: pallet_authorship::pallet::Call<T>
   **/
  PalletAuthorshipCall: {
    _enum: {
      set_uncles: {
        newUncles: "Vec<SpRuntimeHeader>",
      },
    },
  },
  /**
   * Lookup291: sp_runtime::generic::header::Header<Number, sp_runtime::traits::BlakeTwo256>
   **/
  SpRuntimeHeader: {
    parentHash: "H256",
    number: "Compact<u32>",
    stateRoot: "H256",
    extrinsicsRoot: "H256",
    digest: "SpRuntimeDigest",
  },
  /**
   * Lookup292: sp_runtime::traits::BlakeTwo256
   **/
  SpRuntimeBlakeTwo256: "Null",
  /**
   * Lookup293: pallet_collator_selection::pallet::Call<T>
   **/
  PalletCollatorSelectionCall: {
    _enum: {
      set_invulnerables: {
        _alias: {
          new_: "new",
        },
        new_: "Vec<AccountId32>",
      },
      set_desired_candidates: {
        max: "u32",
      },
      set_candidacy_bond: {
        bond: "u128",
      },
      register_as_candidate: "Null",
      leave_intent: "Null",
    },
  },
  /**
   * Lookup294: pallet_session::pallet::Call<T>
   **/
  PalletSessionCall: {
    _enum: {
      set_keys: {
        _alias: {
          keys_: "keys",
        },
        keys_: "TestingHydradxRuntimeOpaqueSessionKeys",
        proof: "Bytes",
      },
      purge_keys: "Null",
    },
  },
  /**
   * Lookup295: testing_hydradx_runtime::opaque::SessionKeys
   **/
  TestingHydradxRuntimeOpaqueSessionKeys: {
    aura: "SpConsensusAuraSr25519AppSr25519Public",
  },
  /**
   * Lookup296: sp_consensus_aura::sr25519::app_sr25519::Public
   **/
  SpConsensusAuraSr25519AppSr25519Public: "SpCoreSr25519Public",
  /**
   * Lookup297: sp_core::sr25519::Public
   **/
  SpCoreSr25519Public: "[u8;32]",
  /**
   * Lookup298: pallet_relaychain_info::pallet::Call<T>
   **/
  PalletRelaychainInfoCall: "Null",
  /**
   * Lookup299: pallet_transaction_multi_payment::pallet::Call<T>
   **/
  PalletTransactionMultiPaymentCall: {
    _enum: {
      set_currency: {
        currency: "u32",
      },
      add_currency: {
        currency: "u32",
        price: "u128",
      },
      remove_currency: {
        currency: "u32",
      },
    },
  },
  /**
   * Lookup300: pallet_sudo::pallet::Call<T>
   **/
  PalletSudoCall: {
    _enum: {
      sudo: {
        call: "Call",
      },
      sudo_unchecked_weight: {
        call: "Call",
        weight: "u64",
      },
      set_key: {
        _alias: {
          new_: "new",
        },
        new_: "AccountId32",
      },
      sudo_as: {
        who: "AccountId32",
        call: "Call",
      },
    },
  },
  /**
   * Lookup301: pallet_scheduler::pallet::Error<T>
   **/
  PalletSchedulerError: {
    _enum: [
      "FailedToSchedule",
      "NotFound",
      "TargetBlockNumberInPast",
      "RescheduleNoChange",
    ],
  },
  /**
   * Lookup303: pallet_balances::BalanceLock<Balance>
   **/
  PalletBalancesBalanceLock: {
    id: "[u8;8]",
    amount: "u128",
    reasons: "PalletBalancesReasons",
  },
  /**
   * Lookup304: pallet_balances::Reasons
   **/
  PalletBalancesReasons: {
    _enum: ["Fee", "Misc", "All"],
  },
  /**
   * Lookup307: pallet_balances::ReserveData<ReserveIdentifier, Balance>
   **/
  PalletBalancesReserveData: {
    id: "[u8;8]",
    amount: "u128",
  },
  /**
   * Lookup309: pallet_balances::Releases
   **/
  PalletBalancesReleases: {
    _enum: ["V1_0_0", "V2_0_0"],
  },
  /**
   * Lookup310: pallet_balances::pallet::Error<T, I>
   **/
  PalletBalancesError: {
    _enum: [
      "VestingBalance",
      "LiquidityRestrictions",
      "InsufficientBalance",
      "ExistentialDeposit",
      "KeepAlive",
      "ExistingVestingSchedule",
      "DeadAccount",
      "TooManyReserves",
    ],
  },
  /**
   * Lookup311: pallet_transaction_payment::Releases
   **/
  PalletTransactionPaymentReleases: {
    _enum: ["V1Ancient", "V2"],
  },
  /**
   * Lookup312: pallet_treasury::Proposal<sp_core::crypto::AccountId32, Balance>
   **/
  PalletTreasuryProposal: {
    proposer: "AccountId32",
    value: "u128",
    beneficiary: "AccountId32",
    bond: "u128",
  },
  /**
   * Lookup315: frame_support::PalletId
   **/
  FrameSupportPalletId: "[u8;8]",
  /**
   * Lookup316: pallet_treasury::pallet::Error<T, I>
   **/
  PalletTreasuryError: {
    _enum: [
      "InsufficientProposersBalance",
      "InvalidIndex",
      "TooManyApprovals",
      "InsufficientPermission",
      "ProposalNotApproved",
    ],
  },
  /**
   * Lookup317: pallet_utility::pallet::Error<T>
   **/
  PalletUtilityError: {
    _enum: ["TooManyCalls"],
  },
  /**
   * Lookup318: pallet_preimage::RequestStatus<sp_core::crypto::AccountId32, Balance>
   **/
  PalletPreimageRequestStatus: {
    _enum: {
      Unrequested: "Option<(AccountId32,u128)>",
      Requested: "u32",
    },
  },
  /**
   * Lookup321: pallet_preimage::pallet::Error<T>
   **/
  PalletPreimageError: {
    _enum: [
      "TooLarge",
      "AlreadyNoted",
      "NotAuthorized",
      "NotNoted",
      "Requested",
      "NotRequested",
    ],
  },
  /**
   * Lookup322: pallet_identity::types::Registration<Balance, MaxJudgements, MaxAdditionalFields>
   **/
  PalletIdentityRegistration: {
    judgements: "Vec<(u32,PalletIdentityJudgement)>",
    deposit: "u128",
    info: "PalletIdentityIdentityInfo",
  },
  /**
   * Lookup330: pallet_identity::types::RegistrarInfo<Balance, sp_core::crypto::AccountId32>
   **/
  PalletIdentityRegistrarInfo: {
    account: "AccountId32",
    fee: "u128",
    fields: "PalletIdentityBitFlags",
  },
  /**
   * Lookup332: pallet_identity::pallet::Error<T>
   **/
  PalletIdentityError: {
    _enum: [
      "TooManySubAccounts",
      "NotFound",
      "NotNamed",
      "EmptyIndex",
      "FeeChanged",
      "NoIdentity",
      "StickyJudgement",
      "JudgementGiven",
      "InvalidJudgement",
      "InvalidIndex",
      "InvalidTarget",
      "TooManyFields",
      "TooManyRegistrars",
      "AlreadyClaimed",
      "NotSub",
      "NotOwned",
    ],
  },
  /**
   * Lookup336: pallet_democracy::PreimageStatus<sp_core::crypto::AccountId32, Balance, BlockNumber>
   **/
  PalletDemocracyPreimageStatus: {
    _enum: {
      Missing: "u32",
      Available: {
        data: "Bytes",
        provider: "AccountId32",
        deposit: "u128",
        since: "u32",
        expiry: "Option<u32>",
      },
    },
  },
  /**
   * Lookup337: pallet_democracy::types::ReferendumInfo<BlockNumber, primitive_types::H256, Balance>
   **/
  PalletDemocracyReferendumInfo: {
    _enum: {
      Ongoing: "PalletDemocracyReferendumStatus",
      Finished: {
        approved: "bool",
        end: "u32",
      },
    },
  },
  /**
   * Lookup338: pallet_democracy::types::ReferendumStatus<BlockNumber, primitive_types::H256, Balance>
   **/
  PalletDemocracyReferendumStatus: {
    end: "u32",
    proposalHash: "H256",
    threshold: "PalletDemocracyVoteThreshold",
    delay: "u32",
    tally: "PalletDemocracyTally",
  },
  /**
   * Lookup339: pallet_democracy::types::Tally<Balance>
   **/
  PalletDemocracyTally: {
    ayes: "u128",
    nays: "u128",
    turnout: "u128",
  },
  /**
   * Lookup340: pallet_democracy::vote::Voting<Balance, sp_core::crypto::AccountId32, BlockNumber>
   **/
  PalletDemocracyVoteVoting: {
    _enum: {
      Direct: {
        votes: "Vec<(u32,PalletDemocracyVoteAccountVote)>",
        delegations: "PalletDemocracyDelegations",
        prior: "PalletDemocracyVotePriorLock",
      },
      Delegating: {
        balance: "u128",
        target: "AccountId32",
        conviction: "PalletDemocracyConviction",
        delegations: "PalletDemocracyDelegations",
        prior: "PalletDemocracyVotePriorLock",
      },
    },
  },
  /**
   * Lookup343: pallet_democracy::types::Delegations<Balance>
   **/
  PalletDemocracyDelegations: {
    votes: "u128",
    capital: "u128",
  },
  /**
   * Lookup344: pallet_democracy::vote::PriorLock<BlockNumber, Balance>
   **/
  PalletDemocracyVotePriorLock: "(u32,u128)",
  /**
   * Lookup347: pallet_democracy::Releases
   **/
  PalletDemocracyReleases: {
    _enum: ["V1"],
  },
  /**
   * Lookup348: pallet_democracy::pallet::Error<T>
   **/
  PalletDemocracyError: {
    _enum: [
      "ValueLow",
      "ProposalMissing",
      "AlreadyCanceled",
      "DuplicateProposal",
      "ProposalBlacklisted",
      "NotSimpleMajority",
      "InvalidHash",
      "NoProposal",
      "AlreadyVetoed",
      "DuplicatePreimage",
      "NotImminent",
      "TooEarly",
      "Imminent",
      "PreimageMissing",
      "ReferendumInvalid",
      "PreimageInvalid",
      "NoneWaiting",
      "NotVoter",
      "NoPermission",
      "AlreadyDelegating",
      "InsufficientFunds",
      "NotDelegating",
      "VotesExist",
      "InstantNotAllowed",
      "Nonsense",
      "WrongUpperBound",
      "MaxVotesReached",
      "TooManyProposals",
      "VotingPeriodLow",
    ],
  },
  /**
   * Lookup350: pallet_elections_phragmen::SeatHolder<sp_core::crypto::AccountId32, Balance>
   **/
  PalletElectionsPhragmenSeatHolder: {
    who: "AccountId32",
    stake: "u128",
    deposit: "u128",
  },
  /**
   * Lookup351: pallet_elections_phragmen::Voter<sp_core::crypto::AccountId32, Balance>
   **/
  PalletElectionsPhragmenVoter: {
    votes: "Vec<AccountId32>",
    stake: "u128",
    deposit: "u128",
  },
  /**
   * Lookup352: pallet_elections_phragmen::pallet::Error<T>
   **/
  PalletElectionsPhragmenError: {
    _enum: [
      "UnableToVote",
      "NoVotes",
      "TooManyVotes",
      "MaximumVotesExceeded",
      "LowBalance",
      "UnableToPayBond",
      "MustBeVoter",
      "DuplicatedCandidate",
      "TooManyCandidates",
      "MemberSubmit",
      "RunnerUpSubmit",
      "InsufficientCandidateFunds",
      "NotMember",
      "InvalidWitnessData",
      "InvalidVoteCount",
      "InvalidRenouncing",
      "InvalidReplacement",
    ],
  },
  /**
   * Lookup354: pallet_collective::Votes<sp_core::crypto::AccountId32, BlockNumber>
   **/
  PalletCollectiveVotes: {
    index: "u32",
    threshold: "u32",
    ayes: "Vec<AccountId32>",
    nays: "Vec<AccountId32>",
    end: "u32",
  },
  /**
   * Lookup355: pallet_collective::pallet::Error<T, I>
   **/
  PalletCollectiveError: {
    _enum: [
      "NotMember",
      "DuplicateProposal",
      "ProposalMissing",
      "WrongIndex",
      "DuplicateVote",
      "AlreadyInitialized",
      "TooEarly",
      "TooManyProposals",
      "WrongProposalWeight",
      "WrongProposalLength",
    ],
  },
  /**
   * Lookup358: pallet_tips::OpenTip<sp_core::crypto::AccountId32, Balance, BlockNumber, primitive_types::H256>
   **/
  PalletTipsOpenTip: {
    reason: "H256",
    who: "AccountId32",
    finder: "AccountId32",
    deposit: "u128",
    closes: "Option<u32>",
    tips: "Vec<(AccountId32,u128)>",
    findersFee: "bool",
  },
  /**
   * Lookup360: pallet_tips::pallet::Error<T, I>
   **/
  PalletTipsError: {
    _enum: [
      "ReasonTooBig",
      "AlreadyKnown",
      "UnknownTip",
      "NotFinder",
      "StillOpen",
      "Premature",
    ],
  },
  /**
   * Lookup363: pallet_proxy::ProxyDefinition<sp_core::crypto::AccountId32, common_runtime::ProxyType, BlockNumber>
   **/
  PalletProxyProxyDefinition: {
    delegate: "AccountId32",
    proxyType: "CommonRuntimeProxyType",
    delay: "u32",
  },
  /**
   * Lookup367: pallet_proxy::Announcement<sp_core::crypto::AccountId32, primitive_types::H256, BlockNumber>
   **/
  PalletProxyAnnouncement: {
    real: "AccountId32",
    callHash: "H256",
    height: "u32",
  },
  /**
   * Lookup369: pallet_proxy::pallet::Error<T>
   **/
  PalletProxyError: {
    _enum: [
      "TooMany",
      "NotFound",
      "NotProxy",
      "Unproxyable",
      "Duplicate",
      "NoPermission",
      "Unannounced",
      "NoSelfProxy",
    ],
  },
  /**
   * Lookup371: pallet_multisig::Multisig<BlockNumber, Balance, sp_core::crypto::AccountId32>
   **/
  PalletMultisigMultisig: {
    when: "PalletMultisigTimepoint",
    deposit: "u128",
    depositor: "AccountId32",
    approvals: "Vec<AccountId32>",
  },
  /**
   * Lookup373: pallet_multisig::pallet::Error<T>
   **/
  PalletMultisigError: {
    _enum: [
      "MinimumThreshold",
      "AlreadyApproved",
      "NoApprovalsNeeded",
      "TooFewSignatories",
      "TooManySignatories",
      "SignatoriesOutOfOrder",
      "SenderInSignatories",
      "NotFound",
      "NotOwner",
      "NoTimepoint",
      "WrongTimepoint",
      "UnexpectedTimepoint",
      "MaxWeightTooLow",
      "AlreadyStored",
    ],
  },
  /**
   * Lookup374: pallet_uniques::types::CollectionDetails<sp_core::crypto::AccountId32, DepositBalance>
   **/
  PalletUniquesCollectionDetails: {
    owner: "AccountId32",
    issuer: "AccountId32",
    admin: "AccountId32",
    freezer: "AccountId32",
    totalDeposit: "u128",
    freeHolding: "bool",
    items: "u32",
    itemMetadatas: "u32",
    attributes: "u32",
    isFrozen: "bool",
  },
  /**
   * Lookup377: pallet_uniques::types::ItemDetails<sp_core::crypto::AccountId32, DepositBalance>
   **/
  PalletUniquesItemDetails: {
    owner: "AccountId32",
    approved: "Option<AccountId32>",
    isFrozen: "bool",
    deposit: "u128",
  },
  /**
   * Lookup378: pallet_uniques::types::CollectionMetadata<DepositBalance, StringLimit>
   **/
  PalletUniquesCollectionMetadata: {
    deposit: "u128",
    data: "Bytes",
    isFrozen: "bool",
  },
  /**
   * Lookup379: pallet_uniques::types::ItemMetadata<DepositBalance, StringLimit>
   **/
  PalletUniquesItemMetadata: {
    deposit: "u128",
    data: "Bytes",
    isFrozen: "bool",
  },
  /**
   * Lookup383: pallet_uniques::pallet::Error<T, I>
   **/
  PalletUniquesError: {
    _enum: [
      "NoPermission",
      "UnknownCollection",
      "AlreadyExists",
      "WrongOwner",
      "BadWitness",
      "InUse",
      "Frozen",
      "WrongDelegate",
      "NoDelegate",
      "Unapproved",
      "Unaccepted",
      "Locked",
      "MaxSupplyReached",
      "MaxSupplyAlreadySet",
      "MaxSupplyTooSmall",
      "NextIdNotUsed",
      "UnknownItem",
      "NotForSale",
      "BidTooLow",
    ],
  },
  /**
   * Lookup384: pallet_asset_registry::types::AssetDetails<AssetId, Balance, sp_runtime::bounded::bounded_vec::BoundedVec<T, S>>
   **/
  PalletAssetRegistryAssetDetails: {
    name: "Bytes",
    assetType: "PalletAssetRegistryAssetType",
    existentialDeposit: "u128",
    locked: "bool",
  },
  /**
   * Lookup385: pallet_asset_registry::types::AssetMetadata<sp_runtime::bounded::bounded_vec::BoundedVec<T, S>>
   **/
  PalletAssetRegistryAssetMetadata: {
    symbol: "Bytes",
    decimals: "u8",
  },
  /**
   * Lookup386: pallet_asset_registry::pallet::Error<T>
   **/
  PalletAssetRegistryError: {
    _enum: [
      "NoIdAvailable",
      "AssetNotFound",
      "TooLong",
      "AssetNotRegistered",
      "AssetAlreadyRegistered",
      "InvalidSharedAssetLen",
      "CannotUpdateLocation",
    ],
  },
  /**
   * Lookup387: pallet_claims::pallet::Error<T>
   **/
  PalletClaimsError: {
    _enum: [
      "InvalidEthereumSignature",
      "NoClaimOrAlreadyClaimed",
      "BalanceOverflow",
    ],
  },
  /**
   * Lookup388: pallet_genesis_history::Chain
   **/
  PalletGenesisHistoryChain: {
    genesisHash: "Bytes",
    lastBlockHash: "Bytes",
  },
  /**
   * Lookup390: pallet_collator_rewards::pallet::Error<T>
   **/
  PalletCollatorRewardsError: "Null",
  /**
   * Lookup391: pallet_omnipool::types::AssetState<Balance>
   **/
  PalletOmnipoolAssetState: {
    hubReserve: "u128",
    shares: "u128",
    protocolShares: "u128",
    cap: "u128",
    tradable: "PalletOmnipoolTradability",
  },
  /**
   * Lookup392: pallet_omnipool::types::SimpleImbalance<Balance>
   **/
  PalletOmnipoolSimpleImbalance: {
    value: "u128",
    negative: "bool",
  },
  /**
   * Lookup393: pallet_omnipool::types::Position<Balance, AssetId>
   **/
  PalletOmnipoolPosition: {
    assetId: "u32",
    amount: "u128",
    shares: "u128",
    price: "u128",
  },
  /**
   * Lookup394: pallet_omnipool::pallet::Error<T>
   **/
  PalletOmnipoolError: {
    _enum: [
      "InsufficientBalance",
      "AssetAlreadyAdded",
      "AssetNotFound",
      "NoStableAssetInPool",
      "NoNativeAssetInPool",
      "MissingBalance",
      "InvalidInitialAssetPrice",
      "BuyLimitNotReached",
      "SellLimitExceeded",
      "PositionNotFound",
      "InsufficientShares",
      "NotAllowed",
      "Forbidden",
      "AssetWeightCapExceeded",
      "TVLCapExceeded",
      "AssetNotRegistered",
      "InsufficientLiquidity",
      "InsufficientTradingAmount",
      "SameAssetTradeNotAllowed",
      "HubAssetUpdateError",
      "PositiveImbalance",
      "InvalidSharesAmount",
      "InvalidHubAssetTradableState",
      "AssetRefundNotAllowed",
      "MaxOutRatioExceeded",
      "MaxInRatioExceeded",
    ],
  },
  /**
   * Lookup397: orml_tokens::BalanceLock<Balance>
   **/
  OrmlTokensBalanceLock: {
    id: "[u8;8]",
    amount: "u128",
  },
  /**
   * Lookup399: orml_tokens::AccountData<Balance>
   **/
  OrmlTokensAccountData: {
    free: "u128",
    reserved: "u128",
    frozen: "u128",
  },
  /**
   * Lookup401: orml_tokens::ReserveData<ReserveIdentifier, Balance>
   **/
  OrmlTokensReserveData: {
    id: "[u8;8]",
    amount: "u128",
  },
  /**
   * Lookup403: orml_tokens::module::Error<T>
   **/
  OrmlTokensModuleError: {
    _enum: [
      "BalanceTooLow",
      "AmountIntoBalanceFailed",
      "LiquidityRestrictions",
      "MaxLocksExceeded",
      "KeepAlive",
      "ExistentialDeposit",
      "DeadAccount",
      "TooManyReserves",
    ],
  },
  /**
   * Lookup404: pallet_currencies::module::Error<T>
   **/
  PalletCurrenciesModuleError: {
    _enum: ["AmountIntoBalanceFailed", "BalanceTooLow", "DepositFailed"],
  },
  /**
   * Lookup406: orml_vesting::module::Error<T>
   **/
  OrmlVestingModuleError: {
    _enum: [
      "ZeroVestingPeriod",
      "ZeroVestingPeriodCount",
      "InsufficientBalanceToLock",
      "TooManyVestingSchedules",
      "AmountLow",
      "MaxVestingSchedulesExceeded",
    ],
  },
  /**
   * Lookup408: polkadot_primitives::v2::UpgradeRestriction
   **/
  PolkadotPrimitivesV2UpgradeRestriction: {
    _enum: ["Present"],
  },
  /**
   * Lookup409: cumulus_pallet_parachain_system::relay_state_snapshot::MessagingStateSnapshot
   **/
  CumulusPalletParachainSystemRelayStateSnapshotMessagingStateSnapshot: {
    dmqMqcHead: "H256",
    relayDispatchQueueSize: "(u32,u32)",
    ingressChannels: "Vec<(u32,PolkadotPrimitivesV2AbridgedHrmpChannel)>",
    egressChannels: "Vec<(u32,PolkadotPrimitivesV2AbridgedHrmpChannel)>",
  },
  /**
   * Lookup412: polkadot_primitives::v2::AbridgedHrmpChannel
   **/
  PolkadotPrimitivesV2AbridgedHrmpChannel: {
    maxCapacity: "u32",
    maxTotalSize: "u32",
    maxMessageSize: "u32",
    msgCount: "u32",
    totalSize: "u32",
    mqcHead: "Option<H256>",
  },
  /**
   * Lookup413: polkadot_primitives::v2::AbridgedHostConfiguration
   **/
  PolkadotPrimitivesV2AbridgedHostConfiguration: {
    maxCodeSize: "u32",
    maxHeadDataSize: "u32",
    maxUpwardQueueCount: "u32",
    maxUpwardQueueSize: "u32",
    maxUpwardMessageSize: "u32",
    maxUpwardMessageNumPerCandidate: "u32",
    hrmpMaxMessageNumPerCandidate: "u32",
    validationUpgradeCooldown: "u32",
    validationUpgradeDelay: "u32",
  },
  /**
   * Lookup419: polkadot_core_primitives::OutboundHrmpMessage<polkadot_parachain::primitives::Id>
   **/
  PolkadotCorePrimitivesOutboundHrmpMessage: {
    recipient: "u32",
    data: "Bytes",
  },
  /**
   * Lookup420: cumulus_pallet_parachain_system::pallet::Error<T>
   **/
  CumulusPalletParachainSystemError: {
    _enum: [
      "OverlappingUpgrades",
      "ProhibitedByPolkadot",
      "TooBig",
      "ValidationDataNotAvailable",
      "HostConfigurationNotAvailable",
      "NotScheduled",
      "NothingAuthorized",
      "Unauthorized",
    ],
  },
  /**
   * Lookup421: pallet_xcm::pallet::QueryStatus<BlockNumber>
   **/
  PalletXcmQueryStatus: {
    _enum: {
      Pending: {
        responder: "XcmVersionedMultiLocation",
        maybeNotify: "Option<(u8,u8)>",
        timeout: "u32",
      },
      VersionNotifier: {
        origin: "XcmVersionedMultiLocation",
        isActive: "bool",
      },
      Ready: {
        response: "XcmVersionedResponse",
        at: "u32",
      },
    },
  },
  /**
   * Lookup424: xcm::VersionedResponse
   **/
  XcmVersionedResponse: {
    _enum: {
      V0: "XcmV0Response",
      V1: "XcmV1Response",
      V2: "XcmV2Response",
    },
  },
  /**
   * Lookup430: pallet_xcm::pallet::VersionMigrationStage
   **/
  PalletXcmVersionMigrationStage: {
    _enum: {
      MigrateSupportedVersion: "Null",
      MigrateVersionNotifiers: "Null",
      NotifyCurrentTargets: "Option<Bytes>",
      MigrateAndNotifyOldTargets: "Null",
    },
  },
  /**
   * Lookup431: pallet_xcm::pallet::Error<T>
   **/
  PalletXcmError: {
    _enum: [
      "Unreachable",
      "SendFailure",
      "Filtered",
      "UnweighableMessage",
      "DestinationNotInvertible",
      "Empty",
      "CannotReanchor",
      "TooManyAssets",
      "InvalidOrigin",
      "BadVersion",
      "BadLocation",
      "NoSubscription",
      "AlreadySubscribed",
    ],
  },
  /**
   * Lookup432: cumulus_pallet_xcm::pallet::Error<T>
   **/
  CumulusPalletXcmError: "Null",
  /**
   * Lookup434: cumulus_pallet_xcmp_queue::InboundChannelDetails
   **/
  CumulusPalletXcmpQueueInboundChannelDetails: {
    sender: "u32",
    state: "CumulusPalletXcmpQueueInboundState",
    messageMetadata: "Vec<(u32,PolkadotParachainPrimitivesXcmpMessageFormat)>",
  },
  /**
   * Lookup435: cumulus_pallet_xcmp_queue::InboundState
   **/
  CumulusPalletXcmpQueueInboundState: {
    _enum: ["Ok", "Suspended"],
  },
  /**
   * Lookup438: polkadot_parachain::primitives::XcmpMessageFormat
   **/
  PolkadotParachainPrimitivesXcmpMessageFormat: {
    _enum: ["ConcatenatedVersionedXcm", "ConcatenatedEncodedBlob", "Signals"],
  },
  /**
   * Lookup441: cumulus_pallet_xcmp_queue::OutboundChannelDetails
   **/
  CumulusPalletXcmpQueueOutboundChannelDetails: {
    recipient: "u32",
    state: "CumulusPalletXcmpQueueOutboundState",
    signalsExist: "bool",
    firstIndex: "u16",
    lastIndex: "u16",
  },
  /**
   * Lookup442: cumulus_pallet_xcmp_queue::OutboundState
   **/
  CumulusPalletXcmpQueueOutboundState: {
    _enum: ["Ok", "Suspended"],
  },
  /**
   * Lookup444: cumulus_pallet_xcmp_queue::QueueConfigData
   **/
  CumulusPalletXcmpQueueQueueConfigData: {
    suspendThreshold: "u32",
    dropThreshold: "u32",
    resumeThreshold: "u32",
    thresholdWeight: "u64",
    weightRestrictDecay: "u64",
    xcmpMaxIndividualWeight: "u64",
  },
  /**
   * Lookup446: cumulus_pallet_xcmp_queue::pallet::Error<T>
   **/
  CumulusPalletXcmpQueueError: {
    _enum: [
      "FailedToSend",
      "BadXcmOrigin",
      "BadXcm",
      "BadOverweightIndex",
      "WeightOverLimit",
    ],
  },
  /**
   * Lookup447: cumulus_pallet_dmp_queue::ConfigData
   **/
  CumulusPalletDmpQueueConfigData: {
    maxIndividual: "u64",
  },
  /**
   * Lookup448: cumulus_pallet_dmp_queue::PageIndexData
   **/
  CumulusPalletDmpQueuePageIndexData: {
    beginUsed: "u32",
    endUsed: "u32",
    overweightCount: "u64",
  },
  /**
   * Lookup451: cumulus_pallet_dmp_queue::pallet::Error<T>
   **/
  CumulusPalletDmpQueueError: {
    _enum: ["Unknown", "OverLimit"],
  },
  /**
   * Lookup452: orml_xcm::module::Error<T>
   **/
  OrmlXcmModuleError: {
    _enum: ["Unreachable", "SendFailure", "BadVersion"],
  },
  /**
   * Lookup453: orml_xtokens::module::Error<T>
   **/
  OrmlXtokensModuleError: {
    _enum: [
      "AssetHasNoReserve",
      "NotCrossChainTransfer",
      "InvalidDest",
      "NotCrossChainTransferableCurrency",
      "UnweighableMessage",
      "XcmExecutionFailed",
      "CannotReanchor",
      "InvalidAncestry",
      "InvalidAsset",
      "DestinationNotInvertible",
      "BadVersion",
      "DistinctReserveForAssetAndFee",
      "ZeroFee",
      "ZeroAmount",
      "TooManyAssetsBeingSent",
      "AssetIndexNonExistent",
      "FeeNotEnough",
      "NotSupportedMultiLocation",
      "MinXcmFeeNotDefined",
    ],
  },
  /**
   * Lookup456: orml_unknown_tokens::module::Error<T>
   **/
  OrmlUnknownTokensModuleError: {
    _enum: ["BalanceTooLow", "BalanceOverflow", "UnhandledAsset"],
  },
  /**
   * Lookup458: pallet_authorship::UncleEntryItem<BlockNumber, primitive_types::H256, sp_core::crypto::AccountId32>
   **/
  PalletAuthorshipUncleEntryItem: {
    _enum: {
      InclusionHeight: "u32",
      Uncle: "(H256,Option<AccountId32>)",
    },
  },
  /**
   * Lookup460: pallet_authorship::pallet::Error<T>
   **/
  PalletAuthorshipError: {
    _enum: [
      "InvalidUncleParent",
      "UnclesAlreadySet",
      "TooManyUncles",
      "GenesisUncle",
      "TooHighUncle",
      "UncleAlreadyIncluded",
      "OldUncle",
    ],
  },
  /**
   * Lookup463: pallet_collator_selection::pallet::CandidateInfo<sp_core::crypto::AccountId32, Balance>
   **/
  PalletCollatorSelectionCandidateInfo: {
    who: "AccountId32",
    deposit: "u128",
  },
  /**
   * Lookup465: pallet_collator_selection::pallet::Error<T>
   **/
  PalletCollatorSelectionError: {
    _enum: [
      "TooManyCandidates",
      "TooFewCandidates",
      "Unknown",
      "Permission",
      "AlreadyCandidate",
      "NotCandidate",
      "TooManyInvulnerables",
      "AlreadyInvulnerable",
      "NoAssociatedValidatorId",
      "ValidatorNotRegistered",
    ],
  },
  /**
   * Lookup469: sp_core::crypto::KeyTypeId
   **/
  SpCoreCryptoKeyTypeId: "[u8;4]",
  /**
   * Lookup470: pallet_session::pallet::Error<T>
   **/
  PalletSessionError: {
    _enum: [
      "InvalidProof",
      "NoAssociatedValidatorId",
      "DuplicatedKey",
      "NoKeys",
      "NoAccount",
    ],
  },
  /**
   * Lookup471: pallet_relaychain_info::pallet::Error<T>
   **/
  PalletRelaychainInfoError: "Null",
  /**
   * Lookup472: pallet_transaction_multi_payment::pallet::Error<T>
   **/
  PalletTransactionMultiPaymentError: {
    _enum: [
      "UnsupportedCurrency",
      "ZeroBalance",
      "AlreadyAccepted",
      "CoreAssetNotAllowed",
      "ZeroPrice",
      "FallbackPriceNotFound",
      "Overflow",
    ],
  },
  /**
   * Lookup473: pallet_sudo::pallet::Error<T>
   **/
  PalletSudoError: {
    _enum: ["RequireSudo"],
  },
  /**
   * Lookup475: sp_runtime::MultiSignature
   **/
  SpRuntimeMultiSignature: {
    _enum: {
      Ed25519: "SpCoreEd25519Signature",
      Sr25519: "SpCoreSr25519Signature",
      Ecdsa: "SpCoreEcdsaSignature",
    },
  },
  /**
   * Lookup476: sp_core::ed25519::Signature
   **/
  SpCoreEd25519Signature: "[u8;64]",
  /**
   * Lookup478: sp_core::sr25519::Signature
   **/
  SpCoreSr25519Signature: "[u8;64]",
  /**
   * Lookup479: sp_core::ecdsa::Signature
   **/
  SpCoreEcdsaSignature: "[u8;65]",
  /**
   * Lookup481: frame_system::extensions::check_spec_version::CheckSpecVersion<T>
   **/
  FrameSystemExtensionsCheckSpecVersion: "Null",
  /**
   * Lookup482: frame_system::extensions::check_tx_version::CheckTxVersion<T>
   **/
  FrameSystemExtensionsCheckTxVersion: "Null",
  /**
   * Lookup483: frame_system::extensions::check_genesis::CheckGenesis<T>
   **/
  FrameSystemExtensionsCheckGenesis: "Null",
  /**
   * Lookup486: frame_system::extensions::check_nonce::CheckNonce<T>
   **/
  FrameSystemExtensionsCheckNonce: "Compact<u32>",
  /**
   * Lookup487: frame_system::extensions::check_weight::CheckWeight<T>
   **/
  FrameSystemExtensionsCheckWeight: "Null",
  /**
   * Lookup488: pallet_transaction_payment::ChargeTransactionPayment<T>
   **/
  PalletTransactionPaymentChargeTransactionPayment: "Compact<u128>",
  /**
   * Lookup489: testing_hydradx_runtime::Runtime
   **/
  TestingHydradxRuntimeRuntime: "Null",
}
