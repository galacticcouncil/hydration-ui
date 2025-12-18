import { Flex, Separator } from "@galacticcouncil/ui/components"
import { getMinusTokenPx, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC, Fragment } from "react"
import { useTranslation } from "react-i18next"

import { TransactionItemMobile } from "@/components/TransactionItem/TransactionItemMobile"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { PastExecutionData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly executions: Array<PastExecutionData>
}

export const PastExecutionsList: FC<Props> = ({
  assetIn,
  assetOut,
  executions,
}) => {
  const { t } = useTranslation(["common"])

  return (
    <Flex
      direction="column"
      gap={2}
      px={getTokenPx("containers.paddings.primary")}
      sx={{ overflowY: "auto" }}
    >
      {executions.map((execution, index) => {
        const statusProps =
          execution.status === TransactionStatusVariant.Success
            ? {
                status: execution.status,
                sent: t("currency", {
                  value: execution.amountIn,
                  symbol: assetIn.symbol,
                }),
                received: t("currency", {
                  value: execution.amountOut,
                  symbol: assetOut.symbol,
                }),
              }
            : { status: execution.status }

        return (
          <Fragment key={execution.id}>
            {index > 0 && (
              <Separator mx={getMinusTokenPx("containers.paddings.primary")} />
            )}
            <TransactionItemMobile
              sx={{ px: 0 }}
              timestamp={execution.timestamp}
              link={execution.link}
              {...statusProps}
            />
          </Fragment>
        )
      })}
    </Flex>
  )
}
