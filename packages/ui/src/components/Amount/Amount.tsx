import {
  ComponentProps,
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
} from "react"
import { useTranslation } from "react-i18next"

import {
  AmountDisplaySize,
  SAmount,
  SAmountDisplayValue,
  SAmountLabel,
  SAmountRoot,
  SAmountValue,
} from "@/components/Amount/Amount.styled"

type ContextType = {
  readonly size: AmountDisplaySize
}

const Context = createContext<ContextType | null>(null)

const useAmountContext = (): ContextType => {
  const context = useContext(Context)

  if (!context) {
    throw new Error("Amount component must be used within an Amount component")
  }

  return context
}

type AmountProps = {
  readonly label?: string
  readonly value?: number
  readonly valueSymbol?: string
  readonly customValue?: ReactNode
  readonly displayValue?: string
  readonly size?: AmountDisplaySize
  readonly className?: string
}

export const Amount: FC<AmountProps> = ({
  label,
  value,
  valueSymbol,
  customValue,
  displayValue,
  size = "medium",
  className,
}) => {
  const { t } = useTranslation()
  const context = useMemo(() => ({ size }), [size])

  return (
    <Context.Provider value={context}>
      <SAmountRoot className={className}>
        {label && <SAmountLabel>{label}</SAmountLabel>}
        <SAmount>
          {customValue ??
            (value && (
              <AmountValue>
                {t("number", { value })}
                {valueSymbol ? ` ${valueSymbol}` : ""}
              </AmountValue>
            ))}
          {displayValue && (
            <AmountDisplayValue>{displayValue}</AmountDisplayValue>
          )}
        </SAmount>
      </SAmountRoot>
    </Context.Provider>
  )
}

export const AmountValue: FC<
  Omit<ComponentProps<typeof SAmountValue>, "size">
> = (props) => {
  const context = useAmountContext()

  return <SAmountValue size={context.size} {...props} />
}

export const AmountDisplayValue: FC<
  Omit<ComponentProps<typeof SAmountDisplayValue>, "size">
> = (props) => {
  const context = useAmountContext()

  return <SAmountDisplayValue size={context.size} {...props} />
}
