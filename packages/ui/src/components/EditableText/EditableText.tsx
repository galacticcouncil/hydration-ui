import { FC, useState } from "react"

import { EditIcon } from "@/assets/icons"
import { Flex, Icon, Text, TextProps } from "@/components"
import { getToken } from "@/utils"

import { SEditableTextInput, SEditButton } from "./EditableText.styled"

export type EditableTextProps = Omit<TextProps, "children" | "onChange"> & {
  value: string
  placeholder?: string
  disabled?: boolean
  editLabel?: string
  onChange: (value: string) => void
}

export const EditableText: FC<EditableTextProps> = ({
  value,
  placeholder,
  disabled = false,
  onChange,
  editLabel = "Edit",
  ...textProps
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const font = textProps.font ?? "secondary"
  const typography = {
    fontFamily:
      font === "mono" ? "GeistMono" : getToken(`fontFamilies1.${font}`),
    fontSize: textProps.fs,
    fontWeight: textProps.fw,
    lineHeight: textProps.lh,
  }

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
        <SEditableTextInput
          autoFocus
          defaultValue={value}
          placeholder={placeholder}
          sx={typography}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur()
            else if (e.key === "Escape") {
              e.currentTarget.value = value
              e.currentTarget.blur()
            }
          }}
          onBlur={(e) => {
            const next = e.currentTarget.value.trim()
            if (next && next !== value) onChange(next)
            setIsEditing(false)
          }}
        />
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
