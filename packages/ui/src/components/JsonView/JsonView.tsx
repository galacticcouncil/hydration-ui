import "react18-json-view/src/style.css"

import { safeStringify } from "@galacticcouncil/utils"
import { ResponsiveStyleValue } from "@theme-ui/css"
import React, { FC, lazy, Ref, Suspense } from "react"
import { type JsonViewProps as ReactJsonViewProps } from "react18-json-view"

import { Spinner } from "@/components/Spinner"

import { SRoot } from "./JsonView.styled"

const ReactJsonView = lazy(() => import("react18-json-view"))

export type JsonViewProps = ReactJsonViewProps & {
  className?: string
  fs?: ResponsiveStyleValue<number>
}

export const JsonView: FC<JsonViewProps & { ref?: Ref<HTMLDivElement> }> = ({
  fs,
  className,
  ref,
  ...props
}) => {
  return (
    <SRoot ref={ref} className={className} sx={{ fontSize: fs }}>
      <Suspense fallback={<JsonViewFallback src={props.src} />}>
        <ReactJsonView
          collapseStringsAfterLength={42}
          enableClipboard={false}
          {...props}
        />
      </Suspense>
    </SRoot>
  )
}

export const JsonViewFallback: React.FC<{ src: ReactJsonViewProps["src"] }> = ({
  src,
}) => (
  <pre>
    {safeStringify(src, true)}
    <Spinner />
  </pre>
)
