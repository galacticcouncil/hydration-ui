import { Root as DialogRoot } from "@radix-ui/react-dialog"
import { Alert } from "components/Alert"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useDeposit } from "sections/deposit/DepositPage.utils"
import { DepositAsset } from "sections/deposit/steps/DepositAsset"
import { DepositCexSelect } from "sections/deposit/steps/DepositCexSelect"
import { DepositCrypto } from "sections/deposit/steps/DepositCrypto"
import { DepositMethodSelect } from "sections/deposit/steps/DepositMethodSelect"
import { DepositSuccess } from "sections/deposit/steps/DepositSuccess"
import { DepositTransfer } from "sections/deposit/steps/DepositTransfer"
import { DepositMethod, DepositScreen } from "sections/deposit/types"
import { SContainer, SDepositContent } from "./DepositPage.styled"

export const DepositPage = () => {
  const {
    asset,
    back,
    direction,
    page,
    depositMethod,
    setAsset,
    setDepositMethod,
    setTransfer,
    setSuccess,
    reset,
  } = useDeposit()

  const isMultiStepTransfer = asset ? asset.route.length > 1 : false

  const showCexDepositAlert =
    page === DepositScreen.DepositAsset &&
    depositMethod === DepositMethod.DepositCex

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
                content: <DepositMethodSelect onSelect={setDepositMethod} />,
              },
              {
                title:
                  depositMethod === DepositMethod.DepositCex
                    ? "Exchange and asset to deposit"
                    : depositMethod === DepositMethod.DepositCrypto
                      ? "Fund with Crypto"
                      : "",
                headerVariant: "GeistMono",
                noPadding: true,
                content:
                  depositMethod === DepositMethod.DepositCex ? (
                    <DepositCexSelect onAssetSelect={setAsset} />
                  ) : depositMethod === DepositMethod.DepositCrypto ? (
                    <DepositCrypto />
                  ) : null,
              },
              {
                title: "How to deposit?",
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
                title: "Deposit to Hydration",
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
          Please don’t close this tab while proceeding with your deposit, it
          might cause unexpected errors. Only click shiny buttons.
        </Alert>
      )}
    </SContainer>
  )
}
