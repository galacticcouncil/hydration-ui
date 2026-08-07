import { Trash2 } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Tooltip } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  STrackedWalletCopyButton,
  STrackedWalletRemoveButton,
} from "@/modules/wallet/assets/Portfolio/TrackedWalletEntry.styled"
import { TrackedWalletIdentity } from "@/modules/wallet/assets/Portfolio/TrackedWalletIdentity"

type Props = {
  readonly address: string
  readonly onRemove: () => void
}

export const TrackedWalletEntry: FC<Props> = ({ address, onRemove }) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Flex align="center" justify="space-between" gap="base" px="m" py="m">
      <TrackedWalletIdentity
        address={address}
        glyphSize={24}
        iconSize={12}
        fs="p4"
        fw={600}
        truncate={160}
      />
      <Flex align="center" gap="base" pl="m" ml="auto" sx={{ flexShrink: 0 }}>
        <Tooltip text={t("common:copyAddress")} size="small" asChild>
          <STrackedWalletCopyButton
            iconSize="s"
            aria-label={t("common:copyAddress")}
            text={address}
          />
        </Tooltip>
        <Tooltip
          text={t("myAssets.tracked.manage.remove")}
          size="small"
          asChild
        >
          <STrackedWalletRemoveButton
            type="button"
            aria-label={t("myAssets.tracked.manage.remove")}
            onClick={onRemove}
          >
            <Icon size="s" component={Trash2} />
          </STrackedWalletRemoveButton>
        </Tooltip>
      </Flex>
    </Flex>
  )
}
