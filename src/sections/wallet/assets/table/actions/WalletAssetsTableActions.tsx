import TradeIcon from "assets/icons/Fill.svg?react"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import MoreIcon from "assets/icons/MoreDotsIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import MetamaskLogo from "assets/icons/MetaMask.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import DollarIcon from "assets/icons/DollarIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown, TDropdownItem } from "components/Dropdown/Dropdown"
import { TableAction } from "components/Table/Table"
import { Trans, useTranslation } from "react-i18next"
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
import {
  useExternalTokenMeta,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { useRefetchProviderData } from "api/provider"
import { useToast } from "state/toasts"
import { useQueryClient } from "@tanstack/react-query"

type Props = {
  toggleExpanded: () => void
  onTransferClick: () => void
  isExpanded: boolean
  asset: AssetsTableData
}

export const WalletAssetsTableActions = (props: Props) => {
  const { t } = useTranslation()
  const setFeeAsPayment = useSetAsFeePayment()
  const { account } = useAccount()
  const { featureFlags } = useRpcProvider()

  const navigate = useNavigate()

  const { hiddenElementsKeys, observe } = useVisibleElements<HTMLDivElement>()

  const {
    id,
    symbol,
    decimals,
    couldBeSetAsPaymentFee,
    tradability: { inTradeRouter, canBuy },
  } = props.asset

  const couldWatchMetaMaskAsset =
    isMetaMask(window?.ethereum) &&
    isEvmAccount(account?.address) &&
    symbol !== NATIVE_EVM_ASSET_SYMBOL

  const onFeePaymentSelect = () =>
    setFeeAsPayment(id, {
      onLoading: (
        <Trans
          t={t}
          i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
          tOptions={{
            asset: symbol,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      ),
      onSuccess: (
        <Trans
          t={t}
          i18nKey="wallet.assets.table.actions.payment.toast.onSuccess"
          tOptions={{
            asset: symbol,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      ),
      onError: (
        <Trans
          t={t}
          i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
          tOptions={{
            asset: symbol,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      ),
    })

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
    {
      key: "deposit",
      icon: <PlusIcon />,
      label: t("wallet.assets.table.actions.deposit"),
      onSelect: () => navigate({ to: LINKS.cross_chain }),
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
              decimals: decimals,
            }),
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
        {props.asset.isExternal && !props.asset.name ? (
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
          items={
            account?.isExternalWalletConnected
              ? []
              : [
                  ...buttons.filter((button) =>
                    hiddenElementsKeys.includes(button.key),
                  ),
                  ...actionItems,
                ]
          }
          onSelect={(item) => item.onSelect?.()}
        >
          <MoreIcon />
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
    </div>
  )
}

export const AddTokenAction = ({
  id,
  className,
  onClick,
}: {
  id: string
  className?: string
  onClick?: () => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { addToken } = useUserExternalTokenStore()
  const queryClient = useQueryClient()

  const externalAsset = useExternalTokenMeta(id)

  const refetchProvider = useRefetchProviderData()
  const { add } = useToast()

  const addExternalAsset = externalAsset
    ? () => {
        addToken({
          id: externalAsset.externalId,
          name: externalAsset.name,
          symbol: externalAsset.symbol,
          decimals: externalAsset.decimals,
          origin: externalAsset.origin,
          internalId: id,
        })
        refetchProvider()
        setTimeout(() => {
          queryClient.removeQueries({
            predicate: (query) => {
              return (
                query.queryKey.includes("spotPrice") &&
                query.queryKey.includes(id.toString())
              )
            },
          })
        }, 1000)

        add("success", {
          title: (
            <Trans
              t={t}
              i18nKey="wallet.addToken.toast.add.onSuccess"
              tOptions={{
                name: externalAsset.name,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        })
      }
    : undefined

  return (
    <TableAction
      icon={<PlusIcon />}
      onClick={() => {
        addExternalAsset?.()
        onClick?.()
      }}
      disabled={account?.isExternalWalletConnected || !externalAsset}
      className={className}
    >
      {t("wallet.assets.table.actions.add")}
    </TableAction>
  )
}
