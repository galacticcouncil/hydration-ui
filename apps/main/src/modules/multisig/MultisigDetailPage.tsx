import { Paper, Stack } from "@galacticcouncil/ui/components"
import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import {
  MultisigConfig,
  useAccount,
  useAccountMultisigConfigs,
} from "@galacticcouncil/web3-connect"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { MultisigDetailHeader } from "@/modules/multisig/MultisigDetailHeader"
import { MultisigDetailSidebar } from "@/modules/multisig/MultisigDetailSidebar"
import { MultisigDetailTransactionsPanel } from "@/modules/multisig/MultisigDetailTransactionsPanel"

const findConfigByAddress = (configs: MultisigConfig[], address: string) => {
  const normalized = safeConvertAddressSS58(address)
  if (!normalized) return undefined

  return configs.find(
    (config) => safeConvertAddressSS58(config.address) === normalized,
  )
}

const getDefaultMultisig = (
  configs: MultisigConfig[],
  accountAddress: string | undefined,
  isMultisig: boolean,
  trackedAddress?: string,
) => {
  if (configs.length === 0) return null

  if (trackedAddress) {
    const tracked = findConfigByAddress(configs, trackedAddress)
    if (tracked) return tracked
  }

  if (isMultisig && accountAddress) {
    const normalized = safeConvertAddressSS58(accountAddress)
    const connected = configs.find(
      (config) => safeConvertAddressSS58(config.address) === normalized,
    )
    if (connected) return connected
  }

  return configs[0] ?? null
}

export const MultisigDetailPage = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const configs = useAccountMultisigConfigs()
  const { address } = useSearch({ from: "/multisigs/" })
  const navigate = useNavigate({ from: "/multisigs/" })
  const [trackedAddress, setTrackedAddress] = useState<string | undefined>(
    address,
  )

  const selectedConfig = useMemo(() => {
    if (address) {
      const fromUrl = findConfigByAddress(configs, address)
      if (fromUrl) return fromUrl
    }

    return getDefaultMultisig(
      configs,
      account?.displayAddress,
      account?.isMultisig ?? false,
      address ? undefined : trackedAddress,
    )
  }, [
    configs,
    address,
    account?.displayAddress,
    account?.isMultisig,
    trackedAddress,
  ])

  useEffect(() => {
    if (!address) return
    if (findConfigByAddress(configs, address)) return

    setTrackedAddress(undefined)
    navigate({ search: { address: undefined }, replace: true })
  }, [address, configs, navigate])

  useEffect(() => {
    if (address || !selectedConfig) return

    setTrackedAddress(selectedConfig.address)
  }, [selectedConfig, address])

  if (!selectedConfig) {
    return (
      <Paper px="xl" py="xxxl">
        <EmptyState
          header={t("multisig.empty.title")}
          description={t("multisig.empty.description")}
        />
      </Paper>
    )
  }

  return (
    <Stack gap="xl">
      <MultisigDetailHeader
        config={selectedConfig}
        onSelectMultisig={(config) =>
          navigate({ search: { address: config.address }, replace: true })
        }
      />
      <TwoColumnGrid template="sidebar-left">
        <MultisigDetailSidebar config={selectedConfig} />
        <MultisigDetailTransactionsPanel config={selectedConfig} />
      </TwoColumnGrid>
    </Stack>
  )
}
