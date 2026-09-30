import { ArrowDownToLine } from "lucide-react"

import { Close } from "@/assets/icons"
import {
  AccountAvatar,
  ButtonIcon,
  Flex,
  Grid,
  Icon,
  Input,
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
  trailingElement?: React.ReactNode
  variant?: "embedded" | "standalone"
  ref?: React.Ref<HTMLInputElement>
}

export const AccountInput: React.FC<AccountInputProps> = ({
  value,
  onChange,
  className,
  ref,
  pasteDisabled = false,
  clearDisabled = false,
  trailingElement,
  variant = "embedded",
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

  const actions = trailingElement ? (
    trailingElement
  ) : (
    <>
      {!value && !pasteDisabled && (
        <ButtonIcon onClick={handlePaste}>
          <Icon component={ArrowDownToLine} size="m" />
        </ButtonIcon>
      )}
      {value && !clearDisabled && (
        <ButtonIcon onClick={handleClear}>
          <Icon component={Close} size="m" />
        </ButtonIcon>
      )}
    </>
  )

  if (variant === "standalone") {
    return (
      <Input
        ref={ref}
        className={className}
        customSize="large"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        leadingElement={<AccountAvatar address={value} size={32} />}
        trailingElement={
          <Flex align="center" gap="s">
            {actions}
          </Flex>
        }
        {...props}
      />
    )
  }

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
        {actions}
      </Flex>
    </Grid>
  )
}
