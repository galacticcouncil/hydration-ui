import { ChainId } from "@aave/contract-helpers"
import { Button, Typography } from "@mui/material"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"

import { Warning } from "sections/lending/components/primitives/Warning"

export type ChangeNetworkWarningProps = {
  funnel?: string
  networkName: string
  chainId: ChainId
}

export const ChangeNetworkWarning = ({
  networkName,
  chainId,
  funnel,
}: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3Context()

  const handleSwitchNetwork = () => {
    switchNetwork(chainId)
  }
  return (
    <Warning severity="error" icon={false}>
      {switchNetworkError ? (
        <Typography>
          <span>
            Seems like we can&apos;t switch the network automatically. Please
            check if you can change it from the wallet.
          </span>
        </Typography>
      ) : (
        <Typography variant="description">
          <span>Please switch to {networkName}.</span>{" "}
          <Button
            variant="text"
            sx={{ ml: "2px", verticalAlign: "top" }}
            onClick={handleSwitchNetwork}
            disableRipple
          >
            <Typography variant="description">
              <span>Switch Network</span>
            </Typography>
          </Button>
        </Typography>
      )}
    </Warning>
  )
}
