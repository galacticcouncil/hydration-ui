import { Modal } from "components/Modal/Modal"
import { ComponentProps } from "react"
import { Text } from "components/Typography/Text/Text"
import { SCryptoBlock, SBlocks } from "./FundWalletModal.styled"
import KrakenLogo from "assets/icons/KrakenLogo.svg?react"
import { CryptoBlockTitle } from "./components/CryptoBlockTitle"
import { BlockContent } from "./components/BlockContent"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"

type Props = Pick<ComponentProps<typeof Modal>, "open" | "onClose">

export const FundWalletModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        disableCloseOutside
        title={t("fund.modal.title")}
        description={t("fund.modal.description")}
      >
        <SBlocks>
          <SCryptoBlock>
            <BlockContent
              title={<KrakenLogo />}
              description={t("fund.modal.kraken.description")}
              linkText={t("fund.modal.kraken.buy")}
              link="https://kraken.com"
              onLinkClick={onClose}
            />
          </SCryptoBlock>
          <Text fw={400} tAlign="center" color="basic400">
            {t("or")}
          </Text>
          <SCryptoBlock>
            <BlockContent
              title={<CryptoBlockTitle />}
              description={t("fund.modal.crypto.description")}
              linkText={t("fund.modal.crypto.buy")}
              link={LINKS.cross_chain}
              onLinkClick={onClose}
            />
          </SCryptoBlock>
        </SBlocks>
      </Modal>
    </>
  )
}
