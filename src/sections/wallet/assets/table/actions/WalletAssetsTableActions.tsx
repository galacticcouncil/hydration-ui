import TradeIcon from "assets/icons/Fill.svg?react"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import MoreIcon from "assets/icons/MoreDotsIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import MetamaskLogo from "assets/icons/MetaMask.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import WarningIcon from "assets/icons/WarningIcon.svg?react"
import DollarIcon from "assets/icons/DollarIcon.svg?react"
import InfoIcon from "assets/icons/InfoIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown, TDropdownItem } from "components/Dropdown/Dropdown"
import { TableAction } from "components/Table/Table"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { isNotNil } from "utils/helpers"
import { useSetAsFeePayment } from "api/payments"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isMetaMask, watchAsset } from "utils/metamask"
import { NATIVE_EVM_ASSET_SYMBOL, isEvmAccount } from "utils/evm"
import { useVisibleElements } from "hooks/useVisibleElements"
import { LINKS } from "utils/navigation"
import { useNavigate } from "@tanstack/react-location"
import { AssetsTableData } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { ExternalAssetImportModal } from "sections/trade/modal/ExternalAssetImportModal"
import { useState } from "react"
import { useExternalTokenMeta } from "sections/wallet/addToken/AddToken.utils"
import { ExternalAssetUpdateModal } from "sections/trade/modal/ExternalAssetUpdateModal"
import { Spinner } from "components/Spinner/Spinner"

type Props = {
  toggleExpanded: () => void
  onTransferClick: () => void
  isExpanded: boolean
  asset: AssetsTableData
}

