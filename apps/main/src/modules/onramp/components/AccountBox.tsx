import {
  ChevronDown,
  Copy,
  ExternalLink,
} from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Button,
  Flex,
  Icon,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { safeConvertAddressSS58, useCopy } from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import {
  createCexWithdrawalUrl,
  getCexConfigById,
} from "@/modules/onramp/config/cex"
import { AssetConfig } from "@/modules/onramp/types"

export type AccountBoxProps = Account & {
  ss58Format: number
  error?: string
  cexId: string
  asset: AssetConfig | null
  onToggleWeb3Modal: () => void
}

export const AccountBox: React.FC<AccountBoxProps> = ({
  name,
  address,
  displayAddress,
  ss58Format,
  error,
  cexId,
  asset,
  onToggleWeb3Modal,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { copied, copy } = useCopy(5000)

  const formattedAddress = safeConvertAddressSS58(address, ss58Format) ?? ""

  const cex = getCexConfigById(cexId)
  const cexUrl = asset
    ? createCexWithdrawalUrl(cexId, asset.data.asset.originSymbol)
    : ""

  return (
    <Paper p="l">
      <Stack gap="s">
        <Button variant="transparent" onClick={onToggleWeb3Modal}>
          <Text fs="p4" color={getToken("text.low")}>
            {t("deposit.cex.account.depositTo")}
          </Text>
          <AccountAvatar address={displayAddress || address} size={20} />
          <Text fs="p4">{name}</Text>
          <Icon size="m" component={ChevronDown} color={getToken("text.low")} />
        </Button>

        {error ? (
          <Text fs="p3" color={getToken("alarmRed.400")}>
            {error}
          </Text>
        ) : (
          <Text
            fs={["p4", "p3"]}
            align="center"
            color={getToken("text.tint.secondary")}
            css={{ wordBreak: "break-all" }}
          >
            {formattedAddress}
          </Text>
        )}

        <Flex gap="s" justify="center" mt="base">
          <Button
            size="small"
            variant="accent"
            outline
            disabled={!!error || copied}
            onClick={() => copy(formattedAddress)}
          >
            <Copy />
            {t("common:copyAddress")}
          </Button>
          {cexUrl && (
            <Button
              size="small"
              variant="primary"
              disabled={!!error}
              onClick={() => window.open(cexUrl, "_blank")}
            >
              <ExternalLink />
              {t("common:open")} {cex?.title}
            </Button>
          )}
        </Flex>
      </Stack>
    </Paper>
  )
}
