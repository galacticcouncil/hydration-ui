import { Button } from "components/Button/Button"
import { ExternalLink } from "components/Link/ExternalLink"
import { Modal } from "components/Modal/Modal"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { useUpdateMetadataMutation } from "sections/wallet/upgrade/WalletUpgradeModal.utils"
import { ReactComponent as UpdateMetadataIcon } from "assets/icons/UpdateMetadataIcon.svg"
import { Spacer } from "components/Spacer/Spacer"
import { useState } from "react"
import {
  SVersionContainer,
  SVersion,
  SVersionArrow,
} from "./WalletUpgradeModal.styled"
import { useTranslation } from "react-i18next"

export function WalletUpgradeModal() {
  const { state, mutation } = useUpdateMetadataMutation()

  const [open, setOpen] = useState(true)
  const onClose = () => setOpen(false)
  const { t } = useTranslation()

  if (!state.data || !state.data.needsUpdate) return null
  return (
    <Modal open={open} onClose={onClose} width={460}>
      <div sx={{ flex: "column", align: "center" }}>
        <UpdateMetadataIcon />

        <Spacer size={12} />

        <GradientText fs={24} lh={32} fw={600} tAlign="center">
          {t("metadata.update.title")}
        </GradientText>

        <Spacer size={8} />

        <Text
          tAlign="center"
          fs={16}
          lh={22}
          color="neutralGray400"
          fw={400}
          css={{ maxWidth: 300 }}
        >
          {t("metadata.update.description")}
        </Text>

        <Spacer size={12} />

        <ExternalLink sx={{ color: "primary450" }} href="/">
          {t("metadata.update.link")}
        </ExternalLink>

        <Spacer size={40} />

        <SVersionContainer>
          <SVersion variant="left">
            <Text color="neutralGray400">
              {t("metadata.update.version.old")}
            </Text>
            <Text fs={20} fw={700} color="neutralGray400">
              {state.data?.currVersion ?? "-"}
            </Text>
          </SVersion>

          <SVersionArrow>
            <svg
              width="118"
              height="11"
              viewBox="0 0 118 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 5.5H117M117 5.5L112 0.5M117 5.5L112 10.5"
                stroke="#8AFFCB"
              />
            </svg>
          </SVersionArrow>

          <SVersion variant="right">
            <Text tAlign={["left", "right"]} color="primary450">
              {t("metadata.update.version.new")}
            </Text>
            <Text
              tAlign={["left", "right"]}
              fs={20}
              fw={700}
              color="primary300"
            >
              {state.data?.nextVersion}
            </Text>
          </SVersion>
        </SVersionContainer>

        <Spacer size={40} />

        <div
          sx={{ flex: ["column", "row"], gap: 16, justify: "space-between" }}
          css={{ alignSelf: "stretch" }}
        >
          <Button onClick={onClose}>{t("metadata.update.cancel")}</Button>
          <Button
            variant="primary"
            isLoading={mutation.isLoading}
            onClick={() => mutation.mutateAsync().then(onClose)}
          >
            {t("metadata.update.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
