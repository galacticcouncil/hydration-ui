import { SContainer, SInput } from "./ProviderInput.styled"
import { ChangeEvent, ReactNode } from "react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"
import { useTranslation } from "react-i18next"

type ProviderInputProps = {
  name: string
  value: string
  error?: string
  button: ReactNode

  onChange: (v: ChangeEvent<HTMLInputElement>) => void
}

export const ProviderInput = ({
  name,
  value,
  error,
  onChange,
  button,
}: ProviderInputProps) => {
  const { t } = useTranslation()
  return (
    <>
      <SContainer error={!!error}>
        <Icon sx={{ color: "basic500" }} icon={<PlusIcon />} />
        <SInput
          name={name}
          value={value}
          onChange={onChange}
          placeholder={t("rpc.change.modal.input.placeholdre")}
          autoComplete="off"
        />
        {button}
      </SContainer>
      {error && <SErrorMessage>{error}</SErrorMessage>}
    </>
  )
}
