import { Text } from "components/Typography/Text/Text"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { m as motion, useAnimationControls } from "framer-motion"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useInterval, useMountedState } from "react-use"
import { PingResponse } from "utils/rpc"

const CIRC = Math.ceil(2 * Math.PI * 5)

export const useElapsedTimeStatus = (timestamp: number | null) => {
  const [now, setNow] = useState(Date.now())

  useInterval(() => {
    setNow(Date.now())
  }, 1000)

  if (timestamp === null) return "offline"

  const diff = now - timestamp

  // Instead of 24s (usual target), use 32s to not show warnings all the time
  if (diff < 32_000) return "online" as const
  if (diff < 120_000) return "slow" as const
  return "offline"
}

function ProviderStatusSuccess() {
  const isMounted = useMountedState()

  const controls = useAnimationControls()

  useEffect(() => {
    controls.set({ opacity: 1, strokeDashoffset: CIRC * (1 - 0) })
    controls
      .start({ strokeDashoffset: CIRC * (1 - 1) }, { duration: 0.8 })
      .then(() => {
        if (isMounted()) {
          controls.start({ opacity: 0 }, { duration: 0.2 })
        }
      })

    return () => {
      controls.stop()
    }
  }, [controls, isMounted])

  return (
    <span css={{ position: "relative" }}>
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
        xmlns="http://www.w3.org/2000.svg?react"
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
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
          animate={controls}
        />
      </svg>
    </span>
  )
}

type ProviderStatusProps = {
  className?: string
  side?: "left" | "top" | "bottom" | "right"
} & Partial<PingResponse>

export const ProviderStatus: React.FC<ProviderStatusProps> = ({
  timestamp,
  blockNumber,
  ping,
  className,
  side,
}) => {
  const { t } = useTranslation()

  const status = useElapsedTimeStatus(timestamp ?? 0)

  const color =
    status === "online"
      ? "#00FFA0"
      : status === "offline"
        ? "#FF4B4B"
        : status === "slow"
          ? "#F5A855"
          : undefined

  const statusText = status != null ? t(`rpc.status.${status}`) : ""

  return (
    <InfoTooltip text={statusText} type="default" side={side}>
      <Text
        fs={9}
        lh={9}
        sx={{ flex: "row", gap: 4, align: "center", height: 10 }}
        css={{ letterSpacing: "1px", color }}
        className={className}
      >
        {blockNumber && <span>{t("value", { value: blockNumber })}</span>}

        {status === "online" && <ProviderStatusSuccess key={timestamp ?? 0} />}

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
            xmlns="http://www.w3.org/2000.svg?react"
          >
            <path
              d="M4.49999 0L8.3971 6.75H0.602875L4.49999 0Z"
              fill="currentColor"
            />
          </svg>
        )}
      </Text>
      {ping && ping < Infinity && (
        <Text
          fs={8}
          lh={14}
          color={
            ping < 250 ? "green400" : ping < 500 ? "warningOrange200" : "red300"
          }
        >
          {t("milliseconds", { value: ping, decimalPlaces: 0 })}
        </Text>
      )}
    </InfoTooltip>
  )
}
