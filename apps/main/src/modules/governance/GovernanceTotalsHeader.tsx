import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  Flex,
  SectionHeader,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { toDecimal } from "@/utils/formatting"

type GovernanceTotalsHeaderProps = {
  votesCount: number
  isVotesLoading: boolean
}

export const GovernanceTotalsHeader: FC<GovernanceTotalsHeaderProps> = ({
  votesCount,
  isVotesLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { getAssetWithFallback, native } = useAssets()
  const { isBalanceLoading, getBalance } = useAccountBalances()

  const hdxBalance = getBalance(native.id)
  const humanHdx = toDecimal(hdxBalance?.total ?? "0", native.decimals) // @TODO: should be total or transferable?
  const [hdxUsdDisplay, { isLoading: isHdxUsdLoading }] = useDisplayAssetPrice(
    native.id,
    humanHdx,
  )

  const gigaHdxAsset = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const gigaHdxBalance = getBalance(HDX_ERC20_ASSET_ID)
  const humanGigaHdx = toDecimal(
    gigaHdxBalance?.total ?? "0",
    gigaHdxAsset.decimals,
  )
  const [gigaHdxUsdDisplay, { isLoading: isGigaHdxUsdLoading }] =
    useDisplayAssetPrice(HDX_ERC20_ASSET_ID, humanGigaHdx)

  return (
    <Flex direction="column" gap="m">
      <Flex direction="column" gap="xs">
        <SectionHeader
          title={t("staking:governance.title")}
          hasDescription
          noTopPadding
        />
        <Text fs="p6" lh="s" color={getToken("text.medium")}>
          {t("staking:governance.description")}
        </Text>
      </Flex>
      <Stack
        direction={["column", null, "row"]}
        gap={["base", null, "xxxl", "3.75rem"]}
        separated
      >
        <ValueStats
          wrap
          size="medium"
          label={t("staking:governance.balance.hdx")}
          isLoading={isBalanceLoading}
          value={t("currency", { value: humanHdx, symbol: native.symbol })}
          bottomLabel={isHdxUsdLoading ? undefined : hdxUsdDisplay}
        />
        <ValueStats
          wrap
          size="medium"
          label={t("staking:governance.balance.gigaHdx")}
          isLoading={isBalanceLoading}
          value={t("currency", {
            value: humanGigaHdx,
            symbol: gigaHdxAsset.symbol,
          })}
          bottomLabel={isGigaHdxUsdLoading ? undefined : gigaHdxUsdDisplay}
        />
        <ValueStats
          wrap
          size="medium"
          label={t("staking:governance.balance.totalVotes")}
          isLoading={isVotesLoading}
          value={votesCount.toString()}
        />
      </Stack>
    </Flex>
  )
}
