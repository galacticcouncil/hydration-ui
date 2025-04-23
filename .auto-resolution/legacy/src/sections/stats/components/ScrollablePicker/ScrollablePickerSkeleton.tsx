import Skeleton from "react-loading-skeleton"
import { Container } from "./ScrollablePicker.styled"

export const ScrollablePickerSkeleton = () => {
  return (
    <Container
      sx={{
        display: ["flex", "none"],
        flex: "row",
        justify: "center",
        gap: 28,
      }}
    >
      <Skeleton width={56} height={19} />
      <Skeleton width={78} height={19} />
      <Skeleton width={56} height={19} />
      <Skeleton width={78} height={19} />
      <Skeleton width={56} height={19} />
    </Container>
  )
}
