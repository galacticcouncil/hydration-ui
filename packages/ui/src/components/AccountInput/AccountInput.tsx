import { ArrowDownToLine } from "lucide-react"

import { Close } from "@/assets/icons"
import {
  AccountAvatar,
  ButtonIcon,
  Flex,
  Grid,
  Icon,
  Input,
  Tooltip,
} from "@/components"

export type AccountInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  value: string
  onChange: (value: string) => void
  isError?: boolean
  className?: string
  pasteDisabled?: boolean
  clearDisabled?: boolean
  pasteLabel?: string
  clearLabel?: string
  endAdornment?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

export const AccountInput: React.FC<AccountInputProps> = ({
  value,
  onChange,
  className,
  ref,
  pasteDisabled = false,
  clearDisabled = false,
  pasteLabel = "Paste",
  clearLabel = "Clear",
  endAdornment,
  ...props
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch (error) {
      console.warn("Failed to read clipboard:", error)
    }
  }

  const handleClear = () => {
    onChange("")
  }

  const withTooltip = (label: string | undefined, button: React.ReactNode) =>
    label ? (
      <Tooltip
        text={label}
        size="small"
        delayDuration={0}
        side="bottom"
        alignOffset={0}
        asChild
      >
        {button}
      </Tooltip>
    ) : (
      button
    )

  return (
    <Grid
      columnTemplate="1fr auto"
      align="center"
      columnGap={10}
      className={className}
    >
      <Flex align="center" gap="base">
        <AccountAvatar address={value} />
        <Input
          ref={ref}
          variant="embedded"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ p: 0, flex: 1 }}
          {...props}
        />
      </Flex>
      <Flex align="center" gap="s">
        {endAdornment}
        {!value &&
          !pasteDisabled &&
          withTooltip(
            pasteLabel,
            <ButtonIcon aria-label={pasteLabel} onClick={handlePaste}>
              <Icon component={ArrowDownToLine} size="m" />
            </ButtonIcon>,
          )}
        {value &&
          !clearDisabled &&
          withTooltip(
            clearLabel,
            <ButtonIcon aria-label={clearLabel} onClick={handleClear}>
              <Icon component={Close} size="m" />
            </ButtonIcon>,
          )}
      </Flex>
    </Grid>
  )
}
