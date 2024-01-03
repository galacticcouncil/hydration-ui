import { Text } from "components/Typography/Text/Text"
import Skeleton from "react-loading-skeleton"
import { SAccountItem } from "./Web3ConnectAccount.styled"

export const Web3ConnectAccountPlaceholder = () => {
  return (
    <SAccountItem css={{ pointerEvents: "none", padding: "14px 18px" }}>
      <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
        <Text font="ChakraPetchBold">
          <Skeleton width={100} height={16} />
        </Text>
        <div sx={{ flex: "row", align: "end", gap: 2 }}>
          <Skeleton width={100} height={18} />
        </div>
      </div>

      <div sx={{ flex: "column", mt: 10, gap: 12 }}>
        <div
          sx={{
            flex: "row",
            align: "center",
            gap: 10,
            justify: "space-between",
          }}
          css={{ position: "relative" }}
        >
          <div sx={{ flex: "row", align: "center", width: "100%" }}>
            <div
              sx={{ flex: "row", align: "center", mr: 10 }}
              css={{ borderRadius: "9999px" }}
            >
              <Skeleton
                width={32}
                height={32}
                css={{ borderRadius: "9999px!important" }}
              />
            </div>

            <div sx={{ flex: "column", width: "100%" }}>
              <Skeleton width={120} height={12} />
              <Skeleton width="90%" height={14} sx={{ flexGrow: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </SAccountItem>
  )
}
