import { first, isArray, isBigInt, isObjectType, isTruthy } from "remeda"

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

export interface JsonObject {
  [key: string]: JsonValue
}

export interface TypeValueNode extends JsonObject {
  type: string
  value: JsonValue
}

function isTypeValueNode(value: JsonValue): value is TypeValueNode {
  return (
    isObjectType(value) &&
    "type" in value &&
    typeof value.type === "string" &&
    "value" in value
  )
}

function collapseBigIntArray(
  input: JsonValue[],
  mapper: (value: JsonValue) => JsonValue,
): JsonValue {
  const filtered = input.filter(isTruthy)
  if (filtered.length === 0) return mapper(input[0])
  if (filtered.length === 1) {
    const value = first(filtered)
    if (value) return mapper(value)
  }
  return filtered.map(mapper)
}

/**
 * Formats a JSON value for display by collapsing `{ type, value }` nodes
 * into an object keyed by type and nested type
 */
export function formatTypeValueJson(input: JsonValue): JsonValue {
  if (isArray(input)) {
    return input.length > 0 && input.every(isBigInt)
      ? collapseBigIntArray(input, formatTypeValueJson)
      : input.map(formatTypeValueJson)
  }

  if (isBigInt(input)) {
    return input.toString()
  }

  if (!isObjectType(input)) {
    return input
  }

  if (isTypeValueNode(input)) {
    const nestedValue = input.value

    if (isTypeValueNode(nestedValue)) {
      return {
        [`${input.type}.${nestedValue.type}`]: formatTypeValueJson(
          nestedValue.value,
        ),
      }
    }

    return {
      [input.type]: formatTypeValueJson(nestedValue),
    }
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      formatTypeValueJson(value),
    ]),
  )
}
