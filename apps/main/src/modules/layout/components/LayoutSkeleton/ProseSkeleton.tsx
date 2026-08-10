import { Skeleton, Stack } from "@galacticcouncil/ui/components"

const DEFAULT_LINE_COUNT = 12
const LINES_PER_PARAGRAPH = 3

const getLineWidth = (index: number) => `${50 + ((index * 17 + 7) % 51)}%`

type ProseSkeletonProps = {
  readonly lines?: number
}

export const ProseSkeleton: React.FC<ProseSkeletonProps> = ({
  lines = DEFAULT_LINE_COUNT,
}) => (
  <Stack gap="m" justify="flex-start">
    {Array.from(
      { length: Math.ceil(lines / LINES_PER_PARAGRAPH) },
      (_, paragraphIndex) => {
        const start = paragraphIndex * LINES_PER_PARAGRAPH
        const lineCount = Math.min(LINES_PER_PARAGRAPH, lines - start)

        return (
          <Stack key={paragraphIndex} gap={0} justify="flex-start">
            {Array.from({ length: lineCount }, (_, i) => (
              <Skeleton key={i} width={getLineWidth(start + i)} height="1em" />
            ))}
          </Stack>
        )
      },
    )}
  </Stack>
)
