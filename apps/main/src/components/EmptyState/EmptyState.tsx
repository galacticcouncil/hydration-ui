import Flamingo from "@galacticcouncil/ui/assets/images/Flamingo.webp"
import {
  Button,
  ButtonProps,
  Flex,
  Image,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment, ReactNode } from "react"

type Props = {
  readonly header: string
  readonly description: string
  readonly action?: ReactNode
}

export const EmptyState: FC<Props> = ({ header, description, action }) => {
  return (
    <Flex
      direction="column"
      align="center"
      gap={6}
      m="auto"
      pb={50}
      maxWidth={230}
    >
      <Image src={Flamingo} alt="Empty state" width={96} height={96} />
      <Text color={getToken("text.high")} fs={14} lh={1.2} fw={500}>
        {header}
      </Text>
      <Text
        key={description}
        color={getToken("text.medium")}
        fs={12}
        lh={1.2}
        fw={400}
        align="center"
      >
        {description.split(". ").map((sentence, index) => (
          <Fragment key={index}>
            {sentence}
            <br />
          </Fragment>
        ))}
      </Text>
      {action}
    </Flex>
  )
}

export const EmptyStateAction: FC<ButtonProps> = ({ sx, ...props }) => {
  return <Button variant="secondary" sx={{ mt: 8, ...sx }} {...props} />
}
