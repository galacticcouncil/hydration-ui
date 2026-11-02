import {
  Button,
  ButtonTransparent,
  ModalBody,
  ModalFooter,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  formatDestChainAddress,
  HYDRATION_CHAIN_KEY,
  isAddressValidOnHydration,
} from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { RecipientSelectPage } from "@/modules/xcm/transfer/components/Recipient/RecipientSelectPage"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

type Props = {
  onBack: () => void
  onSelect: (address: string, account?: Account) => void
}

export const DepositOnchainDestination = ({ onBack, onSelect }: Props) => {
  const { t } = useTranslation(["onramp", "common"])
  const { getValues } = useFormContext<XcmFormValues>()
  const accounts = useDepositAccounts({ signersOnly: true })
  const suggested = useOnrampModal((state) => state.depositSuggestedDestination)
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const active =
    suggested && hydration && isAddressValidOnHydration(suggested.rawAddress)
      ? accounts.find(
          (account) =>
            account.provider === suggested.provider &&
            account.address === suggested.address,
        )
      : undefined
  const [initial] = useState(() => {
    const address = getValues("destAddress")
    const account = getValues("destAccount")
    if (address)
      return { address, account: account ?? undefined, suggested: false }
    if (active && hydration)
      return {
        address: formatDestChainAddress(active.rawAddress, hydration),
        account: active,
        suggested: true,
      }
    return null
  })
  const [choosing, setChoosing] = useState(!initial)
  const symbol = getValues("srcAsset")?.originSymbol ?? ""
  const current = initial?.account
  const available =
    !current ||
    accounts.some(
      (account) =>
        account.provider === current.provider &&
        account.address === current.address,
    )
  if (choosing || !initial || !available)
    return (
      <RecipientSelectPage
        onBack={() => (initial && available ? setChoosing(false) : onBack())}
        onSelectAddress={onSelect}
      />
    )
  const name = current?.name ?? t("deposit.onchain.customAddress")
  return (
    <>
      <SDepositStepHeader
        title={t("deposit.v3.destination.title", { symbol })}
        align="center"
        closable
        onBack={onBack}
      />
      <ModalBody>
        <Stack gap="l" justify="flex-start">
          <Text fs="p4" color={getToken("text.medium")}>
            {t("deposit.v3.destination.arrivesIn")}
          </Text>
          {initial.suggested && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.v3.destination.active")}
            </Text>
          )}
          <DepositAccountButton
            active
            name={
              current
                ? `${getWallet(current.provider)?.title ?? ""} · ${name}`
                : name
            }
            address={initial.address}
          />
          <ButtonTransparent onClick={() => setChoosing(true)}>
            <Text fs="p4" color={getToken("textButtons.small.rest")}>
              {t("deposit.v3.destination.different")}
            </Text>
          </ButtonTransparent>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="tertiary" size="large" width="100%" onClick={onBack}>
          {t("common:back")}
        </Button>
        <Button
          variant="secondary"
          size="large"
          width="100%"
          onClick={() => onSelect(initial.address, current)}
        >
          {t("deposit.v3.destination.continue", { name })}
        </Button>
      </ModalFooter>
    </>
  )
}
