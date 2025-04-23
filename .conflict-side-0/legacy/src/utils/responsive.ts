import { css, CSSObject, SerializedStyles } from "@emotion/react"
import { theme } from "theme"

export type ResponsiveValue<Atom> =
  | Atom
  | Readonly<[xs: Atom]>
  | Readonly<[xs: Atom, sm: Atom]>
  | Readonly<[xs: Atom, sm: Atom, md: Atom]>
  | Readonly<[xs: Atom, sm: Atom, md: Atom, lg: Atom]>
  | Readonly<[xs: Atom, sm: Atom, md: Atom, lg: Atom, xl: Atom]>

type InterpolationPrimitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | SerializedStyles
  | CSSObject

interface ArrayCSSInterpolation extends Array<CSSInterpolation> {}
type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation

type MediaInterpolationMap<Key extends string | number> =
  | Record<Key, CSSInterpolation>
  | ((value: Key) => CSSInterpolation | undefined)

/**
 * This function is explicitly named "_"
 * to make classname viewing much easier
 */
function _<Key extends string | number>(
  value: Key | null | undefined,
  resolved: MediaInterpolationMap<Key>,
): CSSInterpolation | undefined {
  if (value == null) return undefined

  if (typeof resolved === "function") {
    return css(resolved(value))
  }
  return css(resolved[value])
}

export function getResponsiveStyles<Key extends string | number>(
  value: ResponsiveValue<Key | null | undefined> | null | undefined,
  valueMap: MediaInterpolationMap<Key>,
): CSSInterpolation | undefined {
  if (value == null) return undefined

  if (typeof value === "string" || typeof value === "number") {
    return _(value, valueMap)
  }

  if (Array.isArray(value)) {
    const { length } = value

    if (length === 1) {
      const [xs] = value
      return _(xs, valueMap)
    }

    if (length === 2) {
      const [xs, sm] = value
      return {
        [`@media ${theme.viewport.lt.sm}`]: _(xs, valueMap),
        [`@media ${theme.viewport.gte.sm}`]: _(sm, valueMap),
      }
    }

    if (length === 3) {
      const [xs, sm, md] = value
      return {
        [`@media ${theme.viewport.lt.sm}`]: _(xs, valueMap),
        [`@media ${theme.viewport.gte.sm} and ${theme.viewport.lt.md}`]: _(
          sm,
          valueMap,
        ),
        [`@media ${theme.viewport.gte.md}`]: _(md, valueMap),
      }
    }

    if (length === 4) {
      const [xs, sm, md, lg] = value
      return {
        [`@media ${theme.viewport.lt.sm}`]: _(xs, valueMap),
        [`@media ${theme.viewport.gte.sm} and ${theme.viewport.lt.md}`]: _(
          sm,
          valueMap,
        ),
        [`@media ${theme.viewport.gte.md} and ${theme.viewport.lt.lg}`]: _(
          md,
          valueMap,
        ),
        [`@media ${theme.viewport.gte.lg}`]: _(lg, valueMap),
      }
    }

    if (length === 5) {
      const [xs, sm, md, lg, xl] = value
      return {
        [`@media ${theme.viewport.lt.sm}`]: _(xs, valueMap),
        [`@media ${theme.viewport.gte.sm} and ${theme.viewport.lt.md}`]: _(
          sm,
          valueMap,
        ),
        [`@media ${theme.viewport.gte.md} and ${theme.viewport.lt.lg}`]: _(
          md,
          valueMap,
        ),
        [`@media ${theme.viewport.gte.lg} and ${theme.viewport.lt.xl}`]: _(
          lg,
          valueMap,
        ),
        [`@media ${theme.viewport.gte.xl}`]: _(xl, valueMap),
      }
    }

    throw new Error(`Invalid responsive value: ${JSON.stringify(value)}`)
  }

  throw new Error(`Invalid responsive value: ${JSON.stringify(value)}`)
}
