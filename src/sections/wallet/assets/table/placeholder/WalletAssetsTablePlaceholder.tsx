import { css } from "@emotion/react"
import TablePlaceholderIcon from "assets/icons/TablePlaceholderIcon.svg?react"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton.utils"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { theme } from "theme"

export const WalletAssetsTablePlaceholder = () => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const table = useAssetsTableSkeleton(false)

  return (
    <TableSkeleton
      table={table}
      title={
        isDesktop ? t("wallet.assets.table.title") : t("wallet.header.assets")
      }
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
          <WalletConnectButton
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
