import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import {
  SContainer,
  SContent,
  SInnerContainer,
} from "./MoneyMarketBanner.styled"
import { useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation, Trans } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { QUERY_KEYS } from "utils/queryKeys"
import { H160 } from "utils/evm"
import { createToastMessages } from "state/toasts"

type MoneyMarketBannerProps = {
  className?: string
}

export const MoneyMarketBanner: FC<MoneyMarketBannerProps> = ({
  className,
}) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const queryClient = useQueryClient()

  const onBind = () => {
    createTransaction(
      {
        tx: api.tx.evmAccounts.bindEvmAddress(),
      },
      {
        toast: createToastMessages("lending.bind.toast", {
          t,
        }),
        onSuccess: () => {
          if (account) {
            queryClient.refetchQueries(
              QUERY_KEYS.evmAccountBinding(H160.fromSS58(account.address)),
            )
          }
        },
      },
    )
  }

  return (
    <SContainer className={className}>
      <SInnerContainer>
        <SContent>
          <div sx={{ pr: [120, 0] }}>
            <Text font="GeistSemiBold" sx={{ mb: 4 }}>
              {t("lending.bind.banner.title")}
            </Text>

            <Text
              fs={12}
              lh={16}
              sx={{ maxWidth: ["100%", 600], opacity: 0.7 }}
            >
              <Trans t={t} i18nKey="lending.bind.banner.description" />
            </Text>
          </div>
          <Button
            variant="primary"
            size="small"
            sx={{ ml: "auto" }}
            css={{ position: "relative", zIndex: 1 }}
            onClick={onBind}
          >
            {t("lending.bind.banner.button")}
          </Button>
        </SContent>
      </SInnerContainer>
    </SContainer>
  )
}
