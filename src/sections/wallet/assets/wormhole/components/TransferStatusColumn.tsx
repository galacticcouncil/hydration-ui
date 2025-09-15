import { WhStatus, WhTransfer } from "@galacticcouncil/xcm-sdk"
import { useTranslation } from "react-i18next"
import { RedeemButton } from "sections/wallet/assets/wormhole/components/RedeemButton"

export type StatusColumnProps = {
  transfer: WhTransfer
}

export const TransferStatusColumn: React.FC<StatusColumnProps> = ({
  transfer,
}) => {
  const { t } = useTranslation()

  const { status, redeem } = transfer

  switch (status) {
    case WhStatus.Completed:
      return (
        <span sx={{ color: "green400" }}>{t("wormhole.status.completed")}</span>
      )
    case WhStatus.WaitingForVaa:
      return (
        <span sx={{ color: "warning300" }}>
          {t("wormhole.status.processing")}
        </span>
      )
    case WhStatus.VaaEmitted:
      if (!redeem) {
        return (
          <span sx={{ color: "warning300" }}>
            {t("wormhole.status.processing")}
          </span>
        )
      }
      return <RedeemButton transfer={transfer} />
    default:
      return <span sx={{ color: "basic400" }}>-</span>
  }
}
