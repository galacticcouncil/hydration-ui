import { CircleCheck } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Icon,
  ModalBody,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { Trans, useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"

export type DepositOnchainSubmittedProps = {
  amount: string
  symbol: string
  onDepositAnother: () => void
}

export const DepositOnchainSubmitted: React.FC<
  DepositOnchainSubmittedProps
> = ({ amount, symbol, onDepositAnother }) => {
  const { t } = useTranslation(["onramp"])
  const navigate = useNavigate()

  return (
    <ModalBody>
      <Stack gap="s">
        <Icon
          size="2xl"
          component={CircleCheck}
          color={getToken("accents.success.emphasis")}
          sx={{ mx: "auto", my: "m" }}
        />
        <Text fs="p2" lh={1.3} fw={600} align="center">
          {t("deposit.onchain.submitted.title")}
        </Text>
        <Text fs="p3" lh={1.4} color={getToken("text.low")} align="center">
          <Trans
            t={t}
            i18nKey="onramp:deposit.onchain.submitted.description"
            values={{ amount, symbol, dstChain: "Hydration" }}
          >
            <span sx={{ color: getToken("text.high") }} />
          </Trans>
        </Text>
      </Stack>
      <Stack gap="m" mt="xl">
        <Button size="large" onClick={() => navigate({ to: LINKS.crossChain })}>
          {t("deposit.onchain.submitted.history")}
        </Button>
        <Button
          size="large"
          variant="secondary"
          outline
          onClick={onDepositAnother}
        >
          {t("deposit.onchain.submitted.another")}
        </Button>
      </Stack>
    </ModalBody>
  )
}
