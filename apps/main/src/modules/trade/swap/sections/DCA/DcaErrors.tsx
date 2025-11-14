import { Alert, Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly errors: ReadonlyArray<string>
}

export const DcaErrors: FC<Props> = ({ errors }) => {
  if (!errors.length) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" my={8} gap={6}>
        {errors.map((error) => (
          <Alert key={error} variant="error" description={error} />
        ))}
      </Flex>
    </>
  )
}
