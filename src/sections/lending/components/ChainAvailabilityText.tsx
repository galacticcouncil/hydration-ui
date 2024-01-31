import { ChainId } from "@aave/contract-helpers"
import { Box, BoxProps, Typography } from "@mui/material"
import {
  BaseNetworkConfig,
  networkConfigs,
} from "sections/lending/ui-config/networksConfig"

type ChainAvailabilityTextProps = {
  chainId: ChainId
  wrapperSx: BoxProps["sx"]
}

const networkToTextMapper = (
  chainId: ChainId,
  networkConfig: BaseNetworkConfig,
) => {
  switch (chainId) {
    case ChainId.mainnet:
      return "Ethereum Mainnet"
    default:
      return networkConfig.name
  }
}

export const ChainAvailabilityText: React.FC<ChainAvailabilityTextProps> = ({
  chainId,
  wrapperSx,
}) => {
  const network = networkConfigs[chainId]

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...wrapperSx }}>
      <Typography variant="subheader2" sx={{ mr: 8, color: "#C0CBF6" }}>
        <span>Available on</span>
      </Typography>
      <Box
        sx={{
          height: 16,
          width: 16,
        }}
      >
        <img
          src={network.networkLogoPath}
          height="100%"
          width="100%"
          alt="Ethereum Mainnet"
        />
      </Box>
      <Typography variant="subheader2" sx={{ ml: 4, color: "#C0CBF6" }}>
        {networkToTextMapper(chainId, network)}
      </Typography>
    </Box>
  )
}
