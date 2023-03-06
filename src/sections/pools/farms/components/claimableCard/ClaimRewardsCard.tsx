import { Trans, useTranslation } from "react-i18next"
import { SContainer } from "./ClaimRewardsCard.styled"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { Button } from "components/Button/Button"
import { Fragment, useMemo } from "react"
import { css } from "@emotion/react"
import { Separator } from "components/Separator/Separator"
import { useAssetMetaList } from "api/assetMeta"
import { separateBalance } from "utils/balance"
import { useClaimableAmount, useClaimAllMutation } from "utils/farms/claiming"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { DepositNftType } from "api/deposits"

export const ClaimRewardsCard = (props: {
  pool: OmnipoolPool
  depositNft: DepositNftType
}) => {
  const { t } = useTranslation()

  const claimable = useClaimableAmount(props.pool, props.depositNft)
  const assetsMeta = useAssetMetaList(Object.keys(claimable.data?.assets || {}))

  const claimableAssets = useMemo(() => {
    const claimableAssets = []

    if (assetsMeta.data) {
      for (let key in claimable.data?.assets) {
        const asset = assetsMeta.data?.find((meta) => meta.id === key)
        const balance = separateBalance(claimable.data?.assets[key], {
          fixedPointScale: asset?.decimals ?? 12,
          type: "token",
        })

        claimableAssets.push({ ...balance, symbol: asset?.symbol })
      }
    }

    return claimableAssets
  }, [assetsMeta.data, claimable.data?.assets])

  const claimAll = useClaimAllMutation(props.pool.id, props.depositNft)

  return (
    <SContainer>
      <div
        sx={{ flex: "column", gap: 3, mb: [16, 0] }}
        css={{ alignSelf: "start" }}
      >
        <Text color="brightBlue200" sx={{ mb: 7 }}>
          {t("farms.claimCard.title")}
        </Text>
        {claimableAssets.map((claimableAsset) => (
          <Fragment key={claimableAsset.symbol}>
            <Text
              font="FontOver"
              sx={{ mb: 4, fontSize: [26, 28] }}
              css={{ wordBreak: "break-all" }}
            >
              <Trans
                t={t}
                i18nKey={"farms.claimCard.claim.asset"}
                tOptions={claimableAsset ?? {}}
              >
                <span
                  css={css`
                    color: rgba(${theme.rgbColors.white}, 0.4);
                    font-size: 18px;
                  `}
                />
              </Trans>
            </Text>
            <Separator />
          </Fragment>
        ))}
        <Text
          sx={{ mt: 6 }}
          css={{ color: `rgba(${theme.rgbColors.white}, 0.4)` }}
        >
          {t("value.usd", {
            amount: claimable.data?.usd,
            fixedPointScale: 12,
          })}
        </Text>
      </div>
      <Button
        variant="primary"
        sx={{ height: "fit-content", width: ["100%", 168] }}
        onClick={() => claimAll.mutate()}
        isLoading={claimAll.isLoading}
      >
        {t("farms.claimCard.button.label")}
      </Button>
    </SContainer>
  )
}
