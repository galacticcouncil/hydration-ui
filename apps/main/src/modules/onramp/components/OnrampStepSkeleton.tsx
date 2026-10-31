import { ModalBody, Skeleton, Stack } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { SOnrampStepHeader } from "./OnrampStepHeader.styled"

type OnrampStepSkeletonProps = { title: string }

export const OnrampStepSkeleton: FC<OnrampStepSkeletonProps> = ({ title }) => (
  <>
    <SOnrampStepHeader title={title} align="center" closable />
    <ModalBody scrollable={false} aria-busy>
      <Stack gap="xl" justify="flex-start" sx={{ minHeight: pxToRem(402) }}>
        <Stack gap="s" justify="flex-start">
          <Skeleton height={pxToRem(12)} width="30%" />
          <Skeleton height={pxToRem(64)} />
        </Stack>
        <Skeleton height={pxToRem(80)} />
        <Skeleton height={pxToRem(88)} />
        <Skeleton height={pxToRem(48)} borderRadius={pxToRem(24)} />
      </Stack>
    </ModalBody>
  </>
)
