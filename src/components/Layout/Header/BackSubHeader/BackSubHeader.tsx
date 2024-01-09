import { Text } from "components/Typography/Text/Text"
import ChevronDownIcon from "assets/icons/ChevronRight.svg?react"
import { useLocation, useNavigate } from "@tanstack/react-location"
import { IconButton } from "components/IconButton/IconButton"
import { NavigationContainer } from "./BackSubHeader.styled"
import { ButtonTransparent } from "components/Button/Button"

export const BackSubHeader = ({
  label,
  to,
}: {
  label: string
  to?: string
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <NavigationContainer>
      <ButtonTransparent
        name="Back"
        onClick={() => (to ? navigate({ to }) : location.history.back())}
        sx={{ flex: "row", gap: 10, align: "center" }}
      >
        <IconButton
          as="span"
          name="Back"
          icon={<ChevronDownIcon />}
          size={24}
          css={{
            borderColor: "rgba(114, 131, 165, 0.6)",
            color: "white",
            transform: "rotate(180deg)",
          }}
        />
        {label && (
          <Text fs={13} tTransform="uppercase" color="white">
            {label}
          </Text>
        )}
      </ButtonTransparent>
    </NavigationContainer>
  )
}
