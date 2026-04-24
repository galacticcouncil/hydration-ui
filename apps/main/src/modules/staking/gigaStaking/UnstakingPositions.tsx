import {
  Flex,
  Pagination,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { UnstakingPosition } from "@/modules/staking/gigaStaking/UnstakingPosition"

const POSITIONS = [
  { id: "1", value: "2333", displayValue: "22333", remaining: 22 },
  { id: "22", value: "2333", displayValue: "22333", remaining: 0 },
  { id: "2", value: "2333", displayValue: "22333", remaining: 33 },
  { id: "3", value: "2333", displayValue: "22333", remaining: 44 },
]

const MAX_ITEMS_PER_PAGE = 3

export const UnstakingPositions: FC = () => {
  const { t } = useTranslation("staking")
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const visiblePositions = POSITIONS.slice(
    (currentPage - 1) * MAX_ITEMS_PER_PAGE,
    currentPage * MAX_ITEMS_PER_PAGE,
  )

  return (
    <Paper asChild>
      <Flex direction="column" py="l">
        <Flex direction="column" gap="xs" px="l" pb="l">
          <Text
            font="primary"
            fw={500}
            fs="h7"
            lh={1}
            color={getToken("text.high")}
          >
            {t("gigaStaking.unstakingPositions.title")}
          </Text>
          <Text fs="p5" lh="m" color={getToken("text.medium")}>
            {t("gigaStaking.unstakingPositions.description")}
          </Text>
        </Flex>

        <Separator />

        <Flex direction="column" gap="m" px="l" pt="l">
          {visiblePositions.map((position) => (
            <UnstakingPosition key={position.id} {...position} />
          ))}
        </Flex>

        <Pagination
          totalPages={Math.ceil(POSITIONS.length / MAX_ITEMS_PER_PAGE)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </Flex>
    </Paper>
  )
}
