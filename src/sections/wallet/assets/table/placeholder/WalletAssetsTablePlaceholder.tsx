import { useAssetsTableSkeleton } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as TablePlaceholderIcon } from "assets/icons/TablePlaceholderIcon.svg"
import { theme } from "theme"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"

export const WalletAssetsTablePlaceholder = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton(false)

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.table.title")}
      placeholder={
        <div
          css={{ color: theme.colors.neutralGray500 }}
          sx={{ flex: "column", align: "center" }}
        >
          <TablePlaceholderIcon />
          <Text fs={16} lh={22} sx={{ mt: 10, mb: 30 }} color="neutralGray500">
            {t("wallet.assets.table.placeholder")}
          </Text>
          <WalletConnectButton />
        </div>
      }
    />
  )
}
