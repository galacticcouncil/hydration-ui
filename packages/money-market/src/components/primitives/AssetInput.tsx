import { AssetInput as BaseAssetInput } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"

import { TokenIcon } from "@/components/primitives"
import { CapType } from "@/types"

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
  inputTitle?: React.ReactNode
  balanceText?: React.ReactNode
  loading?: boolean
  className?: string
  error?: string
}

export const AssetInput = <T extends Asset = Asset>({
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
  /* const [selectedSymbol, setSelectedSymbol] = useState<string>(symbol)
  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
    const newAsset = assets.find((asset) => asset.symbol === symbol) as T
    onSelect && onSelect(newAsset)
    onChange && onChange("")
  } */

  const asset =
    assets.length === 1
      ? assets[0]
      : assets && (assets.find((asset) => asset.symbol === symbol) as T)

  return (
    <BaseAssetInput
      sx={{ pt: 0 }}
      className={className}
      label="Amount"
      symbol={symbol}
      value={value}
      maxBalance={Big(maxValue || 0)
        .round(6, Big.roundDown)
        .toString()}
      selectedAssetIcon={
        <TokenIcon id={getAssetIdFromAddress(asset.address)} />
      }
      modalDisabled
      onChange={onChange}
      loading={loading}
      error={error}
    />
  )
}
