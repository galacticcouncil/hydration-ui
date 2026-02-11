import { Button } from "components/Button/Button"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import {
  SContent,
  SFooter,
  SHeroImage,
  SSelectImage,
} from "./NextAppModal.styled"
import { useNextAppModalStore } from "./NextAppModal.utils"
import { useTranslation } from "react-i18next"
import { NEXT_APP_URL } from "utils/constants"

export const NextAppModal = () => {
  const { t } = useTranslation()
  const { isOpen, onClose } = useNextAppModalStore()

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContents
        sx={{ mt: "calc(var(--modal-header-height) * -1)" }}
        contents={[
          {
            headerVariant: "simple",
            noPadding: true,
            content: (
              <>
                <SHeroImage />
                <SContent>
                  <Text font="GeistMono" fs={[18, 24]} tAlign="center">
                    {t("next.banner.title")}
                  </Text>
                  <Text fs={14} lh={20} tAlign="center" color="basic400">
                    {t("next.banner.description")}
                  </Text>
                  <SSelectImage />
                  <Text fs={14} tAlign="center" color="basic400">
                    {t("next.banner.subtitle")}
                  </Text>
                </SContent>
                <Separator />
                <SFooter>
                  <Button variant="secondary" onClick={onClose}>
                    {t("next.banner.cta.skip")}
                  </Button>
                  <Button
                    variant="primary"
                    as="a"
                    onClick={onClose}
                    {...{ href: NEXT_APP_URL, target: "_blank" }}
                  >
                    {t("next.banner.cta.preview")}
                  </Button>
                </SFooter>
              </>
            ),
          },
        ]}
      />
    </Modal>
  )
}
