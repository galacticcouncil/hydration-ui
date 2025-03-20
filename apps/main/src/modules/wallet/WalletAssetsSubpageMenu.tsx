import { SubpageMenu } from "@/components/SubpageMenu/SubpageMenu"

export const WalletAssetsSubpageMenu = () => {
  return (
    <SubpageMenu
      items={[
        { to: "/wallet/assets?category=all", title: "All" },
        {
          to: "/wallet/assets?category=assets",
          title: "Assets",
        },
        {
          to: "/wallet/assets?category=liquidity",
          title: "Liquidity",
        },
      ]}
    />
  )
}
