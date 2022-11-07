import { TableSkeleton } from "components/Table/TableSkeleton"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as TablePlaceholderIcon } from "assets/icons/TablePlaceholderIcon.svg"
import { theme } from "theme"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { css } from "@emotion/react"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { useAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton.utils"

export const WalletAssetsTablePlaceholder = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton(false)

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.table.title")}
      css={assetsTableStyles}
      placeholder={
        <div
          css={{ color: theme.colors.neutralGray500 }}
          sx={{ flex: "column", align: "center", p: 16 }}
        >
          <TablePlaceholderIcon sx={{ width: [52, 64], height: [52, 64] }} />
          <Text
            fs={[14, 16]}
            lh={[18, 22]}
            sx={{ mt: 10, mb: 30, textAlign: "center" }}
            color="neutralGray500"
          >
            {t("wallet.assets.table.placeholder")}
          </Text>
          <WalletConnectButton
            css={css`
              @media (${theme.viewport.lt.sm}) {
                padding: 12px 15px;
                font-size: 12px;
              }
            `}
          />
        </div>
      }
    />
  )
}
