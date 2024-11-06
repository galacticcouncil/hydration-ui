import { useEvmAccountBind } from "api/evm"
import CheckIcon from "assets/icons/CheckIcon.svg?react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  SBoundButton,
  SContainer,
  SContent,
  SInnerContainer,
} from "./MoneyMarketBanner.styled"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"

type MoneyMarketBannerProps = {
  className?: string
}

export const MoneyMarketBanner: FC<MoneyMarketBannerProps> = ({
  className,
}) => {
  const { t } = useTranslation()
  const { account, isBound } = useEvmAccount()

  const { mutate: onBind } = useEvmAccountBind()

  return (
    <SContainer className={className}>
      <SInnerContainer>
        <SContent>
          <div>
            <Text font="GeistSemiBold" sx={{ mb: 4 }}>
              {t("lending.bind.banner.title")}
            </Text>

            <Text fs={12} lh={16} sx={{ opacity: 0.85 }}>
              <Trans t={t} i18nKey="lending.bind.banner.description" />
            </Text>
          </div>
          <div css={{ position: "relative", zIndex: 1 }}>
            {!account ? (
              <Web3ConnectModalButton size="small" />
            ) : isBound ? (
              <SBoundButton size="small">
                <CheckIcon width={14} height={14} />{" "}
                {t("lending.bind.banner.bound")}
              </SBoundButton>
            ) : (
              <Button variant="primary" size="small" onClick={() => onBind()}>
                {t("lending.bind.banner.button")}
              </Button>
            )}
          </div>
        </SContent>
      </SInnerContainer>
    </SContainer>
  )
}
