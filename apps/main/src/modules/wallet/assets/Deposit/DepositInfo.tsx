import { Loader } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  TransactionListItem,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const DepositInfo: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Box
      px={getTokenPx("containers.paddings.primary")}
      pb={getTokenPx("containers.paddings.secondary")}
    >
      <Flex direction="column" align="center">
        <TransactionListItem
          sx={{ width: "100%" }}
          variant="info"
          label={t("deposit.howTo.minimalAmount")}
          value={t("common:currency", { value: 2, symbol: "DOT" })}
        />
        <Button
          variant="tertiary"
          iconStart={Loader}
          sx={{ textTransform: "uppercase" }}
        >
          {t("deposit.howTo.awaiting")}
        </Button>
      </Flex>
    </Box>
  )
}
