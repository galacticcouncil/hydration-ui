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
  readonly className?: string
}

export const Points = ({
  size = "m",
  number,
  title,
  description,
  className,
}: Props) => {
  return (
    <SPointsContainer size={size} className={className}>
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
