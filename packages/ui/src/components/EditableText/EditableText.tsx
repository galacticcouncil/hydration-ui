import { FC, useEffect, useLayoutEffect, useRef, useState } from "react"

import { CornerDownLeft as EnterKey, EditIcon } from "@/assets/icons"
import { Flex, Icon, Text, TextProps, Tooltip } from "@/components"
import { getToken } from "@/utils"

import {
  SEditableTextField,
  SEditableTextInput,
  SEditButton,
  SMeasure,
  SSaveHint,
} from "./EditableText.styled"

export type EditableTextProps = Omit<TextProps, "children" | "onChange"> & {
  value: string
  placeholder?: string
  disabled?: boolean
  editLabel?: string
  saveLabel?: string
  onChange: (value: string) => void
}

export const EditableText: FC<EditableTextProps> = ({
  value,
  placeholder,
  disabled = false,
  onChange,
  editLabel = "Edit",
  saveLabel = "Save",
  ...textProps
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [caretOffset, setCaretOffset] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const font = textProps.font ?? "secondary"
  const typography = {
    fontFamily:
      font === "mono" ? "GeistMono" : getToken(`fontFamilies1.${font}`),
    fontSize: textProps.fs,
    fontWeight: textProps.fw,
    lineHeight: textProps.lh,
  }

  const syncCaretOffset = () => {
    const input = inputRef.current
    const measure = measureRef.current
    if (!input || !measure) return

    measure.textContent = input.value.slice(0, input.selectionEnd ?? 0)
    setCaretOffset(measure.offsetWidth - input.scrollLeft)
  }

  useLayoutEffect(() => {
    if (!isEditing) return
    syncCaretOffset()
  }, [isEditing])

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
        <SEditableTextField>
          <SEditableTextInput
            ref={inputRef}
            autoFocus
            defaultValue={value}
            placeholder={placeholder}
            sx={typography}
            onFocus={(e) => {
              e.currentTarget.select()
              requestAnimationFrame(syncCaretOffset)
            }}
            onInput={syncCaretOffset}
            onKeyUp={syncCaretOffset}
            onClick={syncCaretOffset}
            onSelect={syncCaretOffset}
            onScroll={syncCaretOffset}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
            }}
            onBlur={(e) => {
              const next = e.currentTarget.value.trim()
              if (next && next !== value) onChange(next)
              setIsEditing(false)
            }}
          />
          <SMeasure ref={measureRef} aria-hidden sx={typography} />
          <SSaveHint aria-hidden style={{ left: caretOffset }}>
            <Icon size="1em" component={EnterKey} />
            {saveLabel}
          </SSaveHint>
        </SEditableTextField>
      ) : (
        <>
          <Text
            truncate
            color={value ? getToken("text.high") : getToken("text.medium")}
            {...textProps}
          >
            {value || placeholder}
          </Text>
          <Tooltip text={editLabel} size="small" asChild>
            <SEditButton
              type="button"
              aria-label={editLabel}
              onClick={() => setIsEditing(true)}
            >
              <Icon size="1em" component={EditIcon} />
            </SEditButton>
          </Tooltip>
        </>
      )}
    </Flex>
  )
}
