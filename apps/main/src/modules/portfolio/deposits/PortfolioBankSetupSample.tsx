import Bank3D from "@galacticcouncil/ui/assets/images/Bank3D.webp"
import Review3D from "@galacticcouncil/ui/assets/images/Review3D.webp"
import ReviewClock3D from "@galacticcouncil/ui/assets/images/ReviewClock3D.webp"
import {
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BankSetupTile } from "@/modules/onramp/bank/components/BankSetupTile"
import type { BankTile } from "@/modules/onramp/bank/utils/bankTile"

type SampleState = "verification" | "review" | "ready"

const tiles: Record<SampleState, BankTile> = {
  verification: { kind: "verifyAction", tone: "attention" },
  review: { kind: "review", tone: "pending" },
  ready: {
    kind: "account",
    tone: "success",
    account: { currency: "usd", status: "ready" },
  },
}

const images = { verification: Review3D, review: ReviewClock3D, ready: Bank3D }

export const PortfolioBankSetupSample = () => {
  const { t } = useTranslation(["onramp", "common"])
  const [state, setState] = useState<SampleState>("verification")
  const [open, setOpen] = useState(false)
  const options = [
    { key: "verification", label: t("bank.tile.verifyAction.pill") },
    { key: "review", label: t("bank.tile.review.pill") },
    { key: "ready", label: t("bank.tile.account.ready.pill") },
  ] as const
  return (
    <Stack gap="s">
      <Flex align="center" justify="space-between" gap="s" wrap>
        <Text as="h3" font="primary" fs="h7" fw={500}>
          {t("bank.sample.setupTitle")}
        </Text>
        <Select
          label={t("bank.sample.state")}
          items={options}
          value={state}
          onValueChange={setState}
        />
      </Flex>
      <BankSetupTile tile={tiles[state]} onAction={() => setOpen(true)} />
      <Modal variant="popup" open={open} onOpenChange={setOpen}>
        <ModalHeader title={t(`bank.sample.${state}.title`)} />
        <ModalBody>
          <Stack gap="l" align="center">
            <Image src={images[state]} alt="" sx={{ size: "3xl" }} />
            <Text fs="p4" color="text.medium" align="center">
              {t(`bank.sample.${state}.description`)}
            </Text>
            {state === "ready" && (
              <Summary
                rows={[
                  {
                    label: t("bank.deposit.instructions.currency"),
                    content: "USD",
                  },
                  {
                    label: t("bank.deposit.instructions.rails"),
                    content: "ACH / Wire",
                  },
                  {
                    label: t("deposit.portfolio.detail.reference"),
                    content: "DEMO-USD",
                  },
                ]}
              />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            size="large"
            width="100%"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            {t("common:close")}
          </Button>
        </ModalFooter>
      </Modal>
    </Stack>
  )
}
