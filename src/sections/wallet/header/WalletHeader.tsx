import { useTranslation } from "react-i18next"
import { useAccountStore } from "../../../state/store"
import { Text } from "components/Typography/Text/Text"
import { useCopyToClipboard } from "react-use"
import { ReactComponent as CopyIcon } from "assets/icons/CopyIcon.svg"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { WalletConnectModal } from "../connect/modal/WalletConnectModal"
import { useState } from "react"
import { WalletInactiveButton } from "../connect/modal/WalletConnectButton"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"

export const WalletHeader = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [, copy] = useCopyToClipboard()
  const [open, setOpen] = useState(false)

  const hydraAddress = account
    ? encodeAddress(decodeAddress(account?.address), HYDRA_ADDRESS_PREFIX)
    : ""

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
        <Text fs={20} fw={500} lh={20} font="FontOver">
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
                sx={{ maxWidth: ["calc(100vw - 60px)", "fit-content"] }}
                css={{ wordWrap: "break-word" }}
              >
                {hydraAddress}
              </Text>
              <InfoTooltip
                text={t("wallet.header.copyAddress.hover")}
                textOnClick={t("wallet.header.copyAddress.click")}
              >
                <CopyIcon
                  sx={{ color: "brightBlue300" }}
                  css={{ cursor: "pointer" }}
                  onClick={() => copy(hydraAddress)}
                />
              </InfoTooltip>
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
