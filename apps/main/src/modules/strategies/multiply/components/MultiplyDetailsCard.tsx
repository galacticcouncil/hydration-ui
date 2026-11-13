import {
  Box,
  Button,
  CardTable,
  DataTable,
  Flex,
  Icon,
  Paper,
  Separator,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  type MultiplyPairRow,
  useMultiplyPairColumns,
} from "@/modules/strategies/multiply/components/MultiplyPairs.columns"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"

type MultiplyDetailsCardProps = {
  pairs: MultiplyPairRow[]
  onCustomLoop: () => void
  onDeposit: (pair: MultiplyPair) => void
  onDetails: (pair: MultiplyPair) => void
}

export const MultiplyDetailsCard: React.FC<MultiplyDetailsCardProps> = ({
  pairs,
  onCustomLoop,
  onDeposit,
  onDetails,
}) => {
  const { t } = useTranslation("strategies")
  const { gte } = useBreakpoints()
  const columns = useMultiplyPairColumns(onDeposit, onDetails)
  const isLoading =
    pairs.every((p) => p.data === null) && pairs.some((p) => p.isLoading)

  return (
    <Paper>
      <Flex p="l" align="center" justify="space-between" gap="m">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("multiply.details.title")}
        </Text>
        <Button size="small" variant="accent" outline onClick={onCustomLoop}>
          <Icon size="s" component={Plus} />
          {t("multiply.custom.cta")}
        </Button>
      </Flex>
      <Separator />
      {gte("xl") ? (
        <TableContainer borderRadius="xl">
          <DataTable
            data={pairs}
            columns={columns}
            isLoading={isLoading}
            size="small"
          />
        </TableContainer>
      ) : (
        <Box p="m" asChild>
          <CardTable
            data={pairs}
            columns={columns}
            isLoading={isLoading}
            statsColumns={2}
          />
        </Box>
      )}
    </Paper>
  )
}
