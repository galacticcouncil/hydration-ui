import { Check, PixelCheck, PixelX } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  MicroButton,
  Spinner,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useCopy } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import React from "react"
import { useTranslation } from "react-i18next"

import { useBestNumber, useChainSpecData } from "@/api/chain"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { TxStatus } from "@/modules/transactions/types"
import { stringifyTxErrorContext } from "@/modules/transactions/utils/errors"

export type ReviewTransactionStatusProps = {
  status: TxStatus
}

type StatusIconProps = {
  status: TxStatus
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  if (status === "idle") return null

  if (status === "submitted") {
    return <Spinner size={90} />
  }

  return (
    <Flex
      size={90}
      justify="center"
      align="center"
      bg={
        status === "error"
          ? getToken("accents.danger.dimBg")
          : getToken("accents.success.dim")
      }
      sx={{ borderRadius: "full", mb: 4 }}
    >
      <Icon
        size={40}
        sx={{ flexShrink: 0 }}
        color={
          status === "error"
            ? getToken("accents.danger.emphasis")
            : getToken("accents.success.emphasis")
        }
        component={status === "error" ? PixelX : PixelCheck}
      />
    </Flex>
  )
}

type StatusBoxProps = {
  title: string
  description: string
}

const StatusText: React.FC<StatusBoxProps> = ({ title, description }) => {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap={8}
      maxWidth={400}
    >
      <Text as="h2" align="center" fs="h7" fw={500} font="primary">
        {title}
      </Text>
      <Text fs="p5" align="center" color={getToken("text.medium")}>
        {description}
      </Text>
    </Flex>
  )
}

type ErrorCopyButtonProps = {
  message: string
}

const ErrorCopyButton: React.FC<ErrorCopyButtonProps> = ({ message = "" }) => {
  const { t } = useTranslation()
  const { copied, copy } = useCopy(5000)
  const { account } = useAccount()

  const { data: chain } = useChainSpecData()
  const { data: bestNumber } = useBestNumber()

  const blockNumber = bestNumber?.parachainBlockNumber?.toString() ?? ""
  const specVersion = chain?.lastRuntimeUpgrade?.spec_version?.toString() ?? ""

  return (
    <MicroButton
      onClick={() =>
        copy(
          stringifyTxErrorContext({
            message,
            address: account?.address ?? "",
            wallet: account?.provider ?? "",
            specVersion,
            blockNumber,
            path: window.location.pathname,
          }),
        )
      }
    >
      <Flex gap={4} color={copied && getToken("accents.success.emphasis")}>
        {copied && <Icon size={12} component={Check} />}
        <Text>
          {copied ? t("copied") : t("transaction.status.error.copyError")}
        </Text>
      </Flex>
    </MicroButton>
  )
}

export const ReviewTransactionStatus = () => {
  const { t } = useTranslation()
  const { isIdle, isSuccess, isError, status, reset, error } = useTransaction()

  if (status === "idle") {
    return null
  }

  return (
    <Flex direction="column" justify="center" align="center" gap={10} p={20}>
      <StatusIcon status={status} />
      {isIdle && (
        <StatusText
          title={t("transaction.status.submitted.title")}
          description={t("transaction.status.submitted.description")}
        />
      )}
      {isSuccess && (
        <StatusText
          title={t("transaction.status.success.title")}
          description={t("transaction.status.success.description")}
        />
      )}
      {isError && (
        <>
          <StatusText
            title={t("transaction.status.error.title")}
            description={t("transaction.status.error.description")}
          />
          <Flex gap={10} mt={10}>
            <MicroButton onClick={reset}>
              {t("transaction.status.error.tryAgain")}
            </MicroButton>
            {error && <ErrorCopyButton message={error} />}
          </Flex>
        </>
      )}
    </Flex>
  )
}
