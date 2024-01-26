import { MenuIcon } from "@heroicons/react/outline"

import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Typography,
} from "@mui/material"
import { ReactNode } from "react"
import { PROD_ENV } from "sections/lending/utils/marketsAndNetworksConfig"

import { Link } from "sections/lending/components/primitives/Link"
import { moreNavigation } from "sections/lending/ui-config/menu-items"
import { DarkModeSwitcher } from "./components/DarkModeSwitcher"
import { DrawerWrapper } from "./components/DrawerWrapper"
import { MobileCloseButton } from "./components/MobileCloseButton"
import { NavItems } from "./components/NavItems"
import { TestNetModeSwitcher } from "./components/TestNetModeSwitcher"

interface MobileMenuProps {
  open: boolean
  setOpen: (value: boolean) => void
  headerHeight: number
}

const MenuItemsWrapper = ({
  children,
  title,
}: {
  children: ReactNode
  title: ReactNode
}) => (
  <Box
    sx={{
      mb: 6,
      "&:last-of-type": { mb: 0, ".MuiDivider-root": { display: "none" } },
    }}
  >
    <Box sx={{ px: 2 }}>
      <Typography variant="subheader2" sx={{ color: "#A5A8B6", px: 4, py: 2 }}>
        {title}
      </Typography>

      {children}
    </Box>

    <Divider sx={{ borderColor: "#F2F3F729", mt: 6 }} />
  </Box>
)

export const MobileMenu = ({
  open,
  setOpen,
  headerHeight,
}: MobileMenuProps) => {
  return (
    <>
      {open ? (
        <MobileCloseButton setOpen={setOpen} />
      ) : (
        <Button
          id="settings-button-mobile"
          variant="surface"
          sx={{ p: "7px 8px", minWidth: "unset", ml: 2 }}
          onClick={() => setOpen(true)}
        >
          <SvgIcon sx={{ color: "#F1F1F3" }} fontSize="small">
            <MenuIcon />
          </SvgIcon>
        </Button>
      )}

      <DrawerWrapper open={open} setOpen={setOpen} headerHeight={headerHeight}>
        <>
          <MenuItemsWrapper title={<span>Menu</span>}>
            <NavItems setOpen={setOpen} />
          </MenuItemsWrapper>
          <MenuItemsWrapper title={<span>Global settings</span>}>
            <List>
              <DarkModeSwitcher />
              {PROD_ENV && <TestNetModeSwitcher />}
            </List>
          </MenuItemsWrapper>
          <MenuItemsWrapper title={<span>Links</span>}>
            <List>
              {moreNavigation.map((item, index) => (
                <ListItem
                  component={Link}
                  href={item.link}
                  sx={{ color: "#F1F1F3" }}
                  key={index}
                >
                  <ListItemIcon sx={{ minWidth: "unset", mr: 3 }}>
                    <SvgIcon sx={{ fontSize: "20px", color: "#F1F1F3" }}>
                      {item.icon}
                    </SvgIcon>
                  </ListItemIcon>

                  <ListItemText>{item.title}</ListItemText>
                </ListItem>
              ))}
            </List>
          </MenuItemsWrapper>
        </>
      </DrawerWrapper>
    </>
  )
}
