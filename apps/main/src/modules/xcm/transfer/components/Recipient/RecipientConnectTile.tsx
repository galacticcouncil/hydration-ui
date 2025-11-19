import { AccountTile, Box, Button } from "@galacticcouncil/ui/components"
import { Account } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

type RecipientConnectTileProps = {
  account: Account
  walletLogoSrc?: string
  onSelect: () => void
  onConnect: () => void
}

export const RecipientConnectTile: React.FC<RecipientConnectTileProps> = ({
  account,
  walletLogoSrc,
  onSelect,
  onConnect,
}) => {
  const { t } = useTranslation("xcm")
  return (
    <Box position="relative">
      <AccountTile
        onClick={onSelect}
        active
        walletLogoSrc={walletLogoSrc}
        name={account.name}
        address={account.displayAddress}
        value=""
      />
      <Button
        onClick={onConnect}
        variant="accent"
        outline
        size="small"
        sx={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {t("change")}
      </Button>
    </Box>
  )
}
