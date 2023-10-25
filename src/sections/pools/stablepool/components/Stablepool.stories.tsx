import { ComponentMeta, ComponentStory } from "@storybook/react"
import { CurrencyReserves } from "./CurrencyReserves"
import BigNumber from "bignumber.js"

export default {
  title: "stablepool/Transfer",
  component: CurrencyReserves,
} as ComponentMeta<typeof CurrencyReserves>

const CurrencyReservesTemplate: ComponentStory<
  typeof CurrencyReserves
> = () => {
  return (
    <CurrencyReserves
      assets={[
        {
          id: "1",
          symbol: "DAI",
          balance: new BigNumber(1245676),
          value: new BigNumber(100),
        },
        {
          id: "2",
          symbol: "USDC",
          balance: new BigNumber(1245676),
          value: new BigNumber(50),
        },
        {
          id: "3",
          symbol: "USDT",
          balance: new BigNumber(1245676),
          value: new BigNumber(30),
        },
      ]}
    />
  )
}

export const CurrencyReservesStory = CurrencyReservesTemplate.bind({})
