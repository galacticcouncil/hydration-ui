import { Link } from "@tanstack/react-location"
import { useSetAsFeePayment } from "api/payments"
import TradeIcon from "assets/icons/Fill.svg?react"
import DollarIcon from "assets/icons/DollarIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { LINKS } from "utils/navigation"
import { SActionButtonsContainer } from "./WalletAssetsTable.styled"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { NATIVE_ASSET_ID } from "utils/api"
import {
  AssetsTableData,
  useLockedValues,
} from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import Skeleton from "react-loading-skeleton"

type Props = {
  row?: AssetsTableData
  onClose: () => void
  onTransferClick: (id: string) => void
}

export const WalletAssetsTableActionsMob = ({
  row,
  onClose,
  onTransferClick,
}: Props) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const setFeeAsPayment = useSetAsFeePayment()

  const lockedValues = useLockedValues(row?.id ?? "")

  if (!row) return null

  const canBuy = row.tradability.inTradeRouter && row.tradability.canBuy

  const isNativeAsset = row.id === NATIVE_ASSET_ID

  return (
    <Modal open={!!row} isDrawer onClose={onClose} title="">
      <div>
        <div sx={{ pb: 30 }}>
          <AssetTableName {...row} large />
        </div>
        <Separator
          css={{ background: `rgba(${theme.rgbColors.alpha0}, 0.06)` }}
        />
        <div sx={{ flex: "row", justify: "space-between", py: 30 }}>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("wallet.assets.table.header.total")}
            </Text>
            <Text fs={14} lh={14} color="white">
              {t("value", { value: row.total })}
            </Text>
            <Text fs={12} lh={17} color="whiteish500">
              <DisplayValue value={row.totalDisplay} />
            </Text>
          </div>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("wallet.assets.table.header.transferable")}
            </Text>
            <Text fs={14} lh={14} color="white">
              {t("value", { value: row.transferable })}
            </Text>
            <Text fs={12} lh={17} color="whiteish500">
              <DisplayValue value={row.transferableDisplay} />
            </Text>
          </div>
        </div>
        <SActionButtonsContainer>
          <div sx={{ flex: "row", flexWrap: "wrap", py: 20 }}>
            {isNativeAsset && (
              <div
                sx={{
                  flex: "column",
                  gap: 4,
                  pr: 10,
                  mb: 20,
                  flexBasis: "50%",
                }}
              >
                <Text fs={14} lh={16} color="whiteish500">
                  {t("wallet.assets.table.details.lockedStaking")}
                </Text>
                {lockedValues.isLoading ? (
                  <Skeleton height={14} width={40} />
                ) : (
                  <Text fs={14} lh={14} color="white">
                    {t("value", { value: lockedValues.data?.lockedStaking })}
                  </Text>
                )}
                {lockedValues.isLoading ? (
                  <Skeleton height={12} width={30} />
                ) : (
                  <Text fs={12} lh={17} color="whiteish500">
                    <DisplayValue
                      value={lockedValues.data?.lockedStakingDisplay}
                    />
                  </Text>
                )}
              </div>
            )}
            {isNativeAsset && (
              <div
                sx={{
                  flex: "column",
                  gap: 4,
                  pr: 10,
                  mb: 20,
                  flexBasis: "50%",
                }}
              >
                <Text fs={14} lh={16} color="whiteish500">
                  {t("wallet.assets.table.details.lockedDemocracy")}
                </Text>
                {lockedValues.isLoading ? (
                  <Skeleton height={14} width={40} />
                ) : (
                  <Text fs={14} lh={14} color="white">
                    {t("value", { value: lockedValues.data?.lockedDemocracy })}
                  </Text>
                )}
                {lockedValues.isLoading ? (
                  <Skeleton height={12} width={30} />
                ) : (
                  <Text fs={12} lh={17} color="whiteish500">
                    <DisplayValue
                      value={lockedValues.data?.lockedDemocracyDisplay}
                    />
                  </Text>
                )}
              </div>
            )}
            <div sx={{ flex: "column", gap: 4, pr: 10, flexBasis: "50%" }}>
              <Text fs={14} lh={16} color="whiteish500">
                {t("wallet.assets.table.details.reserved")}
              </Text>
              <Text fs={14} lh={14} color="white">
                {t("value", { value: row.reserved })}
              </Text>
              <Text fs={12} lh={17} color="whiteish500">
                <DisplayValue value={row.reservedDisplay} />
              </Text>
            </div>
            {isNativeAsset && (
              <div sx={{ flex: "column", gap: 4, pr: 10, flexBasis: "50%" }}>
                <Text fs={14} lh={16} color="whiteish500">
                  {t("wallet.assets.table.details.lockedVesting")}
                </Text>
                {lockedValues.isLoading ? (
                  <Skeleton height={14} width={40} />
                ) : (
                  <Text fs={14} lh={14} color="white">
                    {t("value", { value: lockedValues.data?.lockedVesting })}
                  </Text>
                )}
                {lockedValues.isLoading ? (
                  <Skeleton height={12} width={30} />
                ) : (
                  <Text fs={12} lh={17} color="whiteish500">
                    <DisplayValue
                      value={lockedValues.data?.lockedVestingDisplay}
                    />
                  </Text>
                )}
              </div>
            )}
          </div>
          <div sx={{ flex: "column", gap: 12 }}>
            <Link
              to={LINKS.trade}
              search={canBuy ? { assetOut: row.id } : { assetIn: row.id }}
              disabled={
                !row.tradability.inTradeRouter ||
                account?.isExternalWalletConnected
              }
              sx={{ width: "100%" }}
            >
              <Button
                sx={{ width: "100%" }}
                size="small"
                disabled={
                  !row.tradability.inTradeRouter ||
                  account?.isExternalWalletConnected
                }
              >
                <TradeIcon />
                {t("wallet.assets.table.actions.trade")}
              </Button>
            </Link>

            <Button
              sx={{ width: "100%" }}
              size="small"
              disabled={account?.isExternalWalletConnected}
              onClick={() => onTransferClick(row.id)}
            >
              <TransferIcon />
              {t("wallet.assets.table.actions.transfer")}
            </Button>
            <Link
              to={LINKS.cross_chain}
              disabled={account?.isExternalWalletConnected}
              sx={{ width: "100%" }}
            >
              <Button
                sx={{ width: "100%" }}
                size="small"
                disabled={account?.isExternalWalletConnected}
              >
                <PlusIcon />
                {t("wallet.assets.table.actions.deposit")}
              </Button>
            </Link>

            <Button
              sx={{ width: "100%" }}
              size="small"
              onClick={() => setFeeAsPayment(row.id)}
              disabled={
                !row.couldBeSetAsPaymentFee ||
                account?.isExternalWalletConnected
              }
            >
              <DollarIcon />
              {t("wallet.assets.table.actions.payment.asset")}
            </Button>
          </div>
        </SActionButtonsContainer>
      </div>
    </Modal>
  )
}
