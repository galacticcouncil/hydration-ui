import { Button, OptionCard, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { useDepositDiscovery } from "@/modules/onramp/deposit/hooks/useDepositDiscovery"
import { DepositSelection } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { toDecimal } from "@/utils/formatting"

type DepositSourceSelectProps = {
  selection: DepositSelection | null
  onSelect: (row: DepositBalanceRow, account: Account) => void
  disabled?: boolean
}

export const DepositSourceSelect: FC<DepositSourceSelectProps> = ({
  selection,
  onSelect,
  disabled,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const [expanded, setExpanded] = useState(false)
  const discovery = useDepositDiscovery()
  const group = discovery.groups.find(
    (group) => group.assetKey === selection?.assetKey,
  )
  const unsupported = discovery.unsupported.filter(
    (row) => row.balance.key === selection?.assetKey,
  )
  const selectedRow = group?.rows.find(
    (row) =>
      row.source.chain.key === selection?.chainKey &&
      row.source.accounts.some(
        (account) =>
          account.provider === selection?.account.provider &&
          account.address === selection?.account.address,
      ),
  )
  const walletName = selection && getWallet(selection.account.provider)?.title
  return (
    <Stack gap="s" justify="flex-start">
      <Text fs="p5" color={getToken("text.medium")}>
        {t("deposit.v3.amount.sendFrom")}
      </Text>
      {selection && (
        <>
          <Text fs="p4" fw={500}>
            {selectedRow?.source.chain.name ??
              discovery.sources.find(
                (source) => source.chain.key === selection.chainKey,
              )?.chain.name}{" "}
            · {walletName}
          </Text>
          <DepositAccountButton
            name={selection.account.name}
            address={selection.account.displayAddress}
            onClick={
              disabled ? undefined : () => setExpanded((value) => !value)
            }
          />
          <Button
            variant="transparent"
            size="small"
            disabled={disabled}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {t(
              expanded
                ? "deposit.v3.amount.hideSources"
                : "deposit.v3.amount.changeSource",
            )}
          </Button>
        </>
      )}
      {expanded && (
        <Stack gap="s" justify="flex-start">
          {group?.rows.flatMap((row) =>
            row.source.accounts.map((account) => (
              <OptionCard
                key={`${row.key}:${account.provider}`}
                label={`${row.source.chain.name} · ${getWallet(account.provider)?.title ?? account.provider}`}
                description={`${account.name} · ${shortenAccountAddress(account.displayAddress)}`}
                value={t("common:currency", {
                  value: toDecimal(row.balance.amount, row.balance.decimals),
                  symbol: row.balance.originSymbol,
                })}
                isActive={
                  row.source.chain.key === selection?.chainKey &&
                  account.provider === selection.account.provider &&
                  account.address === selection.account.address
                }
                onClick={() => {
                  onSelect(row, account)
                  setExpanded(false)
                }}
              />
            )),
          )}
          {unsupported.map((row) => (
            <OptionCard
              key={row.key}
              label={`${row.source.chain.name} · ${getWallet(row.source.account.provider)?.title ?? row.source.account.provider}`}
              description={t("deposit.v3.amount.unsupportedSource")}
              value={t("common:currency", {
                value: toDecimal(row.balance.amount, row.balance.decimals),
                symbol: row.balance.originSymbol,
              })}
              disabled
              isActive={false}
              onClick={() => {}}
            />
          ))}
          {discovery.scanning && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.flow.assets.scanning")}
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  )
}
