import { AssetInput } from "@galacticcouncil/ui/components"
import { ReactNode } from "react"

/* interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
  value: string
  id: string
  placeholder: string
  disabled?: boolean
} */

/* export const NumberFormatCustom = React.forwardRef<
  NumberFormatProps,
  CustomProps
>(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        if (values.value !== props.value)
          onChange({
            target: {
              name: props.name,
              value: values.value || "",
            },
          })
      }}
      autoComplete="off"
      thousandSeparator=" "
      isNumericString
      allowNegative={false}
    />
  )
}) */

export interface Asset {
  balance?: string
  symbol: string
  iconSymbol?: string
  address: string
  aToken?: boolean
  priceInUsd?: string
  decimals?: number
}

export interface AssetInputProps<T extends Asset = Asset> {
  name: string
  value: string
  usdValue: string
  symbol: string
  onChange?: (value: string) => void
  disabled?: boolean
  disableInput?: boolean
  onSelect?: (asset: T) => void
  assets: T[]
  capType?: CapType
  maxValue?: string
  isMaxSelected?: boolean
  inputTitle?: ReactNode
  balanceText?: ReactNode
  loading?: boolean
  className?: string
  error?: string
}

export const MoneyMarketAssetInput = <T extends Asset = Asset>({
  name,
  value,
  usdValue,
  symbol,
  onChange,
  disabled,
  disableInput,
  onSelect,
  assets,
  maxValue,
  isMaxSelected,
  inputTitle,
  loading = false,
  className,
  balanceText,
  error,
}: AssetInputProps<T>) => {
  /* const { t } = useTranslation()
  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
    const newAsset = assets.find((asset) => asset.symbol === symbol) as T
    onSelect && onSelect(newAsset)
    onChange && onChange("")
  }

  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbol)

  const asset =
    assets.length === 1
      ? assets[0]
      : assets && (assets.find((asset) => asset.symbol === selectedSymbol) as T) */

  return (
    <AssetInput
      sx={{ p: 0 }}
      label={inputTitle}
      symbol={symbol}
      value={value}
      maxBalance={maxValue}
      modalDisabled
      onChange={onChange}
      loading={loading}
      error={error}
    />
  )
}
