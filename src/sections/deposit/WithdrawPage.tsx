import { Root as DialogRoot } from "@radix-ui/react-dialog"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useTranslation } from "react-i18next"
import { CEX_CONFIG, useDeposit } from "sections/deposit/DepositPage.utils"
import { DepositCexSelect } from "sections/deposit/steps/deposit/DepositCexSelect"
import { WithdrawMethodSelect } from "sections/deposit/steps/withdraw/WithdrawMethodSelect"
import { WithdrawSuccess } from "sections/deposit/steps/withdraw/WithdrawSuccess"
import { WithdrawTransfer } from "sections/deposit/steps/withdraw/WithdrawTransfer"
import { SContainer, SDepositContent } from "./DepositPage.styled"
import { WithdrawTransferOnchain } from "sections/deposit/steps/withdraw/WithdrawTransferOnchain"
import { useUnmount } from "react-use"
import { WithdrawBank } from "sections/deposit/steps/withdraw/WithdrawBank"
import { DepositMethod } from "sections/deposit/types"

export const WithdrawPage = () => {
  const { t } = useTranslation()
  const {
    asset,
    cexId,
    paginateBack,
    method,
    direction,
    page,
    reset,
    setAsset,
    setMethod,
    setSuccess,
  } = useDeposit()

  useUnmount(reset)

  const activeCex = CEX_CONFIG.find(({ id }) => id === cexId)

  const isOnchain = asset?.withdrawalChain === "hydration"

  return (
    <SContainer>
      <SDepositContent data-page={page}>
        <DialogRoot open modal={false}>
          <ModalContents
            onBack={paginateBack}
            page={page}
            direction={direction}
            contents={[
              {
                content: <WithdrawMethodSelect onSelect={setMethod} />,
              },
              {
                title: (method === DepositMethod.WithdrawCex
                  ? t("withdraw.cex.select.title")
                  : method === DepositMethod.WithdrawBank
                    ? t("withdraw.bank.title")
                    : ""
                ).toUpperCase(),
                headerVariant: "GeistMono",
                noPadding: true,
                content:
                  method === DepositMethod.WithdrawCex ? (
                    <DepositCexSelect onAssetSelect={setAsset} />
                  ) : method === DepositMethod.WithdrawBank ? (
                    <WithdrawBank />
                  ) : null,
              },
              {
                title: t("withdraw.cex.transfer.title", {
                  cex: activeCex?.title,
                }).toUpperCase(),
                headerVariant: "GeistMono",
                content: isOnchain ? (
                  <WithdrawTransferOnchain onTransferSuccess={setSuccess} />
                ) : (
                  <WithdrawTransfer onTransferSuccess={setSuccess} />
                ),
              },
              { content: null },
              {
                hideBack: true,
                content: <WithdrawSuccess onConfirm={reset} />,
              },
            ]}
          />
        </DialogRoot>
      </SDepositContent>
    </SContainer>
  )
}
