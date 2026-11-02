import type { DepositWalletFirstFlow } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"

/** The full flow requires a recipient choice after every asset selection. */
export const depositStepAfterAsset = (flow: DepositWalletFirstFlow) =>
  flow === "connected"
    ? OnrampScreen.DepositOnchainDestination
    : OnrampScreen.DepositOnchainForm

/** Changing a source on an existing form retains the explicitly chosen recipient. */
export const depositStepAfterSource = (
  flow: DepositWalletFirstFlow,
  destinationAddress: string,
) =>
  flow === "connected" && !destinationAddress
    ? OnrampScreen.DepositOnchainDestination
    : OnrampScreen.DepositOnchainForm
