import { interpolationFormat } from "@galacticcouncil/utils/src/helpers/interpolation"
import { TransferValidationReport } from "@galacticcouncil/xc-core"
import i18next, { TFunction } from "i18next"
import { describe, expect, it } from "vitest"

import xcm from "@/i18n/locales/en/xcm.json"
import {
  pickXcmLimitAlert,
  XcmLimitAlertKey,
} from "@/modules/xcm/transfer/utils/limits"
import { getXcmReportAlerts } from "@/modules/xcm/transfer/utils/report"

const ZEC = 10n ** 8n
const DAY_MS = 86_400_000

const i18n = i18next.createInstance()
i18n.init({
  initImmediate: false,
  lng: "en",
  ns: ["xcm"],
  defaultNS: "xcm",
  resources: { en: { xcm } },
  interpolation: { format: interpolationFormat, escapeValue: false },
})

const translate = i18n.getFixedT("en", "xcm") as unknown as (
  key: string,
  options?: Record<string, unknown>,
) => string

// Renders the real strings, after checking the key exists and no bigint
// reaches the interpolation
const t = ((key: string, options?: Record<string, unknown>) => {
  expect(xcm).toHaveProperty([key])
  for (const value of Object.values(options ?? {})) {
    expect(typeof value).not.toBe("bigint")
  }
  return translate(key, options)
}) as unknown as TFunction<["xcm"]>

const belowMinDeposit: TransferValidationReport = {
  amount: "0.001",
  asset: "ZEC",
  chain: "Zcash",
  decimals: 8,
  min: 100_000n,
  error: "omni.belowMinDeposit",
}

const connectorUnreachable: TransferValidationReport = {
  chain: "Zcash",
  error: "omni.connectorUnreachable",
}

const hubOutboundExceeded: TransferValidationReport = {
  asset: "ZEC",
  chain: "NEAR",
  decimals: 8,
  headroom: 5n * ZEC,
  limit: 10n * ZEC,
  windowMs: DAY_MS,
  error: "ntt.outboundLimitExceeded",
}

const hubInboundExceeded: TransferValidationReport = {
  asset: "ZEC",
  chain: "Hydration",
  decimals: 8,
  headroom: 2n * ZEC,
  limit: 10n * ZEC,
  windowMs: DAY_MS,
  error: "ntt.inboundLimitExceeded",
}

const hubLimitUnreachable: TransferValidationReport = {
  asset: "ZEC",
  chain: "NEAR",
  error: "ntt.limitUnreachable",
}

const circuitBreaker: TransferValidationReport[] = [
  {
    asset: "ZEC",
    chain: "Hydration",
    lockedUntilBlock: 100,
    error: "circuitBreaker.assetLockdown",
  },
  {
    asset: "ZEC",
    chain: "Hydration",
    headroom: ZEC,
    limit: 10n * ZEC,
    error: "circuitBreaker.depositLimitExceeded",
  },
  {
    chain: "Hydration",
    lockdownUntilMs: 0,
    error: "circuitBreaker.withdrawLockdown",
  },
]

describe("getXcmReportAlerts", () => {
  it.each([true, false])(
    "blocks a deposit below the Omni minimum (hub metered: %s)",
    (isHubMetered) => {
      expect(getXcmReportAlerts([belowMinDeposit], isHubMetered, t)).toEqual([
        {
          key: "omni.belowMinDeposit",
          message:
            "The minimum deposit from Zcash is 0.001 ZEC. Smaller deposits are not credited or refunded.",
          severity: "error",
        },
      ])
    },
  )

  it.each([true, false])(
    "blocks when the Omni connector cannot be read (hub metered: %s)",
    (isHubMetered) => {
      expect(
        getXcmReportAlerts([connectorUnreachable], isHubMetered, t),
      ).toEqual([
        {
          key: "omni.connectorUnreachable",
          message:
            "Could not read the Zcash deposit minimum, so this transfer cannot be verified right now. Please try again in a moment.",
          severity: "error",
        },
      ])
    },
  )

  it("maps the hub ntt limits for a source without its own manager", () => {
    const [outbound, unreachable, inbound] = getXcmReportAlerts(
      [hubOutboundExceeded, hubLimitUnreachable, hubInboundExceeded],
      true,
      t,
    )

    expect(outbound).toMatchObject({
      key: XcmLimitAlertKey.WormholeOutboundExceeded,
      title: "Wormhole Rate Limit",
      severity: "error",
    })
    expect(outbound?.message).toMatch(/leaving NEAR\b.* send up to 5\sZEC/)

    expect(unreachable).toMatchObject({
      key: "ntt.limitUnreachable",
      title: "Wormhole Rate Limit",
      message: expect.stringContaining("Wormhole limit for ZEC on NEAR"),
      severity: "error",
    })

    expect(inbound).toMatchObject({
      key: XcmLimitAlertKey.WormholeInboundExceeded,
      title: "Wormhole Rate Limit",
      severity: "warning",
    })
    expect(inbound?.message).toMatch(/arrive on Hydration .* up to 2\sZEC/)
    // The warning is shown through the limit pick, so it must rank there
    expect(pickXcmLimitAlert(inbound ? [inbound] : [])).toBe(inbound)
  })

  it("leaves the ntt keys to the limit hook for a source with a manager", () => {
    expect(
      getXcmReportAlerts(
        [hubOutboundExceeded, hubLimitUnreachable, hubInboundExceeded],
        false,
        t,
      ),
    ).toEqual([])
  })

  it.each([true, false])(
    "leaves circuit breaker keys to their hooks (hub metered: %s)",
    (isHubMetered) => {
      expect(getXcmReportAlerts(circuitBreaker, isHubMetered, t)).toEqual([])
    },
  )

  describe("custody", () => {
    const custody: TransferValidationReport[] = [
      { asset: "ZEC", chain: "NEAR", error: "ntt.custodyUnreachable" },
      {
        asset: "ZEC",
        chain: "NEAR",
        decimals: 8,
        headroom: ZEC,
        error: "ntt.custodyExceeded",
      },
    ]

    it("leaves it to the wormhole hook on an ntt route", () => {
      expect(getXcmReportAlerts(custody, false, t)).toEqual([])
    })

    it("blocks on the custody of the hub, which that hook doesn't read", () => {
      expect(getXcmReportAlerts(custody, true, t)).toMatchObject([
        {
          key: XcmLimitAlertKey.WormholeCustodyUnreachable,
          severity: "error",
        },
        { key: XcmLimitAlertKey.WormholeCustodyExceeded, severity: "error" },
      ])
    })
  })

  it("keeps the existing report errors", () => {
    const report: TransferValidationReport[] = [
      {
        amount: "0.5",
        asset: "HDX",
        chain: "Hydration",
        error: "fee.insufficientBalance",
      },
      ...circuitBreaker,
    ]

    expect(getXcmReportAlerts(report, false, t)).toEqual([
      {
        key: "fee.insufficientBalance",
        message: "You need to have 0.5 HDX on Hydration for fees",
        severity: "error",
      },
    ])
  })

  it("maps nothing without a report", () => {
    expect(getXcmReportAlerts(null, true, t)).toEqual([])
  })
})
