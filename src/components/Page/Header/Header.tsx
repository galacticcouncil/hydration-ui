import { BasiliskIcon } from "assets/icons/BasiliskIcon";
import { BasiliskLogo } from "assets/icons/BasiliskLogo";
import { Box } from "components/Box/Box";
import { Icon } from "components/Icon/Icon";
import { IconButton } from "components/IconButton/IconButton";
import { MenuList } from "./MenuList/MenuList";
import { StyledHeader } from "./Header.styled";

const menuItems = [
  {
    text: "Trade",
    active: false,
  },
  { text: "Pools & Farms", active: true },
  { text: "Wallet", active: false },
];

export const Header = () => (
  <StyledHeader>
    <Box flex spread acenter>
      <Box flex acenter>
        <Icon size={32} mr={11}>
          <BasiliskIcon />
        </Icon>
        <Icon height={21} mr={60}>
          <BasiliskLogo />
        </Icon>
        <MenuList items={menuItems} />
      </Box>
      <Box>
        <IconButton>
          <BasiliskIcon />
        </IconButton>
      </Box>
    </Box>
  </StyledHeader>
);
