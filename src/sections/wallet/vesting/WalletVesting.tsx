import { WalletVestingHeader } from "./WalletVestingHeader"
import { WalletVestingBox } from "./WalletVestingBox"

export const WalletVesting = () => (
  <div
    sx={{
      mt: 45,
    }}
  >
    <WalletVestingHeader />
    <WalletVestingBox />
  </div>
)
