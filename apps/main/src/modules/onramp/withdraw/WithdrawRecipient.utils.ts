import {
  accountPublicKey,
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"

import { isAccountValidOnChain } from "@/modules/xcm/transfer/utils/chain"

import type {
  WithdrawDestinationOption,
  WithdrawRecipient,
} from "./WithdrawAssetSelect.utils"

/** Destination choices must fit the selected account and exclude local self-transfers. */
export const getWithdrawRecipientRoutes = (
  routes: readonly WithdrawDestinationOption[],
  recipient: WithdrawRecipient,
  sourceAddress: string,
) =>
  routes.filter(
    ({ destinationChain }) =>
      isAddressValidOnChain(recipient.address, destinationChain) &&
      (!recipient.account ||
        isAccountValidOnChain(recipient.account, destinationChain)) &&
      !(
        destinationChain.key === HYDRATION_CHAIN_KEY &&
        accountPublicKey(recipient.address) === accountPublicKey(sourceAddress)
      ),
  )
