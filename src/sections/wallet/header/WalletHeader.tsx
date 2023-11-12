import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { Button } from "components/Button/Button"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useCopyToClipboard } from "react-use"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { SWalletHeader } from "./WalletHeader.styled"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"

export const WalletHeader = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { toggle: toggleWeb3Connect } = useWeb3ConnectStore()
  const [, copy] = useCopyToClipboard()

  const addressDisplay = account?.evmAddress
    ? account?.evmAddress
    : account?.address
    ? encodeAddress(decodeAddress(account.address), HYDRA_ADDRESS_PREFIX)
    : ""

  return (
    <>
      <SWalletHeader>
        <Text fs={20} fw={500} lh={20} font="FontOver">
          {account?.name ?? t("wallet.header.noAccountSelected")}
        </Text>
        {addressDisplay && (
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
                {addressDisplay}
              </Text>
              <InfoTooltip
                text={t("wallet.header.copyAddress.hover")}
                textOnClick={t("wallet.header.copyAddress.click")}
              >
                <CopyIcon
                  sx={{ color: "brightBlue300" }}
                  css={{ cursor: "pointer" }}
                  onClick={() => copy(addressDisplay)}
                />
              </InfoTooltip>
            </div>
            <Button
              size="small"
              variant="primary"
              sx={{ display: ["none", "inherit"] }}
              onClick={toggleWeb3Connect}
            >
              {t("wallet.header.switchAccount")}
            </Button>
          </div>
        )}
      </SWalletHeader>
      <Separator
        color="white"
        opacity={0.12}
        sx={{ display: ["none", "inherit"] }}
      />
    </>
  )
}
