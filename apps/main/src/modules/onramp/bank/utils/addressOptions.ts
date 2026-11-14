import { ISO_3166_1 } from "@/modules/onramp/bank/config/countries"
import { US_STATES } from "@/modules/onramp/bank/config/usStates"

const ALPHA3_BY_ALPHA2 = new Map(ISO_3166_1.map(([a2, a3]) => [a2, a3]))

/** Every ISO 3166-1 alpha-3 code the form offers (the API takes any three capitals). */
export const COUNTRY_CODES: ReadonlySet<string> = new Set(
  ISO_3166_1.map(([, a3]) => a3),
)

/** Every USPS code the ACH state field offers for a US address. */
export const US_STATE_CODES: ReadonlySet<string> = new Set(
  US_STATES.map(([code]) => code),
)

/** The alpha-3 of an ISO alpha-2 (an IBAN's first two letters), or null. */
export const alpha3FromAlpha2 = (alpha2: string): string | null =>
  ALPHA3_BY_ALPHA2.get(alpha2.toUpperCase()) ?? null

export type AddressOption = { key: string; label: string }

/**
 * Country options: value the alpha-3 code the API takes, label the country's
 * name in `locale` from `Intl.DisplayNames` (built in) plus the code. A name
 * Intl cannot give falls back to the code alone.
 */
export const countryOptions = (locale: string): AddressOption[] => {
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames([locale, "en"], { type: "region" })
  } catch {
    names = null
  }
  return ISO_3166_1.map(([a2, a3]) => {
    const name = names?.of(a2)
    return { key: a3, label: name && name !== a2 ? `${name} (${a3})` : a3 }
  }).sort((a, b) => a.label.localeCompare(b.label, locale))
}

/** US state options: value the USPS code, label the name plus the code. */
export const usStateOptions = (): AddressOption[] =>
  US_STATES.map(([code, name]) => ({ key: code, label: `${name} (${code})` }))
