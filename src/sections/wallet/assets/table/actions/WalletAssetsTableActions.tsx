import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
import { useTranslation } from "react-i18next"
import { TableAction } from "components/Table/Table"

import { Dropdown } from "components/Dropdown/Dropdown"
import { ReactComponent as DollarIcon } from "assets/icons/DollarIcon.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { ReactComponent as MoreDotsIcon } from "assets/icons/MoreDotsIcon.svg"

import { isNotNil } from "utils/helpers"

type Props = {
  toggleExpanded: () => void
  symbol: string
  onBuyClick: (() => void) | undefined
  onSellClick: (() => void) | undefined
  onTransferClick: () => void
  onSetFeeAsPaymentClick: () => void
  couldBeSetAsPaymentFee: boolean
}

export const WalletAssetsTableActions = (props: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <div sx={{ display: ["block", "none"] }}>
        <ButtonTransparent
          onClick={() => console.log("detail", props.symbol)}
          css={{ color: theme.colors.iconGray }}
        >
          <ChevronRightIcon />
        </ButtonTransparent>
      </div>
      <div
        sx={{
          flex: "row",
          gap: 10,
          display: ["none", "flex"],
          align: "center",
        }}
      >
        <TableAction
          icon={<BuyIcon />}
          onClick={props.onBuyClick}
          disabled={props.onBuyClick == null}
        >
          {t("wallet.assets.table.actions.buy")}
        </TableAction>
        <TableAction
          icon={<SellIcon />}
          onClick={props.onSellClick}
          disabled={props.onSellClick == null}
        >
          {t("wallet.assets.table.actions.sell")}
        </TableAction>
        <TableAction icon={<TransferIcon />} onClick={props.onTransferClick}>
          {t("wallet.assets.table.actions.transfer")}
        </TableAction>

        <Dropdown
          items={[
            {
              key: "add",
              icon: <PlusIcon />,
              label: t("wallet.assets.table.actions.add.liquidity"),
            },
            props.couldBeSetAsPaymentFee
              ? {
                  key: "setAsFeePayment",
                  icon: <DollarIcon />,
                  label: t("wallet.assets.table.actions.payment.asset"),
                }
              : null,
          ].filter(isNotNil)}
          onSelect={(item) => {
            if (item === "setAsFeePayment") {
              props.onSetFeeAsPaymentClick()
            }
          }}
        >
          <MoreDotsIcon />
        </Dropdown>

        <ButtonTransparent
          onClick={props.toggleExpanded}
          css={{ color: theme.colors.iconGray }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
