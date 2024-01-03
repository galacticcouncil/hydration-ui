import { Page } from "components/Layout/Page/Page"
import { HeroBanner } from "./components/HeroBanner/HeroBanner"
import { WavySeparator } from "components/WavySeparator/WavySeparator"
import { CodePreview } from "./components/CodePreview/CodePreview"
import { FaqAccordion } from "./components/FaqAccordion/FaqAccordion"

export const ReferralsSkeleton = () => (
  <Page>
    <div sx={{ flex: "column", gap: 30 }}>
      <HeroBanner>
        <WavySeparator sx={{ my: 24, opacity: 0.15 }} />
        <CodePreview disabled />
      </HeroBanner>
      <FaqAccordion />
    </div>
  </Page>
)
