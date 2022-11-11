import { useTranslation } from "react-i18next"
import { useAccountStore } from "../../../state/store"
import { Text } from "components/Typography/Text/Text"
import { useCopyToClipboard, useWindowSize } from "react-use"
import { ReactComponent as CopyIcon } from "assets/icons/CopyIcon.svg"
import { Button, ButtonTransparent } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { WalletConnectModal } from "../connect/modal/WalletConnectModal"
import { useState } from "react"
import { WalletInactiveButton } from "../connect/modal/WalletConnectButton"

export const WalletHeader = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [, copy] = useCopyToClipboard()
  const [open, setOpen] = useState(false)
  const { width } = useWindowSize()

  return (
    <>
      <div
        sx={{
          flex: ["column", "row"],
          justify: "space-between",
          align: ["start", "center"],
          pb: 16,
        }}
      >
        <Text fs={20} fw={500} lh={20} css={{ fontFamily: "FontOver" }}>
          {account?.name}
        </Text>
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
              <Text
                color="brightBlue300"
                fs={14}
                fw={500}
                sx={{ maxWidth: [width - 60, "fit-content"] }}
                css={{
                  wordWrap: "break-word",
                }}
              >
                {account.address}
              </Text>
              <ButtonTransparent
                onClick={() => copy(account.address.toString())}
              >
                <CopyIcon
                  sx={{
                    color: "brightBlue300",
                  }}
                />
              </ButtonTransparent>
            </div>
            <Button
              size="small"
              variant="primary"
              sx={{ display: ["none", "inherit"] }}
              onClick={() => setOpen(true)}
            >
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
