import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Pagination,
  Stack,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { gigaUnstakePositionsQuery } from "@/api/gigaStake"
import { GigaPendingPosition } from "@/modules/staking/gigaStaking/pendingPositions/GigaPendingPosition"
import { useRpcProvider } from "@/providers/rpcProvider"

const MAX_ITEMS_PER_PAGE = 3

export const PendingPositions: FC = () => {
  const { t } = useTranslation("staking")
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const { data: pendingPositions = [] } = useQuery(
    gigaUnstakePositionsQuery(rpc, account?.address ?? ""),
  )

  const visiblePositions = pendingPositions.slice(
    (currentPage - 1) * MAX_ITEMS_PER_PAGE,
    currentPage * MAX_ITEMS_PER_PAGE,
  )

  const visiblePositionsLength = visiblePositions.length

  useEffect(() => {
    if (visiblePositionsLength === 0) {
      setCurrentPage(Math.max(1, currentPage - 1))
    }
  }, [visiblePositionsLength, currentPage])

  if (!pendingPositions.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("gigaStaking.unstakingPositions.title")}</CardTitle>
        <CardDescription>
          {t("gigaStaking.unstakingPositions.description")}
        </CardDescription>
      </CardHeader>
      <CardBody>
        <Stack gap="m">
          {visiblePositions.map((position, index) => (
            <GigaPendingPosition
              key={`${position.voteAtBlock}-${index}`}
              {...position}
            />
          ))}

          {pendingPositions.length > MAX_ITEMS_PER_PAGE && (
            <Pagination
              totalPages={Math.ceil(
                pendingPositions.length / MAX_ITEMS_PER_PAGE,
              )}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
