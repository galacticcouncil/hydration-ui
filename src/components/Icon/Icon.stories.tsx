const iconPaths = import.meta.glob("/src/assets/icons/*.svg")

const icons = await Promise.all(
  Object.keys(iconPaths).map(
    async (path) =>
      await import(path + "?react").then((mod) => {
        return {
          component: mod.default,
          name: path.split("/").pop(),
        }
      }),
  ),
)

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
