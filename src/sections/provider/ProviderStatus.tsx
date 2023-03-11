import { u32 } from "@polkadot/types"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Maybe } from "utils/helpers"

export function ProviderStatus(props: {
  status: "online" | "offline" | "slow"
  relaychainBlockNumber: Maybe<u32>
}) {
  const { t } = useTranslation()
  const color =
    props.status === "online"
      ? "#00FFA0"
      : props.status === "offline"
      ? "#FF4B4B"
      : props.status === "slow"
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

      {props.status === "online" && (
        <span
          sx={{ width: 7, height: 7, display: "block" }}
          css={{
            background: `currentColor`,
            borderRadius: "9999px",
          }}
        />
      )}

      {props.status === "offline" && (
        <span
          sx={{ width: 7, height: 7, display: "block" }}
          css={{ background: `currentColor` }}
        />
      )}

      {props.status === "slow" && (
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
