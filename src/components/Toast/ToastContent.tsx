import { ReactNode } from "react"
import { SContainer, SContent, SIcon } from "components/Toast/Toast.styled"
import { ReactComponent as SuccessIcon } from "assets/icons/IconSuccessSmall.svg"
import { ReactComponent as FailIcon } from "assets/icons/IconFailureSmall.svg"
import { ReactComponent as BasiliskIcon } from "assets/icons/BasiliskIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Maybe } from "utils/helpers"

export function ToastContent(props: {
  variant: Maybe<"info" | "success" | "error" | "loading">
  content: { text?: string; children?: ReactNode }
  children?: ReactNode
}) {
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
      <SContent>
        {"text" in props.content && (
          <Text fs={12} lh={16} fw={500} color="neutralGray100">
            {props.content.text}
          </Text>
        )}
        {"children" in props.content && <>{props.content.children}</>}
      </SContent>
      {props.children}
    </SContainer>
  )
}
