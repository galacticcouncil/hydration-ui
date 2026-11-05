import Bank3D from "@galacticcouncil/ui/assets/images/Bank3D.webp"
import SuccessStatus from "@galacticcouncil/ui/assets/images/SuccessStatusPlain.webp"
import Waiting3D from "@galacticcouncil/ui/assets/images/Waiting3D.webp"
import WarningStatus from "@galacticcouncil/ui/assets/images/WarningStatusPlain.webp"
import { Image } from "@galacticcouncil/ui/components"
import { FC } from "react"

type BankTransferStatusIllustrationProps = {
  status?: "waiting" | "success" | "warning" | "bank"
}

const illustrations = {
  bank: Bank3D,
  waiting: Waiting3D,
  success: SuccessStatus,
  warning: WarningStatus,
}

export const BankTransferStatusIllustration: FC<
  BankTransferStatusIllustrationProps
> = ({ status = "waiting" }) => (
  <Image
    src={illustrations[status]}
    alt=""
    aria-hidden
    lazy={false}
    sx={{ size: "3xl", objectFit: "contain" }}
  />
)
