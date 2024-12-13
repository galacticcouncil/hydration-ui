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

export const DepositPage = () => {
  const { account } = useAccount()
  const {
    asset,
    setDepositMethod,
    setAsset,
    depositMethod,
    paginateToTransfer,
    page,
    direction,
    back,
  } = useDeposit()

  const address = account?.address ?? ""
  const srcChain = asset?.route[0] ?? ""
  const isMultiStepTransfer = asset ? asset.route.length > 1 : false

  useCrossChainBalanceSubscription(address, srcChain)

  return (
    <SContainer>
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
              title: "Exchange and asset to deposit",
              headerVariant: "GeistMono",
              content:
                depositMethod === DepositMethod.DepositCex ? (
                  <DepositCexSelect onAssetSelect={setAsset} />
                ) : null,
            },
            {
              title: "How to deposit?",
              content: (
                <DepositAsset
                  onAsssetSelect={back}
                  onDepositSuccess={paginateToTransfer}
                />
              ),
            },
            {
              title: "Deposit to Hydration",
              content: isMultiStepTransfer ? (
                <DepositTransfer />
              ) : (
                <>finished</>
              ),
            },
          ]}
        />
      </DialogRoot>
    </SContainer>
  )
}
