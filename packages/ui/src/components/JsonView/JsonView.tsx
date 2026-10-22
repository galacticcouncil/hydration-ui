import "react18-json-view/src/style.css"

import { safeStringify } from "@galacticcouncil/utils"
import { ThemeUICSSProperties } from "@theme-ui/css"
import React, { FC, lazy, Ref, Suspense } from "react"
import { type JsonViewProps as ReactJsonViewProps } from "react18-json-view"

import { Skeleton } from "@/components/Skeleton"
import { Spinner } from "@/components/Spinner"

import { SRoot, SSkeletonIndent, SSkeletonRoot } from "./JsonView.styled"

const ReactJsonView = lazy(() => import("react18-json-view"))

export type JsonViewProps = ReactJsonViewProps & {
  className?: string
  fs?: ThemeUICSSProperties["fontSize"]
  ref?: Ref<HTMLDivElement>
}

export const JsonView: FC<JsonViewProps> = ({
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

const SkeletonRow: FC<{ width: number }> = ({ width }) => (
  <Skeleton width={`${width}%`} />
)

export const JsonViewSkeleton: FC<Pick<JsonViewProps, "fs" | "className">> = ({
  fs,
  className,
}) => (
  <SSkeletonRoot className={className} sx={{ fontSize: fs }}>
    <SkeletonRow width={22} />
    <SSkeletonIndent>
      <SkeletonRow width={64} />
      <SkeletonRow width={48} />
      <SkeletonRow width={30} />
      <SSkeletonIndent>
        <SkeletonRow width={58} />
        <SkeletonRow width={41} />
        <SkeletonRow width={52} />
        <SSkeletonIndent>
          <SkeletonRow width={46} />
          <SkeletonRow width={61} />
          <SkeletonRow width={34} />
        </SSkeletonIndent>
        <SkeletonRow width={28} />
      </SSkeletonIndent>
      <SkeletonRow width={55} />
      <SkeletonRow width={36} />
      <SSkeletonIndent>
        <SkeletonRow width={49} />
        <SkeletonRow width={63} />
      </SSkeletonIndent>
      <SkeletonRow width={26} />
    </SSkeletonIndent>
    <SkeletonRow width={12} />
  </SSkeletonRoot>
)
