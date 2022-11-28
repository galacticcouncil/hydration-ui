import { u32 } from "@polkadot/types-codec"

export const normalizeId = (id: string | u32) => {
  return id.toString()
}
