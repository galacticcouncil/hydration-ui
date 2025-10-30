import { Separator } from "components/Separator/Separator"
import React from "react"

export const CtaSeparator = () => (
  <Separator
    sx={{
      mt: "auto",
      width: "auto",
      mx: "calc(-1 * var(--modal-header-padding-x))",
      mb: "var(--modal-header-padding-x)",
    }}
  />
)
