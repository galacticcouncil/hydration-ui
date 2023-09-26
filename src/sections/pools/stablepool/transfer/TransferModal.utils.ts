import { ComponentProps, useRef, useState } from "react"
import { TransferOptions } from "./components/TransferOptions"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  ASSETS,
  WAIT,
  MOVE_TO_OMNIPOOL,
}

export type PathOption = ComponentProps<typeof TransferOptions>["selected"]

export const usePage = (initial = Page.OPTIONS) => {
  const [current, setCurrent] = useState(initial)
  const prevPage = useRef<Page[]>([initial])

  const prev = () => {
    setCurrent(prevPage.current.pop() ?? initial)
  }

  const set = (p: Page) => {
    prevPage.current.push(current)
    setCurrent(p)
  }

  return {
    currentPage: current,
    setPage: set,
    goBack: prev,
    path: prevPage.current,
  }
}
