import { ApiPromise } from "@polkadot/api"
import { createContext, useContext } from "react"

export const ApiPromiseContext = createContext<ApiPromise>({} as ApiPromise)
export const useApiPromise = () => useContext(ApiPromiseContext)

export const BASILISK_ADDRESS_PREFIX = 10041
export const NATIVE_ASSET_ID = "0"
export const DEPOSIT_CLASS_ID = "1000000" // TODO: replace with constant from api
export const POLKADOT_APP_NAME = "Basilisk Web App"
