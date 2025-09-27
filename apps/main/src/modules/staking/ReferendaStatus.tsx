import { Box, Flex } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AyeDetails } from "@/modules/staking/AyeDetails"

type Props = {
  readonly percent: number
  readonly ayeValue: string
  readonly ayePercent: number
  readonly thresholdValue: string
  readonly thresholdPercent: number
  readonly nayValue: string
  readonly nayPercent: number
}

export const ReferendaStatus: FC<Props> = ({
  percent,
  ayeValue,
  ayePercent,
  thresholdValue,
  thresholdPercent,
  nayValue,
  nayPercent,
}) => {
  const { t } = useTranslation(["staking"])

  return (
    <Flex direction="column" gap={16}>
      <Flex direction="column" gap={7}>
        <Flex direction="column" gap={7}>
          <Flex
            px={getTokenPx("scales.paddings.base")}
            py={7}
            bg="#4D525F1A"
            borderWidth={1}
            borderStyle="solid"
            borderColor="#7C7F8A33"
            borderRadius={12}
            gap={7}
          >
            <Box
              height={5}
              bg="#6FC272"
              width={`${percent}%`}
              borderRadius={7}
            />
            <Box
              height={5}
              bg="#FF5757"
              width={`${100 - percent}%`}
              borderRadius={7}
            />
          </Flex>
        </Flex>
        <Flex pb={7} justify="space-between">
          <AyeDetails
            label={t("staking:referenda.item.aye")}
            labelProps={{ color: getToken("text.lowest") }}
            value={ayeValue}
            percent={ayePercent}
          />
          <AyeDetails
            label={t("staking:referenda.item.threshold")}
            labelProps={{
              color: getToken("surfaces.containers.low.onPrimary"),
              align: "center",
            }}
            value={thresholdValue}
            percent={thresholdPercent}
          />
          <AyeDetails
            label={t("staking:referenda.item.nay")}
            labelProps={{ color: getToken("text.lowest"), align: "right" }}
            value={nayValue}
            percent={nayPercent}
          />
        </Flex>
      </Flex>
      <Flex py={7} direction="column" gap={7}>
        <Box
          px={getTokenPx("scales.paddings.base")}
          py={7}
          bg="#4D525F1A"
          borderWidth={1}
          borderStyle="solid"
          borderColor="#7C7F8A33"
          borderRadius={12}
          gap={7}
        >
          <Box
            height={5}
            bg={getToken("text.tint.secondary")}
            borderRadius={7}
            width="25%"
          />
        </Box>
        <Flex justify="space-between">
          <AyeDetails percent={0} />
          <AyeDetails
            label={t("staking:referenda.item.threshold")}
            value={"28610000"}
            percent={100}
          />
          <AyeDetails percent={47.7} />
        </Flex>
      </Flex>
    </Flex>
  )
}
