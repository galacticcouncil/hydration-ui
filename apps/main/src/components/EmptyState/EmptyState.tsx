import Flamingo from "@galacticcouncil/ui/assets/images/Flamingo.webp"
import {
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  Image,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment, ReactNode } from "react"

type Props = FlexProps & {
  readonly header: string
  readonly description: string
  readonly image?: string
  readonly icon?: ReactNode
  readonly action?: ReactNode
}

export const EmptyState: FC<Props> = ({
  header,
  description,
  image = Flamingo,
  icon,
  action,
  ...props
}) => {
  return (
    <Flex
      direction="column"
      align="center"
      gap="s"
      m="auto"
      pb="3rem"
      maxWidth="4xl"
      {...props}
    >
      {icon || <Image src={image} alt="Empty state" sx={{ size: "3xl" }} />}
      <Text
        font="primary"
        color={getToken("text.high")}
        fs="h7"
        lh={1}
        fw={500}
      >
        {header}
      </Text>
      <Flex direction="column" gap="xl" align="center">
        <Text
          key={description}
          color={getToken("text.medium")}
          fs="p5"
          lh={1.3}
          align="center"
          sx={{ textWrap: "balance" }}
        >
          {description.split(". ").map((sentence, index) => (
            <Fragment key={index}>
              {sentence.endsWith(".") ? sentence : `${sentence}.`}
              <br />
            </Fragment>
          ))}
        </Text>
        {action}
      </Flex>
    </Flex>
  )
}

export const EmptyStateAction: FC<ButtonProps> = ({ sx, ...props }) => {
  return <Button variant="secondary" sx={{ mt: 8, ...sx }} {...props} />
}
