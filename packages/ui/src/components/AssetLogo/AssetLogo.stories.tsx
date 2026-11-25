import { METADATA_CDN_URL } from "@galacticcouncil/utils"
import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { Grid } from "@/components/Grid"
import { Separator } from "@/components/Separator"
import { Stack } from "@/components/Stack"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import { AssetLogo, MultipleAssetLogoWrapper } from "./AssetLogo"

type Story = StoryObj<typeof AssetLogo>

export default {
  component: AssetLogo,
} satisfies Meta<typeof AssetLogo>

const ETH_SRC = `${METADATA_CDN_URL}/v2/ethereum/1/icon.svg`
const AAVE_SRC = `${METADATA_CDN_URL}/v2/ethereum/1/assets/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9/icon.svg`
const HDX_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/0/icon.svg`
const USDT_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/10/icon.svg`
const TBTC_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/1000765/icon.svg`
const HOLLAR_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/222/icon.svg`

const Template = (args: React.ComponentPropsWithoutRef<typeof AssetLogo>) => (
  <Stack gap="xl">
    <AssetLogo {...args} size="extra-small" />
    <AssetLogo {...args} size="small" />
    <AssetLogo {...args} size="medium" />
    <AssetLogo {...args} size="large" />
    <AssetLogo {...args} size="extra-large" />
  </Stack>
)

const MultipleAssetsTemplate = (
  args: Omit<
    React.ComponentPropsWithoutRef<typeof MultipleAssetLogoWrapper>,
    "children"
  >,
) => (
  <MultipleAssetLogoWrapper {...args}>
    <AssetLogo src={HDX_SRC} />
    <AssetLogo src={AAVE_SRC} />
    <AssetLogo src={ETH_SRC} />
    <AssetLogo src={USDT_SRC} />
  </MultipleAssetLogoWrapper>
)

export const Default: Story = {
  render: Template,
  args: {
    src: HDX_SRC,
  },
}

export const WithChain: Story = {
  render: Template,
  args: {
    src: AAVE_SRC,
    chainSrc: ETH_SRC,
  },
}

export const WithSideChain: Story = {
  render: (args) => (
    <Stack gap="xl">
      <Template {...args} />
      <Template {...args} decoration="atoken" />
      <Stack gap="xl">
        <MultipleAssetsTemplate size="extra-small" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="small" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="medium" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="large" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="extra-large" chainSrc={ETH_SRC} />
      </Stack>
      <Stack gap="xl">
        {[2, 3, 4].map((count) => (
          <MultipleAssetLogoWrapper
            key={count}
            size="large"
            chainSrc={ETH_SRC}
            collapsed
          >
            {[HDX_SRC, AAVE_SRC, ETH_SRC, USDT_SRC]
              .slice(0, count)
              .map((src) => (
                <AssetLogo key={src} src={src} />
              ))}
          </MultipleAssetLogoWrapper>
        ))}
      </Stack>
    </Stack>
  ),
  args: {
    src: AAVE_SRC,
    chainSrc: ETH_SRC,
    chainPosition: "side",
  },
}

