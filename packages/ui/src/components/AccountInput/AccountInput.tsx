import { ArrowDownToLine } from "lucide-react"

import { Close } from "@/assets/icons"
import {
  AccountAvatar,
  AccountAvatarTheme,
  Button,
  Flex,
  Grid,
  Input,
} from "@/components"

export type AccountInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  value: string
  onChange: (value: string) => void
  avatarTheme?: AccountAvatarTheme
  isError?: boolean
  className?: string
  pasteDisabled?: boolean
  clearDisabled?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export const AccountInput: React.FC<AccountInputProps> = ({
  value,
  onChange,
  avatarTheme = "auto",
  className,
  ref,
  pasteDisabled = false,
  clearDisabled = false,
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

  return (
    <Grid
      columnTemplate="1fr auto"
      align="center"
      columnGap={10}
      className={className}
    >
      <Flex align="center" gap="base">
        <AccountAvatar address={value} theme={avatarTheme} />
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
      {!value && !pasteDisabled && (
        <Button icon={ArrowDownToLine} variant="ghost" onClick={handlePaste} />
      )}
      {value && !clearDisabled && (
        <Button icon={Close} variant="ghost" onClick={handleClear} />
      )}
    </Grid>
  )
}
