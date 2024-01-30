import { Warning } from "sections/lending/components/primitives/Warning"

export const ParameterChangewarning = ({
  underlyingAsset,
}: {
  underlyingAsset: string
}) => {
  return (
    <Warning severity="info" sx={{ my: 24 }}>
      <span>
        <b>Attention:</b> Parameter changes via governance can alter your
        account health factor and risk of liquidation. Follow the{" "}
        <a href="https://governance.aave.com/">Aave governance forum</a> for
        updates.
      </span>
    </Warning>
  )
}
