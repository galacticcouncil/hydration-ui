import { Container, InnerContainer, SOption } from "./ScrollablePicker.styled"
import { useEffect, useRef, useState } from "react"
import { useScroll } from "react-use"
import { Spacer } from "components/Spacer/Spacer"
import { TSlice } from "../PieChart/PieChart"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as ArrowIcon } from "assets/icons/ChevronRightSmall.svg"
import { Icon } from "components/Icon/Icon"

const ITEM_HEIGHT = 45
const VISIBLE_OPTION_AMOUNT = 5
const HEIGHT = ITEM_HEIGHT * VISIBLE_OPTION_AMOUNT

type ScrollablePickerProps = {
  values: TSlice[]
  onChange: (value: number | undefined) => void
}

export const ScrollablePicker = ({
  values,
  onChange,
}: ScrollablePickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeOption, setActiveOption] = useState<number | undefined>(
    undefined,
  )

  const { y } = useScroll(scrollRef)

  useEffect(() => {
    const newValue = Math.floor(y / ITEM_HEIGHT)
    if (activeOption !== newValue) {
      setActiveOption(Math.floor(y / ITEM_HEIGHT))
      onChange(newValue === 0 ? undefined : newValue - 1)
    }
  }, [activeOption, y, onChange])

  const scrollTo = (number: number) => {
    scrollRef.current?.scrollTo({
      top: number,
      left: 0,
      behavior: "smooth",
    })
  }

  return (
    <Container height={HEIGHT} ref={scrollRef}>
      <InnerContainer>
        <Spacer size={ITEM_HEIGHT * 2} />
        {values.map((el, index) => {
          const isActive = index === activeOption
          const currentYCor = index * ITEM_HEIGHT

          return (
            <SOption
              key={el.symbol}
              isActive={isActive}
              onClick={() => scrollTo(currentYCor)}
            >
              <div
                sx={{
                  flex: "row",
                  gap: 6,
                  align: "center",
                  height: `calc(${ITEM_HEIGHT}px - var(--padding) * 2)`,
                }}
              >
                {el.symbol !== "overview" ? (
                  <div
                    sx={{ width: 10, height: 10 }}
                    css={{ borderRadius: "50%", background: el.color }}
                  />
                ) : (
                  <Icon sx={{ color: "white", mr: 4 }} icon={<ArrowIcon />} />
                )}
                <Text fs={12}>{el.name}</Text>
              </div>
            </SOption>
          )
        })}
        <Spacer size={ITEM_HEIGHT * 2} />
      </InnerContainer>
    </Container>
  )
}
