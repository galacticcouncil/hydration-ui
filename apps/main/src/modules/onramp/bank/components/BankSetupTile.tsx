import { LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Flex,
  Icon,
  LoadingButton,
  Paper,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankStatusPill } from "@/modules/onramp/bank/components/BankStatusPill"
import type { BankTile } from "@/modules/onramp/bank/utils/bankTile"

type BankSetupTileProps = {
  tile: BankTile
  onAction: () => void
  busy?: boolean
  error?: string
}

/** One saved-status tile (Figma M01-M08): pill, title, text and one action. */
export const BankSetupTile: FC<BankSetupTileProps> = ({
  tile,
  onAction,
  busy,
  error,
}) => {
  const { t } = useTranslation(["onramp"])
  if (tile.kind === "loading")
    return (
      <Paper p="xl">
        <Skeleton height={120} />
      </Paper>
    )

  const account = tile.account
  const currency = account ? t(`bank.deposit.currency.${account.currency}`) : ""
  const key = account
    ? `bank.tile.account.${account.status}`
    : `bank.tile.${tile.kind}`

  return (
    <Paper p="xl" data-bank-tile={tile.kind}>
      <Stack gap="m">
        <Flex justify="space-between" align="center">
          <Icon
            component={LandmarkIcon}
            size="xl"
            color={getToken("text.tint.secondary")}
          />
          <BankStatusPill
            label={t(`${key}.pill` as "bank.tile.setUp.pill")}
            tone={tile.tone}
          />
        </Flex>
        <Stack gap="xs">
          <Text fs="p2" fw={500} color={getToken("text.high")}>
            {t(`${key}.title` as "bank.tile.setUp.title", { currency })}
          </Text>
          <Text fs="p4" color={getToken("text.medium")}>
            {t(`${key}.description` as "bank.tile.setUp.description", {
              currency,
            })}
          </Text>
        </Stack>
        {error && <Alert variant="warning" description={error} />}
        <LoadingButton
          size="large"
          variant={tile.tone === "attention" ? "primary" : "secondary"}
          isLoading={!!busy}
          disabled={!!busy}
          onClick={onAction}
        >
          {t(`${key}.cta` as "bank.tile.setUp.cta")}
        </LoadingButton>
      </Stack>
    </Paper>
  )
}
