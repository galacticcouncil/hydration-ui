import { Root as DialogRoot } from "@radix-ui/react-dialog"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PendingDeposit } from "sections/deposit/components/PendingDeposit"
import {
  selectPendingDepositsByAccount,
  useDeposit,
  useDepositStore,
} from "sections/deposit/DepositPage.utils"
import { DepositAsset } from "sections/deposit/steps/deposit/DepositAsset"
import { DepositCexSelect } from "sections/deposit/steps/deposit/DepositCexSelect"
import { DepositBank } from "sections/deposit/steps/deposit/DepositBank"
import { DepositMethodSelect } from "sections/deposit/steps/deposit/DepositMethodSelect"
import { DepositSuccess } from "sections/deposit/steps/deposit/DepositSuccess"
import { DepositTransfer } from "sections/deposit/steps/deposit/DepositTransfer"
import { DepositMethod, DepositScreen } from "sections/deposit/types"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { SContainer, SDepositContent } from "./DepositPage.styled"
import { useShallow } from "hooks/useShallow"
import { useUnmount } from "react-use"

export const DepositPage = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const {
    asset,
    page,
    method,
    setAsset,
    setMethod,
    setTransfer,
    setSuccess,
    reset,
    paginateBack,
    direction,
  } = useDeposit()

  useUnmount(reset)

  const isMultiStepTransfer = asset ? asset.depositChain !== "hydration" : false

  const pendingDeposits = useDepositStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  const showPendingDeposits =
    page === DepositScreen.Select && pendingDeposits.length > 0

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
                content: <DepositMethodSelect onSelect={setMethod} />,
              },
              {
                title: (method === DepositMethod.DepositCex
                  ? t("deposit.cex.select.title")
                  : method === DepositMethod.DepositBank
                    ? t("deposit.bank.title")
                    : ""
                ).toUpperCase(),
                headerVariant: "GeistMono",
                noPadding: true,
                content:
                  method === DepositMethod.DepositCex ? (
                    <DepositCexSelect onAssetSelect={setAsset} />
                  ) : method === DepositMethod.DepositBank ? (
                    <DepositBank />
                  ) : null,
              },
              {
                title: t("deposit.cex.asset.title"),
                content: (
                  <DepositAsset
                    onAsssetSelect={paginateBack}
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

      {showPendingDeposits && (
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={18} font="GeistMono">
            {t("deposit.cex.transfer.ongoing.title")}
          </Text>
          {pendingDeposits.map((deposit) => (
            <PendingDeposit key={deposit.id} {...deposit} />
          ))}
        </div>
      )}
    </SContainer>
  )
}
