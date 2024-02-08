import { Button } from "components/Button/Button"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"

export const HeaderValues = () => {
  return (
    <div sx={{ maxWidth: ["100%", 700], mb: 40 }}>
      <DataValueList separated>
        <DataValue labelColor="brightBlue300" label="Net worth">
          <DisplayValue value={122000564} />
        </DataValue>
        <DataValue
          labelColor="brightBlue300"
          label="Net Apy"
          tooltip="APY tooltip..."
        >
          <DisplayValue value={122000564} />
        </DataValue>
        <DataValue
          labelColor="brightBlue300"
          label="Health factor"
          tooltip="Health Factor tooltip..."
        >
          <div sx={{ flex: "row", gap: 6, align: "center" }}>
            <span sx={{ color: "warningYellow400" }}>1.35</span>
            <div css={{ display: "inline-flex" }}>
              <Button
                sx={{
                  color: "warningYellow400",
                }}
                css={{
                  borderColor: "currentColor",
                  background: "transparent",
                }}
                size="micro"
              >
                Risk Details
              </Button>
            </div>
          </div>
        </DataValue>
      </DataValueList>
    </div>
  )
}
