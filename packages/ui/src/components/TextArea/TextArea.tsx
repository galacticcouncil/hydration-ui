import { ReactNode, useEffect, useRef } from "react"

import { Text } from "@/components/Text/Text"
import { getToken } from "@/utils"

import { STextArea, STextAreaBar, STextAreaContainer } from "./TextArea.styled"

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string
  onChange: (val: string) => void
  name: string
  label?: string
  error?: string
  icon?: ReactNode
  autoSize?: boolean
}

export const TextArea = ({
  onChange,
  value,
  label,
  placeholder,
  name,
  icon,
  error,
  autoSize = true,
  ...p
}: TextAreaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoSize && textAreaRef.current) {
      textAreaRef.current.style.height = "0px"
      const scrollHeight = textAreaRef.current.scrollHeight

      textAreaRef.current.style.height = scrollHeight + 1 + "px"
    }
  }, [textAreaRef, value, autoSize])

  return (
    <STextAreaContainer htmlFor={name} error={error}>
      {(label || icon) && (
        <STextAreaBar>
          {label && (
            <Text color={getToken("text.high")} fs="p5" transform="uppercase">
              {label}
            </Text>
          )}
          {icon}
        </STextAreaBar>
      )}
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
  )
}
