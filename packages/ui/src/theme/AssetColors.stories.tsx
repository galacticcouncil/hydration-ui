import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import assetColors from "@/theme/assetColors.json"
import { getToken } from "@/utils"

const METADATA_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master/assets-v2.json"
const HYDRATION_PARACHAIN_ID = "2034"

type AssetMetadata = {
  cdn: { jsDelivr: string }
  repository: string
  path: string
  items: string[]
}

const colors: Record<string, string> = assetColors

const useAssetIconSrcs = () => {
  const [srcs, setSrcs] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    fetch(METADATA_URL)
      .then((res) => res.json())
      .then(({ cdn, repository, path, items }: AssetMetadata) => {
        if (!active) return

        const baseUrl = [cdn.jsDelivr, `${repository}@latest`, path].join("/")
        const pattern = new RegExp(
          `polkadot/${HYDRATION_PARACHAIN_ID}/assets/(\\d+)/icon`,
        )

        setSrcs(
          Object.fromEntries(
            items.flatMap((item) => {
              const id = item.match(pattern)?.[1]

              return id ? [[id, `${baseUrl}/${item}`]] : []
            }),
          ),
        )
      })

    return () => {
      active = false
    }
  }, [])

  return srcs
}

const AssetColorTile = ({
  id,
  color,
  src,
}: {
  id: string
  color: string
  src?: string
}) => (
  <Flex
    direction="column"
    gap={8}
    p={12}
    sx={{ borderRadius: "m", position: "relative", overflow: "hidden" }}
  >
    <Flex
      sx={{
        position: "absolute",
        inset: 0,
        background: color,
        opacity: 0.3,
      }}
    />
    <Flex gap={8} align="center" sx={{ position: "relative" }}>
      <AssetLogo src={src} alt={id} size="medium" />
      <Flex direction="column">
        <Text fs="p5" fw={600} color={getToken("text.high")}>
          {id}
        </Text>
        <Text fs="p6" color={getToken("text.medium")}>
          {color}
        </Text>
      </Flex>
      <Flex
        sx={{
          ml: "auto",
          width: 24,
          height: 24,
          borderRadius: "full",
          background: color,
        }}
      />
    </Flex>
  </Flex>
)

const AssetColors = () => {
  const srcs = useAssetIconSrcs()
  const ids = Object.keys(colors).sort((a, b) => Number(a) - Number(b))

  return (
    <Flex gap={12} wrap>
      {ids.map((id) => (
        <Flex key={id} sx={{ width: 240 }}>
          <AssetColorTile id={id} color={colors[id] ?? ""} src={srcs[id]} />
        </Flex>
      ))}
    </Flex>
  )
}

export default {
  title: "theme/AssetColors",
  component: AssetColors,
} satisfies Meta<typeof AssetColors>

export const Default: StoryObj<typeof AssetColors> = {}
