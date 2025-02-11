import "react18-json-view/src/style.css"

import { ResponsiveStyleValue } from "@theme-ui/css"
import { forwardRef } from "react"
import ReactJsonView, {
  JsonViewProps as ReactJsonViewProps,
} from "react18-json-view"

import { SRoot } from "./JsonView.styled"

export type JsonViewProps = ReactJsonViewProps & {
  fs?: ResponsiveStyleValue<number>
}

export const JsonView = forwardRef<HTMLDivElement, JsonViewProps>(
  ({ fs, ...props }, ref) => {
    return (
      <SRoot ref={ref} sx={{ fontSize: fs }}>
        <ReactJsonView
          collapseStringsAfterLength={40}
          enableClipboard={false}
          {...props}
        />
      </SRoot>
    )
  },
)

JsonView.displayName = "JsonView"
