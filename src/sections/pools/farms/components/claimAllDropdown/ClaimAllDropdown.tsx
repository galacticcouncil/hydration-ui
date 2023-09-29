import * as Popover from "@radix-ui/react-popover"
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

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <>
      <HeaderSeparator />
      <div
        sx={{ flex: "row" }}
        css={{ textAlign: "right" }}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
          <div sx={{ flex: "column", flexGrow: [1, 0] }}>
            <STriggerButton>
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
            <Popover.Portal>
              <Popover.Content
                css={{ zIndex: theme.zIndices.modal }}
                side="bottom"
                align="end"
                sideOffset={-2}
              >
                <ClaimAllContent onClose={handleClose} />
              </Popover.Content>
            </Popover.Portal>
          )}
        </Popover.Root>
      </div>
    </>
  )
}
