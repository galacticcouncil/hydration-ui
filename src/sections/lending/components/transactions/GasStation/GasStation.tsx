import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import { normalize } from "@aave/math-utils"
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"
import { Box, CircularProgress, Stack } from "@mui/material"
import { BigNumber } from "ethers/lib/ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import React, { ReactNode } from "react"
import { GasTooltip } from "sections/lending/components/infoTooltips/GasTooltip"
import { Warning } from "sections/lending/components/primitives/Warning"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import { usePoolReservesHumanized } from "sections/lending/hooks/pool/usePoolReserves"
import { useGasStation } from "sections/lending/hooks/useGasStation"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useRootStore } from "sections/lending/store/root"
import {
  getNetworkConfig,
  marketsData,
} from "sections/lending/utils/marketsAndNetworksConfig"
import invariant from "tiny-invariant"

import {
  GasPriceData,
  useGasPrice,
} from "sections/lending/hooks/useGetGasPrices"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { GasOption } from "./GasStationProvider"

export interface GasStationProps {
  gasLimit: BigNumber
  skipLoad?: boolean
  disabled?: boolean
  rightComponent?: ReactNode
  chainId?: number
}

export const getGasCosts = (
  gasLimit: BigNumber,
  gasOption: GasOption,
  customGas: string,
  gasData: GasPriceData,
  baseCurrencyUsd: string,
) => {
  const gasPrice =
    gasOption === GasOption.Custom
      ? parseUnits(customGas, "gwei").toString()
      : gasData[gasOption].legacyGasPrice
  return (
    Number(formatUnits(gasLimit.mul(gasPrice), 18)) *
    parseFloat(baseCurrencyUsd)
  )
}

export const GasStation: React.FC<GasStationProps> = ({
  gasLimit,
  skipLoad,
  disabled,
  rightComponent,
  chainId,
}) => {
  const { state } = useGasStation()
  const currentChainId = useRootStore((store) => store.currentChainId)
  const selectedChainId = chainId ?? currentChainId
  // TODO: find a better way to query base token price instead of using a random market.
  const marketOnNetwork = Object.values(marketsData).find(
    (elem) => elem.chainId === selectedChainId,
  )
  invariant(marketOnNetwork, "No market for this network")
  const { data: poolReserves } = usePoolReservesHumanized(marketOnNetwork)
  const { data: gasPrice } = useGasPrice(selectedChainId)
  const { walletBalances } = useWalletBalances(marketOnNetwork)
  const nativeBalanceUSD =
    walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD
  const { name, baseAssetSymbol } = getNetworkConfig(selectedChainId)

  const { loadingTxns } = useModalContext()

  const totalGasCostsUsd =
    gasPrice && poolReserves?.baseCurrencyData
      ? getGasCosts(
          gasLimit,
          state.gasOption,
          state.customGas,
          gasPrice,
          normalize(
            poolReserves?.baseCurrencyData.networkBaseTokenPriceInUsd,
            poolReserves?.baseCurrencyData.networkBaseTokenPriceDecimals,
          ),
        )
      : undefined

  return (
    <Stack gap={6} sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", mt: 6, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LocalGasStationIcon
            color="primary"
            sx={{ fontSize: "16px", mr: 6 }}
          />

          {loadingTxns && !skipLoad ? (
            <div sx={{ flex: "row", align: "center", height: 20 }}>
              <CircularProgress color="inherit" size="14px" sx={{ mr: 8 }} />
            </div>
          ) : totalGasCostsUsd && !disabled ? (
            <>
              <FormattedNumber
                value={totalGasCostsUsd}
                symbol="USD"
                color="text.secondary"
              />
              <GasTooltip />
            </>
          ) : (
            "-"
          )}
        </Box>
        {rightComponent}
      </Box>
      {!disabled && Number(nativeBalanceUSD) < Number(totalGasCostsUsd) && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Warning variant="warning" sx={{ mb: 0, mx: "auto" }}>
            You do not have enough {baseAssetSymbol} in your account to pay for
            transaction fees on {name} network. Please deposit {baseAssetSymbol}{" "}
            from another account.
          </Warning>
        </Box>
      )}
    </Stack>
  )
}
