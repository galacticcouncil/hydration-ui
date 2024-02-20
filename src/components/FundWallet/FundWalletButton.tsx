import { FC, useState } from "react"
import { Button, ButtonProps } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { FundWalletModal } from "./FundWalletModal"

export const FundWalletButton: FC<ButtonProps> = (props) => {
  const { t } = useTranslation()
  const [isFundModalOpen, setIsFundModalOpen] = useState(false)
  return (
    <>
      <Button type="button" {...props} onClick={() => setIsFundModalOpen(true)}>
        {props.children ?? t("fund.button")}
      </Button>
      {isFundModalOpen && (
        <FundWalletModal open onClose={() => setIsFundModalOpen(false)} />
      )}
    </>
  )
}
