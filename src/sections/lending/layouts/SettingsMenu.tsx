import { CogIcon } from "@heroicons/react/solid"

import { Button, Menu, MenuItem, SvgIcon, Typography } from "@mui/material"
import React, { useState } from "react"

import { DarkModeSwitcher } from "./components/DarkModeSwitcher"
import { TestNetModeSwitcher } from "./components/TestNetModeSwitcher"

export function SettingsMenu() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const handleSettingsClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget)
    setSettingsOpen(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSettingsOpen(false)
  }

  return (
    <>
      <Button
        variant="surface"
        aria-label="settings"
        id="settings-button"
        aria-controls={settingsOpen ? "settings-menu" : undefined}
        aria-expanded={settingsOpen ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleSettingsClick}
        sx={{ p: "7px 8px", minWidth: "unset", ml: 8 }}
      >
        <SvgIcon sx={{ color: "#F1F1F3" }} fontSize="small">
          <CogIcon />
        </SvgIcon>
      </Button>

      <Menu
        id="settings-menu"
        MenuListProps={{
          "aria-labelledby": "settings-button",
        }}
        anchorEl={anchorEl}
        open={settingsOpen}
        onClose={handleClose}
        sx={{ ".MuiMenuItem-root.Mui-disabled": { opacity: 1 } }}
        keepMounted={true}
      >
        <MenuItem disabled sx={{ mb: "4px" }}>
          <Typography variant="subheader2" color="text.secondary">
            <span>Global settings</span>
          </Typography>
        </MenuItem>

        <DarkModeSwitcher component={MenuItem} />
        <TestNetModeSwitcher />
      </Menu>
    </>
  )
}
