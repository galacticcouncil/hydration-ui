import { SxProps } from "jsx/jsx-sx-convert"
import { SxProps as MuiSxProps } from "@mui/system"

declare module "react" {
  interface Attributes {
    sx?: SxProps | MuiSxProps
  }
}
