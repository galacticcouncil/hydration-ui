import { Root as DialogRoot } from "@radix-ui/react-dialog"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useDeposit } from "sections/deposit/DepositPage.utils"
import { DepositAsset } from "sections/deposit/steps/DepositAsset"
import { DepositCexSelect } from "sections/deposit/steps/DepositCexSelect"
import { DepositMethodSelect } from "sections/deposit/steps/DepositMethodSelect"
import { DepositMethod } from "sections/deposit/types"
import { SContainer } from "./DepositPage.styled"
import { DepositTransfer } from "sections/deposit/steps/DepositTransfer"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useCrossChainBalanceSubscription } from "api/xcm"
import { DepositSuccess } from "sections/deposit/steps/DepositSuccess"
import { DepositCrypto } from "sections/deposit/steps/DepositCrypto"

export const DepositPage = () => {
  const { account } = useAccount()
  const {
    asset,
    back,
    direction,
    page,
    depositMethod,
    isLoading,
    setAsset,
    setDepositMethod,
    setTransfer,
    setSuccess,
    reset,
  } = useDeposit()

  const address = account?.address ?? ""
  const srcChain = asset?.route[0] ?? ""
  const isMultiStepTransfer = asset ? asset.route.length > 1 : false

  useCrossChainBalanceSubscription(address, srcChain)

  return (
    <SContainer data-page={page}>
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
              hideBack: isLoading,
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
              content: <DepositTransfer onTransferSuccess={setSuccess} />,
            },
            {
              content: <DepositSuccess onConfirm={reset} />,
            },
          ]}
        />
      </DialogRoot>
    </SContainer>
  )
}
