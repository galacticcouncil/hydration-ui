import { Button } from "components/Button/Button"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { MemepadSummaryValues } from "sections/memepad/form/MemepadForm.utils"
import { SContainer } from "./MemepadSummary.styled"
import { SBottleCaps } from "sections/memepad/components/MemepadVisual"

type MemepadSummaryProps = {
  values: MemepadSummaryValues | null
  onReset: () => void
}

export const MemepadSummary: React.FC<MemepadSummaryProps> = ({
  values,
  onReset,
}) => {
  return (
    <SContainer>
      <SBottleCaps
        css={{ position: "absolute", left: "100%", top: 0 }}
        sx={{ m: 0 }}
      />
      <div>
        <GradientText
          fs={34}
          tTransform="uppercase"
          tAlign="center"
          sx={{ display: "block" }}
        >
          You've succesfully
          <br />
          created new asset!
        </GradientText>
        {/* <pre sx={{ color: "white" }}>{JSON.stringify(values, null, 2)}</pre> */}
        <Button onClick={onReset}>Create another asset</Button>
      </div>
      <SBottleCaps
        css={{ position: "absolute", right: "100%", top: 0 }}
        sx={{ m: 0 }}
      />
    </SContainer>
  )
}
