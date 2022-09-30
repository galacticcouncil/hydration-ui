import { useId, useMemo } from "react"
import { encodeAddress } from "@polkadot/util-crypto"
import color from "color"
import md5 from "md5"

const shuffle = (input: string, e = 0) => input.slice(e) + input.slice(0, e)

// Obtained from Talisman Wallet
function encode(input: string, mod: number) {
  let res = 5381
  for (let n = 0; n < input.length; n++) {
    res = (res << 5) + res + input.charCodeAt(n)
  }
  return (res + mod) % mod
}

const getColor = (input: string) => {
  const e = encode(input, 360)
  return color().hsv(e, 100, 100)
}

function normalizeSeed(seed: string) {
  const isEthereum = seed.startsWith("0x")
  if (isEthereum) return seed

  try {
    return encodeAddress(seed)
  } catch (e) {
    return seed
  }
}

export const TalismanAvatar = (props: {
  seed: string
  className?: string
  width: string | number
  height: string | number
}) => {
  const id = useId()
  const { bgColor1, bgColor2, transform, glowColor, cx, cy } = useMemo(() => {
    const hash = md5(normalizeSeed(props.seed))
    const one = shuffle(hash, 1)
    const two = shuffle(hash, 2)

    const [bgColor1, bgColor2, glowColor] = [
      getColor(hash),
      getColor(one),
      getColor(two),
    ]
      .sort((t, e) => t.lightness() - e.lightness())
      .map((i) => i.hex())

    const cx = 10 + encode(hash, 10)
    const cy = 10 + encode(one, 10)
    const transform = `rotate(${encode(hash, 360)} 32 32)`

    return { bgColor1, bgColor2, glowColor, transform, cx, cy }
  }, [props.seed])

  return (
    <svg
      width={props.width}
      height={props.height}
      className={props.className}
      viewBox="0 0 64 64"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-bg`}>
          <stop offset="20%" stopColor={bgColor1} />
          <stop offset="100%" stopColor={bgColor2} />
        </linearGradient>
        <radialGradient id={`${id}-circle`}>
          <stop offset="10%" stopColor={glowColor} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <g transform={transform}>
          <rect fill={`url(#${id}-bg)`} x={0} y={0} width={64} height={64} />
          <circle
            fill={`url(#${id}-circle)`}
            cx={cx}
            cy={cy}
            r={45}
            opacity={0.7}
          />
        </g>
      </g>
    </svg>
  )
}
