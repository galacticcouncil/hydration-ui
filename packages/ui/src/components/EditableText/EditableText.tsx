import { FC, useEffect, useRef, useState } from "react"

import { EditIcon } from "@/assets/icons"
import { Flex, Icon, Text, TextProps } from "@/components"
import { getToken } from "@/utils"

import { SEditableTextInput, SEditButton } from "./EditableText.styled"

export type EditableTextProps = Omit<TextProps, "children" | "onChange"> & {
  value: string
  placeholder?: string
  disabled?: boolean
  editLabel?: string
  editingHint?: string
  onChange: (value: string) => void
}

export const EditableText: FC<EditableTextProps> = ({
  value,
  placeholder,
  disabled = false,
  onChange,
  editLabel = "Edit",
  editingHint = "Hit Enter to save",
  ...textProps
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const font = textProps.font ?? "secondary"
  const typography = {
    fontFamily:
      font === "mono" ? "GeistMono" : getToken(`fontFamilies1.${font}`),
    fontSize: textProps.fs,
    fontWeight: textProps.fw,
    lineHeight: textProps.lh,
  }

  useEffect(() => {
    if (!isEditing) return

    const cancelEditing = () => {
      const input = inputRef.current
      if (!input) return

      input.value = value
      setIsEditing(false)
      input.blur()
    }

    const onEscDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      cancelEditing()
    }

    // Capture ESC key to stop propagating to parent elements (e.g. modals, dropdowns)
    window.addEventListener("keydown", onEscDown, { capture: true })
    return () =>
      window.removeEventListener("keydown", onEscDown, { capture: true })
  }, [isEditing, value])

  if (disabled) {
    return (
      <Text
        truncate
        color={value ? getToken("text.high") : getToken("text.medium")}
        {...textProps}
      >
        {value || placeholder}
      </Text>
    )
  }

  return (
    <Flex align="center" gap="s" sx={typography}>
      {isEditing ? (
        <Flex direction="column" gap={1} sx={{ minWidth: 0, flex: 1 }}>
          <SEditableTextInput
            ref={inputRef}
            autoFocus
            defaultValue={value}
            placeholder={placeholder}
            sx={typography}
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
            }}
            onBlur={(e) => {
              const next = e.currentTarget.value.trim()
              if (next && next !== value) onChange(next)
              setIsEditing(false)
            }}
          />
          {editingHint && (
            <Text fs="p6" color={getToken("text.medium")} lh={1}>
              {editingHint}
            </Text>
          )}
        </Flex>
      ) : (
        <Text
          truncate
          color={value ? getToken("text.high") : getToken("text.medium")}
          {...textProps}
        >
          {value || placeholder}
        </Text>
      )}
      {!isEditing && (
        <SEditButton
          type="button"
          title={editLabel}
          aria-label={editLabel}
          onClick={() => setIsEditing(true)}
        >
          <Icon size="0.85em" component={EditIcon} />
        </SEditButton>
      )}
    </Flex>
  )
}
