import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"
import { TransferStatus } from "api/wormhole/types"
import { Button } from "components/Button/Button"

export type StatusColumnProps = {
  status: TransferStatus
  onRedeem?: () => void
}

export const TransferStatusColumn: React.FC<StatusColumnProps> = ({
  status,
  onRedeem,
}) => {
  const { account } = useAccount()
  const isEvm = !!account && isEvmAccount(account.address)

  switch (status) {
    case TransferStatus.Completed:
      return <span sx={{ color: "green400" }}>Completed</span>
    case TransferStatus.WaitingForVaa:
      return <span sx={{ color: "warning300" }}>Processing</span>
    case TransferStatus.VaaEmitted:
      const isRedeemable = !!onRedeem && isEvm
      return (
        <Button size="micro" onClick={onRedeem} disabled={!isRedeemable}>
          Redeem
        </Button>
      )
    default:
      return <span sx={{ color: "basic400" }}>-</span>
  }
}
