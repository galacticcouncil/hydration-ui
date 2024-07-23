import { FC, memo, useId, useMemo } from "react"
import { encodeAddress } from "@polkadot/util-crypto"
import color from "color"
import md5 from "md5"
import { isEvmAddress } from "utils/evm"

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

type TalismanAvatarProps = {
  seed: string
  className?: string
  size: string | number
}

export const TalismanAvatar: FC<TalismanAvatarProps> = memo(
  ({ seed, className, size }) => {
    const id = useId()
    const { bgColor1, bgColor2, transform, glowColor, cx, cy } = useMemo(() => {
      const hash = md5(normalizeSeed(seed))
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
    }, [seed])

    return (
      <>
        <svg
          width={size}
          height={size}
          className={className}
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
              <rect
                fill={`url(#${id}-bg)`}
                x={0}
                y={0}
                width={64}
                height={64}
              />
              <circle
                fill={`url(#${id}-circle)`}
                cx={cx}
                cy={cy}
                r={45}
                opacity={0.7}
              />
            </g>
          </g>
          {isEvmAddress(seed) ? (
            <g fill="#fff" opacity=".75">
              <path d="M18.767 32.732 32.2 41.034l13.433-8.302L32.2 9.751 18.767 32.732Z" />
              <path d="M18.767 35.336 32.2 43.701l13.433-8.365L32.2 54.551 18.767 35.336Z" />
            </g>
          ) : (
            <g
              clip-path="url(#:r27:_1751_2030)"
              opacity="0.75"
              transform="scale(2.2) translate(4.5 3.9)"
            >
              <path
                d="M9.99937 4.4612C12.1176 4.4612 13.8347 3.46253 13.8347 2.2306C13.8347 0.998674 12.1176 0 9.99937 0C7.88119 0 6.16406 0.998674 6.16406 2.2306C6.16406 3.46253 7.88119 4.4612 9.99937 4.4612Z"
                fill="white"
              ></path>
              <path
                d="M9.99937 21.2683C12.1176 21.2683 13.8347 20.2697 13.8347 19.0377C13.8347 17.8058 12.1176 16.8071 9.99937 16.8071C7.88119 16.8071 6.16406 17.8058 6.16406 19.0377C6.16406 20.2697 7.88119 21.2683 9.99937 21.2683Z"
                fill="white"
              ></path>
              <path
                d="M4.65427 7.54892C5.71336 5.71457 5.70649 3.72787 4.63892 3.11149C3.57135 2.49511 1.84735 3.48246 0.788259 5.31681C-0.270832 7.15115 -0.263958 9.13786 0.803612 9.75424C1.87118 10.3706 3.59518 9.38326 4.65427 7.54892Z"
                fill="white"
              ></path>
              <path
                d="M19.2083 15.9515C20.2674 14.1171 20.2611 12.1307 19.1943 11.5148C18.1274 10.8988 16.404 11.8865 15.3449 13.7209C14.2858 15.5552 14.2921 17.5416 15.3589 18.1575C16.4258 18.7735 18.1492 17.7858 19.2083 15.9515Z"
                fill="white"
              ></path>
              <path
                d="M4.6399 18.1571C5.70747 17.5407 5.71434 15.554 4.65525 13.7196C3.59616 11.8853 1.87216 10.8979 0.804589 11.5143C-0.262981 12.1307 -0.269855 14.1174 0.789235 15.9517C1.84833 17.7861 3.57233 18.7734 4.6399 18.1571Z"
                fill="white"
              ></path>
              <path
                d="M19.1952 9.75475C20.2621 9.13878 20.2684 7.15241 19.2093 5.31807C18.1502 3.48372 16.4268 2.49603 15.3599 3.11199C14.2931 3.72796 14.2868 5.71433 15.3459 7.54867C16.405 9.38302 18.1284 10.3707 19.1952 9.75475Z"
                fill="white"
              ></path>
            </g>
          )}
        </svg>
      </>
    )
  },
)
