import { useNavigate } from "@tanstack/react-location"
import { Button } from "components/Button/Button"
import { TableCell } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { SSupplyGigaDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigaRow.styled"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { GigaAPY } from "sections/pools/stablepool/components/GigaIncentives"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAssetIdFromAddress } from "utils/evm"

type Props = {
  readonly reserve: ComputedReserveData
  readonly onOpenSupply: () => void
}

export const SupplyGigadotDesktopRow: FC<Props> = ({
  reserve,
  onOpenSupply,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()
  const { account } = useAccount()

  return (
    <table sx={{ display: "block" }}>
      <tbody sx={{ display: "block" }}>
        <SSupplyGigaDesktopRow
          onClick={() =>
            navigate({
              to: ROUTES.reserveOverview(
                reserve.underlyingAsset,
                currentMarket,
              ),
            })
          }
        >
          <TableCell
            sx={{
              flexBasis: ["44%", "44%", "41.5%"],
            }}
          >
            <AssetNameColumn
              detailsAddress={reserve.underlyingAsset}
              symbol={reserve.symbol}
              aToken
            />
          </TableCell>
          <TableCell>
            <Text fw={500} fs={11} lh="1.4" tAlign="center" color="whiteish500">
              {t("lending.apy")}
            </Text>
            <GigaAPY
              type="supply"
              assetId={getAssetIdFromAddress(reserve.underlyingAsset)}
            />
          </TableCell>
          <TableCell sx={{ ml: "auto" }}>
            <div sx={{ flex: "row", align: "center" }}>
              <Button
                sx={{ py: 4 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenSupply()
                }}
                size="micro"
                disabled={!account}
              >
                {t("lending.supply")}
              </Button>

              <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
            </div>
          </TableCell>
        </SSupplyGigaDesktopRow>
      </tbody>
    </table>
  )
}
