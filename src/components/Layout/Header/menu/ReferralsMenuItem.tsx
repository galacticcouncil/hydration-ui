import { SItem } from "./HeaderMenu.styled"
import { Icon } from "components/Icon/Icon"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { ReactNode } from "react"

export const ReferralsMenuItem = ({
  isActive,
  children,
}: {
  isActive: boolean
  children: ReactNode
}) => {
  return (
    <div css={{ position: "relative" }}>
      <SItem isActive={isActive}>
        {children}
        <Icon
          size={20}
          sx={{ color: "red100" }}
          icon={<ChevronDown />}
          css={{ position: "absolute" }}
        />
      </SItem>
    </div>
  )
}
