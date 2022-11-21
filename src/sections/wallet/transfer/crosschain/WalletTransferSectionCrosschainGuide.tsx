import { Button } from "components/Button/Button"
import { ModalMeta } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { useTranslation } from "react-i18next"
import { ReactNode } from "react"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { WalletTransferCrosschainLogo } from "./WalletTransferCrosschainLogo"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { useMedia } from "react-use"
import { theme } from "theme"

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
      <ModalMeta
        title={undefined}
        secondaryIcon={
          isDesktop
            ? {
                icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
                name: "Back",
                onClick: props.onBack,
              }
            : undefined
        }
      />

      <div
        sx={{
          flex: "column",
          align: "center",
          justify: "space-between",
          height: "100%",
        }}
      >
        <div sx={{ flex: "column", align: "center" }}>
          <WalletTransferCrosschainLogo icon={props.icon} />

          <Spacer size={10} />

          <GradientText fs={20} lh={28} fw={600}>
            {t("wallet.assets.transfer.crosschain.guide.title", {
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
            {t("wallet.assets.transfer.crosschain.guide.submit", {
              name: props.name,
            })}{" "}
            <LinkIcon />
          </Button>
        </div>
      </div>
    </>
  )
}
