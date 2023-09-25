import * as Tooltip from "@radix-ui/react-tooltip"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { HeaderSeparator } from "sections/pools/header/PoolsHeader"
import { theme } from "theme"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { STriggerButton } from "./ClaimAllDrowpdown.styled"
import { ClaimAllContent } from "./ClaimAllContent"

export const ClaimAllDropdown = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const depositShares = useAllUserDepositShare()

  if (!Object.keys(depositShares.data).length) {
    return null
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <HeaderSeparator />
      <div sx={{ flex: "row" }} css={{ textAlign: "right" }}>
        <Tooltip.Root
          delayDuration={0}
          open={open}
          onOpenChange={(open) => {
            isDesktop && setOpen(open)
          }}
        >
          <div sx={{ flex: "column", flexGrow: [1, 0] }}>
            <STriggerButton
              onMouseOver={() => setOpen(true)}
              onClick={() => !isDesktop && setOpen(!open)}
            >
              <Text
                fs={13}
                lh={13}
                tTransform="uppercase"
                css={{ whiteSpace: "nowrap" }}
              >
                {t("farms.header.dropdown.label")}
              </Text>
              <Icon
                size={18}
                icon={
                  <ChevronRight
                    css={{ transform: `rotate(${open ? "270" : "90"}deg)` }}
                  />
                }
              />
            </STriggerButton>
            {open && !isDesktop && <ClaimAllContent onClose={handleClose} />}
          </div>
          {isDesktop && (
            <Tooltip.Portal>
              <Tooltip.Content
                asChild
                side="bottom"
                align="end"
                sideOffset={-2}
              >
                <ClaimAllContent onClose={handleClose} />
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </Tooltip.Root>
      </div>
    </>
  )
}
