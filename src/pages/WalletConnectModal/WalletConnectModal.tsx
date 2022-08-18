import { css } from "styled-components/macro"

import { Text } from "components/Typography/Text/Text"
import { Modal } from "components/Modal/Modal"
import { Trans, useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { ExternalLink } from "components/Link/ExternalLink"
import { WalletButtonList } from "./WalletButtonList"

export function WalletConnectModal(props: {
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useTranslation("translation")
  return (
    <Modal
      width={460}
      open={props.isOpen}
      onClose={props.onClose}
      title={t("walletConnectModal.title")}
    >
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnectModal.description")}
      </Text>

      <WalletButtonList />

      <Text
        mt={20}
        mb={30}
        fs={14}
        fw={400}
        tAlign="center"
        color="neutralGray400"
      >
        <Trans t={t} i18nKey="walletConnectModal.terms">
          <ExternalLink href="/" color="orange100" />
        </Trans>
      </Text>

      <Separator
        ml={-30}
        color="white"
        opacity={0.06}
        css={css`
          width: calc(100% + 60px);
        `}
      />

      <Text fw={400} mt={26} fs={14} tAlign="center" color="neutralGray400">
        <Trans t={t} i18nKey="walletConnectModal.learn">
          <ExternalLink href="/" color="primary450" />
        </Trans>
      </Text>
    </Modal>
  )
}
