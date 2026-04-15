import {
  Button,
  ExternalLink,
  Flex,
  Icon,
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
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  MultisigAccount,
  MultisigPendingTx,
  useAccount,
  useMultisigConfigs,
} from "@galacticcouncil/web3-connect"
import { MoveUpRight } from "lucide-react"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDecodedMultisigTx } from "@/api/multisig"
import { MultisigSummary } from "@/modules/transactions/review/ReviewMultisig/components/MultisigSummary"
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

  const normalizedApprovals = useMemo(
    () => tx.approvals.map((a) => safeConvertAddressSS58(a)),
    [tx.approvals],
  )

  const connectedNormalized = account
    ? safeConvertAddressSS58(account.address)
    : ""

  const hasApprovedAsMultisig =
    !!account?.isMultisig &&
    !!account?.multisigSignerAddress &&
    normalizedApprovals.includes(account.multisigSignerAddress)

  const hasApprovedAsConnected = connectedNormalized
    ? normalizedApprovals.includes(connectedNormalized)
    : false

  const hasApproved = hasApprovedAsMultisig || hasApprovedAsConnected

  const approvedCount = normalizedApprovals.length
  const totalSignatories = multisig.signatories.length
  const threshold = multisig.threshold ?? totalSignatories
  const multisigAddress = safeConvertPublicKeyToSS58(multisig.pubKey)

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
        <Button
          size="large"
          variant={hasApproved ? "secondary" : "primary"}
          asChild
        >
          <ExternalLink
            href={`https://multix.cloud/?network=hydration&address=${multisigAddress}`}
          >
            {hasApproved
              ? t("multisig.modal.viewOnMultix")
              : t("multisig.modal.approveOnMultix")}
            <Icon component={MoveUpRight} size="s" />
          </ExternalLink>
        </Button>
      </ModalFooter>
    </>
  )
}
