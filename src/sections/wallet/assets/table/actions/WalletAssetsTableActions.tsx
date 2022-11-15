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

type Props = {
  toggleExpanded: () => void
  symbol: string
  onTransferClick: () => void
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
          onClick={() => console.log("buy", props.symbol)}
        >
          {t("wallet.assets.table.actions.buy")}
        </TableAction>
        <TableAction
          icon={<SellIcon />}
          onClick={() => console.log("sell", props.symbol)}
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
            {
              key: "remove",
              icon: <DollarIcon />,
              label: t("wallet.assets.table.actions.payment.asset"),
            },
          ]}
          onSelect={(item) => console.log("item", item)}
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
