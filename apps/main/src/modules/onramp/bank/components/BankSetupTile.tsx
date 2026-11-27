import Bank3D from "@galacticcouncil/ui/assets/images/Bank3D.webp"
import {
  Alert,
  Flex,
  Image,
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
  onAction?: () => void
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
    <Stack
      as={Paper}
      px={["l", "xl"]}
      py={["l", "1.25rem"]}
      gap="m"
      data-bank-tile={tile.kind}
    >
      <Flex
        align={["stretch", null, "center"]}
        direction={["column", null, "row"]}
        justify="space-between"
        gap="m"
      >
        <Flex align="center" gap="m" minWidth={0}>
          <Image
            src={Bank3D}
            alt=""
            sx={{ size: ["2.5rem", "3.5rem"], flexShrink: 0 }}
          />
          <Stack gap="xs" minWidth={0}>
            <Text fs="p2" fw={500} color={getToken("text.high")}>
              {t(`${key}.title` as "bank.tile.setUp.title", { currency })}
            </Text>
            <Text fs="p3" color={getToken("text.medium")}>
              {t(`${key}.description` as "bank.tile.setUp.description", {
                currency,
              })}
            </Text>
          </Stack>
        </Flex>
        <Flex align="center" justify="space-between" gap="m">
          <BankStatusPill
            label={t(`${key}.pill` as "bank.tile.setUp.pill")}
            tone={tile.tone}
          />
          {onAction && (
            <LoadingButton
              size="medium"
              variant={tile.tone === "attention" ? "primary" : "secondary"}
              isLoading={!!busy}
              disabled={!!busy}
              onClick={onAction}
            >
              {t(`${key}.cta` as "bank.tile.setUp.cta")}
            </LoadingButton>
          )}
        </Flex>
      </Flex>
      {error && <Alert variant="warning" description={error} />}
    </Stack>
  )
}
