import { Root, Trigger } from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { ReactNode, useState } from "react"

import { getToken } from "@/utils"

import { Flex } from "../Flex"
import { Icon } from "../Icon"
import { Text } from "../Text"
import { SContent, STrigger } from "./Collapsible.styled"

type CollapsbileProps = {
  children: ReactNode
  label: string
  trigger: string
  initialOpen?: boolean
}

export const Collapsible = ({
  children,
  label,
  trigger,
  initialOpen = true,
}: CollapsbileProps) => {
  const [open, setOpen] = useState(initialOpen)

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Trigger asChild>
        <STrigger>
          <Flex justify="space-between" align="center" sx={{ py: 9 }}>
            <Text fs="p5" fw={500} color={getToken("text.medium")}>
              {label}
            </Text>

            <Flex>
              <Text fs="p5" fw={500} color={getToken("text.low")}>
                {trigger}
              </Text>
              <Icon
                size={18}
                color={getToken("text.low")}
                component={ChevronDown}
              />
            </Flex>
          </Flex>
        </STrigger>
      </Trigger>

      <SContent>{children}</SContent>
    </Root>
  )
}
