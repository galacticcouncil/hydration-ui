import { ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"

type Props = {
  readonly label: string
  readonly price: string
  readonly isLoading: boolean
}

export const OtcValue: FC<Props> = ({ label, price, isLoading }) => {
  return (
    <ValueStats
      label={label}
      wrap={[false, true]}
      isLoading={isLoading}
      value={price}
    />
  )
}
