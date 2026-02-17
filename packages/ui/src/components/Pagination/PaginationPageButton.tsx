import { FC } from "react"

import { Button } from "@/components/Button"

export type PaginationPageButtonProps = {
  pageNumber: number
  isActive?: boolean
  onClick?: () => void
}

export const PaginationPageButton: FC<PaginationPageButtonProps> = ({
  pageNumber,
  isActive = false,
  onClick,
}) => {
  return (
    <Button
      size="small"
      variant={isActive ? "secondary" : "tertiary"}
      outline={!isActive}
      onClick={onClick}
      sx={{ px: "base", minWidth: "1.5rem" }}
    >
      {pageNumber}
    </Button>
  )
}
