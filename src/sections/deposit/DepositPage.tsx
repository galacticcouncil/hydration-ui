import { Root as DialogRoot } from "@radix-ui/react-dialog"
import { Alert } from "components/Alert"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useDeposit } from "sections/deposit/DepositPage.utils"
import { DepositAsset } from "sections/deposit/steps/deposit/DepositAsset"
import { DepositCexSelect } from "sections/deposit/steps/deposit/DepositCexSelect"
import { DepositCrypto } from "sections/deposit/steps/deposit/DepositCrypto"
import { DepositMethodSelect } from "sections/deposit/steps/deposit/DepositMethodSelect"
import { DepositSuccess } from "sections/deposit/steps/deposit/DepositSuccess"
import { DepositTransfer } from "sections/deposit/steps/deposit/DepositTransfer"
import { DepositMethod, DepositScreen } from "sections/deposit/types"
import { SContainer, SDepositContent } from "./DepositPage.styled"
import { useTranslation } from "react-i18next"

export const DepositPage = () => {
  const { t } = useTranslation()
  const {
    asset,
    back,
    direction,
    page,
    method,
    setAsset,
    setMethod,
    setTransfer,
    setSuccess,
    reset,
  } = useDeposit()

  const isMultiStepTransfer = asset ? asset.depositChain !== "hydration" : false

  const showCexDepositAlert =
    page === DepositScreen.DepositAsset && method === DepositMethod.DepositCex

  return (
    <SContainer>
      <SDepositContent data-page={page}>
        <DialogRoot open modal={false}>
          <ModalContents
            onBack={back}
            page={page}
            direction={direction}
            contents={[
              {
                content: <DepositMethodSelect onSelect={setMethod} />,
              },
              {
                title: (method === DepositMethod.DepositCex
                  ? t("deposit.cex.select.title")
                  : method === DepositMethod.DepositCrypto
                    ? t("deposit.crypto.fund.title")
                    : ""
                ).toUpperCase(),
                headerVariant: "GeistMono",
                noPadding: true,
                content:
                  method === DepositMethod.DepositCex ? (
                    <DepositCexSelect onAssetSelect={setAsset} />
                  ) : method === DepositMethod.DepositCrypto ? (
                    <DepositCrypto />
                  ) : null,
              },
              {
                title: t("deposit.cex.asset.title"),
                content: (
                  <DepositAsset
                    onAsssetSelect={back}
                    onDepositSuccess={
                      isMultiStepTransfer ? setTransfer : setSuccess
                    }
                  />
                ),
              },
              {
                title: t("deposit.cex.transfer.title"),
                hideBack: true,
                content: <DepositTransfer onTransferSuccess={setSuccess} />,
              },
              {
                hideBack: true,
                content: <DepositSuccess onConfirm={reset} />,
              },
            ]}
          />
        </DialogRoot>
      </SDepositContent>
      {showCexDepositAlert && (
        <Alert variant="info" sx={{ mt: 10 }}>
          {t("deposit.cex.asset.alert")}
        </Alert>
      )}
    </SContainer>
  )
}
