import { useParachainAmount } from "api/externalAssetRegistry"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { STokenInfoRow } from "./TokenInfo.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useGetXYKPools } from "api/xyk"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_0 } from "utils/constants"
import { useExternalXYKVolume } from "./TokenInfo.utils"
import Skeleton from "react-loading-skeleton"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import WarningIcon from "assets/icons/WarningIconRed.svg?react"
import { Icon } from "components/Icon/Icon"
import BN from "bignumber.js"

export const TokenInfo = ({
  asset,
  isChainStored,
}: {
  asset: TExternalAsset
  isChainStored: boolean
}) => {
  const { assets } = useRpcProvider()
  const { t } = useTranslation()
  const parachains = useParachainAmount(asset.id)
  const xykPools = useGetXYKPools()

  const { isXYKPool, pools } = useMemo(() => {
    if (!isChainStored || !xykPools.data)
      return { isXYKPool: false, pools: undefined }

    const storedAsset = assets.external.find(
      (external) => external.generalIndex === asset.id,
    )

    if (storedAsset) {
      const filteredXykPools = xykPools.data.filter((shareToken) =>
        shareToken.assets.includes(storedAsset.id),
      )

      return {
        isXYKPool: filteredXykPools.length,
        pools: filteredXykPools.map((pool) => pool.poolAddress),
      }
    }

    return { isXYKPool: false, pools: undefined }
  }, [asset.id, assets.external, isChainStored, xykPools])

  return (
    <div sx={{ flex: "column" }}>
      <Text fs={12} color="brightBlue300" sx={{ mb: 4 }}>
        {t("wallet.addToken.form.info.title")}
      </Text>

      <STokenInfoRow>
        <div sx={{ flex: "row", gap: 4, align: "center" }}>
          <InfoTooltip
            text={t("wallet.addToken.form.info.registered.tooltip", {
              value: isChainStored ? "is" : "is not",
            })}
          >
            <SInfoIcon />
          </InfoTooltip>
          <Text fs={12} color="basic400">
            {t("wallet.addToken.form.info.registered")}
          </Text>
        </div>

        {isChainStored ? (
          <Text fs={12} color="green600">
            {t("yes")}
          </Text>
        ) : (
          <Text fs={12} color="red500">
            {t("no")}
          </Text>
        )}
      </STokenInfoRow>
      <Separator opacity={0.3} color="darkBlue400" />

      <STokenInfoRow>
        <div sx={{ flex: "row", gap: 4, align: "center" }}>
          <InfoTooltip
            text={t("wallet.addToken.form.info.masterAccount.tooltip")}
          >
            <SInfoIcon />
          </InfoTooltip>
          <Text fs={12} color="basic400">
            {t("wallet.addToken.form.info.masterAccount")}
          </Text>
        </div>

        <div sx={{ flex: "row", gap: 8, align: "center" }}>
          <Text fs={12} color="red500">
            {t("yes")}
          </Text>
          <Icon size={14} sx={{ color: "red500" }} icon={<WarningIcon />} />
        </div>
      </STokenInfoRow>
      <Separator opacity={0.3} color="darkBlue400" />

      <STokenInfoRow>
        <div sx={{ flex: "row", gap: 4, align: "center" }}>
          <InfoTooltip
            text={t("wallet.addToken.form.info.availability.tooltip", {
              count: BN(parachains.amount).plus(1).toNumber(),
            })}
          >
            <SInfoIcon />
          </InfoTooltip>
          <Text fs={12} color="basic400">
            {t("wallet.addToken.form.info.availability")}
          </Text>
        </div>

        <Text fs={12}>{BN(parachains.amount).plus(1).toString()}</Text>
      </STokenInfoRow>

      {isChainStored && (
        <>
          <Separator opacity={0.3} color="darkBlue400" />
          <STokenInfoRow>
            <Text fs={12} color="basic400">
              {t("wallet.addToken.form.info.isolatedPool")}
            </Text>

            {isXYKPool ? (
              <Text fs={12} color="green600">
                {t("yes")}
              </Text>
            ) : (
              <Text fs={12} color="red500">
                {t("no")}
              </Text>
            )}
          </STokenInfoRow>
          {pools?.length ? (
            <>
              <Separator opacity={0.3} color="darkBlue400" />
              <STokenInfoRow>
                <Text fs={12} color="basic400">
                  {t("wallet.addToken.form.info.volume")}
                </Text>

                <XYKVolume pools={pools} />
              </STokenInfoRow>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

const XYKVolume = ({ pools }: { pools: string[] }) => {
  const volumes = useExternalXYKVolume(pools)
  const total = volumes.data?.reduce(
    (acc, value) => acc.plus(value.volume),
    BN_0,
  )

  return (
    <Text fs={12}>
      {volumes.isLoading ? (
        <Skeleton width={40} height={10} />
      ) : (
        <DisplayValue value={total?.div(2)} />
      )}
    </Text>
  )
}
