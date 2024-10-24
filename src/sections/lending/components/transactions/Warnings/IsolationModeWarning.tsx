import { Alert } from "components/Alert"
import { Link } from "sections/lending/components/primitives/Link"
import { Text } from "components/Typography/Text/Text"

interface IsolationModeWarningProps {
  asset?: string
  severity?: "warning" | "error"
}

export const IsolationModeWarning = ({
  asset,
  severity,
  ...rest
}: IsolationModeWarningProps) => {
  return (
    <Alert variant={severity || "info"} {...rest}>
      <Text fs={13} font="GeistSemiBold" sx={{ mb: 4 }}>
        You are entering Isolation mode
      </Text>
      <Text fs={13}>
        In Isolation mode, you cannot supply other assets as collateral. A
        global debt ceiling limits the borrowing power of the isolated asset. To
        exit isolation mode disable {asset ? asset : ""} as collateral before
        borrowing another asset. Read more in our{" "}
        <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
          FAQ
        </Link>
      </Text>
    </Alert>
  )
}
