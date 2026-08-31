import { Flex, ProgressBar, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SBorrowCapItem,
  SBorrowCapProgress,
} from "@/modules/strategies/bil/components/BilBorrowCapCurrency.styled"

type BilBorrowCapCurrencyProps = {
  assetId: string
  totalBorrowedHollar: number
  borrowCapHollar: number
}

export const BilBorrowCapCurrency = ({
  assetId,
  totalBorrowedHollar,
  borrowCapHollar,
}: BilBorrowCapCurrencyProps) => {
  const { t } = useTranslation(["common"])

  const totalBorrowed = Math.max(
    0,
    borrowCapHollar > 0
      ? Math.min(totalBorrowedHollar, borrowCapHollar)
      : totalBorrowedHollar,
  )
  const borrowedPct =
    borrowCapHollar > 0 ? (totalBorrowed / borrowCapHollar) * 100 : 0

  return (
    <SBorrowCapItem>
      <Flex align="center" gap="base">
        <AssetLogo id={assetId} size="small" />
        <Text
          font="primary"
          fs="h6"
          fw={600}
          color={getToken("text.high")}
          minWidth="10rem"
        >
          {t("number", { value: totalBorrowed })}
        </Text>
      </Flex>
      {borrowCapHollar > 0 && borrowedPct > 0 && (
        <SBorrowCapProgress>
          <ProgressBar
            size="small"
            value={borrowedPct}
            customLabel={
              <Text
                fs="p4"
                as="span"
                fw={600}
                color={getToken("text.tint.quart")}
              >
                {t("percent", { value: borrowedPct })}
              </Text>
            }
          />
        </SBorrowCapProgress>
      )}
    </SBorrowCapItem>
  )
}
