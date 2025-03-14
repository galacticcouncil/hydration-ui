import { Add } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DataTable,
  Flex,
  Paper,
  SectionHeader,
  TableContainer,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useWalletAssetsColumns } from "@/modules/wallet/WalletAssets.columns"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly search: string
}

export const WalletAssets: FC<Props> = ({ search }) => {
  const { t } = useTranslation("wallet")
  const { tokens, stableswap, bonds, erc20, isExternal } = useAssets()
  const columns = useWalletAssetsColumns()

  const filteredTokens = useMemo(
    () =>
      [...tokens, ...stableswap, ...bonds, ...erc20].filter(
        (asset) => asset.isTradable && !isExternal(asset),
      ),
    [tokens, stableswap, bonds, erc20, isExternal],
  )

  const [showAllAssets, setShowAllAssets] = useState(false)

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader>{t("assets.table.header.title")}</SectionHeader>
        <Flex gap={16} align="center">
          <Button size="medium" iconStart={Add}>
            {t("assets.table.header.cta")}
          </Button>
          <ToggleRoot>
            <ToggleLabel>{t("assets.table.header.toggle")}</ToggleLabel>
            <Toggle
              checked={showAllAssets}
              onCheckedChange={() => setShowAllAssets(!showAllAssets)}
            />
          </ToggleRoot>
        </Flex>
      </Flex>
      <TableContainer as={Paper}>
        <DataTable
          paginated
          pageSize={10}
          globalFilter={search}
          data={filteredTokens}
          columns={columns}
          expandable
          renderSubComponent={({ row }) => {
            return <div>{row.original.name}</div>
          }}
        />
      </TableContainer>
    </div>
  )
}
