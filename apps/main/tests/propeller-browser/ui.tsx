import React from "react"
const Container = ({ children }) => <div>{children}</div>
export const Box = Container,
  Flex = Container,
  Stack = Container,
  Text = Container,
  AuthorizedAction = Container
export const Icon = () => null,
  Scale = () => null,
  ShieldCheck = () => null,
  Separator = () => null
export const getToken = () => ""
export const LoadingButton = ({ children, disabled, type }) => (
  <button type={type} disabled={disabled}>
    {children}
  </button>
)
export const AssetSelect = ({ value, onChange, balance, amountError }) => (
  <div>
    <input
      aria-label="Amount"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <button
      type="button"
      disabled={balance.isMaxDisabled}
      onClick={balance.onMax}
    >
      MAX
    </button>
    <div role="alert">{amountError}</div>
  </div>
)
