import { AccordionAnimation } from "components/Accordion/Accordion"
import {
  SFaqListContainer,
  SFaqListItem,
  SFaqListItemToggle,
} from "components/FaqList/FaqList.styled"
import { HideShow } from "components/HideShow"
import { Text } from "components/Typography/Text/Text"
import { useToggle } from "react-use"

type FaqListItemProps = { question: string; answer: React.ReactNode }

export type FaqListProps = {
  items: FaqListItemProps[]
}

const FaqListItem: React.FC<FaqListItemProps> = ({ question, answer }) => {
  const [isExpanded, toggleExpanded] = useToggle(false)
  return (
    <SFaqListItem>
      <SFaqListItemToggle
        data-expanded={String(isExpanded)}
        onClick={toggleExpanded}
      >
        {question}
        <HideShow isOpen={isExpanded} />
      </SFaqListItemToggle>
      <AccordionAnimation expanded={isExpanded}>
        <Text fs={14} lh="1.4" color="darkBlue200" sx={{ px: 20, pb: 10 }}>
          {answer}
        </Text>
      </AccordionAnimation>
    </SFaqListItem>
  )
}

export const FaqList: React.FC<FaqListProps> = ({ items = [] }) => {
  return (
    <SFaqListContainer>
      {items.map((props) => (
        <FaqListItem key={props.question} {...props} />
      ))}
    </SFaqListContainer>
  )
}
