import Skeleton from "react-loading-skeleton"
import {
  SHeader,
  SOpenGovContainer,
  SProgressBarContainer,
  SVoteButton,
} from "./ReferendumCard.styled"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import VoteIcon from "assets/icons/StakingVote.svg?react"

export const ReferendaSkeleton = () => {
  const { t } = useTranslation()

  return (
    <SOpenGovContainer type="staking">
      <SHeader>
        <Skeleton height={13} width={164} />
      </SHeader>

      <Separator css={{ background: "#372244" }} sx={{ my: 16 }} />

      <div sx={{ px: 16 }}>
        <Skeleton height={23} width="100%" />

        <Spacer size={20} />

        <SProgressBarContainer>
          <div
            sx={{ flex: "row", gap: 6, height: 7 }}
            css={{
              "& > span": { width: "100%", position: "relative", top: -7 },
            }}
          >
            <Skeleton height={7} />
            <Skeleton height={7} />
          </div>
        </SProgressBarContainer>

        <Spacer size={20} />

        <SProgressBarContainer>
          <div
            sx={{ height: 7 }}
            css={{
              "& > span": { width: "100%", position: "relative", top: -7 },
            }}
          >
            <Skeleton height={7} />
          </div>
        </SProgressBarContainer>
      </div>

      <Separator css={{ background: "#372244" }} sx={{ my: 16 }} />

      <SVoteButton disabled sx={{ mx: 16 }}>
        <Icon icon={<VoteIcon />} />
        {t("referenda.btn.vote")}
      </SVoteButton>
    </SOpenGovContainer>
  )
}
