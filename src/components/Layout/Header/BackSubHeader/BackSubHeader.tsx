import { Text } from "components/Typography/Text/Text"
import ChevronDownIcon from "assets/icons/ChevronRight.svg?react"
import { useNavigate } from "@tanstack/react-location"
import { IconButton } from "components/IconButton/IconButton"
import { NavigationContainer } from "./BackSubHeader.styled"

export const BackSubHeader = ({ label, to }: { label: string; to: string }) => {
  const navigate = useNavigate()
  return (
    <NavigationContainer>
      <IconButton
        name="Back"
        icon={<ChevronDownIcon />}
        onClick={() => navigate({ to })}
        size={24}
        css={{
          borderColor: "rgba(114, 131, 165, 0.6)",
          color: "white",
          transform: "rotate(180deg)",
        }}
      />
      <Text fs={13} tTransform="uppercase" color="white">
        {label}
      </Text>
    </NavigationContainer>
  )
}
