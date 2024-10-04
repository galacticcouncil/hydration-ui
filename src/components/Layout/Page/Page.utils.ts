import { useSearch } from "@tanstack/react-location"
import { useEffect, useRef } from "react"
import { useLocation } from "react-use"

export const useControlScroll = () => {
  const location = useLocation()
  const { id } = useSearch<{
    Search: {
      id?: number
    }
  }>()
  const ref = useRef<HTMLDivElement>(null)

  const { pathname } = location

  const poolId = pathname?.includes("liquidity") ? id : undefined

  useEffect(() => {
    console.log("Scroll")
    ref.current?.scrollTo({
      top: 0,
      left: 0,
    })
    window.scrollTo({
      top: 0,
      left: 0,
    })
  }, [pathname, poolId])

  return ref
}
