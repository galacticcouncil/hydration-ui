import {
  ArrowRightLeftIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  ModalBody,
  ModalHeader,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { StepButton } from "@/modules/onramp/components/StepButton"
import { PendingDeposits } from "@/modules/onramp/deposit/components/PendingDeposits"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"

export type DepositMethodSelectProps = {
  onSelect: (page: OnrampScreen) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation(["onramp"])
  const setModal = useOnrampModal((state) => state.setModal)
  const entryChoice = useOnrampModal((state) => state.depositEntryChoice)
  const openOnchain = useOnrampModal((state) => state.openOnchain)
  const onchain = (
    <StepButton
      hasFooter={entryChoice}
      icon={ArrowRightLeftIcon}
      onClick={() => onSelect(OnrampScreen.DepositOnchainWallet)}
      title={t("deposit.method.onchain.title")}
      description={t("deposit.method.onchain.description")}
    />
  )

  return (
    <>
      <ModalHeader title={t("deposit.method.title")} align="center" />
      <ModalBody>
        <Stack gap="m">
          <StepButton
            icon={LandmarkIcon}
            onClick={() => onSelect(OnrampScreen.DepositAssetSelect)}
            title={t("deposit.method.cex.title")}
            description={t("deposit.method.cex.description")}
          />
          {entryChoice ? (
            <Stack gap={0} borderRadius="m" overflow="hidden">
              {onchain}
              <Stack gap={0} bg={getToken("buttons.secondary.low.rest")}>
                <Separator mx={["l", "xl"]} />
                <Flex
                  gap="m"
                  direction={["column", "row"]}
                  align={["flex-start", "center"]}
                  justify="space-between"
                  px={["l", "xl"]}
                  py="m"
                >
                  <Text
                    fs="p4"
                    lh={1.3}
                    minWidth={0}
                    color={getToken("text.medium")}
                  >
                    {t("deposit.method.quick.hint")}
                  </Text>
                  <Button
                    type="button"
                    variant="secondary"
                    outline
                    size="small"
                    flexShrink={0}
                    onClick={() => openOnchain("simple", { entryChoice: true })}
                  >
                    {t("deposit.quick.title")}
                  </Button>
                </Flex>
              </Stack>
            </Stack>
          ) : (
            onchain
          )}
          <StepButton
            icon={LandmarkIcon}
            onClick={() => setModal("bankDeposit")}
            title={t("deposit.method.bridge.title")}
            description={t("deposit.method.bridge.description")}
          />
        </Stack>
      </ModalBody>
      <PendingDeposits />
    </>
  )
}
