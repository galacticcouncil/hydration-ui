import { polkadotIcon } from "@polkadot/ui-shared"
import { useMemo } from "react"

import { Box, BoxProps } from "@/components/Box"
import { getToken } from "@/utils"

export type PolkadotIdenticonProps = BoxProps & {
  address: string
  size: number
}

export const PolkadotIdenticon: React.FC<PolkadotIdenticonProps> = ({
  address,
  size,
  ...props
}) => {
  const circles = useMemo(() => {
    const circles = polkadotIcon(address, {
      size,
    })
    // remove first circle so we can use different background
    return circles.slice(1, circles.length)
  }, [address, size])

  return (
    <Box {...props}>
      <svg
        width={size}
        height={size}
        name={address}
        viewBox="0 0 64 64"
        sx={{
          bg: getToken("surfaces.themeBasePalette.surfaceHigh"),
          borderRadius: "full",
          p: 2,
        }}
      >
        {circles.map(({ cx, cy, fill, r }, key) => (
          <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />
        ))}
      </svg>
    </Box>
  )
}
