import type { AnyJson } from "@polkadot/types-codec/types"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"

type TXData = AnyJson & {
  method: {
    args: {
      [key: string]: string
    }
    method: string
    section: string
  }
}

export function getTransactionJSON(tx: SubmittableExtrinsic) {
  const data = tx.toHuman() as TXData

  return {
    name: `${data.method.section}.${data.method.method}(args)`,
    code: {
      args: data.method.args,
    },
  }
}