export const WithMultipleAssets: Story = {
  render: () => (
    <Stack gap="xl">
      <MultipleAssetsTemplate size="extra-small" />
      <MultipleAssetsTemplate size="small" />
      <MultipleAssetsTemplate size="medium" />
      <MultipleAssetsTemplate size="large" />
      <Stack gap="xl">
        {(
          ["extra-small", "small", "medium", "large", "extra-large"] as const
        ).map((size) => (
          <MultipleAssetLogoWrapper key={size} size={size}>
            <AssetLogo src={TBTC_SRC} chainSrc={ETH_SRC} decoration="atoken" />
            <AssetLogo src={HOLLAR_SRC} />
          </MultipleAssetLogoWrapper>
        ))}
      </Stack>
    </Stack>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <Stack gap="xl">
      {[2, 3, 4].map((count) => (
        <Stack
          key={count}
          direction="row"
          gap="xl"
          align="center"
          justify="start"
        >
          {(
            ["extra-small", "small", "medium", "large", "extra-large"] as const
          ).map((size) => (
            <MultipleAssetLogoWrapper key={size} size={size} collapsed>
              {[HDX_SRC, AAVE_SRC, ETH_SRC, USDT_SRC]
                .slice(0, count)
                .map((src) => (
                  <AssetLogo key={src} src={src} chainSrc={ETH_SRC} />
                ))}
            </MultipleAssetLogoWrapper>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
}

export const WithAtokenDecoration: Story = {
  render: (args) => (
    <Stack gap="xl">
      <Template {...args} />
      <MultipleAssetsTemplate decoration={args.decoration} size="extra-small" />
      <MultipleAssetsTemplate decoration={args.decoration} size="small" />
      <MultipleAssetsTemplate decoration={args.decoration} size="medium" />
      <MultipleAssetsTemplate decoration={args.decoration} size="large" />
    </Stack>
  ),
  args: {
    decoration: "atoken",
    src: AAVE_SRC,
  },
}

export const Placeholder: Story = {
  render: Template,
}

// Kitchen sink: realistic Hydration mainnet assets, wired the way
// apps/main/src/components/AssetLogo resolves them (aTokens show the
// underlying icon + chain, stableswap pools show their reserves).
const CDN = `${METADATA_CDN_URL}/v2`
const hydra = (id: number) => `${CDN}/polkadot/2034/assets/${id}/icon.svg`
const eth = (addr: string, ext = "svg") =>
  `${CDN}/ethereum/1/assets/${addr}/icon.${ext}`

const CHAIN = {
  assetHub: `${CDN}/polkadot/1000/icon.svg`,
  bifrost: `${CDN}/polkadot/2030/icon.svg`,
  ethereum: `${CDN}/ethereum/1/icon.svg`,
  solana: `${CDN}/solana/101/icon.svg`,
}

type Asset = { src: string; chainSrc?: string; alt: string }
const A = {
  HDX: { alt: "HDX", src: hydra(0) },
  HOLLAR: { alt: "HOLLAR", src: hydra(222) },
  DOT: { alt: "DOT", src: hydra(5) },
  ETH: { alt: "ETH", src: hydra(34) },
  SOL: { alt: "SOL", src: hydra(1000752) },
  jitoSOL: { alt: "jitoSOL", src: hydra(40) },
  DAI: { alt: "DAI (Wormhole)", src: hydra(18) },
  USDCwh: { alt: "USDC (Wormhole)", src: hydra(21) },
  USDTwh: { alt: "USDT (Wormhole)", src: hydra(23) },
  EURC: { alt: "EURC", src: hydra(44) },
  USDT: { alt: "USDT", src: hydra(10), chainSrc: CHAIN.assetHub },
  USDC: { alt: "USDC", src: hydra(22), chainSrc: CHAIN.assetHub },
  vDOT: { alt: "vDOT", src: hydra(15), chainSrc: CHAIN.bifrost },
  tBTC: {
    alt: "tBTC",
    src: eth("0x18084fba666a33d37592fa2633fd49a74dd93a88"),
    chainSrc: CHAIN.ethereum,
  },
  wstETH: {
    alt: "wstETH",
    src: eth("0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", "png"),
    chainSrc: CHAIN.ethereum,
  },
  USDCsb: {
    alt: "USDC (Snowbridge)",
    src: eth("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    chainSrc: CHAIN.ethereum,
  },
  AAVE: { alt: "AAVE", src: AAVE_SRC, chainSrc: CHAIN.ethereum },
  GDOT: { alt: "GDOT", src: hydra(69) },
  GETH: { alt: "GETH", src: hydra(420) },
  GSOL: { alt: "GSOL", src: hydra(9001) },
  BIL: { alt: "BIL", src: hydra(55) },
} satisfies Record<string, Asset>

type Child = Asset & { atoken?: boolean }
const at = (asset: Asset): Child => ({ ...asset, atoken: true })

const SIZES = [
  "extra-small",
  "small",
  "medium",
  "large",
  "extra-large",
] as const
type Size = (typeof SIZES)[number]

type Row = { label: string; render: (size: Size) => React.ReactNode }

const single = (
  label: string,
  asset: Asset,
  props: Partial<React.ComponentProps<typeof AssetLogo>> = {},
): Row => ({
  label,
  render: (size) => <AssetLogo {...asset} size={size} {...props} />,
})

// Mirrors the app: a side chain on the wrapper drops the children's corner chains.
const multi = (
  label: string,
  children: Child[],
  props: { collapsed?: boolean; atoken?: boolean; sideChainSrc?: string } = {},
): Row => ({
  label,
  render: (size) => (
    <MultipleAssetLogoWrapper
      size={size}
      collapsed={props.collapsed}
      chainSrc={props.sideChainSrc}
      decoration={props.atoken ? "atoken" : "none"}
    >
      {children.map((c, i) => (
        <AssetLogo
          key={i}
          src={c.src}
          alt={c.alt}
          chainSrc={props.sideChainSrc ? undefined : c.chainSrc}
          decoration={c.atoken || props.atoken ? "atoken" : "none"}
        />
      ))}
    </MultipleAssetLogoWrapper>
  ),
})

// Uncollapsed + collapsed variant of the same pool.
const pool = (
  label: string,
  children: Child[],
  props: Omit<Parameters<typeof multi>[2], "collapsed"> = {},
) => [
  multi(label, children, props),
  multi(`${label} · collapsed`, children, { ...props, collapsed: true }),
]

const POOL = {
  twoPool: [A.USDT, A.USDC],
  threePoolMrl: [A.USDC, A.USDT, A.HOLLAR],
  fourPool: [A.USDT, A.DAI, A.USDCwh, A.USDTwh],
  gdot: [A.vDOT, at(A.DOT)],
  geth: [at(A.ETH), A.wstETH],
  gsol: [A.jitoSOL, at(A.SOL)],
  husdt: [A.HOLLAR, at(A.USDT)],
  threePool: [at(A.USDT), A.USDC, A.USDT],
}

const SECTIONS: { title: string; description: string; rows: Row[] }[] = [
  {
    title: "Single asset",
    description:
      "Plain tokens. Chain badge sits in the top-right corner; native and chainless assets show none.",
    rows: [
      single("HDX · native, no chain", A.HDX),
      single("HOLLAR · no chain", A.HOLLAR),
      single("USDT · Asset Hub corner", A.USDT),
      single("vDOT · Bifrost corner", A.vDOT),
      single("tBTC · Ethereum corner", A.tBTC),
      single("wstETH · Ethereum corner (png)", A.wstETH),
      single("GDOT · pool aToken, own icon", A.GDOT),
      single("GETH · pool aToken, own icon", A.GETH),
      single("GSOL · pool aToken, own icon", A.GSOL),
      single("BIL · own icon", A.BIL),
    ],
  },
  {
    title: "Single aToken",
    description:
      "Money market aTokens render the underlying icon wrapped in the aToken ring.",
    rows: [
      single("aDOT · no chain", A.DOT, { decoration: "atoken" }),
      single("aUSDT · Asset Hub corner", A.USDT, { decoration: "atoken" }),
      single("avDOT · Bifrost corner", A.vDOT, { decoration: "atoken" }),
      single("atBTC · Ethereum corner", A.tBTC, { decoration: "atoken" }),
    ],
  },
  {
    title: "Side chain",
    description: `chainPosition="side" puts the source chain beside the logo, cut out by a gap.`,
    rows: [
      single(
        "USDC from Asset Hub",
        { ...A.USDC, chainSrc: CHAIN.assetHub },
        {
          chainPosition: "side",
        },
      ),
      single("USDC from Ethereum", A.USDCsb, { chainPosition: "side" }),
      single("AAVE from Ethereum", A.AAVE, { chainPosition: "side" }),
      single(
        "SOL from Solana",
        { ...A.SOL, chainSrc: CHAIN.solana },
        {
          chainPosition: "side",
        },
      ),
      single("aUSDT · side Asset Hub", A.USDT, {
        chainPosition: "side",
        decoration: "atoken",
      }),
    ],
  },
  {
    title: "Stableswap pool",
    description:
      "Stableswap pools show their reserves stacked, or merged into one split circle when collapsed.",
    rows: [
      ...pool("2-Pool · USDT/USDC", POOL.twoPool),
      ...pool("3-Pool-MRL · USDC/USDT/HOLLAR", POOL.threePoolMrl),
      ...pool("4-Pool · USDT/DAI/USDC/USDT", POOL.fourPool),
    ],
  },
  {
    title: "Pool with aToken reserves",
    description:
      "Pools mixing plain and aToken reserves: each aToken gets its own ring.",
    rows: [
      ...pool("GDOT pool · vDOT/aDOT", POOL.gdot),
      ...pool("GETH pool · aETH/wstETH", POOL.geth),
      ...pool("GSOL pool · jitoSOL/aSOL", POOL.gsol),
      ...pool("HUSDT pool · HOLLAR/aUSDT", POOL.husdt),
      ...pool("3-Pool · aUSDT/USDC/USDT", POOL.threePool),
    ],
  },
  {
    title: "Pool aToken",
    description:
      "aToken of a stableswap pool: one ring around the whole stack, child rings dropped.",
    rows: [
      ...pool("HUSDT · a(HOLLAR/aUSDT)", POOL.husdt, { atoken: true }),
      ...pool("HUSDC · a(HOLLAR/aUSDC)", [A.HOLLAR, at(A.USDC)], {
        atoken: true,
      }),
      ...pool("HEURC · a(HOLLAR/aEURC)", [A.HOLLAR, at(A.EURC)], {
        atoken: true,
      }),
    ],
  },
  {
    title: "Pool with side chain",
    description:
      "One side chain for the whole stack; children drop their corner chains.",
    rows: [
      ...pool("2-Pool · side Asset Hub", POOL.twoPool, {
        sideChainSrc: CHAIN.assetHub,
      }),
      ...pool("4-Pool · side Ethereum", POOL.fourPool, {
        sideChainSrc: CHAIN.ethereum,
      }),
      ...pool("GDOT pool · side Bifrost", POOL.gdot, {
        sideChainSrc: CHAIN.bifrost,
      }),
      ...pool("HUSDT aToken pool · side Asset Hub", POOL.husdt, {
        atoken: true,
        sideChainSrc: CHAIN.assetHub,
      }),
    ],
  },
  {
    title: "States",
    description: "Loading skeletons and a missing icon.",
    rows: [
      single("Loading · default", A.HDX, { isLoading: true }),
      single("Loading · side chain", A.HDX, {
        isLoading: true,
        chainPosition: "side",
      }),
      single("Placeholder · no src", { alt: "Unknown", src: "" }),
    ],
  },
]

const SIZE_LABELS: Record<Size, string> = {
  "extra-small": "XS",
  small: "S",
  medium: "M",
  large: "L",
  "extra-large": "XL",
}

const ROW_DIVIDER = { gridColumn: "1 / -1", justifySelf: "stretch" }

export const KitchenSink: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <Stack gap="xxxl">
      {SECTIONS.map(({ title, description, rows }) => (
        <Stack key={title} gap="l">
          <Stack gap="s">
            <Text as="h2" font="primary" fs="h7" fw={500}>
              {title}
            </Text>
            <Text fs="p5" color={getToken("text.medium")}>
              {description}
            </Text>
          </Stack>
          <Grid
            columns="220px repeat(5, max-content)"
            columnGap="xxl"
            rowGap="m"
            align="center"
            justifyItems="start"
          >
            <span />
            {SIZES.map((size) => (
              <Text key={size} fs="p6" color={getToken("text.low")}>
                {SIZE_LABELS[size]}
              </Text>
            ))}
            {rows.map(({ label, render }) => {
              const [name, ...details] = label.split(" · ")
              return (
                <React.Fragment key={label}>
                  <Separator sx={ROW_DIVIDER} />
                  <Stack gap="xs" sx={{ justifySelf: "start" }}>
                    <Text fs="p5" fw={500} color={getToken("text.high")}>
                      {name}
                    </Text>
                    {details.length > 0 && (
                      <Text fs="p6" color={getToken("text.medium")}>
                        {details.join(" · ")}
                      </Text>
                    )}
                  </Stack>
                  {SIZES.map((size) => (
                    <React.Fragment key={size}>{render(size)}</React.Fragment>
                  ))}
                </React.Fragment>
              )
            })}
          </Grid>
        </Stack>
      ))}
    </Stack>
  ),
}
