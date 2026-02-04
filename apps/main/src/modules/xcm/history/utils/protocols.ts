import { ThemeToken } from "@galacticcouncil/ui/theme"

const XC_SCAN_PROTOCOLS: Record<string, { label: string; color: ThemeToken }> =
  {
    xcm: {
      label: "XCM",
      color: "colors.coral.400",
    },
    wh_relayer: {
      label: "Wormhole",
      color: "colors.lavender.500",
    },
    wh_portal: {
      label: "Wormhole",
      color: "colors.lavender.500",
    },
    wh: {
      label: "Wormhole",
      color: "colors.lavender.500",
    },
    snowbridge: {
      label: "Snowbridge",
      color: "colors.skyBlue.500",
    },
    pkbridge: {
      label: "Polkadot-Kusama Bridge",
      color: "colors.aubergine.500",
    },
    hyperbridge: {
      label: "Hyperbridge",
      color: "colors.successGreen.300",
    },
  } as const

export function getProtocolLabel(protocol: string): string {
  return XC_SCAN_PROTOCOLS[protocol]?.label || protocol
}

export function getProtocolColor(protocol: string): ThemeToken | undefined {
  const protocolKey = protocol.toLowerCase()
  return XC_SCAN_PROTOCOLS[protocolKey]?.color
}
