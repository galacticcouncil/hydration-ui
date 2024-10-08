import { ComponentPropsWithoutRef, FC } from "react"
import Skeleton from "react-loading-skeleton"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import { SAccountItem } from "./Web3ConnectAccount.styled"

export const Web3ConnectAccountPlaceholder: FC<
  Partial<ComponentPropsWithoutRef<typeof Web3ConnectAccount>>
> = () => {
  return (
    <SAccountItem css={{ pointerEvents: "none" }}>
      <div sx={{ flex: "column", gap: 12 }}>
        <div
          sx={{
            flex: "row",
            align: "center",
            gap: 12,
            justify: "space-between",
          }}
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
              <Skeleton width={120} height={13} />
              <Skeleton width="90%" height={13} sx={{ flexGrow: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </SAccountItem>
  )
}
