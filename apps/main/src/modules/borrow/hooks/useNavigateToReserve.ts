import { useNavigate, useSearch } from "@tanstack/react-router"

export const useNavigateToReserve = () => {
  const { market } = useSearch({ from: "/borrow" })

  const navigate = useNavigate()

  return (address: string) =>
    navigate({
      to: "/borrow/markets/$address",
      params: { address },
      search: market ? { market } : {},
    })
}
