import { ReactNode } from "react"
import { SContainer, SIcon, STitle, SLink } from "components/Toast/Toast.styled"
import SuccessIcon from "assets/icons/SuccessIcon.svg?react"
import FailIcon from "assets/icons/FailIcon.svg?react"
import InfoIcon from "assets/icons/InfoIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import UnknownIcon from "assets/icons/Unknown.svg?react"
import { Text } from "components/Typography/Text/Text"
import { Maybe, useNow } from "utils/helpers"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { ToastVariant } from "state/toasts"
import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { Spinner } from "components/Spinner/Spinner"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"

export function ToastContent(props: {
  variant: Maybe<ToastVariant>
  title?: string | ReactNode
  link?: string
  actions?: ReactNode
  meta?: ReactNode
  dateCreated?: Date
  children?: ReactNode
  onClick?: () => void
}) {
  const { t } = useTranslation()

  useNow(props.dateCreated != null)
  return (
    <SContainer variant={props.variant ?? "info"} onClick={props.onClick}>
      <SIcon>
        {props.variant === "success" ? (
          <SuccessIcon />
        ) : props.variant === "error" ? (
          <FailIcon />
        ) : props.variant === "progress" ? (
          <Spinner size={28} />
        ) : props.variant === "unknown" ? (
          <UnknownIcon color={theme.colors.darkBlue200} />
        ) : props.variant === "temporary" ? (
          <ChainlinkIcon color={theme.colors.white} />
        ) : (
          <SInfoIcon>
            <InfoIcon />
          </SInfoIcon>
        )}
      </SIcon>
      <div sx={{ flex: "column", gap: 4, justify: "center" }}>
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "flex-end",
            gap: 8,
          }}
        >
          <STitle>
            {typeof props.title === "string" ? (
              <p dangerouslySetInnerHTML={{ __html: props.title }} />
            ) : (
              props.title
            )}
          </STitle>
        </div>
        <div sx={{ flex: "row", justify: "space-between", align: "flex-end" }}>
          {props.dateCreated && (
            <Text
              fs={12}
              css={{ color: `rgba(${theme.rgbColors.white}, 0.6)` }}
              tTransform="uppercase"
            >
              {t("toast.date", { value: props.dateCreated })}
            </Text>
          )}
          {props.meta}
        </div>
      </div>

      <div sx={{ flex: "row", align: "center", gap: 8 }}>
        {props.actions}
        {props.link && (
          <SLink>
            <a href={props.link} target="_blank" rel="noreferrer">
              <LinkIcon />
            </a>
          </SLink>
        )}
      </div>

      {props.children}
    </SContainer>
  )
}
