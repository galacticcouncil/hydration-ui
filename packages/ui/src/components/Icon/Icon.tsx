type IconProps = {
  component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  size?: number | string
  color?: string
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
    <SvgComponent color={color} />
  </p>
)
