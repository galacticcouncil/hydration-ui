import { ReactNode } from "react"
import { SContainer, SIcon, STitle } from "components/Toast/Toast.styled"
import { ReactComponent as SuccessIcon } from "assets/icons/SuccessIcon.svg"
import { ReactComponent as FailIcon } from "assets/icons/FailIcon.svg"
import { ReactComponent as InfoIcon } from "assets/icons/InfoIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { ToastSpinner } from "components/Spinner/Spinner.styled"
import { Maybe, useNow } from "utils/helpers"
import { useTranslation } from "react-i18next"
import { ToastVariant } from "./Toast"
import { theme } from "theme"

export function ToastContent(props: {
  variant: Maybe<ToastVariant>
  title?: string | ReactNode
  actions?: ReactNode
  meta?: ReactNode
  dateCreated?: Date
  children?: ReactNode
}) {
  const { t } = useTranslation()

  useNow(props.dateCreated != null)

  return (
    <SContainer variant={props.variant ?? "info"}>
      <SIcon>
        {props.variant === "success" ? (
          <SuccessIcon />
        ) : props.variant === "error" ? (
          <FailIcon />
        ) : props.variant === "loading" ? (
          <ToastSpinner width={28} height={28} />
        ) : (
          <InfoIcon />
        )}
      </SIcon>
      <div sx={{ flex: "column", gap: 4, justify: "center" }}>
        <div sx={{ flex: "row", justify: "space-between", align: "flex-end" }}>
          <STitle>
            {typeof props.title === "string" ? (
              <Text fs={12} lh={16} fw={500} color="white">
                {props.title}
              </Text>
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
            >
              {t("toast.date", { value: props.dateCreated })}
            </Text>
          )}

          {props.meta}
        </div>
      </div>
      {props.children}
    </SContainer>
  )
}
