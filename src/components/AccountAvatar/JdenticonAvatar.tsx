import * as jdenticon from "jdenticon"
import { memo, useMemo } from "react"
import { theme } from "theme"

export const JdenticonAvatar = memo(
  (props: { publicKey: string; size: number; className?: string }) => {
    const html = useMemo(
      () => ({
        __html: jdenticon.toSvg(props.publicKey.substring(2), props.size),
      }),
      [props.publicKey, props.size],
    )

    return (
      <span
        css={{
          display: "inline-block",
          lineHeight: 0,
          background: theme.colors.white,
          borderRadius: "9999px",
        }}
        className={props.className}
        dangerouslySetInnerHTML={html}
      />
    )
  },
)
