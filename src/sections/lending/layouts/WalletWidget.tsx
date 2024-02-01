import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid"
import {
  Button,
  Skeleton,
  SvgIcon,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { AvatarSize } from "sections/lending/components/Avatar"
import { UserDisplay } from "sections/lending/components/UserDisplay"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"

import {
  ENABLE_TESTNET,
  STAGING_ENV,
} from "sections/lending/utils/marketsAndNetworksConfig"
import { MobileCloseButton } from "./components/MobileCloseButton"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"

interface WalletWidgetProps {
  open: boolean
  setOpen: (value: boolean) => void
  headerHeight: number
}

export default function WalletWidget({
  open,
  setOpen,
  headerHeight,
}: WalletWidgetProps) {
  const { connected, loading, readOnlyModeAddress } = useWeb3Context()

  const { toggle: setWalletModalOpen } = useWeb3ConnectStore()

  const { breakpoints } = useTheme()
  const xsm = useMediaQuery(breakpoints.down("xsm"))
  const md = useMediaQuery(breakpoints.down("md"))

  const hideWalletAccountText =
    xsm && (ENABLE_TESTNET || STAGING_ENV || readOnlyModeAddress)

  return (
    <>
      {md && connected && open ? (
        <MobileCloseButton setOpen={setOpen} />
      ) : loading ? (
        <Skeleton height={36} width={126} sx={{ background: "#383D51" }} />
      ) : (
        <>
          {connected ? (
            <Button
              variant={connected ? "surface" : "gradient"}
              aria-label="wallet"
              id="wallet-button"
              aria-controls={open ? "wallet-button" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-haspopup="true"
              onClick={() => setWalletModalOpen()}
              sx={{
                p: connected ? "5px 8px" : undefined,
                minWidth: hideWalletAccountText ? "unset" : undefined,
              }}
              endIcon={
                connected &&
                !hideWalletAccountText &&
                !md && (
                  <SvgIcon
                    sx={{
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </SvgIcon>
                )
              }
            >
              <UserDisplay
                avatarProps={{ size: AvatarSize.SM }}
                oneLiner={true}
                titleProps={{ variant: "buttonM" }}
              />
            </Button>
          ) : (
            <Web3ConnectModalButton />
          )}
        </>
      )}
    </>
  )
}
