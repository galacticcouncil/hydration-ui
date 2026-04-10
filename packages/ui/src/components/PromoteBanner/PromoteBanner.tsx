import { pxToRem } from "@galacticcouncil/ui/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Flex, Icon, SDefaultButton, Text } from "@/components"
import { getToken } from "@/utils"

import {
  SPromoteBannerBody,
  SPromoteBannerClose,
  SPromoteBannerContent,
} from "./PromoteBanner.styled"

export type PromoteBannerItem = {
  id: string
  open?: boolean
  backgroundImage: string
  backgroundImageMobile: string
  title: string
  textColor?: string
  ctaColor?: string
  ctaTextColor?: string
  description?: string
  cta?: string
  onCta?: () => void
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
}

export type PromoteBannerProps = {
  item: PromoteBannerItem
}

export const PromoteBanner = ({ item }: PromoteBannerProps) => {
  const isOpen = item.open ?? true

  const [exiting, setExiting] = useState(false)
  const onCloseRef = useRef(item.onClose)
  onCloseRef.current = item.onClose

  const requestClose = useCallback(() => {
    if (!onCloseRef.current || exiting) return
    setExiting(true)
  }, [exiting])

  useEffect(() => {
    if (!exiting) return
    const id = setTimeout(() => {
      onCloseRef.current?.()
    }, 280)
    return () => clearTimeout(id)
  }, [exiting])

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={item.onOpenChange}
      modal={false}
    >
      <DialogPrimitive.Content asChild>
        <SPromoteBannerContent
          backgroundImage={item.backgroundImage}
          backgroundImageMobile={item.backgroundImageMobile}
          $exiting={exiting}
          m="auto"
        >
          <SPromoteBannerBody
            direction="column"
            align={["start", "end"]}
            justify={["start", "end"]}
          >
            <Flex direction="column" align={["start", "center"]} gap="xl">
              <Flex
                direction="column"
                gap={["base", "m"]}
                width={[pxToRem(200), "100%"]}
              >
                <DialogPrimitive.Title asChild>
                  <Text
                    fs={["h7", "h6"]}
                    fw={500}
                    lh={[1, 1.2]}
                    color={getToken("colors.darkBlue.900")}
                    font="primary"
                    sx={{ color: item.textColor }}
                  >
                    {item.title}
                  </Text>
                </DialogPrimitive.Title>
                {item.description && (
                  <DialogPrimitive.Description asChild>
                    <Text
                      fs="p4"
                      fw={400}
                      lh={[1, 1.2]}
                      color={getToken("colors.darkBlue.900")}
                      font="secondary"
                      sx={{ color: item.textColor }}
                    >
                      {item.description}
                    </Text>
                  </DialogPrimitive.Description>
                )}
              </Flex>
              {item.cta ? (
                typeof item.cta === "string" ? (
                  <SDefaultButton
                    size="medium"
                    onClick={item.onCta}
                    sx={{
                      backgroundColor: item.ctaColor,
                      color: item.ctaTextColor,
                      ":hover": {
                        filter: "brightness(1.18)",
                      },
                    }}
                  >
                    {item.cta}
                  </SDefaultButton>
                ) : (
                  item.cta
                )
              ) : null}
            </Flex>

            {item.onClose && (
              <SPromoteBannerClose
                type="button"
                onClick={requestClose}
                aria-label="Close promote banner"
              >
                <Icon component={X} size="s" />
              </SPromoteBannerClose>
            )}
          </SPromoteBannerBody>
        </SPromoteBannerContent>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
