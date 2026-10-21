import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { PerpsDepositHydration } from "@/modules/perps/components/PerpsDepositHydration"
import { PerpsTransfer } from "@/modules/perps/components/PerpsTransfer"

type DepositTab = "hydration" | "transfer"

const TABS: readonly DepositTab[] = ["hydration", "transfer"]

type PerpsDepositProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

/**
 * Funds the Hyperliquid account from Hydration. Hyperliquid keeps spot and
 * perps balances apart, so the spot ↔ perps transfer sits beside it.
 */
export const PerpsDeposit: FC<PerpsDepositProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation("trade")
  const [tab, setTab] = useState<DepositTab>("hydration")

  const close = () => onOpenChange(false)

  return (
    <Modal variant="popup" open={open} onOpenChange={onOpenChange}>
      <ModalHeader title={t("perps.deposit.title")} />
      <ModalBody>
        <Stack gap="m">
          <Flex gap="xs">
            {TABS.map((key) => (
              <Button
                key={key}
                size="small"
                variant={key === tab ? "secondary" : "muted"}
                onClick={() => setTab(key)}
                sx={{ flex: 1 }}
              >
                <Text fs="p6" font="mono">
                  {t(`perps.deposit.tab.${key}`)}
                </Text>
              </Button>
            ))}
          </Flex>

          {tab === "hydration" ? (
            <PerpsDepositHydration onSubmitted={close} />
          ) : (
            <PerpsTransfer onDone={close} />
          )}
        </Stack>
      </ModalBody>
    </Modal>
  )
}
