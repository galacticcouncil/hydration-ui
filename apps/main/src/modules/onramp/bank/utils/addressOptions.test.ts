import { describe, expect, it } from "vitest"
import { vi } from "vitest"

import { SEPA_IBAN_COUNTRIES } from "@/modules/onramp/bank/components/BankAccountForm.form"
import {
  alpha3FromAlpha2,
  COUNTRY_CODES,
  countryOptions,
  usStateOptions,
} from "@/modules/onramp/bank/utils/addressOptions"

vi.mock("@/i18n", () => ({ default: { t: (key: string) => key } }))

// The server's address rules (hydration-ramp server/routes/bankAccountRoutes.mjs
// :377-378): country any three capitals on both rails, ACH state any two.
// Bound: copied here, not imported (the server is another repository).
const SERVER_COUNTRY = /^[A-Z]{3}$/
const SERVER_STATE = /^[A-Z]{2}$/

// The server's SEPA IBAN country table, alpha-2 -> alpha-3
// (hydration-ramp server/lib/bridge/ibanCountryAlpha3.mjs:16-53), copied.
const SERVER_SEPA_ALPHA3: Record<string, string> = {
  AT: "AUT",
  BE: "BEL",
  BG: "BGR",
  HR: "HRV",
  CY: "CYP",
  CZ: "CZE",
  DK: "DNK",
  EE: "EST",
  FI: "FIN",
  FR: "FRA",
  DE: "DEU",
  GR: "GRC",
  HU: "HUN",
  IE: "IRL",
  IT: "ITA",
  LV: "LVA",
  LT: "LTU",
  LU: "LUX",
  MT: "MLT",
  NL: "NLD",
  PL: "POL",
  PT: "PRT",
  RO: "ROU",
  SK: "SVK",
  SI: "SVN",
  ES: "ESP",
  SE: "SWE",
  IS: "ISL",
  LI: "LIE",
  NO: "NOR",
  CH: "CHE",
  GB: "GBR",
  MC: "MCO",
  SM: "SMR",
  AD: "AND",
  VA: "VAT",
}

describe("country options", () => {
  const options = countryOptions("en")

  it("offer the 249 ISO 3166-1 alpha-3 codes, each one the server accepts", () => {
    expect(options).toHaveLength(249)
    expect(new Set(options.map((o) => o.key))).toEqual(COUNTRY_CODES)
    expect(options.every((o) => SERVER_COUNTRY.test(o.key))).toBe(true)
  })

  it("label each code with its localized name and the code", () => {
    const usa = options.find((o) => o.key === "USA")
    expect(usa?.label).toBe("United States (USA)")
    // Every alpha-2 of the table resolves to a name in Intl.
    expect(options.every((o) => o.label.endsWith(`(${o.key})`))).toBe(true)
    expect(countryOptions("de").find((o) => o.key === "DEU")?.label).toBe(
      "Deutschland (DEU)",
    )
  })

  it("map every SEPA IBAN country to the server's alpha-3", () => {
    expect([...SEPA_IBAN_COUNTRIES].sort()).toEqual(
      Object.keys(SERVER_SEPA_ALPHA3).sort(),
    )
    for (const [a2, a3] of Object.entries(SERVER_SEPA_ALPHA3))
      expect([a2, alpha3FromAlpha2(a2)]).toEqual([a2, a3])
  })
})

describe("US state options", () => {
  it("are the 50 states, DC and five territories, each a code the server accepts", () => {
    const states = usStateOptions()
    expect(states).toHaveLength(56)
    expect(states.every((s) => SERVER_STATE.test(s.key))).toBe(true)
    for (const code of ["DC", "PR", "GU", "VI", "AS", "MP", "CA", "NY"])
      expect(states.map((s) => s.key)).toContain(code)
    expect(states.find((s) => s.key === "CA")?.label).toBe("California (CA)")
  })
})
