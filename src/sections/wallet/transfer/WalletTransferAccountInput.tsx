import GuestIcon from "assets/icons/GuestIcon.svg?react"
import IconWalletSmall from "assets/icons/IconWalletSmall.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AddressInput } from "components/AddressInput/AddressInput"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Maybe } from "utils/helpers"
import {
  SAddressBookButton,
  SContainer,
  SIconContainer,
} from "./WalletTransferAccountInput.styled"
import { safeConvertAddressSS58 } from "utils/formatting"
import { safeConvertAddressH160 } from "utils/evm"

interface Props {
  name: string
  value: Maybe<string>
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
  label?: string
  placeholder?: string
  rightIcon?: ReactNode
  openAddressBook?: () => void
  className?: string
  hideNativeAddress?: boolean
}

export const WalletTransferAccountInput = (props: Props) => {
  const { t } = useTranslation()

  const isDisabled = !props.onChange

  const validAddress = props.value
    ? safeConvertAddressSS58(props.value, 0) ||
      safeConvertAddressH160(props.value)
    : ""

  return (
    <>
      <SContainer
        disabled={isDisabled}
        htmlFor={props.name}
        error={!!props.error}
        className={props.className}
      >
        <Text fs={11} color="basic500" tTransform={"uppercase"} sx={{ mb: 8 }}>
          {props.label}
        </Text>
        <div sx={{ flex: "row", align: "center" }}>
          <div>
            {validAddress ? (
              <AccountAvatar address={validAddress} size={30} />
            ) : (
              <SIconContainer>
                <GuestIcon width={30} height={30} />
              </SIconContainer>
            )}
          </div>

          {props.openAddressBook && (
            <SAddressBookButton type="button" onClick={props.openAddressBook}>
              <Text fs={11} lh={11} color="darkBlue100">
                {t("wallet.assets.transfer.dest.addressBook")}
              </Text>
              <IconWalletSmall />
            </SAddressBookButton>
          )}

          <AddressInput
            disabled={isDisabled}
            name={props.name}
            label={props.name}
            onBlur={props.onBlur}
            onChange={props.onChange}
            value={props.value}
            error={props.error}
            placeholder={props.placeholder}
            rightIcon={props.rightIcon}
            hideNativeAddress={props.hideNativeAddress}
          />
        </div>
      </SContainer>
      {props.error && <SErrorMessage>{props.error}</SErrorMessage>}
    </>
  )
}
