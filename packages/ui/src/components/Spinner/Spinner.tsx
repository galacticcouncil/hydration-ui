import { ThemeUICSSProperties } from "@theme-ui/css"

import { SpinnerCircle } from "@/assets/icons"

export type SpinnerProps = Omit<React.ComponentProps<"svg">, "size"> & {
  size?: ThemeUICSSProperties["size"]
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "l", ...props }) => {
  return <SpinnerCircle sx={{ size }} {...props} />
}
