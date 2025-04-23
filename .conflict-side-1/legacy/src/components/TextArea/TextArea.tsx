import { ReactNode, useEffect, useRef } from "react"
import { STextArea, STextAreaBar, STextAreaContainer } from "./TextArea.styled"
import { ErrorMessage } from "components/Label/Label.styled"
import { Text } from "components/Typography/Text/Text"

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string
  onChange: (val: string) => void
  name: string
  label?: string
  error?: string
  icon?: ReactNode
}

export const TextArea = ({
  onChange,
  value,
  label,
  placeholder,
  name,
  icon,
  error,
  ...p
}: TextAreaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px"
      const scrollHeight = textAreaRef.current.scrollHeight

      textAreaRef.current.style.height = scrollHeight + 1 + "px"
    }
  }, [textAreaRef, value])

  return (
    <>
      <STextAreaContainer htmlFor={name} error={error}>
        {label || icon ? (
          <STextAreaBar>
            {label && (
              <Text
                className="label"
                color="basic500"
                fs={12}
                tTransform="uppercase"
              >
                {label}
              </Text>
            )}
            {icon}
          </STextAreaBar>
        ) : null}
        <STextArea
          ref={textAreaRef}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          value={value ?? ""}
          id={name}
          autoComplete="off"
          placeholder={placeholder}
          {...p}
        />
      </STextAreaContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  )
}
