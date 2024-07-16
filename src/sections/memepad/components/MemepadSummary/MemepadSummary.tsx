import { Button } from "components/Button/Button"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { MemepadSummaryValues } from "sections/memepad/form/MemepadForm.utils"
import {
  SContainer,
  SDecorativeStarIcon,
  SHeading,
  SRowItem,
} from "./MemepadSummary.styled"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { shortenAccountAddress } from "utils/formatting"
import { MemepadVisual } from "sections/memepad/components/MemepadVisual"
import { useRpcProvider } from "providers/rpcProvider"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { theme } from "theme"
import { useMedia } from "react-use"
import IconGithub from "assets/icons/IconGithub.svg?react"
import { qs } from "utils/formatting"

type MemepadSummaryProps = {
  values: MemepadSummaryValues | null
  onReset: () => void
}

export const GITHUB_ISSUE_URL =
  "https://github.com/galacticcouncil/intergalactic-asset-metadata/issues/new"

export const MemepadSummary: React.FC<MemepadSummaryProps> = ({
  values,
  onReset,
}) => {
  const { assets } = useRpcProvider()
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.md)

  if (!values) return null

  const {
    symbol,
    name,
    decimals,
    account,
    amount,
    supply,
    xykPoolAssetId,
    internalId,
  } = values || {}

  const xykAssetAMeta = internalId ? assets.getAsset(internalId) : null
  const xykAssetBMeta = xykPoolAssetId ? assets.getAsset(xykPoolAssetId) : null

  const onGithubOpen = () => {
    const url = `${GITHUB_ISSUE_URL}${qs({
      title: `[MEMEPAD] Add ${name} (${symbol})`,
      ticker: symbol,
      template: "ADD-ASSET.yml",
      labels: "add-token",
      "token-id": internalId,
    })}`
    window.open(url)
  }

  return (
    <SContainer>
      {isDesktop && (
        <div sx={{ mt: -50 }}>
          <MemepadVisual variant="b" />
        </div>
      )}
      <div>
        <SHeading>
          <SDecorativeStarIcon />
          <Text
            fs={[12, 20]}
            lh={[20, 30]}
            tTransform="uppercase"
            tAlign="center"
            font="GeistMedium"
            sx={{ mb: 4 }}
          >
            {t("memepad.summary.congrats")}
          </Text>
          <GradientText
            fs={[22, 34]}
            tTransform="uppercase"
            tAlign="center"
            sx={{ display: "block" }}
          >
            <Trans t={t} i18nKey="memepad.summary.title" />
          </GradientText>
          <SDecorativeStarIcon />
        </SHeading>
        <div sx={{ mb: [16, 28] }}>
          <Text sx={{ mb: 12 }} color="brightBlue300" font="GeistMono">
            {t("memepad.summary.yourSummary")}:
          </Text>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.form.symbol")}
            </Text>
            <Text fs={14} color="brightBlue300">
              {symbol}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.form.name")}
            </Text>
            <Text fs={14} color="brightBlue300">
              {name}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.form.decimals")}
            </Text>
            <Text fs={14} color="brightBlue300">
              {decimals}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.summary.totalSupply")}
            </Text>
            <Text fs={14} color="brightBlue300">
              {t("value.tokenWithSymbol", {
                value: supply,
                symbol: symbol,
              })}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.form.account")}
            </Text>
            <Text fs={14} color="brightBlue300">
              {account ? shortenAccountAddress(account) : ""}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.summary.liquidityTransfered")}
            </Text>
            <Text fs={14} color="brightBlue300">
              {t("value.tokenWithSymbol", {
                value: amount,
                symbol: symbol,
              })}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.summary.xykPool")}
            </Text>
            <div sx={{ flex: "row", align: "center", gap: 4 }}>
              <div sx={{ flex: "row" }}>
                <Icon size={20} icon={<AssetLogo id={xykAssetAMeta?.id} />} />
                <Icon
                  size={20}
                  icon={<AssetLogo id={xykAssetBMeta?.id} />}
                  sx={{ ml: -4 }}
                />
              </div>
              <Text fs={14} color="brightBlue300">
                {xykAssetAMeta?.symbol}/{xykAssetBMeta?.symbol}
              </Text>
            </div>
          </SRowItem>
        </div>
        <div
          sx={{ flex: ["column", "row"], gap: 12, justify: "space-between" }}
        >
          <Button size="small" onClick={onReset} sx={{ height: "auto" }}>
            {t("memepad.summary.createNewAsset")}
          </Button>
          <Button size="small" onClick={onGithubOpen} sx={{ height: "auto" }}>
            <IconGithub width={18} height={18} />
            {t("memepad.summary.createGithubIssue")}
          </Button>
        </div>
      </div>
      {isDesktop && (
        <div sx={{ mt: -100 }}>
          <MemepadVisual variant="a" />
        </div>
      )}
    </SContainer>
  )
}
