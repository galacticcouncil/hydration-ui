import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Step } from "./Step"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { whyBonds } from "sections/trade/sections/bonds/Bonds.utils"
import { useTranslation } from "react-i18next"
import { SBondSteps, SWhyBonds } from "./WhyBonds.styled"
import WhyBondsIcon from "assets/icons/WhyBonds.svg?react"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { useState, useEffect } from "react"
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m as motion,
} from "framer-motion"
import { pluck } from "utils/rx"
import { DOC_LINK } from "utils/constants"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"
import BN from "bignumber.js"

export const WhyBonds = () => {
  const { t } = useTranslation()

  const { bonds } = useAssets()

  const [expanded, setExpanded] = useState<boolean | undefined>(undefined)

  const accountAssets = useAccountAssets()
  const balances = pluck("id", bonds).map(
    (id) => accountAssets.data?.accountAssetsMap.get(id)?.balance,
  )

  const hasBonds = balances.some((balance) => BN(balance?.total ?? "0").gt(0))

  useEffect(() => {
    if (hasBonds !== undefined && expanded === undefined) {
      if (!hasBonds) {
        setExpanded(true)
      } else {
        setExpanded(false)
      }
    }
  }, [hasBonds, expanded])

  return (
    <SWhyBonds
      expanded={!!expanded}
      onClick={() => setExpanded((state) => !state)}
    >
      <div sx={{ flex: "row", justify: "space-between", height: 24 }}>
        <div sx={{ flex: "row", gap: 8, align: "center" }}>
          <Icon icon={<WhyBondsIcon />} />
          <Text color="white" fs={[15, 19]} fw={600} font="GeistMono">
            {t("bonds.whyBonds.title")}
          </Text>
        </div>

        <div sx={{ flex: "row", align: "center" }}>
          <Text fs={13} color="darkBlue300">
            {t(expanded ? "hide" : "show")}
          </Text>
          <ButtonTransparent
            css={{
              color: theme.colors.iconGray,
              transform: expanded ? "rotate(180deg)" : undefined,
              transition: theme.transitions.default,
            }}
          >
            <Icon icon={<ChevronDownIcon />} sx={{ color: "darkBlue300" }} />
          </ButtonTransparent>
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
            >
              <SBondSteps>
                {whyBonds.map((whyBond) => (
                  <Step
                    key={whyBond.index}
                    icon={<Icon icon={whyBond.icon} />}
                    title={t(`bonds.whyBonds.${whyBond.index}.title`)}
                    description={t(`bonds.whyBonds.${whyBond.index}.desc`)}
                  />
                ))}
              </SBondSteps>
              <Text
                color="brightBlue600"
                fs={12}
                sx={{ mt: 30 }}
                css={{
                  borderBottom: `1px solid ${theme.colors.brightBlue600}`,
                  display: "inline-block",
                  "&:hover": {
                    color: theme.colors.brightBlue100,
                  },
                }}
              >
                <a href={`${DOC_LINK}/bonds`} target="_blank" rel="noreferrer">
                  {t("bonds.whyBonds.link")}
                  <LinkIcon height={10} sx={{ ml: 6 }} />
                </a>
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </SWhyBonds>
  )
}
