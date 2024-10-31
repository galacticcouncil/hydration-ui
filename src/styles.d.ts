import { SxProps } from "jsx/jsx-sx-convert"

declare module "react" {
  interface Attributes {
    sx?: SxProps
  }
}
