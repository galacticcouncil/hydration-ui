const iconPaths = import.meta.glob("/src/assets/icons/*.svg")

const BLACKLIST = [
  "/src/assets/icons/ChartErrorIcon.svg",
  "/src/assets/icons/ChartNoDataIcon.svg",
  "/src/assets/icons/EmptyStateLPIcon.svg",
  "/src/assets/icons/FullFailIcon.svg",
  "/src/assets/icons/FullSuccessIcon.svg",
  "/src/assets/icons/HydraLogoFull.svg",
  "/src/assets/icons/IconAddressBook.svg",
  "/src/assets/icons/HydraLogo.svg",
  "/src/assets/icons/WalletConnect.svg",
  "/src/assets/icons/NoActivities.svg",
  "/src/assets/icons/PolkadotLogo.svg",
  "/src/assets/icons/TablePlaceholderIcon.svg",
  "/src/assets/icons/GuestIcon.svg",
  "/src/assets/icons/FailIcon.svg",
  "/src/assets/icons/ExternalWalletIcon.svg",
  "/src/assets/icons/ErrorIcon.svg",
  "/src/assets/icons/LPInfoIcon.svg",
  "/src/assets/icons/TestnetIcon.svg",
  "/src/assets/icons/TalismanLogo.svg",
  "/src/assets/icons/UpdateMetadataIcon.svg",
  "/src/assets/icons/StakingChart.svg",
  "/src/assets/icons/StakingAccountIcon.svg",
  "/src/assets/icons/TalismanLogo.svg",
  "/src/assets/icons/WhyBonds.svg",
  "/src/assets/icons/WhyBonds.svg",
  "/src/assets/icons/WhyBonds.svg",
  "/src/assets/icons/WhyBonds.svg",
  "/src/assets/icons/PlaceholderIcon.svg",
]

const paths = Object.keys(iconPaths).filter((path) => !BLACKLIST.includes(path))

const icons = await Promise.all(
  paths.map(
    async (path) =>
      await import(path + "?react").then((mod) => {
        return {
          component: mod.default,
          name: path.split("/").pop(),
        }
      }),
  ),
)

console.log({ icons })

const Icons = () => {
  return (
    <div sx={{ flex: "row", flexWrap: "wrap", gap: 10 }}>
      {icons.map(({ component: Icon, name }) => {
        const { width, height } = Icon()?.props || {}

        return (
          <div
            key={name}
            sx={{
              p: 20,
              color: "white",
              flex: "column",
              align: "center",
              justify: "center",
              gap: 10,
            }}
            css={{
              width: 140,
              height: 140,
              border: "1px solid white",
              position: "relative",
            }}
          >
            <Icon css={{ backgroundColor: "black", maxWidth: 80 }} />
            <div css={{ position: "absolute", bottom: 5, textAlign: "center" }}>
              <div css={{ fontSize: 16 }}>
                {width}x{height}
              </div>
              <div css={{ fontSize: 11 }}>{name}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default {
  component: Icons,
}

export const IconGallery = () => <Icons />
