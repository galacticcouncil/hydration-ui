import { Button } from "components/Button/Button"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { MemepadSummaryValues } from "sections/memepad/form/MemepadForm.utils"
import { SContainer } from "./MemepadSummary.styled"
import { SBottleCaps } from "sections/memepad/components/MemepadVisual"
import { Text } from "components/Typography/Text/Text"

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
        sx={{ display: ["none", "block"] }}
        css={{ position: "absolute", left: "100%", top: 0 }}
      />
      <div>
        <Text
          fs={[12, 22]}
          lh={[20, 26]}
          tTransform="uppercase"
          tAlign="center"
          font="GeistMedium"
        >
          Congrats!
        </Text>
        <GradientText
          fs={[22, 34]}
          tTransform="uppercase"
          tAlign="center"
          sx={{ display: "block" }}
        >
          You've succesfully
          <br />
          created new asset!
        </GradientText>
        {values && (
          <div sx={{ color: "white", mb: 20 }}>
            {Object.entries(values).map(([key, value]) => (
              <div sx={{ flex: "row", gap: 20, justify: "space-between" }}>
                <div>{key}</div>
                <div>{value.length > 10 ? value.slice(0, 10) : value}</div>
              </div>
            ))}
          </div>
        )}
        <Button onClick={onReset}>Create another asset</Button>
      </div>
      <SBottleCaps
        sx={{ display: ["none", "block"] }}
        css={{ position: "absolute", right: "100%", top: 0 }}
      />
    </SContainer>
  )
}
