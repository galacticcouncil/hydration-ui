import {
  AccountAvatar,
  EditableText,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { MultisigConfig, useMultisigStore } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { MultisigAccountSelector } from "@/modules/multisig/MultisigAccountSelector"

type Props = {
  config: MultisigConfig
  onSelectMultisig: (config: MultisigConfig) => void
}

export const MultisigDetailHeader: React.FC<Props> = ({
  config,
  onSelectMultisig,
}) => {
  const { t } = useTranslation()
  const updateConfig = useMultisigStore((state) => state.update)
  const addConfig = useMultisigStore((state) => state.add)

  const handleRename = (newName: string) => {
    const trimmed = newName.trim()
    if (config.isCustom) {
      updateConfig(config.id, { name: trimmed })
      return
    }
    addConfig({
      address: config.address,
      name: trimmed,
      signers: config.signers,
      threshold: config.threshold,
      isCustom: true,
    })
  }

  return (
    <Flex
      direction={["column", null, "row"]}
      align={["flex-start", null, "center"]}
      justify={["center", null, "space-between"]}
      gap="l"
    >
      <Flex align="center" gap="base">
        <AccountAvatar address={config.address} size={42} />
        <Stack>
          <EditableText
            value={config.name}
            placeholder={t("multisig.detail.noName")}
            onChange={handleRename}
            fs="h6"
            lh={1.3}
            fw={500}
            font="primary"
          />
          <Text fs="p4" color={getToken("text.medium")} truncate lh={1.2}>
            {shortenAccountAddress(config.address, 6)}
          </Text>
        </Stack>
      </Flex>
      <MultisigAccountSelector
        config={config}
        onSelectMultisig={onSelectMultisig}
      />
    </Flex>
  )
}
