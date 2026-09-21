import { CustomMarket, MarketDescriptor } from "@/types"

/**
 * The four deployed markets, as plain data.
 *
 * No chain id lives here (ADR-0003): every one of these pools is on Hydration,
 * and the descriptor's job is to name contracts, not networks. The wagmi
 * `Config` the caller passes alongside a descriptor is what decides which
 * network is read — pairing the two is the only guard against reading the
 * wrong one (ADR-0010).
 *
 * `hydration_testnet_v3` deliberately points at the SAME addresses as
 * `hydration_v3`. v1 carries a separate set of testnet addresses, but no
 * contract is deployed at them; copying them across would only produce empty
 * reads.
 */
export const markets: { readonly [K in CustomMarket]: MarketDescriptor } = {
  hydration_v3: {
    market: "hydration_v3",
    marketTitle: "Hydration",
    addresses: {
      POOL_ADDRESSES_PROVIDER: "0xf3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691",
      POOL: "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38",
      UI_POOL_DATA_PROVIDER: "0x112b087b60C1a166130d59266363C45F8aa99db0",
      UI_INCENTIVE_DATA_PROVIDER: "0x23711ED88aFd7C9930a7337e5AacA3DAcC780FEc",
      WALLET_BALANCE_PROVIDER: "0x0AFCD36f29BbC1Ae40007ff289901Ae442558796",
      HOLLAR_TOKEN: "0x531a654d1696ED52e7275A8cede955E82620f99a",
      HOLLAR_UI_DATA_PROVIDER: "0x5A31E4a57212eB5ad02a1b9fd736A1fDd9Caa05D",
    },
  },
  hydration_testnet_v3: {
    market: "hydration_testnet_v3",
    marketTitle: "Hydration Testnet",
    addresses: {
      POOL_ADDRESSES_PROVIDER: "0xf3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691",
      POOL: "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38",
      UI_POOL_DATA_PROVIDER: "0x112b087b60C1a166130d59266363C45F8aa99db0",
      UI_INCENTIVE_DATA_PROVIDER: "0x23711ED88aFd7C9930a7337e5AacA3DAcC780FEc",
      WALLET_BALANCE_PROVIDER: "0x0AFCD36f29BbC1Ae40007ff289901Ae442558796",
      HOLLAR_TOKEN: "0x531a654d1696ED52e7275A8cede955E82620f99a",
      HOLLAR_UI_DATA_PROVIDER: "0x5A31E4a57212eB5ad02a1b9fd736A1fDd9Caa05D",
    },
  },
  bil_v3: {
    market: "bil_v3",
    marketTitle: "BIL",
    addresses: {
      POOL_ADDRESSES_PROVIDER: "0x653DFc382b74E7399dae06DC4d07202E28b5990B",
      POOL: "0x69310FdA58c819aD82df7d2Cb61841C853337a53",
      UI_POOL_DATA_PROVIDER: "0x112b087b60C1a166130d59266363C45F8aa99db0",
      UI_INCENTIVE_DATA_PROVIDER: "0x23711ED88aFd7C9930a7337e5AacA3DAcC780FEc",
      WALLET_BALANCE_PROVIDER: "0x0AFCD36f29BbC1Ae40007ff289901Ae442558796",
      HOLLAR_TOKEN: "0x531a654d1696ED52e7275A8cede955E82620f99a",
      HOLLAR_UI_DATA_PROVIDER: "0x5A31E4a57212eB5ad02a1b9fd736A1fDd9Caa05D",
    },
  },
  gigahdx_v3: {
    market: "gigahdx_v3",
    marketTitle: "GIGAHDX",
    addresses: {
      POOL_ADDRESSES_PROVIDER: "0x3C7D7b74bB625736b93d859e332F06Df64635973",
      POOL: "0x2Ce2CfFF743CdB6637F4B5D351937A541B8c8923",
      UI_POOL_DATA_PROVIDER: "0x112b087b60C1a166130d59266363C45F8aa99db0",
      UI_INCENTIVE_DATA_PROVIDER: "0x23711ED88aFd7C9930a7337e5AacA3DAcC780FEc",
      WALLET_BALANCE_PROVIDER: "0x0AFCD36f29BbC1Ae40007ff289901Ae442558796",
      HOLLAR_TOKEN: "0x531a654d1696ED52e7275A8cede955E82620f99a",
      HOLLAR_UI_DATA_PROVIDER: "0x5A31E4a57212eB5ad02a1b9fd736A1fDd9Caa05D",
    },
  },
} as const

/** Resolve a market key to its descriptor. */
export const getMarket = (market: CustomMarket): MarketDescriptor =>
  markets[market]
