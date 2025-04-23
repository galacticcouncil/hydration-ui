import { css } from "@emotion/react"
import TablePlaceholderIcon from "assets/icons/TablePlaceholderIcon.svg?react"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton.utils"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { theme } from "theme"

export const WalletTransactionsPlaceholder = () => {
  const { t } = useTranslation()
  const table = useAssetsTableSkeleton(false)

  return (
    <TableSkeleton
      table={table}
      title={t("wallet.transactions.table.header.title")}
      css={assetsTableStyles}
      hideHeader={true}
      placeholder={
        <div
          sx={{
            flex: "column",
            align: "center",
            width: 280,
            color: "neutralGray500",
          }}
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
          <Web3ConnectModalButton
            css={css`
              @media ${theme.viewport.lt.sm} {
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
