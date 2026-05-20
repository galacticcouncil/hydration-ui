import {
  Button,
  Flex,
  ModalBody,
  ModalCloseTrigger,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  ProgressBar,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  type MultisigAccount,
  type MultisigPendingTx,
  useAccount,
  useMultisigConfigs,
} from "@galacticcouncil/web3-connect"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDecodedMultisigTx } from "@/api/multisig"
import { MultisigSummary } from "@/modules/transactions/review/ReviewMultisig/components/MultisigSummary"
import { ReviewMultisigAction } from "@/modules/transactions/review/ReviewMultisig/components/ReviewMultisigAction"
import {
  getMultisigAddress,
  getNormalizedApprovals,
} from "@/modules/transactions/review/ReviewMultisig/ReviewMultisig.utils"
import { ReviewTransactionJsonContent } from "@/modules/transactions/review/ReviewTransactionJsonView"
import { JsonViewContainer } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.styled"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"

type ReviewMultisigProps = {
  tx: MultisigPendingTx
  multisig: MultisigAccount
}

export const ReviewMultisig: FC<ReviewMultisigProps> = ({ tx, multisig }) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const configs = useMultisigConfigs()
  const { data: decodedTx } = useDecodedMultisigTx(tx)

  const normalizedApprovals = useMemo(() => getNormalizedApprovals(tx), [tx])

  const approvedCount = normalizedApprovals.length
  const totalSignatories = multisig.signatories.length
  const threshold = multisig.threshold ?? totalSignatories
  const multisigAddress = getMultisigAddress(multisig)

  const config = configs.find((c) => stringEquals(c.address, multisigAddress))

  const progress = (approvedCount / threshold) * 100

  return (
    <>
      <ModalHeader
        title={t("multisig.modal.title")}
        description={
          decodedTx?.timestamp
            ? t("multisig.modal.description", {
                date: new Date(decodedTx.timestamp),
              })
            : undefined
        }
      />
      <ModalBody noPadding>
        <Flex direction="column" gap="m">
          {isPapiTransaction(decodedTx?.tx) && (
            <JsonViewContainer>
              <ReviewTransactionJsonContent
                tx={decodedTx.tx}
                jsonPath="value.value.call"
                srcChainKey={HYDRATION_CHAIN_KEY}
              />
            </JsonViewContainer>
          )}

          <Stack
            px="xl"
            pt="m"
            gap="s"
            separated
            separator={<ModalContentDivider />}
          >
            <Stack py="base">
              <Flex gap="s" align="center" justify="space-between">
                {config ? (
                  <Stack>
                    <Flex gap="s" align="center">
                      <Text fs="p4" fw={600}>
                        {config.name}
                      </Text>
                      <Text fs="p4" fw={500} color={getToken("text.medium")}>
                        {shortenAccountAddress(config.address)}
                      </Text>
                    </Flex>
                  </Stack>
                ) : (
                  <Text fs="p4" fw={500}>
                    {t("approvals")}
                  </Text>
                )}
              </Flex>
              <ProgressBar
                value={progress}
                customLabel={
                  <Text fs="p5" lh={1} fw={600}>
                    {approvedCount} / {threshold}
                  </Text>
                }
              />
            </Stack>
            <MultisigSummary
              multisig={multisig}
              normalizedApprovals={normalizedApprovals}
              account={account}
            />
          </Stack>
        </Flex>
      </ModalBody>
      <ModalFooter justify="space-between">
        <ModalCloseTrigger asChild>
          <Button size="large" variant="tertiary">
            {t("close")}
          </Button>
        </ModalCloseTrigger>
        <ReviewMultisigAction tx={tx} multisig={multisig} />
      </ModalFooter>
    </>
  )
}
