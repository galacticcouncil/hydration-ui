import { ChevronDown, ChevronUp } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Icon,
  MicroButton,
  SectionHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { HDXIssuanceQuery } from "@/api/balances"
import { referendaTracksQuery } from "@/api/constants"
import { openGovReferendaQuery, TAccountVote } from "@/api/democracy"
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

  const { data: referenda = [], isPending: referendaLoading } = useQuery(
    openGovReferendaQuery(rpc),
  )

  const { data: tracksData, isLoading: tracksLoading } = useQuery(
    referendaTracksQuery(rpc),
  )

  const { data: totalIssuance, isLoading: totalIssuanceLoading } = useQuery(
    HDXIssuanceQuery(rpc),
  )

  const gridRef = useRef<HTMLDivElement>(null)

  const isLoading =
    referendaLoading || tracksLoading || isVotesLoading || totalIssuanceLoading

  // TODO use open gov referenda here

  return (
    <CollapsibleRoot open={!isCollapsed}>
      <Flex direction="column" gap="m">
        <Box>
          <Flex
            align={isMobile ? "center" : "flex-end"}
            pt={[null, null, "xl"]}
            justify="space-between"
          >
            <SectionHeader
              title={t("staking:referenda.title", {
                count: referenda.length,
              })}
              hasDescription
              noTopPadding
            />
            {!isLoading && referenda.length > 0 && (
              <MicroButton
                asChild
                sx={{ display: "flex", alignItems: "center", gap: "s" }}
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
                    fs="p6"
                    lh={1.4}
                    color={getToken("text.medium")}
                    transform="uppercase"
                  >
                    {isCollapsed ? t("show") : t("hide")}
                  </Text>
                  <Icon
                    size="xs"
                    component={isCollapsed ? ChevronDown : ChevronUp}
                    color={getToken("icons.onContainer")}
                  />
                </CollapsibleTrigger>
              </MicroButton>
            )}
          </Flex>
          <Text fs="p6" lh="s" color={getToken("text.medium")}>
            {t("staking:referenda.participate")}
          </Text>
        </Box>
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Flex>
    </CollapsibleRoot>
  )
}
