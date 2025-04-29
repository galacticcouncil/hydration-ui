import {
  PointsSize,
  SPointsContainer,
  SPointsDescription,
  SPointsNumber,
  SPointsNumberContainer,
  SPointsTextContent,
  SPointsTitle,
} from "@/components/Points/Points.styled"

type Props = {
  readonly size?: PointsSize
  readonly number: number
  readonly title: string
  readonly description: string
}

export const Points = ({ size = "m", number, title, description }: Props) => {
  return (
    <SPointsContainer size={size}>
      <SPointsNumberContainer size={size}>
        <SPointsNumber size={size}>{number}</SPointsNumber>
      </SPointsNumberContainer>
      <SPointsTextContent size={size}>
        <SPointsTitle size={size}>{title}</SPointsTitle>
        <SPointsDescription size={size}>{description}</SPointsDescription>
      </SPointsTextContent>
    </SPointsContainer>
  )
}
