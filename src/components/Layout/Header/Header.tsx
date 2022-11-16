import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { ReactComponent as BasiliskLogo } from "assets/icons/BasiliskLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SHeader } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { IconButton } from "components/IconButton/IconButton"
import { ReactComponent as BellIcon } from "assets/icons/BellIcon.svg"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"

export const Header = () => {
  const { setSidebar } = useToast()
  const { t } = useTranslation()
  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "row", align: "center" }}>
          <Icon size={32} icon={<BasiliskIcon />} sx={{ mr: 11 }} />
          <Icon sx={{ mr: 60, display: ["none", "inherit"] }}>
            <BasiliskLogo />
          </Icon>
          <HeaderMenu />
        </div>

        <div sx={{ flex: "row", align: "center", gap: [12, 24] }}>
          <IconButton
            icon={<BellIcon />}
            name={t("toast.sidebar.title")}
            sx={{ color: "neutralGray300" }}
            onClick={() => setSidebar(true)}
          />

          <WalletConnectButton />
        </div>
      </div>
    </SHeader>
  )
}
