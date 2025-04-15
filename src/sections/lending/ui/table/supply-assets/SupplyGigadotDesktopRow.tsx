import { Link, useNavigate } from "@tanstack/react-location"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { TableCell } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { TAsset } from "providers/assets"
import { FC, useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { NoData } from "sections/lending/components/primitives/NoData"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { SSupplyGigadotDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow.styled"
import { SupplyGigadotRowData } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow"
import { getAddressFromAssetId } from "utils/evm"
import { createPortal } from "react-dom"
import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"

type Props = {
  readonly data: SupplyGigadotRowData
  readonly gigadot: TAsset
  readonly onOpenSupply: () => void
}

export const SupplyGigadotDesktopRow: FC<Props> = ({
  data,
  gigadot,
  onOpenSupply,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()

  const [supplyButtonWidth, setSupplyButtonWidth] = useState(0)
  const [supplyButtonHeight, setSupplyButtonHeight] = useState(0)

  const handleSupplyButtonWidth = useCallback((e: HTMLElement | null) => {
    setSupplyButtonWidth(e?.getBoundingClientRect().width ?? 0)
  }, [])

  const handleSupplyButtonHeight = useCallback((e: HTMLElement | null) => {
    setSupplyButtonHeight(e?.getBoundingClientRect().height ?? 0)
  }, [])

  return (
    <table sx={{ display: "block" }}>
      <tbody sx={{ display: "block" }}>
        <SSupplyGigadotDesktopRow
          onClick={() =>
            navigate({
              to: ROUTES.reserveOverview(
                getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID),
                currentMarket,
              ),
            })
          }
        >
          <TableCell>
            <AssetNameColumn
              detailsAddress={getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID)}
              symbol={gigadot.symbol}
            />
          </TableCell>
          <TableCell>
            <Text fw={500} fs={10} lh="1.4" color="whiteish500">
              {t("lending.apy")}
            </Text>
            <div sx={{ flex: "row", align: "center", gap: 1 }}>
              {data.supplyAPY.toString() === "-1" ? (
                <NoData />
              ) : (
                <div sx={{ flex: "column", gap: 2 }}>
                  <Text fw={500} fs={13} lh="1" color="white">
                    <FormattedNumber
                      percent
                      value={new BigNumber(data.supplyAPY).toString()}
                    />
                  </Text>
                  <IncentivesButton
                    incentives={data.aIncentivesData}
                    symbol={data.symbol}
                  />
                </div>
              )}
            </div>
          </TableCell>
          <TableCell css={{ alignSelf: "flex-center" }}>
            <div sx={{ flex: "row", align: "center" }}>
              <Button
                sx={{
                  height: supplyButtonHeight,
                  width: supplyButtonWidth,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenSupply()
                }}
                size="micro"
              >
                {t("lending.buy")}
              </Button>
              <Link
                to={ROUTES.reserveOverview(
                  getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID),
                  currentMarket,
                )}
              >
                <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
              </Link>
            </div>
          </TableCell>
        </SSupplyGigadotDesktopRow>
        {createPortal(
          <div
            ref={handleSupplyButtonHeight}
            sx={{ flex: "row", align: "center" }}
            css={{
              position: "absolute",
              visibility: "hidden",
              height: "max-content",
            }}
          >
            <Button ref={handleSupplyButtonWidth} size="micro">
              {t("lending.supply")}
            </Button>
            <Link>
              <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
            </Link>
          </div>,
          document.body!,
        )}
      </tbody>
    </table>
  )
}
