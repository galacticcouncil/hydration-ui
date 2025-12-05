import { Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly unclaimable: string
  readonly isModal?: boolean
  readonly className?: string
}

export const ClaimStakingRemainder: FC<Props> = ({
  unclaimable,
  isModal,
  className,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

  const amountColor = isModal
    ? getToken("accents.alertAlt.primary")
    : getToken("text.tint.primary")

  return (
    <Text as="div" lh={1.3} className={className}>
      <div>{t("staking:dashboard.remainder1")}</div>
      {isMobile && !isModal ? (
        <Trans
          t={t}
          i18nKey="staking:dashboard.remainder2.mobile"
          values={{
            amount: t("number", { value: unclaimable }),
            symbol: native.symbol,
          }}
        >
          <span sx={{ color: amountColor }} />
        </Trans>
      ) : (
        <>
          <div>
            <Trans
              t={t}
              i18nKey="staking:dashboard.remainder2"
              values={{
                amount: t("number", { value: unclaimable }),
              }}
            >
              <span sx={{ color: amountColor }} />
            </Trans>
          </div>
          <Trans
            t={t}
            i18nKey="staking:dashboard.remainder3"
            values={{
              symbol: native.symbol,
            }}
          >
            <span sx={{ color: amountColor }} />
          </Trans>
        </>
      )}
    </Text>
  )
}
