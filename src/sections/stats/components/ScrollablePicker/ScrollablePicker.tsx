import { Container, InnerContainer, SOption } from "./ScrollablePicker.styled"
import { useCallback, useState } from "react"
import { useEvent } from "react-use"
import { TSlice } from "sections/stats/components/DoughnutChart/DoughnutChart"
import { Text } from "components/Typography/Text/Text"
import ArrowIcon from "assets/icons/ChevronDownSmall.svg?react"
import { Icon } from "components/Icon/Icon"

type ScrollablePickerProps = {
  values: TSlice[]
  onChange: (value: number | undefined) => void
}

export const ScrollablePicker = ({
  values,
  onChange,
}: ScrollablePickerProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [activeOption, setActiveOption] = useState<number | undefined>(
    undefined,
  )

  const onScroll = useCallback(() => {
    if (!container) return

    const children = container ? [...container.children] : []

    const containerRect = container.getBoundingClientRect()
    const middlePoint = containerRect.left + containerRect.width / 2

    let newValue = 0

    children.forEach((el, i) => {
      const bounds = el.getBoundingClientRect()
      const left = bounds.left

      if (left < middlePoint) {
        newValue = i
      }
    })

    if (activeOption !== newValue) {
      setActiveOption(newValue)
      onChange(newValue === 0 ? undefined : newValue - 1)
    }
  }, [activeOption, container, onChange])

  useEvent("scroll", onScroll, container)

  return (
    <Container>
      <Icon sx={{ color: "white", display: "block" }} icon={<ArrowIcon />} />
      <InnerContainer ref={setContainer}>
        {values.map((el, index) => {
          const isActive = index === activeOption

          return (
            <SOption
              key={el.symbol}
              isActive={isActive}
              onClick={(e) => {
                e.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "center",
                })
              }}
            >
              <div
                sx={{
                  flex: "row",
                  gap: 6,
                  align: "center",
                }}
              >
                {el.symbol !== "overview" && (
                  <div
                    sx={{ width: 10, height: 10 }}
                    css={{ borderRadius: "50%", background: el.color }}
                  />
                )}
                <Text fs={12}>{el.name}</Text>
              </div>
            </SOption>
          )
        })}
      </InnerContainer>
    </Container>
  )
}
