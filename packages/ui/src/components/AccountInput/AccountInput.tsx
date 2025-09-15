import { ArrowDownToLine } from "lucide-react"

import { Close } from "@/assets/icons"
import {
  AccountAvatar,
  AccountAvatarTheme,
  ButtonIcon,
  Flex,
  Grid,
  Icon,
  Input,
} from "@/components"
import { getTokenPx } from "@/utils"

export type AccountInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  value: string
  onChange: (value: string) => void
  avatarTheme?: AccountAvatarTheme
  isError?: boolean
  className?: string
  ref?: React.Ref<HTMLInputElement>
}

export const AccountInput: React.FC<AccountInputProps> = ({
  value,
  onChange,
  avatarTheme = "auto",
  className,
  ref,
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
      <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
        <AccountAvatar address={value} theme={avatarTheme} />
        <Input
          ref={ref}
          variant="embedded"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ p: 0, flex: 1 }}
          {...props}
        />
      </Flex>
      {!value ? (
        <ButtonIcon onClick={handlePaste}>
          <Icon component={ArrowDownToLine} size={18} />
        </ButtonIcon>
      ) : (
        <ButtonIcon onClick={handleClear}>
          <Icon component={Close} size={18} />
        </ButtonIcon>
      )}
    </Grid>
  )
}
