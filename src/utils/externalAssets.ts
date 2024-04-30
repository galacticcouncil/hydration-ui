import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { PENDULUM_ID } from "api/externalAssetRegistry"
import { Buffer } from "buffer"
import {
  InteriorProp,
  isGeneralKey,
  TExternalAssetInput,
} from "sections/wallet/addToken/AddToken.utils"

export const getPendulumInputData = (
  location: HydradxRuntimeXcmAssetLocation,
): TExternalAssetInput => {
  const formatGeneralKey = (key: string) => {
    const isHex = key.startsWith("0x")
    const bytes = Buffer.from(
      isHex ? key.slice(2) : key,
      isHex ? "hex" : "ascii",
    )

    const length = bytes.buffer.byteLength
    const data = Buffer.concat([bytes, Buffer.alloc(32 - length)]).toString(
      "hex",
    )

    return {
      length: length.toString(),
      data: `0x${data}`,
    }
  }

  const interiorType = location.interior.type

  if (interiorType !== "Here") {
    const interior = location.interior[
      `as${interiorType}`
    ].toHuman() as InteriorProp[]

    const newInteriorType = `X${Number(interiorType.slice(1)) + 1}`

    const props = (Array.isArray(interior) ? interior : [interior]).map(
      (interiorProp) => {
        const formatedProp = isGeneralKey(interiorProp)
          ? {
              GeneralKey: formatGeneralKey(interiorProp["GeneralKey"]),
            }
          : interiorProp

        return formatedProp
      },
    )

    return {
      parents: "1",
      interior: {
        [newInteriorType]: [{ Parachain: PENDULUM_ID.toString() }, ...props],
      },
    }
  } else {
    return {
      parents: location.parents.toString(),
      interior: interiorType,
    }
  }
}
