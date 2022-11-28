import { ReactNode } from "react"
import { SContainer, SIcon, STitle } from "components/Toast/Toast.styled"
import { ReactComponent as SuccessIcon } from "assets/icons/IconSuccessSmall.svg"
import { ReactComponent as FailIcon } from "assets/icons/IconFailureSmall.svg"
import { ReactComponent as BasiliskIcon } from "assets/icons/BasiliskIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Maybe, useNow } from "utils/helpers"
import { useTranslation } from "react-i18next"

export function ToastContent(props: {
  variant: Maybe<"info" | "success" | "error" | "loading">
  title?: string | ReactNode
  actions?: ReactNode
  meta?: ReactNode
  dateCreated?: Date
  children?: ReactNode
}) {
  const { t } = useTranslation()

  useNow(props.dateCreated != null)

  return (
    <SContainer>
      <SIcon>
        {props.variant === "success" ? (
          <SuccessIcon />
        ) : props.variant === "error" ? (
          <FailIcon />
        ) : props.variant === "loading" ? (
          <Spinner width={28} height={28} />
        ) : (
          <BasiliskIcon />
        )}
      </SIcon>
      <div sx={{ flex: "column", gap: 4, justify: "center" }}>
        <div sx={{ flex: "row", justify: "space-between", align: "flex-end" }}>
          <STitle>
            {typeof props.title === "string" ? (
              <Text fs={12} lh={16} fw={500} color="neutralGray100">
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
            <Text fs={12} color="neutralGray400">
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
