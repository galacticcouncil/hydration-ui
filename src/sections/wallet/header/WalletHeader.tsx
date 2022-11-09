import { GradientText } from "../../../components/Typography/GradientText/GradientText"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "../../../state/store"
import { Text } from "../../../components/Typography/Text/Text"
import { useCopyToClipboard } from "react-use"
import { ReactComponent as CopyIcon } from "../../../assets/icons/CopyIcon.svg"
import { Button, ButtonTransparent } from "../../../components/Button/Button"
import { Separator } from "../../../components/Separator/Separator"
import { WalletConnectModal } from "../connect/modal/WalletConnectModal"
import { useState } from "react"
import { WalletInactiveButton } from "../connect/modal/WalletConnectButton"

export const WalletHeader = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [, copy] = useCopyToClipboard()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        sx={{ flex: "row", justify: "space-between", align: "center", pb: 16 }}
      >
        <GradientText fs={20} fw={600} lh={20}>
          {account?.name}
        </GradientText>
        {account?.address ? (
          <div sx={{ flex: "row", align: "center" }}>
            <div
              sx={{
                flex: "row",
                align: "center",
                gap: 8,
                mr: 50,
              }}
            >
              <Text color="primary300" fs={14} fw={500}>
                {account.address}
              </Text>
              <ButtonTransparent
                onClick={() => copy(account.address.toString())}
              >
                <CopyIcon
                  sx={{
                    color: "primary300",
                  }}
                />
              </ButtonTransparent>
            </div>
            <Button size="small" onClick={() => setOpen(true)}>
              {t("wallet.header.switchAccount")}
            </Button>
          </div>
        ) : (
          <WalletInactiveButton size="small" onOpen={() => setOpen(true)} />
        )}
      </div>
      <Separator color="white" opacity={0.12} />

      <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
