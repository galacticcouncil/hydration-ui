import { Trans, useTranslation } from "react-i18next"
import { SContainer } from "./ClaimeRewardsCard.styled"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { Button } from "components/Button/Button"
import { Fragment, useMemo } from "react"
import { css } from "@emotion/react"
import { Separator } from "components/Separator/Separator"
import { useAssetMetaList } from "api/assetMeta"
import { separateBalance } from "utils/balance"
import BN from "bignumber.js"

const claimable: { data: { assets: Record<string, BN>; usd: BN } } = {
  data: {
    usd: BN(123144562223378),
    assets: {
      "0": BN(2234343213213),
      "1": BN(2352313493213),
    },
  },
}

export const ClaimeRewardsCard = () => {
  const { t } = useTranslation()

  const assetsMeta = useAssetMetaList(["0", "1"])

  const { claimableAssets } = useMemo(() => {
    if (!assetsMeta.data) return { claimableAssets: [], toastValue: undefined }

    let claimableAssets = []

    for (let key in claimable.data?.assets) {
      const { decimals, symbol } =
        assetsMeta.data?.find((meta) => meta.id === key) || {}

      const balance = separateBalance(claimable.data?.assets[key], {
        fixedPointScale: decimals || 12,
        type: "token",
      })

      claimableAssets.push({ ...balance, symbol })
    }

    return { claimableAssets }
  }, [assetsMeta.data])

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
      >
        {t("farms.claimCard.button.label")}
      </Button>
    </SContainer>
  )
}
