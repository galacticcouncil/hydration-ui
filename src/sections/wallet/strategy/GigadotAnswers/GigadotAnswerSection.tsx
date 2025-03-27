import { HideShow } from "components/HideShow"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useToggle } from "react-use"

type Props = {
  readonly question: string
  readonly answer: string
}

export const GigadotAnswerSection: FC<Props> = ({ question, answer }) => {
  const [isExpanded, toggleExpanded] = useToggle(false)

  return (
    <div
      sx={{
        flex: "column",
        gap: 4,
        px: 20,
        pb: isExpanded ? 10 : 0,
      }}
      css={{ cursor: "pointer" }}
      onClick={toggleExpanded}
    >
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <Text fw={500} fs={17.5} lh="1" color="basic200">
          {question}
        </Text>
        <HideShow isOpen={isExpanded} />
      </div>
      {isExpanded && (
        <Text fs={14} lh="1.4" color="darkBlue200">
          {answer}
        </Text>
      )}
    </div>
  )
}
