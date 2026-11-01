import { LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Notification,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"

import { useBankPreviewStore } from "./useBankPreviewStore"

type BankSetupResumeProps = { notification?: boolean }

export const BankSetupResume: FC<BankSetupResumeProps> = ({
  notification = false,
}) => {
  const { t } = useTranslation("onramp")
  const { account } = useAccount()
  const draft = useBankPreviewStore(
    (state) => state.setups[account?.address ?? ""],
  )
  const setModal = useOnrampModal((state) => state.setModal)
  if (!draft) return null
  const ready = draft.accounts.includes(draft.currency)
  const title = t(
    ready ? "bankSimplified.resume.readyTitle" : "bankSimplified.resume.title",
    { currency: draft.currency },
  )
  const description = t(
    ready
      ? "bankSimplified.resume.readyDescription"
      : "bankSimplified.resume.description",
  )
  const action = (
    <Button
      size="small"
      variant="secondary"
      onClick={() => setModal("bankDeposit")}
    >
      {t(
        ready
          ? "bankV2.deposit.action.details"
          : "bankSimplified.resume.action",
      )}
    </Button>
  )
  if (notification)
    return (
      <Notification
        fullWidth
        autoClose={false}
        variant="info"
        content={title}
        description={description}
        actions={action}
      />
    )
  return (
    <Flex
      align="center"
      justify="space-between"
      gap="m"
      p="l"
      borderRadius="m"
      bg="surfaces.containers.dim.dimOnHigh"
      wrap
    >
      <Icon component={LandmarkIcon} size="l" />
      <Stack gap="xs" flex={1}>
        <Text fs="p4" fw={500}>
          {title}
        </Text>
        <Text fs="p5" color="text.medium">
          {description}
        </Text>
      </Stack>
      {action}
    </Flex>
  )
}
