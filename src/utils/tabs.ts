import { EXTERNAL_LINKS } from "./links"

export const MENU_ITEMS = [
  {
    key: "lbp",
    translationKey: "header.lbp",
    active: false,
    href: EXTERNAL_LINKS.lbp,
  },
  {
    key: "trade",
    translationKey: "header.trade",
    active: false,
    href: EXTERNAL_LINKS.swap,
  },
  { key: "pools", translationKey: "header.pools", active: true, href: "/" },
  {
    key: "wallet",
    translationKey: "header.wallet",
    active: false,
    href: EXTERNAL_LINKS.wallet,
  },
  {
    key: "bridge",
    translationKey: "header.bridge",
    active: false,
    href: EXTERNAL_LINKS.bridge,
  },
] as const

export type TabKeys = typeof MENU_ITEMS[number]["key"]
