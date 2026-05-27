import { Close, StylizedAdd } from "@/assets/icons"
import { SClose } from "@/components/BannerTop/BannerTop.styled"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextButton } from "@/components/TextButton"
import { getToken } from "@/utils"

export type BannerTopProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
}

export const BannerTop = ({
  message,
  actionLabel,
  onAction,
  onClose,
}: BannerTopProps) => {
  return (
    <Flex
      align="center"
      justify="center"
      bg={getToken("buttons.primary.medium.rest")}
      px={["m", "m", "l"]}
      sx={{
        position: "relative",
        minHeight: "1.375rem",
      }}
    >
      <Flex direction={["column", "row"]} align="center" gap="s" py="xs">
        <Flex align="center" gap="xs" pr={["m", 0]}>
          <Icon
            component={StylizedAdd}
            size="xs"
            color={getToken("buttons.primary.medium.onButton")}
          />
          <Text
            fs="p5"
            fw={500}
            color={getToken("buttons.primary.medium.onButton")}
          >
            {message}
          </Text>
        </Flex>

        {actionLabel && onAction && (
          <>
            <Text
              fs="p6"
              fw={500}
              color={getToken("buttons.primary.medium.onButton")}
              sx={{ opacity: 0.2, display: ["none", "block"] }}
            >
              |
            </Text>
            <TextButton
              direction="internal"
              onClick={onAction}
              sx={{
                color: getToken("buttons.primary.medium.onButton"),
                whiteSpace: "nowrap",
                "&:hover": {
                  color: getToken("buttons.primary.medium.onButton"),
                  opacity: 0.7,
                },
              }}
            >
              {actionLabel}
            </TextButton>
          </>
        )}
      </Flex>

      {onClose && (
        <SClose onClick={onClose} aria-label="Close banner">
          <Icon
            component={Close}
            size="xs"
            color={getToken("buttons.primary.medium.onButton")}
          />
        </SClose>
      )}
    </Flex>
  )
}
