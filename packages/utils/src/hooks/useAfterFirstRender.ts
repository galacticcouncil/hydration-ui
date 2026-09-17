import { useDeferredValue } from "react"

/**
 * False on the first render, true from the background re-render React schedules
 * right after it.
 *
 * Use it to hold back work that would block the browser from painting the
 * initial UI - an expensive synchronous decode, a heavy query, a large tree -
 * until the cheap version is on screen.
 */
export const useAfterFirstRender = () => useDeferredValue(true, false)
