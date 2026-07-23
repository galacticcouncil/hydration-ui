import {
  Flex,
  Paper,
  Separator,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { MultisigConfig } from "@galacticcouncil/web3-connect"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useMultisigPendingTxs } from "@/api/multisig"
import { MultisigDetailHistory } from "@/modules/multisig/MultisigDetailHistory"
import { MultisigDetailTransactions } from "@/modules/multisig/MultisigDetailTransactions"

enum TabView {
  Pending = "pending",
  History = "history",
}

type Props = {
  config: MultisigConfig
}

export const MultisigDetailTransactionsPanel: React.FC<Props> = ({
  config,
}) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabView>(TabView.Pending)
  const { data: pendingTxs = [] } = useMultisigPendingTxs(config.address)

  useEffect(() => {
    setTab(TabView.Pending)
  }, [config.id])

  const pendingCount = pendingTxs.length

  return (
    <Paper gap="m" sx={{ overflow: "hidden" }}>
      <Flex align="center" justify="space-between" gap="m" px="l" py="m">
        <Text fs="p1" lh={1.8} fw={500} font="primary">
          {t("multisig.detail.transactions.title")}
        </Text>
        <ToggleGroup<TabView>
          type="single"
          size="small"
          value={tab}
          onValueChange={(value) => value && setTab(value)}
        >
          <ToggleGroupItem value={TabView.Pending}>
            <Text fs="p5" px="s">
              {t("multisig.detail.transactions.tabs.pending")}
              {pendingCount > 0 && (
                <Text as="span" mx="s" fw={600} sx={{ opacity: 0.5 }}>
                  {pendingCount}
                </Text>
              )}
            </Text>
          </ToggleGroupItem>
          <ToggleGroupItem value={TabView.History}>
            <Text fs="p5" px="s">
              {t("multisig.detail.transactions.tabs.history")}
            </Text>
          </ToggleGroupItem>
        </ToggleGroup>
      </Flex>
      <Separator />
      {tab === TabView.Pending ? (
        <MultisigDetailTransactions config={config} />
      ) : (
        <MultisigDetailHistory config={config} />
      )}
    </Paper>
  )
}
