import { useTheme } from "@emotion/react"
import { Text } from "@galacticcouncil/ui/components"
import { createLazyFileRoute } from "@tanstack/react-router"
import { entries, fromEntries, isObjectType, isString, pipe } from "remeda"

const isColor = (value: string) =>
  isString(value) &&
  (value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value.startsWith("lch"))

const flattenObject = (obj: object, prefix = ""): object => {
  return pipe(
    entries(obj),
    (pairs: (object | string)[][]) => {
      return pairs.flatMap(([key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key
        return isObjectType(value) && !Array.isArray(value)
          ? entries(flattenObject(value, String(newKey)))
          : [[newKey, value]]
      })
    },
    fromEntries,
  )
}

const Page = () => {
  const theme = useTheme()
  const flatTheme = flattenObject(theme)
  return (
    <div>
      <Text as="h1" fs={40} fw={600} font="primary">
        Homepage
      </Text>
      <div css={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {Object.entries(flatTheme).map(([key, value]) => (
          <div
            key={key}
            css={{
              width: 240,
              height: 160,
              border: "1px solid #ccc",
              padding: 10,
            }}
          >
            <p css={{ fontSize: 14, fontWeight: 600 }}>{key}</p>
            {isColor(value) ? (
              <div
                css={{
                  height: 100,
                  background: value,
                }}
              >
                <p css={{ fontSize: 12 }}>{value}</p>
              </div>
            ) : (
              <p css={{ fontSize: 14, fontWeight: 600 }}>{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export const Route = createLazyFileRoute("/")({
  component: Page,
})
