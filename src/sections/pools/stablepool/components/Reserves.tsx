import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  motion,
} from "framer-motion"
import React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { TReservesBalance } from "sections/pools/PoolsPage.utils"
import { BN_0 } from "utils/constants"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { theme } from "theme"
import BN from "bignumber.js"

export const Reserves = ({
  reserves,
  lableSize = 15,
}: {
  reserves: TReservesBalance
  lableSize?: number
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const total = reserves.reduce(
    (acc, reserve) => acc.plus(reserve.balanceDisplay),
    BN_0,
  )

  return (
    <div sx={{ py: 12 }}>
      <div
        onClick={() => setExpanded((state) => !state)}
        sx={{ flex: "row", justify: "space-between", align: "center" }}
        css={{ cursor: "pointer" }}
      >
        <Text tTransform="uppercase" font="GeistMono" fs={lableSize}>
          {t("liquidity.stablepool.reserves")}
        </Text>
        <div sx={{ flex: "row", align: "center" }}>
          <Text color="basic500" fs={14}>
            <DisplayValue value={total} isUSD />
          </Text>

          <Icon
            icon={<ChevronDownIcon />}
            sx={{ color: "darkBlue300" }}
            css={{
              color: theme.colors.iconGray,
              transform: expanded ? "rotate(180deg)" : undefined,
              transition: theme.transitions.default,
            }}
          />
        </div>
      </div>

      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
              sx={{ flex: "column", gap: 6, mt: 8, py: 2, px: 2 }}
            >
              {reserves.map(({ id, symbol, balance, percentage }, index) => (
                <React.Fragment key={id}>
                  <div
                    sx={{
                      flex: "row",
                      justify: "space-between",
                      align: "center",
                    }}
                  >
                    <div sx={{ flex: "row", align: "center", gap: 8 }}>
                      <Icon size={24} icon={<AssetLogo id={id} />} />
                      <Text color="white" fs={14}>
                        {symbol}
                      </Text>
                    </div>

                    <div sx={{ flex: "row", align: "center", gap: 8 }}>
                      <Text color="white" fs={14}>
                        {t("value", {
                          value: balance,
                          decimalPlaces:
                            symbol?.includes("ETH") || symbol?.includes("BTC")
                              ? 4
                              : 3,
                        })}
                      </Text>
                      <Text fs={14} color="basic500">
                        {t("value.percentage", {
                          value: BN(percentage),
                          numberPrefix: "(",
                          numberSuffix: "%)",
                        })}
                      </Text>
                    </div>
                  </div>

                  {index < reserves.length - 1 && (
                    <Separator sx={{ width: "100%" }} color="darkBlue401" />
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </div>
  )
}
