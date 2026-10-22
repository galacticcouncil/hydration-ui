import { MoveUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  ExternalLink,
  Flex,
  Icon,
  Text,
  TextProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { neckwork, shortenAccountAddress } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { SAddressTagCopyButton } from "@/components/AddressTag/AddressTag.styled"

export type AddressTagLinkType = "none" | "account" | "contract"

export type AddressTagProps = {
  label: string
  address: string | undefined
  fs?: TextProps["fs"]
  fw?: TextProps["fw"]
  lh?: TextProps["lh"]
  linkType?: AddressTagLinkType
}

const getExplorerHref = (
  address: string,
  linkType: AddressTagLinkType,
): string | undefined => {
  switch (linkType) {
    case "account":
      return neckwork.account(address)
    case "contract":
      return neckwork.contract(address)
    case "none":
      return undefined
  }
}

export const AddressTag = ({
  label,
  address,
  fs = "p6",
  fw = 500,
  lh,
  linkType = "none",
}: AddressTagProps) => {
  const { t } = useTranslation("common")

  if (!address) return null

  const shortenedAddress = shortenAccountAddress(address)
  const explorerHref = getExplorerHref(address, linkType)

  return (
    <Flex align="center" gap="xs">
      <Text fs={fs} fw={fw} lh={lh} color={getToken("text.low")}>
        {label}
      </Text>
      {explorerHref ? (
        <Tooltip text={t("openInExplorer")} size="small" asChild>
          <ExternalLink href={explorerHref} underlined={false}>
            <Flex as="span" align="center" gap="xs">
              <Text
                as="span"
                fs={fs}
                fw={fw}
                lh={lh}
                color={getToken("text.medium")}
              >
                {shortenedAddress}
              </Text>
              <Icon
                component={MoveUpRight}
                size="xs"
                color={getToken("text.medium")}
              />
            </Flex>
          </ExternalLink>
        </Tooltip>
      ) : (
        <Text fs={fs} fw={fw} lh={lh} color={getToken("text.medium")}>
          {shortenedAddress}
        </Text>
      )}
      <Tooltip text={t("copy")} size="small" side="top" asChild>
        <SAddressTagCopyButton text={address} iconSize="xs" />
      </Tooltip>
    </Flex>
  )
}
