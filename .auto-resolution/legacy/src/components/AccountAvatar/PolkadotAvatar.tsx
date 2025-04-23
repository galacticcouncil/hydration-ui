import { memo, useMemo } from "react"
import { polkadotIcon } from "@polkadot/ui-shared"

export const PolkadotAvatar = memo(
  (props: {
    address: string
    isAlternative?: boolean
    size: number
    className?: string
  }) => {
    const circles = useMemo(
      () =>
        polkadotIcon(props.address, {
          isAlternative: props.isAlternative ?? false,
        }),
      [props.address, props.isAlternative],
    )

    return (
      <svg
        className={props.className}
        width={props.size}
        height={props.size}
        name={props.address}
        viewBox="0 0 64 64"
      >
        {circles.map(({ cx, cy, fill, r }, key) => (
          <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />
        ))}
      </svg>
    )
  },
)
