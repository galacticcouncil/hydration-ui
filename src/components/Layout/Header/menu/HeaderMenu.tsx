import { Link, useSearch } from "@tanstack/react-location"
import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { MENU_ITEMS } from "utils/navigation"
import { HeaderSubMenu } from "./HeaderSubMenu"
import { useProviderRpcUrlStore } from "api/provider"
import { useBestNumber } from "api/chain"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { enableStakingBlock } from "utils/constants"

export const HeaderMenu = () => {
  const { t } = useTranslation()
  const { account } = useSearch()
  const providers = useProviderRpcUrlStore()
  const api = useApiPromise()
  const bestNumber = useBestNumber(!isApiLoaded(api))

  const isMainnet =
    (providers.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL) ===
      "wss://rpc.hydradx.cloud" || import.meta.env.VITE_ENV === "production"

  const blockNumber = bestNumber.data?.parachainBlockNumber.toNumber()

  if (!blockNumber) return null

  return (
    <SList>
      {MENU_ITEMS.map((item, i) => {
        if (
          item.key === "staking" &&
          isMainnet &&
          blockNumber < enableStakingBlock
        ) {
          return null
        }

        if (!item.enabled) {
          return null
        }

        if (!item.href && item.subItems?.length) {
          return <HeaderSubMenu key={i} item={item} />
        }

        if (item.external) {
          return (
            <a href={item.href} key={i}>
              <SItem>{t(`header.${item.key}`)}</SItem>
            </a>
          )
        }

        return (
          <Link
            to={item.href}
            search={account ? { account } : undefined}
            key={i}
          >
            {({ isActive }) => (
              <SItem isActive={isActive}>{t(`header.${item.key}`)}</SItem>
            )}
          </Link>
        )
      })}
    </SList>
  )
}
