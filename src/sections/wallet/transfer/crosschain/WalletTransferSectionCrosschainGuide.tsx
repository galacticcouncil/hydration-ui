import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { WalletTransferCrosschainLogo } from "./WalletTransferCrosschainLogo"

export function WalletTransferSectionCrosschainGuide(props: {
  name: string
  icon: ReactNode
  children?: ReactNode
  onVisit: () => void
  onBack: () => void
}) {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <>
      <div
        sx={{
          flex: "column",
          align: "center",
          justify: "space-between",
          height: "calc(100% - var(--modal-content-padding))",
        }}
      >
        <div sx={{ flex: "column", align: "center" }}>
          <WalletTransferCrosschainLogo icon={props.icon} />

          <Spacer size={10} />

          <GradientText fs={20} lh={28} fw={600}>
            {t("wallet.assets.transfer.bridge.guide.title", {
              name: props.name,
            })}
          </GradientText>

          <Spacer size={20} />

          {props.children}

          <Spacer size={50} />
        </div>

        <div
          sx={{ flex: "row", gap: 12, justify: "space-between", width: "100%" }}
        >
          <Button variant="secondary" onClick={props.onBack}>
            {t("wallet.assets.transfer.cancel")}
          </Button>

          <Button variant="primary" onClick={props.onVisit}>
            {t("wallet.assets.transfer.bridge.guide.submit", {
              name: props.name,
            })}{" "}
            <LinkIcon />
          </Button>
        </div>
      </div>
    </>
  )
}
