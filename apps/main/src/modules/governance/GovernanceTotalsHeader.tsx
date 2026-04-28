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
import { useAccountBalance, useAccountBalances } from "@/states/account"
import { NATIVE_ASSET_DECIMALS, NATIVE_ASSET_ID } from "@/utils/consts"
import { toDecimal } from "@/utils/formatting"

type Props = {
  votesCount: number
  isVotesLoading: boolean
}

export const GovernanceTotalsHeader: FC<Props> = ({
  votesCount,
  isVotesLoading,
}) => {
  const { t } = useTranslation("common")
  const { getAssetWithFallback } = useAssets()
  const { isBalanceLoading } = useAccountBalances()

  const hdxAsset = getAssetWithFallback(NATIVE_ASSET_ID)
  const hdxBalance = useAccountBalance(NATIVE_ASSET_ID)
  const humanHdx = toDecimal(hdxBalance?.total ?? "0", NATIVE_ASSET_DECIMALS)
  const [hdxUsdDisplay, { isLoading: isHdxUsdLoading }] = useDisplayAssetPrice(
    NATIVE_ASSET_ID,
    humanHdx,
  )

  const gigaHdxAsset = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const gigaHdxBalance = useAccountBalance(HDX_ERC20_ASSET_ID)
  const humanGigaHdx = toDecimal(
    gigaHdxBalance?.total ?? "0",
    gigaHdxAsset.decimals,
  )
  const [gigaHdxUsdDisplay, { isLoading: isGigaHdxUsdLoading }] =
    useDisplayAssetPrice(HDX_ERC20_ASSET_ID, humanGigaHdx)

  return (
    <Flex direction="column" gap="m">
      <Flex direction="column" gap="xs">
        <SectionHeader title="Your voting power" hasDescription noTopPadding />
        <Text fs="p6" lh="s" color={getToken("text.medium")}>
          Vote with GIGAHDX or GIGAHDX+HDX. Not possible to vote with only HDX
          if you have GIGAHDX.
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
          label="HDX balance"
          isLoading={isBalanceLoading}
          value={t("currency", { value: humanHdx, symbol: hdxAsset.symbol })}
          bottomLabel={isHdxUsdLoading ? undefined : hdxUsdDisplay}
        />
        <ValueStats
          wrap
          size="medium"
          label="GIGAHDX balance"
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
          label="Total votes"
          isLoading={isVotesLoading}
          value={votesCount.toString()}
        />
      </Stack>
    </Flex>
  )
}
