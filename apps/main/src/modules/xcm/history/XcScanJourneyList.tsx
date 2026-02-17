import { Pagination, Stack } from "@galacticcouncil/ui/components"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useState } from "react"

import { XcJourneyCard } from "./XcJourneyCard"

type Props = {
  readonly data: XcJourney[]
  readonly pageSize?: number
}

export const XcScanJourneyList = ({ data, pageSize = 10 }: Props) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Stack gap="base" maxWidth="6xl" width="100%" mx="auto">
      <Stack gap="base">
        {paginatedData.map((journey) => (
          <XcJourneyCard key={journey.correlationId} {...journey} />
        ))}
      </Stack>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </Stack>
  )
}
