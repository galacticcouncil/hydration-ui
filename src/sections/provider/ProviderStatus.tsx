import { u32, u64 } from "@polkadot/types"
import { Text } from "components/Typography/Text/Text"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Maybe } from "utils/helpers"
import { motion, useAnimationControls } from "framer-motion"

function useElapsedTimeStatus(time: Maybe<u64>) {
  const [now, setNow] = useState(Date.now())

  const ref = useRef<number>(0)
  useEffect(() => {
    function update() {
      const now = Date.now()
      const nextTimer = 1000 - (now % 1000)
      ref.current = window.setTimeout(update, nextTimer)
      setNow(now)
    }

    update()
    return () => {
      window.clearInterval(ref.current)
    }
  }, [])

  if (time == null) return null

  const diff = now - time.toNumber()

  // Instead of 24s (usual target), use 32s to not show warnings all the time
  if (diff < 32_000) return "online" as const
  if (diff < 120_000) return "slow" as const
  return "offline"
}

function ProviderStatusSuccess() {
  const circ = Math.ceil(2 * Math.PI * 5)

  const controls = useAnimationControls()
  useEffect(() => {
    async function animate() {
      controls.set({ opacity: 1, strokeDashoffset: circ * (1 - 0) })
      await controls.start(
        { strokeDashoffset: circ * (1 - 1) },
        { duration: 0.8 },
      )
      await controls.start({ opacity: 0 }, { duration: 0.2 })
    }

    animate()
  }, [controls, circ])

  return (
    <div css={{ position: "relative" }}>
      <span
        sx={{ width: 7, height: 7, display: "block" }}
        css={{
          background: `currentColor`,
          borderRadius: "9999px",
        }}
      />

      <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        css={{
          position: "absolute",
          top: -2,
          left: -2,
          transform: "rotate(-90deg)",
        }}
      >
        <motion.circle
          cx="5.5"
          cy="5.5"
          r="5"
          stroke="currentColor"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          animate={controls}
        />
      </svg>
    </div>
  )
}

export function ProviderStatus(props: {
  timestamp: Maybe<u64>
  relaychainBlockNumber: Maybe<u32>
}) {
  const { t } = useTranslation()

  const status = useElapsedTimeStatus(props.timestamp)

  const color =
    status === "online"
      ? "#00FFA0"
      : status === "offline"
      ? "#FF4B4B"
      : status === "slow"
      ? "#F5A855"
      : undefined

  return (
    <Text
      fs={9}
      lh={9}
      sx={{ flex: "row", gap: 4, align: "center" }}
      css={{ letterSpacing: "1px", color }}
    >
      <span>{t("value", { value: props.relaychainBlockNumber })}</span>

      {status === "online" && (
        <ProviderStatusSuccess key={props.timestamp?.toNumber() ?? 0} />
      )}

      {status === "offline" && (
        <span
          sx={{ width: 7, height: 7, display: "block" }}
          css={{ background: `currentColor` }}
        />
      )}

      {status === "slow" && (
        <svg
          width="9"
          height="7"
          viewBox="0 0 9 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.49999 0L8.3971 6.75H0.602875L4.49999 0Z"
            fill="currentColor"
          />
        </svg>
      )}
    </Text>
  )
}
