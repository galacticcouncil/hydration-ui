import { Modal } from "components/Modal/Modal"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"

import { ReactComponent as TestnetIcon } from "assets/icons/TestnetIcon.svg"
import { Button } from "components/Button/Button"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"

export function TestnetModal(props: { onBack: () => void }) {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation("translation")

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div sx={{ flex: "column", gap: 20, align: "center" }}>
        <div sx={{ flex: "column", gap: 10, align: "center" }}>
          <TestnetIcon />
          <GradientText
            fw={700}
            fs={28}
            tAlign="center"
            css={{ maxWidth: 300 }}
          >
            {t("testnet.modal.title")}
          </GradientText>
        </div>

        <div sx={{ flex: "column", gap: 20, maxWidth: 450 }}>
          <Text fs={14} fw={500} color="basic400">
            {t("testnet.modal.description.1.text")}
          </Text>

          <Text fs={14} fw={500} color="basic400">
            {t("testnet.modal.description.2.text")}
          </Text>

          <Text fs={14} fw={500} color="basic400">
            <Trans t={t} i18nKey="testnet.modal.description.3.text">
              <a sx={{ fontWeight: 700 }} href="https://sentry.io/privacy/">
                &nbsp;
              </a>
            </Trans>
          </Text>

          <Text fs={14} fw={500} color="warning300">
            {t("testnet.modal.description.4.text")}
          </Text>
        </div>
      </div>

      <div
        sx={{
          flex: ["column", "row"],
          justify: "space-between",
          gap: 10,
          mt: 40,
        }}
      >
        <Button onClick={props.onBack}>{t("testnet.modal.back")}</Button>

        <Button variant="primary" onClick={() => setOpen(false)}>
          {t("testnet.modal.enter")}
        </Button>
      </div>
    </Modal>
  )
}
