import { css } from "@emotion/react"
import { ReactComponent as TablePlaceholderIcon } from "assets/icons/TablePlaceholderIcon.svg"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton.utils"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { theme } from "theme"

export const WalletAssetsTablePlaceholder = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton(false)

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.assets.table.title")}
      css={assetsTableStyles}
      hideHeader={true}
      placeholder={
        <div
          css={{
            color: theme.colors.neutralGray500,
          }}
          sx={{ flex: "column", align: "center", width: 280 }}
        >
          <TablePlaceholderIcon sx={{ width: [52, 64], height: [52, 64] }} />
          <Text
            fs={[14, 16]}
            lh={[18, 22]}
            sx={{ mt: 10, mb: 26, textAlign: "center" }}
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
