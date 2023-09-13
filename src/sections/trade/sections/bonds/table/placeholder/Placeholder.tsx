import { css } from "@emotion/react"
import { ReactComponent as TablePlaceholderIcon } from "assets/icons/TablePlaceholderIcon.svg"
import { TableSkeleton } from "components/Table/TableSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { theme } from "theme"
import { useBondsSkeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton.utils"

type Props = {
  title: string
  showTransactions?: boolean
  showTransfer?: boolean
}

export const Placeholder = ({
  title,
  showTransactions,
  showTransfer,
}: Props) => {
  const { t } = useTranslation()
  const table = useBondsSkeleton({
    showTransactions,
    showTransfer,
    enableAnimation: false,
    onTransfer: () => null,
  })

  return (
    <TableSkeleton
      table={table}
      title={title}
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
