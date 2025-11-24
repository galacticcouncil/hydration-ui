import { Ref, useCallback, useRef } from "react"

/*
 * Use when you need to access element ref that is attaching to a parent ref
 */
export const useForwardElementRef = <TRef>(
  parentRef: Ref<TRef> | undefined,
) => {
  const ref = useRef<TRef | null>(null)

  return [
    ref,
    useCallback(
      (element: TRef | null) => {
        ref.current = element

        if (typeof parentRef === "function") {
          parentRef(element)
        } else if (parentRef) {
          parentRef.current = element
        }
      },
      [parentRef],
    ),
  ] as const
}
