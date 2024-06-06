import CrossIcon from "assets/icons/CrossIcon.svg?react"
import {
  SSecondaryItem,
  SWarningMessageContainer,
  SWarningMessageContent,
} from "components/WarningMessage/WarningMessage.styled"
import { useTranslation } from "react-i18next"
import Star from "assets/icons/Star.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { Separator } from "components/Separator/Separator"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export type MigrationWarningProps = {
  onClick: () => void
  onClose?: () => void
}

export const MigrationWarning: React.FC<MigrationWarningProps> = ({
  onClick,
  onClose,
}) => {
  const { t } = useTranslation()

  const { account } = useAccount()
  const { balanceTotal, isLoading } = useWalletAssetsTotals({
    address: account?.address,
  })

  if (isLoading || balanceTotal?.isZero()) return null

  return (
    <SWarningMessageContainer onClick={onClick} variant="pink">
      <SSecondaryItem />
      <SWarningMessageContent sx={{ fontWeight: 600 }}>
        <Star width={12} height={12} sx={{ flexShrink: 0 }} />
        <div
          sx={{
            flex: ["column", "row"],
            align: ["start", "center"],
            gap: [6, 0],
          }}
        >
          {t("migration.warning.text")}
          <Separator
            orientation="vertical"
            color="black"
            size={1}
            sx={{
              display: ["none", "block"],
              height: 12,
              mx: 12,
              opacity: 0.25,
            }}
          />
          <span
            css={{
              whiteSpace: "nowrap",
              opacity: 0.7,
              "&:hover": { opacity: 1 },
            }}
          >
            {t("stats.tiles.link")}
            <LinkIcon sx={{ ml: 10, mb: -2 }} css={{ rotate: "45deg" }} />
          </span>
        </div>
      </SWarningMessageContent>
      <SSecondaryItem
        css={{
          justifyContent: "flex-end",
        }}
      >
        <CrossIcon
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
        />
      </SSecondaryItem>
    </SWarningMessageContainer>
  )
}
