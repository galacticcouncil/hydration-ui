import { ChevronDown, ChevronUp } from "@galacticcouncil/ui/assets/icons"
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Icon,
  SectionHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { HDXIssuanceQuery } from "@/api/balances"
import { referendaTracksQuery } from "@/api/constants"
import { govReferendaQuery, TAccountVote } from "@/api/democracy"
import { OngoingReferendaEmptyState } from "@/modules/staking/OngoingReferendaEmptyState"
import { Referenda } from "@/modules/staking/Referenda"
import { SReferendaList } from "@/modules/staking/Referenda.styled"
import { ReferendaSkeleton } from "@/modules/staking/ReferendaSkeleton"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly votes: ReadonlyArray<TAccountVote>
  readonly isVotesLoading: boolean
}

export const OngoingReferenda: FC<Props> = ({ votes, isVotesLoading }) => {
  const { t } = useTranslation(["common", "staking"])
  const { isMobile } = useBreakpoints()

  const rpc = useRpcProvider()

  const [isCollapsed, setIsCollapsed] = useState(isMobile)

  const { data: govReferendaData, isPending: govLoading } = useQuery(
    govReferendaQuery(rpc),
  )

  const referenda =
    govReferendaData
      ?.filter((referendum) => referendum.type === "Ongoing")
      .map(({ id, value }) => ({ id, ...value })) ?? []

  const { data: tracksData, isLoading: tracksLoading } = useQuery(
    referendaTracksQuery(rpc),
  )

  const { data: totalIssuance, isLoading: totalIssuanceLoading } = useQuery(
    HDXIssuanceQuery(rpc),
  )

  const gridRef = useRef<HTMLDivElement>(null)

  const isLoading =
    govLoading || tracksLoading || isVotesLoading || totalIssuanceLoading

  return (
    <CollapsibleRoot open={!isCollapsed}>
      <Flex align={isMobile ? "center" : "flex-start"} justify="space-between">
        <SectionHeader>
          {t("staking:referenda.title", { count: referenda.length })}
        </SectionHeader>
        {!isLoading && referenda.length > 0 && (
          <Flex
            px={getTokenPx("scales.paddings.base")}
            height={22}
            py={8}
            bg={getToken("buttons.secondary.low.rest")}
            borderRadius={20}
            borderWidth={1}
            borderStyle="solid"
            borderColor={getToken("buttons.secondary.low.borderRest")}
            align="center"
            gap={getTokenPx("containers.paddings.quint")}
            asChild
          >
            <CollapsibleTrigger
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setIsCollapsed((prev) => !prev)

                if (!isMobile) {
                  setTimeout(() => {
                    gridRef.current?.scrollIntoView({ behavior: "smooth" })
                  }, 0)
                }
              }}
            >
              <Text
                fw={500}
                fs={10}
                lh={1.4}
                color={getToken("text.medium")}
                transform="uppercase"
              >
                {isCollapsed ? t("show") : t("hide")}
              </Text>
              <Icon
                size={12}
                component={isCollapsed ? ChevronDown : ChevronUp}
                color={getToken("icons.onContainer")}
              />
            </CollapsibleTrigger>
          </Flex>
        )}
      </Flex>
      <CollapsibleContent>
        <Flex direction="column" gap={getTokenPx("scales.paddings.base")}>
          {isLoading && (
            <SReferendaList>
              {Array(isMobile ? 1 : 3)
                .fill(0)
                .map((_, i) => (
                  <ReferendaSkeleton key={i} />
                ))}
            </SReferendaList>
          )}
          {!isLoading &&
            (referenda.length ? (
              <SReferendaList ref={gridRef}>
                {referenda.map((item) => {
                  const track = tracksData?.get(item.track)
                  const voted = !!votes.some((vote) => vote.id === item.id)

                  return (
                    <Referenda
                      key={item.id}
                      id={item.id}
                      item={item}
                      track={track}
                      totalIssuance={totalIssuance}
                      voted={voted}
                    />
                  )
                })}
              </SReferendaList>
            ) : (
              <OngoingReferendaEmptyState />
            ))}
          <Text
            fw={500}
            fs={13}
            lh={1.4}
            color={getToken("text.tint.primary")}
            align="center"
          >
            {t("staking:referenda.participate")}
          </Text>
        </Flex>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
