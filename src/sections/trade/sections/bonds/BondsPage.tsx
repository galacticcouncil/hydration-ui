import { Heading } from "components/Typography/Heading/Heading"
import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { gradientBorder, theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { ReactComponent as TickIcon } from "assets/icons/TickIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/Dollar2Icon.svg"
import { Step } from "./components/Step"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"

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
        <Text color="darkBlue200" sx={{ mt: 16 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec
          commodo libero. Nulla facilisi. Donec venenatis fringilla elit, ac
          feugiat sem volutpat id. Nam consectetur viverra feugiat.Lorem ipsum
          dolor sit amet, consectetur adipiscing elit. Quisque nec commodo
          libero. Nulla facilisi.
        </Text>
        <div sx={{ mt: 41, flex: "row", gap: 20 }}>
          <Step
            icon={<TickIcon sx={{ color: "vibrantBlue200" }} />}
            title="Buy bonded assets with discount"
            description="Buy bonds at a discounted rate, giving you an instant edge."
          />
          <Step
            icon={<ClockIcon sx={{ color: "brightBlue300" }} />}
            title="Wait for Maturity"
            description="Bond needs to reach its maturity before you can redeem it.Maturity is specified at bond creation"
          />
          <Step
            icon={<DollarIcon sx={{ color: "green600" }} />}
            title="Profit"
            description="As your bonds reach maturity date, you can redeem them for underlying asset 1:1."
          />
        </div>
        <Text
          color="brightBlue300"
          fs={12}
          sx={{ mt: 30 }}
          css={{
            borderBottom: `1px solid ${theme.colors.brightBlue300}`,
            display: "inline-block",
          }}
        >
          <a href="https://hydradx.io" target="_blank" rel="noreferrer">
            Want to learn more? Check Documentation
            <LinkIcon height={10} sx={{ ml: 6 }} />
          </a>
        </Text>
      </div>
    </>
  )
}
