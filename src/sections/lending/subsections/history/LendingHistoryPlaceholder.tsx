import { css } from "@emotion/react"
import TablePlaceholderIcon from "assets/icons/TablePlaceholderIcon.svg?react"
import { TableContainer, TableTitle } from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { theme } from "theme"

export const LendingHistoryPlaceholder = () => {
  const { t } = useTranslation()

  return (
    <TableContainer sx={{ bg: "darkBlue700" }}>
      <TableTitle sx={{ px: [20, 30], py: [14, 24] }}>
        <Text
          fs={[15, 20]}
          lh={[20, 26]}
          font="GeistMono"
          fw={500}
          color="white"
        >
          {t("lending.history.table.title")}
        </Text>
      </TableTitle>
      <div
        sx={{
          flex: "column",
          justify: "center",
          align: "center",
          color: "neutralGray500",
          height: 320,
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
    </TableContainer>
  )
}
