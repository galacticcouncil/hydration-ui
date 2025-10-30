import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"

import blastCampaignImage from "assets/images/blast-campaign.webp"
import { Trans, useTranslation } from "react-i18next"
import { CtaSeparator } from "sections/blast/components/CtaSeparator"

type BlastCampaignModalProps = {
  rewardApy: string
  open: boolean
  onClose: () => void
  onGetBitcoin: () => void
  onEarnOnUSDC: () => void
}

export const BlastCampaignModal: React.FC<BlastCampaignModalProps> = ({
  open,
  rewardApy,
  onClose,
  onGetBitcoin,
  onEarnOnUSDC,
}) => {
  const { t } = useTranslation()

  return (
    <Modal open={open} onClose={onClose} headerVariant="simple">
      <div sx={{ textAlign: "center" }}>
        <img
          loading="lazy"
          src={blastCampaignImage}
          width={304}
          height={182}
          alt=""
          sx={{ mb: 20, mx: "auto" }}
        />

        <Text font="GeistMonoSemiBold" fs={22} tAlign="center" sx={{ mb: 20 }}>
          {t("blast.campaign.title", { rewardApy })}
        </Text>

        <Text
          color="basic400"
          lh={20}
          fs={14}
          tAlign="center"
          sx={{ mb: 30, maxWidth: ["90%", "75%"], mx: "auto" }}
        >
          <Trans
            t={t}
            i18nKey="blast.campaign.description"
            tOptions={{ rewardApy }}
          >
            <span sx={{ color: "white" }} />
          </Trans>
        </Text>
      </div>
      <CtaSeparator />
      <div sx={{ flex: "row", justify: "space-between", gap: 12 }}>
        <Button onClick={onGetBitcoin} variant="secondary">
          {t("blast.campaign.cta.bitcoin")}
        </Button>
        <Button onClick={onEarnOnUSDC} variant="primary">
          {t("blast.campaign.cta.usdc")}
        </Button>
      </div>
    </Modal>
  )
}
