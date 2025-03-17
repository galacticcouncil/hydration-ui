import { assethub, TRugCheckData, useParachainAmount } from "api/external"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { useMemo } from "react"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_0 } from "utils/constants"
import { useExternalXYKVolume } from "./TokenInfo.utils"
import Skeleton from "react-loading-skeleton"
import WarningIcon from "assets/icons/WarningIconRed.svg?react"
import { Icon } from "components/Icon/Icon"
import BN from "bignumber.js"
import { TExternal, useAssets } from "providers/assets"
import { TokenInfoRow } from "sections/wallet/addToken/modal/components/TokenInfo/TokenInfoRow"
import { TokenInfoValueDiff } from "sections/wallet/addToken/modal/components/TokenInfo/TokenInfoValueDiff"
import {
  useAssetHubRevokeAdminRights,
  useRefetchAssetHub,
} from "api/external/assethub"
import { safeConvertAddressSS58 } from "utils/formatting"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Button } from "components/Button/Button"
import { useUserExternalTokenStore } from "sections/wallet/addToken/AddToken.utils"
import { useRefetchProviderData } from "api/provider"

export const TokenInfo = ({
  externalAsset,
  chainStoredAsset,
  rugCheckData,
}: {
  externalAsset: TExternalAsset
  chainStoredAsset?: TExternal
  rugCheckData?: TRugCheckData
}) => {
  const { getExternalByExternalId, shareTokens } = useAssets()
  const { account } = useAccount()
  const { t } = useTranslation()
  const { setIsWhiteListed } = useUserExternalTokenStore()
  const refetchProvider = useRefetchProviderData()
  const parachains = useParachainAmount(externalAsset.id)
  const refetchAssetHub = useRefetchAssetHub()

  const { totalSupplyInternal, totalSupplyExternal, externalToken } =
    rugCheckData ?? {}
  const isChainStored = !!chainStoredAsset

  const isAdmin =
    externalToken?.owner && account
      ? safeConvertAddressSS58(externalToken.owner, 0) ===
        safeConvertAddressSS58(account.address, 0)
      : false

  const { mutate: revokeAdminRights, isSuccess: isRevoking } =
    useAssetHubRevokeAdminRights({
      onSuccess: () => {
        if (chainStoredAsset) {
          setIsWhiteListed(chainStoredAsset.id, true)
          refetchProvider()
          refetchAssetHub()
        }
      },
    })

  const { isXYKPool, pools } = useMemo(() => {
    if (!isChainStored || !shareTokens.length)
      return { isXYKPool: false, pools: undefined }

    const chainAsset = getExternalByExternalId(externalAsset.id)

    if (chainAsset) {
      const filteredXykPools = shareTokens.filter((shareToken) =>
        shareToken.assets.some((asset) => asset.id === chainAsset.id),
      )

      return {
        chainAsset,
        isXYKPool: filteredXykPools.length,
        pools: filteredXykPools.map((pool) => pool.poolAddress),
      }
    }

    return { isXYKPool: false, pools: undefined }
  }, [externalAsset.id, getExternalByExternalId, isChainStored, shareTokens])

  const warningFlags = Object.fromEntries(
    rugCheckData?.warnings.map(({ type, diff }) => {
      const [from, to] = diff
      return [type, { from, to }]
    }) ?? [],
  )

  return (
    <div sx={{ flex: "column" }}>
      <Text fs={12} color="brightBlue300" sx={{ mb: 10 }}>
        {t("wallet.addToken.form.info.title")}
      </Text>

      {totalSupplyExternal && (
        <TokenInfoRow
          label={t("wallet.addToken.form.supply")}
          severity="high"
          value={
            <Text
              fs={12}
              fw={500}
              font="GeistMedium"
              color={warningFlags.supply ? "alarmRed400" : undefined}
            >
              {t("value", {
                value: totalSupplyExternal,
                fixedPointScale: externalAsset.decimals,
                decimalPlaces: 0,
              })}
            </Text>
          }
          warning={
            warningFlags.supply
              ? t("wallet.addToken.rugCheck.supply", {
                  name: rugCheckData?.externalToken.name,
                })
              : ""
          }
        />
      )}

      {totalSupplyInternal && (
        <>
          <Separator opacity={0.3} color="darkBlue400" />
          <TokenInfoRow
            label={t("wallet.addToken.form.hydrationSupply")}
            value={t("value", {
              value: totalSupplyInternal,
              fixedPointScale: externalAsset.decimals,
              decimalPlaces: 0,
            })}
          />
        </>
      )}
      {warningFlags.name && (
        <>
          <Separator opacity={0.3} color="darkBlue400" />
          <TokenInfoRow
            label={t("wallet.addToken.form.name")}
            value={
              <TokenInfoValueDiff
                before={warningFlags.name.from}
                after={warningFlags.name.to}
              />
            }
            warning={
              warningFlags.name ? t("wallet.addToken.rugCheck.name") : ""
            }
          />
        </>
      )}
      <Separator opacity={0.3} color="darkBlue400" />
      <TokenInfoRow
        label={t("wallet.addToken.form.symbol")}
        value={
          warningFlags.symbol ? (
            <TokenInfoValueDiff
              before={warningFlags.symbol.from}
              after={warningFlags.symbol.to}
            />
          ) : (
            externalAsset.symbol
          )
        }
        warning={
          warningFlags.symbol ? t("wallet.addToken.rugCheck.symbol") : ""
        }
      />
      <Separator opacity={0.3} color="darkBlue400" />
      <TokenInfoRow
        label={t("wallet.addToken.form.decimals")}
        value={
          warningFlags.decimals ? (
            <TokenInfoValueDiff
              before={warningFlags.decimals.from}
              after={warningFlags.decimals.to}
            />
          ) : (
            externalAsset.decimals.toString()
          )
        }
        warning={
          warningFlags.decimals ? t("wallet.addToken.rugCheck.decimals") : ""
        }
      />
      <Separator opacity={0.3} color="darkBlue400" />
      <TokenInfoRow
        label={t("wallet.addToken.form.assetId")}
        value={externalAsset.id}
      />
      <Separator opacity={0.3} color="darkBlue400" />
      <TokenInfoRow
        label={t("wallet.addToken.form.info.registered")}
        value={
          isChainStored ? (
            <Text fs={12} color="green600">
              {t("yes")}
            </Text>
          ) : (
            <Text fs={12} color="red500">
              {t("no")}
            </Text>
          )
        }
      />
      <Separator opacity={0.3} color="darkBlue400" />
      {externalAsset.origin === assethub.parachainId && (
        <TokenInfoRow
          tooltip={t("wallet.addToken.form.info.masterAccount.tooltip")}
          label={t("wallet.addToken.form.info.masterAccount")}
          value={
            <div sx={{ flex: "row", gap: 4, align: "center" }}>
              {externalAsset.isWhiteListed ? (
                <Text fs={12} color="green600">
                  {t("yes")}
                </Text>
              ) : (
                <>
                  <Text fs={12} lh={14} color="red500">
                    {t("no")}
                  </Text>
                  <Icon
                    size={14}
                    sx={{ color: "red500" }}
                    icon={<WarningIcon />}
                  />
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="warning"
                      size="micro"
                      disabled={isRevoking}
                      sx={{
                        ml: 6,
                        mt: -2,
                        py: 0,
                        px: 4,
                        fontSize: 9,
                      }}
                      onClick={() => revokeAdminRights(externalAsset.id)}
                    >
                      {t("memepad.summary.adminRights.burn")}
                    </Button>
                  )}
                </>
              )}
            </div>
          }
        />
      )}
      <Separator opacity={0.3} color="darkBlue400" />
      <TokenInfoRow
        label={t("wallet.addToken.form.info.availability")}
        value={BN(parachains.amount).plus(1).toString()}
      />
      {isChainStored && (
        <>
          <Separator opacity={0.3} color="darkBlue400" />
          <TokenInfoRow
            label={t("wallet.addToken.form.info.isolatedPool")}
            value={
              isXYKPool ? (
                <Text fs={12} color="green600">
                  {t("yes")}
                </Text>
              ) : (
                <Text fs={12} color="red500">
                  {t("no")}
                </Text>
              )
            }
          />
          <Separator opacity={0.3} color="darkBlue400" />
          {pools?.length ? (
            <>
              <TokenInfoRow
                label={t("wallet.addToken.form.info.volume")}
                value={<XYKVolume pools={pools} />}
              />
            </>
          ) : (
            <TokenInfoRow
              label={t("wallet.addToken.form.info.volume")}
              value={"-"}
            />
          )}
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
      ) : total?.isNaN() || !total ? (
        "N/A"
      ) : (
        <DisplayValue value={total.div(2)} />
      )}
    </Text>
  )
}