export const WalletAssetsTableActions = (props: Props) => {
  const { t } = useTranslation()
  const feePayment = useSetAsFeePayment()
  const { account } = useAccount()
  const { featureFlags } = useRpcProvider()
  const [assetCheckModalOpen, setAssetCheckModalOpen] = useState(false)

  const navigate = useNavigate()

  const { hiddenElementsKeys, observe } = useVisibleElements<HTMLDivElement>()

  const {
    id,
    symbol,
    meta,
    couldBeSetAsPaymentFee,
    tradability: { inTradeRouter, canBuy },
  } = props.asset

  const rugCheckData = props.asset.rugCheckData
  const hasRugCheckData = !!rugCheckData
  const hasRugCheckWarnings = !!rugCheckData?.warnings?.length

  const couldWatchMetaMaskAsset =
    isMetaMask(window?.ethereum) &&
    isEvmAccount(account?.address) &&
    symbol !== NATIVE_EVM_ASSET_SYMBOL

  const onFeePaymentSelect = () => feePayment.mutate(id)

  const buttons: TDropdownItem[] = [
    {
      key: "trade",
      icon: <TradeIcon />,
      label: t("wallet.assets.table.actions.trade"),
      onSelect: inTradeRouter
        ? () =>
            navigate({
              to: LINKS.swap,
              search: canBuy ? { assetOut: id } : { assetIn: id },
            })
        : undefined,
      disabled: !inTradeRouter || account?.isExternalWalletConnected,
    },
    {
      key: "transfer",
      icon: <TransferIcon />,
      label: t("wallet.assets.table.actions.transfer"),
      onSelect: () => props.onTransferClick(),
      disabled: account?.isExternalWalletConnected,
    },
  ]

  const allowSetAsPaymentFee = isEvmAccount(account?.address)
    ? featureFlags.dispatchPermit && couldBeSetAsPaymentFee
    : couldBeSetAsPaymentFee

  const actionItems = [
    allowSetAsPaymentFee
      ? {
          key: "setAsFeePayment",
          icon: <DollarIcon />,
          label: t("wallet.assets.table.actions.payment.asset"),
          onSelect: () => onFeePaymentSelect(),
        }
      : null,
    couldWatchMetaMaskAsset
      ? {
          key: "watch",
          icon: <MetamaskLogo width={18} height={18} />,
          label: t("wallet.assets.table.actions.watch"),
          onSelect: () =>
            watchAsset(window?.ethereum, id, {
              symbol: symbol,
              decimals: meta.decimals,
            }),
        }
      : null,
    hasRugCheckData
      ? {
          key: "checkData",
          icon: <InfoIcon width={18} height={18} />,
          label: t("wallet.assets.table.actions.checkExternal"),
          onSelect: () => setAssetCheckModalOpen(true),
        }
      : null,
  ].filter(isNotNil)

  return (
    <div
      sx={{
        flex: "row",
        gap: 10,
        justify: "end",
      }}
    >
      <>
        {hasRugCheckWarnings ? (
          <UpdateTokenDataAction id={props.asset.id} />
        ) : props.asset.isExternalInvalid ? (
          <AddTokenAction id={props.asset.id} />
        ) : (
          <div
            sx={{
              flex: "row",
              gap: 10,
              flexWrap: "wrap",
              height: 38,
              justify: "end",
            }}
            css={{ overflow: "hidden" }}
            ref={observe}
          >
            {buttons.map((button) => (
              <TableAction
                key={button.key}
                icon={button.icon}
                onClick={button.onSelect}
                disabled={button.disabled}
                data-intersect={button.key}
              >
                {button.label}
              </TableAction>
            ))}
          </div>
        )}

        <Dropdown
          align="end"
          disabled={feePayment.isLoading}
          items={
            account?.isExternalWalletConnected
              ? []
              : [
                  ...buttons.filter(
                    (button) =>
                      hiddenElementsKeys.includes(button.key) &&
                      !button.disabled,
                  ),
                  ...actionItems,
                ]
          }
          onSelect={(item) => item.onSelect?.()}
        >
          {!feePayment.isLoading ? <MoreIcon /> : <Spinner size={15} />}
        </Dropdown>
      </>

      <ButtonTransparent
        onClick={props.toggleExpanded}
        css={{
          color: theme.colors.iconGray,
          opacity: props.isExpanded ? "1" : "0.5",
          transform: props.isExpanded ? "rotate(180deg)" : undefined,
        }}
      >
        <ChevronDownIcon />
      </ButtonTransparent>
      {assetCheckModalOpen && (
        <ExternalAssetUpdateModal
          open={assetCheckModalOpen}
          assetId={id}
          onClose={() => {
            setAssetCheckModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export const UpdateTokenDataAction = ({
  id,
  className,
}: {
  id: string
  className?: string
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <TableAction
        variant="warning"
        icon={<WarningIcon />}
        onClick={() => {
          setModalOpen(true)
        }}
        disabled={account?.isExternalWalletConnected}
        className={className}
      >
        {t("wallet.assets.table.actions.update")}
      </TableAction>
      {modalOpen && (
        <ExternalAssetUpdateModal
          open={modalOpen}
          assetId={id}
          onClose={() => {
            setModalOpen(false)
          }}
        />
      )}
    </>
  )
}

export const AddTokenAction = ({
  id,
  className,
  onClick,
  onClose,
}: {
  id: string
  className?: string
  onClick?: () => void
  onClose?: () => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [addTokenModalOpen, setAddTokenModalOpen] = useState(false)
  const getExternalMeta = useExternalTokenMeta()

  const assetMeta = getExternalMeta(id)

  return (
    <>
      <TableAction
        icon={<PlusIcon />}
        onClick={() => {
          setAddTokenModalOpen(true)
          onClick?.()
        }}
        disabled={account?.isExternalWalletConnected || !assetMeta}
        className={className}
      >
        {t("wallet.assets.table.actions.add")}
      </TableAction>
      {assetMeta && addTokenModalOpen && (
        <ExternalAssetImportModal
          assetIds={[assetMeta.id]}
          onClose={() => {
            setAddTokenModalOpen(false)
            onClose?.()
          }}
        />
      )}
    </>
  )
}
