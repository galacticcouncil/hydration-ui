import { FC, ReactNode, useCallback, useEffect, useRef } from "react"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { mimirWallet } from "sections/web3-connect/wallets"

type Props = {
  readonly children: ReactNode
}

export const MimirProvider: FC<Props> = ({ children }) => {
  const { account, setAccount } = useWeb3ConnectStore()
  const isMimirRef = useRef(false)

  const initAccount = useCallback(async () => {
    const mimirAccount = await mimirWallet.getMimirAccount()

    if (mimirAccount.address === account?.address) {
      return
    }

    setAccount({
      provider: WalletProviderType.MimirWallet,
      address: mimirAccount.address,
      name: mimirAccount.name ?? mimirAccount.address,
    })
  }, [account?.address, setAccount])

  useEffect(() => {
    const initMimir = async () => {
      const isMimir = isMimirRef.current || (await mimirWallet.init())

      if (isMimir) {
        isMimirRef.current = true
        await initAccount()
      }
    }

    initMimir()
  }, [initAccount])

  useEffect(() => {
    if (isMimirRef.current) {
      initAccount()
    }
  }, [initAccount])

  return children
}
