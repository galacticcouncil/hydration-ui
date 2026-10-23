import {
  Alert,
  Button,
  Flex,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentProps, FC, ReactNode } from "react"

import type { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"
import { PortfolioDepositStatus } from "./PortfolioDepositStatus"

type PortfolioDepositModalContentProps = {
  title: string
  logo: ReactNode
  amount: string
  status: PortfolioDepositSample["status"]
  description: string
  rows: NonNullable<ComponentProps<typeof Summary>["rows"]>
  notice: string
  closeLabel: string
  onClose: () => void
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export const PortfolioDepositModalContent: FC<
  PortfolioDepositModalContentProps
> = ({
  title,
  logo,
  amount,
  status,
  description,
  rows,
  notice,
  closeLabel,
  onClose,
  action,
}) => (
  <>
    <ModalHeader title={title} align="center" sx={{ p: ["l", "xl"] }} />
    <ModalBody sx={{ p: ["l", "xl"] }}>
      <Stack gap={["l", "xl"]} justify="flex-start">
        <Flex direction={["row", "column"]} align="center" gap="m">
          {logo}
          <Stack align={["flex-start", "center"]} gap={["xs", "m"]}>
            <Text font="primary" fs={["h7", "h5"]}>
              {amount}
            </Text>
            <PortfolioDepositStatus status={status} />
          </Stack>
        </Flex>
        <Text
          fs={["p5", "p4"]}
          lh={1.5}
          align={["left", "center"]}
          color={getToken("text.medium")}
        >
          {description}
        </Text>
        <Summary rows={rows} />
        <Alert variant="info" description={notice} />
      </Stack>
    </ModalBody>
    <ModalFooter sx={{ p: ["l", "xl"] }}>
      <Button variant="tertiary" size="large" onClick={onClose} width="100%">
        {closeLabel}
      </Button>
      {action && (
        <Button
          variant="secondary"
          size="large"
          onClick={action.onClick}
          disabled={action.disabled}
          width="100%"
        >
          {action.label}
        </Button>
      )}
    </ModalFooter>
  </>
)
