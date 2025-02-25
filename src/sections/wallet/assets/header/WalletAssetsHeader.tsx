import { Trans, useTranslation } from "react-i18next"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import BN from "bignumber.js"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { separateBalance } from "utils/balance"
import { theme } from "theme"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { LINKS } from "utils/navigation"
import { useNavigate } from "@tanstack/react-location"
import UploadIcon from "assets/icons/UploadIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import { WalletTransferModal } from "sections/wallet/transfer/WalletTransferModal"
import { useState } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { Text } from "components/Typography/Text/Text"
import { DepositButton } from "sections/deposit/DepositButton"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()
  const {
    isLoading,
    balanceTotal,
    assetsTotal,
    farmsTotal,
    lpTotal,
    borrowsTotal,
  } = useWalletAssetsTotals()

  const [transferModalOpen, setTransferModalOpen] = useState(false)

  const navigate = useNavigate()

  return (
    <div
      sx={{
        flex: ["column", "column", "row"],
        align: "start",
        gap: [10, 24, 100],
        mb: [24, 40],
      }}
    >
      <DataValueList separated sx={{ flexGrow: 1, width: "100%" }}>
        <DataValue
          labelColor="brightBlue300"
          label={t("wallet.assets.header.networth")}
          size="large"
          isLoading={isLoading}
          disableSkeletonAnimation={disconnected}
        >
          <WalletAssetsHeaderDisplay value={balanceTotal} />
        </DataValue>
        <DataValue
          labelColor="brightBlue300"
          label={t("wallet.assets.header.assetsBalance")}
          size="large"
          isLoading={isLoading}
          disableSkeletonAnimation={disconnected}
        >
          <WalletAssetsHeaderDisplay value={assetsTotal} />
          {BN(borrowsTotal).gt(0) && (
            <Text fs={12} color="alpha0">
              {t("wallet.assets.header.assetsBorrowed", {
                value: borrowsTotal,
              })}
            </Text>
          )}
        </DataValue>
        <DataValue
          labelColor="brightBlue300"
          label={t("wallet.assets.header.liquidityBalance")}
          size="large"
          isLoading={isLoading}
          disableSkeletonAnimation={disconnected}
        >
          <WalletAssetsHeaderDisplay value={lpTotal} />
          {BN(farmsTotal).gt(0) && (
            <Text fs={12} color="alpha0">
              {t("wallet.assets.header.farmsBalance", {
                value: farmsTotal,
              })}
            </Text>
          )}
        </DataValue>
      </DataValueList>
      {!disconnected && (
        <div
          sx={{
            width: ["100%", "100%", "auto"],
            flex: "row",
            align: "center",
            justify: "flex-end",
            gap: 12,
          }}
        >
          <DepositButton sx={{ width: ["100%", "auto"] }} />
          <Button
            size="compact"
            variant="mutedSecondary"
            onClick={() => navigate({ to: LINKS.withdraw })}
            sx={{ width: ["100%", "auto"] }}
          >
            <Icon size={14} sx={{ ml: -4 }} icon={<UploadIcon />} />
            {t("withdraw")}
          </Button>
          <Button
            size="compact"
            variant="mutedSecondary"
            onClick={() => setTransferModalOpen(true)}
            sx={{ width: ["100%", "auto"] }}
          >
            <Icon size={14} sx={{ ml: -4 }} icon={<TransferIcon />} />
            {t("transfer")}
          </Button>
          <WalletTransferModal
            open={transferModalOpen}
            initialAsset={NATIVE_ASSET_ID}
            onClose={() => setTransferModalOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

const WalletAssetsHeaderDisplay = ({ value }: { value: string }) => {
  const { t } = useTranslation()
  return (
    <Text tAlign={["right", "left"]} sx={{ fontSize: "inherit" }}>
      <DisplayValue
        value={
          <Trans
            t={t}
            i18nKey="wallet.assets.header.value"
            tOptions={{ ...separateBalance(BN(value), { type: "dollar" }) }}
          >
            <span css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }} />
          </Trans>
        }
      />
    </Text>
  )
}
