import { ButtonTransparent } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  SContainer,
  SInput,
  SInputContainer,
} from "./ReviewTransactionAuthorTip.styled"
import { useDebounce } from "react-use"
import CrossIcon from "assets/icons/CrossIcon.svg?react"

type Props = {
  onChange?: (nonce: string) => void
  nonce?: string
}

export const ReviewTransactionNonce: FC<Props> = ({ onChange, nonce }) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState(nonce)
  const [visible, setVisible] = useState(false)

  useDebounce(
    () => {
      const value = amount ?? ""
      onChange?.(visible ? value : "")
    },
    300,
    [amount, visible],
  )

  const toggleVisible = () => {
    setAmount(nonce)
    setVisible((visible) => !visible)
  }

  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <div sx={{ flex: "row", gap: 6, align: "baseline" }}>
        {visible ? (
          <SContainer>
            <SInputContainer>
              <SInput
                type="number"
                sx={{ maxWidth: 60 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </SInputContainer>
          </SContainer>
        ) : (
          <Text fs={14}>{nonce}</Text>
        )}

        <ButtonTransparent
          onClick={toggleVisible}
          sx={{ flex: "row" }}
          css={{ alignSelf: "center" }}
        >
          <Text fs={14} color="brightBlue300">
            {visible ? (
              <CrossIcon />
            ) : (
              t("liquidity.reviewTransaction.modal.edit")
            )}
          </Text>
        </ButtonTransparent>
      </div>
    </div>
  )
}
