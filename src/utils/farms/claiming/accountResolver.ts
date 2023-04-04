import { GenericAccountId32, u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { u8aConcat } from "@polkadot/util"
import { padEndU8a } from "utils/helpers"
import { Registry } from "@polkadot/types/types"

export const getAccountResolver =
  (registry: Registry) =>
  (sub: u32 | number): AccountId32 => {
    // TYPE_ID based on Substrate
    const TYPE_ID = "modl"
    const PALLET_ID = "0x4f6d6e6957684c4d"

    return new GenericAccountId32(
      registry,
      padEndU8a(
        u8aConcat(
          TYPE_ID,
          PALLET_ID,
          typeof sub !== "number" ? sub.toU8a() : [sub],
        ),
        32,
      ),
    )
  }
