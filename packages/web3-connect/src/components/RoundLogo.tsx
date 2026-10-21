import { Image, ImageProps } from "@galacticcouncil/ui/components"
import { ThemeUICSSProperties } from "@galacticcouncil/ui/types"

type Props = ImageProps & {
  readonly size: ThemeUICSSProperties["size"]
}

export const RoundLogo = ({
  size,
  alt = "",
  lazy = false,
  ...props
}: Props) => (
  <Image
    {...props}
    alt={alt}
    lazy={lazy}
    sx={{ size, borderRadius: "full", flexShrink: 0, objectFit: "contain" }}
  />
)
