import { Struct, Enum } from "@polkadot/types"
import { Codec, CodecClass, Registry } from "@polkadot/types/types"

type StructPairType = [string | CodecClass<Codec>, unknown]
export const createStruct = <T extends Struct>(
  registry: Registry,
  pairs: Record<keyof Omit<T, keyof Struct>, StructPairType>,
) => {
  return new (Struct.with(
    Object.fromEntries(
      Object.entries<StructPairType>(pairs).map(([key, [_class]]) => [
        key,
        _class,
      ]),
    ),
  ))(
    registry,
    Object.fromEntries(
      Object.entries<StructPairType>(pairs).map(([key, [_, instance]]) => [
        key,
        instance,
      ]),
    ),
  ) as unknown as T
}

type EnumPairType =
  | [string | CodecClass<Codec>, unknown]
  | [string | CodecClass<Codec>]

export const createEnum = <T extends Enum>(
  registry: Registry,
  pairs: Record<T["type"], EnumPairType>,
) => {
  return new (Enum.with(
    Object.fromEntries(
      Object.entries<EnumPairType>(pairs).map(([key, [_class]]) => [
        key,
        _class,
      ]),
    ),
  ))(
    registry,
    Object.fromEntries(
      Object.entries<EnumPairType>(pairs)
        .map(([key, value]) => {
          if (value.length === 2) {
            return [key, value[1]]
          } else {
            return null
          }
        })
        .filter((x): x is [string | CodecClass<Codec>, unknown] => x != null),
    ),
  ) as unknown as T
}
