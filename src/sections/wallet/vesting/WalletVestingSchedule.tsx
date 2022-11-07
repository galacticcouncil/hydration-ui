import { SSchedule, SInner } from "./WalletVestingSchedule.styled"
import { FC, useCallback, useMemo } from "react"
import { Text } from "../../../components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { getFormatSeparators } from "../../../utils/formatting"
import i18n from "i18next"
import { css } from "@emotion/react"
import { theme } from "../../../theme"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { Button } from "../../../components/Button/Button"
import {
  ScheduleType,
  useNextClaimableDate,
  useVestingScheduleClaimableBalance,
} from "../../../api/vesting"
import { useAUSD } from "../../../api/asset"
import { useSpotPrice } from "../../../api/spotPrice"
import { NATIVE_ASSET_ID, useApiPromise } from "../../../utils/api"
import { useTokenBalance } from "../../../api/balances"
import { useAccountStore, useStore } from "../../../state/store"
import { usePaymentInfo } from "../../../api/transaction"

interface WalletVestingScheduleProps {
  schedule: ScheduleType
}

export const WalletVestingSchedule: FC<WalletVestingScheduleProps> = ({
  schedule,
}) => {
  const { t } = useTranslation()
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()
  const separators = getFormatSeparators(i18n.languages[0])
  const { data: claimableBalance } =
    useVestingScheduleClaimableBalance(schedule)

  const { data: nextClaimableDate } = useNextClaimableDate(schedule)
  const { data: paymentInfoData } = usePaymentInfo(api.tx.vesting.claim())

  const AUSD = useAUSD()
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, AUSD.data?.id)
  const balance = useTokenBalance(NATIVE_ASSET_ID, account?.address)

  const claimableUSD = useMemo(() => {
    if (claimableBalance && spotPrice.data) {
      return claimableBalance.times(spotPrice.data.spotPrice)
    }
    return null
  }, [claimableBalance, spotPrice])

  const [num, denom] = t("value", {
    value: claimableBalance,
    fixedPointScale: 12,
    decimalPlaces: 2,
  }).split(separators.decimal ?? ".")

  const isClaimAllowed = useMemo(() => {
    if (paymentInfoData && balance.data && claimableBalance) {
      return claimableBalance.isGreaterThan(
        balance.data.balance.plus(paymentInfoData.partialFee.toBigNumber()),
      )
    }

    return false
  }, [paymentInfoData, balance.data, claimableBalance])

  const handleClaim = useCallback(async () => {
    return await createTransaction({
      tx: api.tx.vesting.claim(),
    })
  }, [api, createTransaction])

  return (
    <SSchedule>
      <SInner>
        <div
          sx={{
            flex: "column",
            gap: 10,
          }}
        >
          <Text color="primary200" fs={16} fw={500}>
            {t("wallet.vesting.claimable_now")}
          </Text>
          <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 900 }}>
            <Trans
              t={t}
              i18nKey="wallet.vesting.claimable_now_value"
              tOptions={{ num, denom }}
            >
              <span
                css={css`
                  color: rgba(${theme.rgbColors.white}, 0.4);
                  font-size: 22px;
                `}
              />
            </Trans>
          </Heading>
          <Text color="neutralGray300" fs={16} lh={18}>
            {t("value.usd", { amount: claimableUSD })}
          </Text>
        </div>
        <div
          sx={{
            textAlign: "center",
          }}
        >
          {balance.data && claimableBalance && (
            <Button
              variant="gradient"
              transform="uppercase"
              onClick={handleClaim}
              disabled={!isClaimAllowed}
              sx={{
                fontWeight: 800,
              }}
            >
              {t("wallet.vesting.claim_assets")}
            </Button>
          )}
          {nextClaimableDate && (
            <Text
              color="neutralGray300"
              tAlign="center"
              sx={{
                mt: 15,
              }}
            >
              {t("wallet.vesting.estimated_claim_date", {
                date: nextClaimableDate,
              })}
            </Text>
          )}
        </div>
      </SInner>
    </SSchedule>
  )
}
