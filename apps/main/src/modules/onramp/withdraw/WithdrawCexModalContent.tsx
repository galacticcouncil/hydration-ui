import {
  FC,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { AssetConfig, CexId, OnrampScreen } from "@/modules/onramp/types"

import { WithdrawCexContext, WithdrawCexState } from "./WithdrawCex.context"
import { WithdrawCexModalSteps } from "./WithdrawCexModalSteps"

export const WithdrawCexModalContent: FC = () => {
  const page = useOnrampModal((state) => state.withdrawPage)
  const paginateWithdraw = useOnrampModal((state) => state.paginateWithdraw)
  const mounted = useRef(true)

  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const paginateTo = useCallback(
    (nextPage: OnrampScreen) => {
      if (mounted.current) paginateWithdraw(nextPage)
    },
    [paginateWithdraw],
  )
  const [asset, setAsset] = useState<AssetConfig | null>(null)
  const [cexId, setCexId] = useState(CexId.Kraken)
  const [amount, setAmount] = useState("")
  const context = useMemo<WithdrawCexState>(
    () => ({
      page,
      asset,
      cexId,
      amount,
      setAsset,
      setCexId,
      setAmount,
      paginateTo,
      reset: () => {
        setAsset(null)
        setCexId(CexId.Kraken)
        setAmount("")
      },
    }),
    [page, asset, cexId, amount, paginateTo],
  )

  return (
    <WithdrawCexContext.Provider value={context}>
      <WithdrawCexModalSteps />
    </WithdrawCexContext.Provider>
  )
}
