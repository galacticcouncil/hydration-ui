import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  DataTable,
  Flex,
  Input,
  Paper,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useWalletAssetsColumns } from "@/modules/wallet/WalletAssetsPage.utils"
import { useAssets } from "@/providers/assetsProvider"

export const WalletAssetsPage = () => {
  const { t } = useTranslation()
  const columns = useWalletAssetsColumns()
  const [search, setSearch] = useState("")
  const { tokens, stableswap, bonds, erc20, isExternal } = useAssets()

  const filteredTokens = [...tokens, ...stableswap, ...bonds, ...erc20].filter(
    (asset) => asset.isTradable && !isExternal(asset),
  )

  return (
    <Flex direction="column" gap={20}>
      <Box>
        <Text>
          {t("number", {
            value: 1234.56789,
          })}
        </Text>

        <Text>
          {t("number", {
            value: 0.00001234567,
          })}
        </Text>

        <Text>
          {t("number", {
            value: 123456789,
          })}
        </Text>

        <Text>
          {t("number.compact", {
            value: 123456789,
          })}
        </Text>
      </Box>
      <Box>
        <Text>
          {t("currency", {
            value: 1234.56789,
          })}
        </Text>
        <Text>
          {t("currency", {
            value: 0.00001234567,
          })}
        </Text>
        <Text>
          {t("currency", {
            value: 123456789,
            currency: "CZK",
          })}
        </Text>
        <Text>
          {t("currency", {
            value: 123456789,
            currency: "EUR",
          })}
        </Text>
        <Text>
          {t("currency", {
            value: 123456789,
            symbol: "HDX",
          })}
        </Text>
        <Text>
          {t("currency.compact", {
            value: 123456789,
          })}
        </Text>
      </Box>
      <Box>
        <Text>
          {t("date", {
            value: new Date(),
            format: "d/MM/yyyy HH:mm:ss",
          })}
        </Text>
        <Text>
          {t("date.relative", {
            value: Date.now() + 25000,
          })}
        </Text>
        <Text>
          {t("date.relative", {
            value: Date.now() - 25000,
          })}
        </Text>
        <Text>
          {t("date.relative", {
            value: Date.now() - 1000 * 60 * 60 * 12,
          })}
        </Text>
        <Text>
          {t("date.relative", {
            value: Date.now() + 1000 * 60 * 60 * 12,
          })}
        </Text>
        <Text>
          {t("date.relative", {
            value: Date.now() - 1000 * 60 * 60 * 24 * 365 * 6,
          })}
        </Text>
        <Text>
          {t("date.relative", {
            value: Date.now() + 1000 * 60 * 60 * 24 * 365 * 6,
          })}
        </Text>
      </Box>
      <Input
        customSize="large"
        placeholder="Search..."
        iconStart={Search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <TableContainer as={Paper}>
        <DataTable
          paginated
          pageSize={10}
          globalFilter={search}
          data={filteredTokens}
          columns={columns}
        />
      </TableContainer>
    </Flex>
  )
}
