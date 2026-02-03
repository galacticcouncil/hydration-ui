import { Check } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { ReferendaSeparator } from "@/modules/staking/ReferendaSeparator"

type Props = {
  readonly track: string | undefined
  readonly state: string
  readonly number: number
  readonly voted: boolean
  readonly title: string
  readonly isTitledLoading: boolean
}

export const ReferendaHeader: FC<Props> = ({
  track,
  state,
  number,
  title,
  isTitledLoading,
  voted,
}) => {
  const { t } = useTranslation(["staking"])

  return (
    <Flex direction="column" gap="l">
      <Flex justify="space-between" align="center">
        <Flex py="s" align="center" gap="s" wrap>
          {track && (
            <Chip
              sx={{ textTransform: "uppercase" }}
              rounded
              variant="tertiary"
            >
              {track.replaceAll("_", " ")}
            </Chip>
          )}
          <Chip sx={{ textTransform: "uppercase" }} rounded variant="green">
            {state}
          </Chip>
        </Flex>
        <Flex align="center" gap="s">
          <Text
            font="primary"
            fs="p3"
            lh={1.3}
            color={
              voted ? getToken("text.medium") : getToken("text.tint.primary")
            }
          >
            #{number}
          </Text>
          {voted && (
            <Chip sx={{ textTransform: "uppercase" }} rounded variant="green">
              <Icon size="xs" component={Check} />
              {t("staking:referenda.item.voted")}
            </Chip>
          )}
        </Flex>
      </Flex>
      <ReferendaSeparator voted={voted} />
      {isTitledLoading ? (
        <Skeleton height={23} width="100%" />
      ) : (
        <Text
          py="s"
          fw={500}
          fs="p2"
          lh={1.3}
          color={
            voted
              ? getToken("text.high")
              : getToken("surfaces.containers.low.onPrimary")
          }
        >
          {title || "N/a"}
        </Text>
      )}
    </Flex>
  )
}
