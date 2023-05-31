import Skeleton from "react-loading-skeleton"
import { Container } from "./ScrollablePicker.styled"

const ITEM_HEIGHT = 45
const VISIBLE_OPTION_AMOUNT = 5
const HEIGHT = ITEM_HEIGHT * VISIBLE_OPTION_AMOUNT

export const ScrollablePickerSkeleton = () => {
  return (
    <Container
      height={HEIGHT}
      sx={{ display: ["flex", "none"], flex: "column", gap: 28 }}
    >
      <Skeleton width={56} height={19} />
      <Skeleton width={78} height={19} />
      <Skeleton width={56} height={19} />
      <Skeleton width={78} height={19} />
      <Skeleton width={56} height={19} />
    </Container>
  )
}
