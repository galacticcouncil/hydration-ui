import {
  Box,
  CardTable,
  DataTable,
  Paper,
  Separator,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import {
  type MultiplyPairRow,
  useMultiplyPairColumns,
} from "@/modules/strategies/multiply/components/MultiplyPairs.columns"

type MultiplyDetailsCardProps = {
  pairs: MultiplyPairRow[]
}

export const MultiplyDetailsCard: React.FC<MultiplyDetailsCardProps> = ({
  pairs,
}) => {
  const { t } = useTranslation("strategies")
  const { gte } = useBreakpoints()
  const columns = useMultiplyPairColumns()
  const isLoading =
    pairs.every((p) => p.data === null) && pairs.some((p) => p.isLoading)

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("multiply.details.title")}
        </Text>
      </Box>
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
