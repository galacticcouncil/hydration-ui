import Skeleton from "react-loading-skeleton"
import IconArrow from "assets/icons/IconArrow.svg?react"
import { Separator } from "components/Separator/Separator"
import { SContainer, SHeader } from "./ReferendumCard.styled"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"

export const ReferendumCardSkeleton = ({
  type,
}: {
  type: "toast" | "staking"
}) => {
  const { t } = useTranslation()

  const isToastCard = type === "toast"

  return (
    <SContainer type={type}>
      <SHeader>
        <Skeleton height={13} width={isToastCard ? 100 : 164} />
        <Icon sx={{ color: "brightBlue300" }} icon={<IconArrow />} />
      </SHeader>

      <Separator color="primaryA15Blue" opacity={0.35} sx={{ my: 16 }} />

      <Skeleton height={23} width="100%" />

      <Spacer size={20} />

      <div
        sx={{ flex: "row", gap: 8, justify: "space-between" }}
        css={{ "& > span": { width: "100%" } }}
      >
        <Skeleton height={4} />
        <Skeleton height={4} />
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text color="white" fs={14} fw={600}>
          {t("toast.sidebar.referendums.aye")}
        </Text>
        <Text color="white" fs={14} fw={600}>
          {t("toast.sidebar.referendums.nay")}
        </Text>
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Skeleton height={10} width={100} />
        <Skeleton height={10} width={100} />
      </div>
    </SContainer>
  )
}
