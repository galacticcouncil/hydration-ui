import {
  Flex,
  Icon,
  Image,
  ModalBody,
  ModalFooter,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { ComponentType, FC, ReactNode } from "react"

type BankMessageProps = {
  /** An illustration (image url) or, without one, an icon. */
  image?: string
  icon?: ComponentType
  title: string
  description?: string
  /** Inline content under the text: alerts, a progress list. */
  children?: ReactNode
  /** A line above the actions ("You can close this window ..."). */
  note?: string
  /** The footer actions, primary first. */
  actions?: ReactNode
}

/**
 * Figma pattern P01: one centred message with its illustration, title and
 * text, and the actions in the modal footer.
 */
export const BankMessage: FC<BankMessageProps> = ({
  image,
  icon,
  title,
  description,
  children,
  note,
  actions,
}) => (
  <>
    <ModalBody>
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="l"
        py="xl"
        sx={{ minHeight: pxToRem(360) }}
      >
        {image ? (
          <Image src={image} alt="" sx={{ size: "3xl" }} />
        ) : (
          icon && (
            <Icon component={icon} size="xl" color={getToken("text.medium")} />
          )
        )}
        <Stack gap="s" align="center">
          <Text
            font="primary"
            fs="h7"
            fw={500}
            align="center"
            color={getToken("text.high")}
          >
            {title}
          </Text>
          {description && (
            <Text
              fs="p5"
              lh={1.4}
              align="center"
              color={getToken("text.medium")}
              textWrap="balance"
            >
              {description}
            </Text>
          )}
        </Stack>
        {children && (
          <Stack gap="m" width="100%">
            {children}
          </Stack>
        )}
      </Flex>
    </ModalBody>
    {(note || actions) && (
      <ModalFooter>
        <Stack gap="m" width="100%">
          {note && (
            <Text fs="p5" align="center" color={getToken("text.medium")}>
              {note}
            </Text>
          )}
          {actions}
        </Stack>
      </ModalFooter>
    )}
  </>
)
