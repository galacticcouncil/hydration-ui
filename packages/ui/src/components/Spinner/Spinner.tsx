import { ThemeUICSSProperties } from "@theme-ui/css"

import { LoaderCircle, SpinnerCircle } from "@/assets/icons"
import { getToken } from "@/utils"

export type SpinnerProps = Omit<React.ComponentProps<"svg">, "size"> & {
  size?: ThemeUICSSProperties["size"]
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "l", ...props }) => {
  return <SpinnerCircle sx={{ size }} {...props} />
}

export const SpinnerIcon: React.FC<SpinnerProps> = ({ size, ...props }) => {
  return (
    <LoaderCircle
      {...props}
      sx={{
        size,
        animationName: getToken("animations.rotate"),
        animationDuration: "0.75s",
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
      }}
    />
  )
}
