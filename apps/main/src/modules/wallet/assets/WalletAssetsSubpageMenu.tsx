import { SubpageMenu } from "@/components/SubpageMenu/SubpageMenu"

export const WalletAssetsSubpageMenu = () => {
  return (
    <SubpageMenu
      items={[
        {
          to: "/wallet/assets",
          search: { category: "all" },
          title: "All",
        },
        {
          to: "/wallet/assets",
          search: { category: "assets" },
          title: "Assets",
        },
        {
          to: "/wallet/assets",
          search: { category: "liquidity" },
          title: "Liquidity",
        },
      ]}
    />
  )
}
