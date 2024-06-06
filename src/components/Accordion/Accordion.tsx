import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { SContainer, SContent } from "./Accordion.styled"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { FC, ReactNode, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

type AccordionProps = {
  title: string
  children: ReactNode
  icon?: ReactNode
  columns?: number
  open?: boolean
}

export const Accordion: FC<AccordionProps> = ({
  title,
  children,
  icon,
  columns = 1,
  open = false,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(open)

  return (
    <SContainer
      expanded={expanded}
      onClick={() => setExpanded((state) => !state)}
    >
      <div sx={{ flex: "row", justify: "space-between", height: 24 }}>
        <div sx={{ flex: "row", gap: 8, align: "center" }}>
          {icon && <Icon icon={icon} />}
          <Text
            color="white"
            fs={15}
            fw={400}
            font="GeistMono"
            tTransform="uppercase"
          >
            {title}
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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            css={{ overflow: "hidden" }}
          >
            <SContent columns={columns}>{children}</SContent>
          </motion.div>
        )}
      </AnimatePresence>
    </SContainer>
  )
}
