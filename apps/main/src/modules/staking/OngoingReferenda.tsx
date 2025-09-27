import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OngoingReferendaEmptyState } from "@/modules/staking/OngoingReferendaEmptyState"
import { Referenda } from "@/modules/staking/Referenda"

// TODO integrate
const referenda = [
  {
    id: "1",
    title: "Accept Moonbeam HRMP & on-chain remark",
    tags: ["ROOT", "PREPARING"],
    number: 75,
    percent: 66,
    ayeValue: "28610000",
    ayePercent: 100,
    thresholdValue: "28610000",
    thresholdPercent: 100,
    nayValue: "0",
    nayPercent: 0,
    end: new Date(Date.now() + 1000000000),
  },
] satisfies Array<Referenda>

export const OngoingReferenda: FC = () => {
  const { t } = useTranslation("staking")

  return (
    <Flex direction="column" gap={getTokenPx("scales.paddings.base")}>
      {referenda.length ? (
        <Flex gap={20}>
          {referenda.map((item) => (
            <Referenda key={item.id} item={item} />
          ))}
        </Flex>
      ) : (
        <OngoingReferendaEmptyState />
      )}
      <Text
        fw={500}
        fs={13}
        lh={1.4}
        color={getToken("text.tint.primary")}
        align="center"
      >
        {t("referenda.participate")}
      </Text>
    </Flex>
  )
}
