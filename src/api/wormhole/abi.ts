import { Abi } from "@galacticcouncil/xcm-core"
import { type META } from "@galacticcouncil/xcm-core/build/types/evm/abi/Meta"
import { type TOKEN_BRIDGE } from "@galacticcouncil/xcm-core/build/types/evm/abi/TokenBridge"
import { type ERC20 } from "@galacticcouncil/xcm-core/build/types/evm/abi/Erc20"

export const Erc20 = Abi.Erc20 as typeof ERC20
export const Meta = Abi.Meta as typeof META
export const TokenBridge = Abi.TokenBridge as typeof TOKEN_BRIDGE
