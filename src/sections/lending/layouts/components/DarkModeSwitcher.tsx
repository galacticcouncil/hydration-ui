import {
  Box,
  FormControlLabel,
  ListItem,
  ListItemText,
  MenuItem,
  Switch,
  useTheme,
} from "@mui/material"
import React from "react"

import { ColorModeContext } from "sections/lending/layouts/AppGlobalStyles"

interface DarkModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem
}

export const DarkModeSwitcher = ({
  component = ListItem,
}: DarkModeSwitcherProps) => {
  const theme = useTheme()
  const colorMode = React.useContext(ColorModeContext)

  return (
    <Box
      component={component}
      onClick={colorMode.toggleColorMode}
      sx={{
        color: { xs: "#F1F1F3", md: "text.primary" },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <span>Dark mode</span>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="darkmode"
        control={
          <Switch
            disableRipple
            checked={theme.palette.mode === "dark"}
            sx={{
              ".MuiSwitch-track": {
                bgcolor: { xs: "#FFFFFF1F", md: "primary.light" },
              },
            }}
          />
        }
        label={theme.palette.mode === "dark" ? "On" : "Off"}
        labelPlacement="start"
      />
    </Box>
  )
}
