import { Trans, useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { css } from "@emotion/react"
import { theme } from "theme"
import { SContainer } from "./PoolFarmClaim.styled"
import { getFormatSeparators } from "utils/formatting"
import { PoolBase } from "@galacticcouncil/sdk"
import { useClaimableAmount, useClaimAllMutation } from "utils/farms/claiming"
import { Modal } from "components/Modal/Modal"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { PoolPositionMobile } from "../../pool/position/PoolPositionMobile"
import { useUserDeposits } from "utils/farms/deposits"

export function PoolFarmClaim(props: { pool: PoolBase }) {
  const { t, i18n } = useTranslation()
  const [openMyPositions, setOpenMyPositions] = useState(false)

  const positions = useUserDeposits(props.pool.address)
  const claimable = useClaimableAmount(props.pool)
  const claimAll = useClaimAllMutation(props.pool.address)

  const separators = getFormatSeparators(i18n.languages[0])
  const [num, denom] = t("value", {
    value: claimable.data?.bsx,
    fixedPointScale: 12,
    numberPrefix: "≈",
    decimalPlaces: 4,
  }).split(separators.decimal ?? ".")

  const positionsList = useMemo(() => {
    let index = 0

    return positions.data?.map((deposit) =>
      deposit.deposit.yieldFarmEntries.map((entry) => {
        ++index
        return (
          <PoolPositionMobile
            key={index}
            pool={props.pool}
            position={entry}
            index={index}
          />
        )
      }),
    )
  }, [positions.data, props.pool])

  return (
    <SContainer>
      <div css={{ flexShrink: 1 }}>
        <Text color="primary200" fs={16} sx={{ mb: 6 }}>
          {t("pools.allFarms.modal.claim.title")}
        </Text>
        <Text
          fw={900}
          sx={{ mb: 4, fontSize: [24, 28] }}
          css={{ wordBreak: "break-all" }}
        >
          <Trans
            t={t}
            i18nKey="pools.allFarms.modal.claim.bsx"
            tOptions={{ num, denom }}
          >
            <span
              css={css`
                color: rgba(${theme.rgbColors.white}, 0.4);
                font-size: 18px;
              `}
            />
          </Trans>
        </Text>
        <Text
          css={css`
            color: rgba(255, 255, 255, 0.4);
            word-break: break-all;
          `}
        >
          {t("value.usd", { amount: claimable.data?.ausd })}
        </Text>
      </div>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
        }}
      >
        {positions.data && positions.data.length > 0 ? (
          <Button
            variant="secondary"
            sx={{
              p: "10px 16px",
              display: ["inherit", "none"],
            }}
            disabled={!positions.data?.length}
            isLoading={claimAll.mutation.isLoading}
            onClick={() => setOpenMyPositions(true)}
          >
            <WalletIcon />
            {t("pools.allFarms.modal.myPositions")}
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="primary"
          sx={{
            ml: [0, 32],
            flexShrink: 0,
            p: ["10px 16px", "16px 36px"],
            width: "max-content",
          }}
          disabled={!!claimable.data?.bsx.isZero()}
          isLoading={claimAll.mutation.isLoading}
          onClick={() => claimAll.mutation.mutate()}
        >
          {t("pools.allFarms.modal.claim.submit")}
        </Button>
      </div>
      <Modal
        open={openMyPositions}
        isDrawer
        titleDrawer={t("pools.allFarms.modal.list.positions")}
        onClose={() => setOpenMyPositions(false)}
      >
        <div sx={{ flex: "column", gap: 10 }}>{positionsList}</div>
      </Modal>
    </SContainer>
  )
}
