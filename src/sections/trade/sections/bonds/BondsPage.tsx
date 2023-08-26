import { Heading } from "components/Typography/Heading/Heading"
import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { gradientBorder } from "theme"
import { Text } from "components/Typography/Text/Text"

export const BondsPage = () => {
  return (
    <>
      <Heading sx={{ mb: 33 }}>hydradx bonds</Heading>
      <div sx={{ flex: "column", gap: 12 }}>
        <Bond
          icon={<AssetLogo id="0" />}
          title="HDXb08112024"
          maturity="22.6.2024"
          endingIn="23H 22m"
          discount="5"
          onDetailClick={console.log}
        />
        <Bond
          icon={<AssetLogo id="0" />}
          title="HDXb08112024"
          maturity="22.6.2024"
          endingIn="23H 22m"
          discount="5"
          onDetailClick={console.log}
        />
        <Bond
          icon={<AssetLogo id="0" />}
          title="HDXb08112024"
          maturity="22.6.2024"
          endingIn="23H 22m"
          discount="5"
          onDetailClick={console.log}
        />
      </div>
      <div css={gradientBorder} sx={{ mt: 40, p: 30 }}>
        <Text color="white" fs={20} fw={600}>
          Why use Bonds?
        </Text>
      </div>
    </>
  )
}
