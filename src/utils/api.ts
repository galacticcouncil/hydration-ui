import { encodeAddress } from "@polkadot/util-crypto"
import { stringToU8a } from "@polkadot/util"

export const HYDRA_ADDRESS_PREFIX = 63
export const NATIVE_ASSET_ID = "0"
export const HUB_ID = "1"
export const OMNIPOOL_ACCOUNT_ADDRESS = encodeAddress(
  stringToU8a("modlomnipool".padEnd(32, "\0")),
  HYDRA_ADDRESS_PREFIX,
)
export const HYDRA_TREASURE_ACCOUNT =
  "7L53bUTBopuwFt3mKUfmkzgGLayYa1Yvn1hAg9v5UMrQzTfh"
export const DEPOSIT_CLASS_ID = "1" // TODO: replace with constant from api
export const POLKADOT_APP_NAME = "HydraDX"

export const getHydraAccountAddress = (seed?: string) =>
  seed
    ? encodeAddress(
        stringToU8a(("modl" + seed).padEnd(32, "\0")),
        HYDRA_ADDRESS_PREFIX,
      )
    : undefined
