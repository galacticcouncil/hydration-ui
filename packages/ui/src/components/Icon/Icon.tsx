import { ThemeUICSSProperties } from "@theme-ui/css"

import { ThemeColor } from "@/theme"

type IconProps = {
  component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  size?: number | string
  color?: ThemeColor | ThemeUICSSProperties["color"]
  className?: string
}

export const Icon = ({
  component: SvgComponent,
  size = 24,
  color = "currentColor",
  className,
}: IconProps) => (
  <p
    css={{
      width: size,
      height: size,
      " & > *": { width: size, height: size },
    }}
    className={className}
  >
    <SvgComponent color={color as string} />
  </p>
)
