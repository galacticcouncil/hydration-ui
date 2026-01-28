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
  readonly image?: string
  readonly icon?: ReactNode
  readonly action?: ReactNode
  readonly className?: string
}

export const EmptyState: FC<Props> = ({
  header,
  description,
  image = Flamingo,
  icon,
  action,
  className,
}) => {
  return (
    <Flex
      direction="column"
      align="center"
      gap="s"
      m="auto"
      pb="3rem"
      maxWidth="4xl"
      className={className}
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
    </Flex>
  )
}

export const EmptyStateAction: FC<ButtonProps> = ({ sx, ...props }) => {
  return <Button variant="secondary" sx={{ mt: 8, ...sx }} {...props} />
}
