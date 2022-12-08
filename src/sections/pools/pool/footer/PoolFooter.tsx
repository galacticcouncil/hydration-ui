import { Button } from "components/Button/Button"
import { SContainer } from "./PoolFooter.styled"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { Icon } from "components/Icon/Icon"

export const PoolFooter = () => {
  const { t } = useTranslation()
  return (
    <SContainer>
      <div sx={{ flex: "row", gap: 85 }}>
        <Text fs={[16, 16]}>
          Total locked $3 000 of which $1 000 not farming.
        </Text>
        <Text fs={[16, 16]}>$12 Claimable</Text>
      </div>
      <Button variant="primary" size="small" sx={{ width: 178 }}>
        <Icon icon={<WalletIcon />} />
        {t("pools.allFarms.modal.claim.submit")}
      </Button>
    </SContainer>
  )
}
