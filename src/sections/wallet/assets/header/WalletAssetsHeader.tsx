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
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import { WalletTransferModal } from "sections/wallet/transfer/WalletTransferModal"
import { useState } from "react"
import { NATIVE_ASSET_ID } from "utils/api"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()
  const { isLoading, balanceTotal, assetsTotal, farmsTotal, lpTotal } =
    useWalletAssetsTotals()

  const [transferModalOpen, setTransferModalOpen] = useState(false)

  const navigate = useNavigate()

  return (
    <div sx={{ flex: ["column", "row"], gap: [10, 100], mb: [24, 40] }}>
      <DataValueList separated sx={{ flexGrow: 1 }}>
        <DataValue
          labelColor="brightBlue300"
          label={t("wallet.assets.header.balance")}
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
        </DataValue>
        <DataValue
          labelColor="brightBlue300"
          label={t("wallet.assets.header.liquidityBalance")}
          size="large"
          isLoading={isLoading}
          disableSkeletonAnimation={disconnected}
        >
          <WalletAssetsHeaderDisplay value={lpTotal} />
        </DataValue>
        <DataValue
          labelColor="brightBlue300"
          label={t("wallet.assets.header.farmsBalance")}
          size="large"
          isLoading={isLoading}
          disableSkeletonAnimation={disconnected}
        >
          <WalletAssetsHeaderDisplay value={farmsTotal} />
        </DataValue>
      </DataValueList>
      {!disconnected && (
        <div sx={{ flex: "row", gap: 12 }}>
          <Button
            size="compact"
            variant="mutedSecondary"
            onClick={() => navigate({ to: LINKS.deposit })}
            fullWidth
          >
            <Icon size={22} sx={{ ml: -4 }} icon={<DownloadIcon />} />
            {t("deposit")}
          </Button>
          <Button
            size="compact"
            variant="mutedSecondary"
            onClick={() => setTransferModalOpen(true)}
            fullWidth
          >
            <Icon
              size={22}
              sx={{ ml: -4 }}
              icon={<TransferIcon css={{ transform: "scale(0.8)" }} />}
            />
            {t("transfer")}
          </Button>
        </div>
      )}
      <WalletTransferModal
        open={transferModalOpen}
        initialAsset={NATIVE_ASSET_ID}
        onClose={() => setTransferModalOpen(false)}
      />
    </div>
  )
}

const WalletAssetsHeaderDisplay = ({ value }: { value: string }) => {
  const { t } = useTranslation()
  return (
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
  )
}
