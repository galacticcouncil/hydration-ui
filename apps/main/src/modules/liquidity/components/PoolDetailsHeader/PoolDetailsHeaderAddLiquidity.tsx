import { Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Icon } from "@galacticcouncil/ui/components"
import { Link, useMatch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const PoolDetailsHeaderAddLiquidity: FC = () => {
  const { t } = useTranslation("liquidity")

  const isLiquidityPage = useMatch({
    from: "/liquidity/$id",
    shouldThrow: false,
  })

  const isWalletAssetsPage = useMatch({
    from: "/wallet/assets/liquidity/$id",
    shouldThrow: false,
  })

  return (
    <Button asChild>
      <Link
        {...(isLiquidityPage && { from: "/liquidity/$id", to: "add" })}
        {...(isWalletAssetsPage && {
          from: "/wallet/assets/liquidity/$id",
          to: "add",
        })}
        resetScroll={false}
      >
        <Icon size={14} component={Plus} />
        {t("details.header.addJoinFarms")}
      </Link>
    </Button>
  )
}
