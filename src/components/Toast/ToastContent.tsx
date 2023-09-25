import { ReactNode } from "react"
import { SContainer, SIcon, STitle, SLink } from "components/Toast/Toast.styled"
import SuccessIcon from "assets/icons/SuccessIcon.svg?react"
import FailIcon from "assets/icons/FailIcon.svg?react"
import InfoIcon from "assets/icons/InfoIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import UnknownIcon from "assets/icons/Unknown.svg?react"
import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Maybe, useNow } from "utils/helpers"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { ToastVariant } from "state/toasts"

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
          <Spinner width={28} height={28} />
        ) : props.variant === "unknown" ? (
          <UnknownIcon color={theme.colors.darkBlue200} />
        ) : (
          <InfoIcon />
        )}
      </SIcon>
      <div sx={{ flex: "column", gap: 4, justify: "center" }}>
        <div sx={{ flex: "row", justify: "space-between", align: "flex-end" }}>
          <STitle>
            {typeof props.title === "string" ? (
              <p dangerouslySetInnerHTML={{ __html: props.title }} />
            ) : (
              props.title
            )}
          </STitle>

          {props.actions}
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

      <SLink variant={props.variant ?? "info"}>
        {props.link && (
          <a href={props.link} target="_blank" rel="noreferrer">
            <LinkIcon />
          </a>
        )}
      </SLink>
      {props.children}
    </SContainer>
  )
}
