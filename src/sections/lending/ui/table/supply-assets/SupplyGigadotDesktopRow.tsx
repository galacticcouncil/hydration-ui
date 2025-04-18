import { Link, useNavigate } from "@tanstack/react-location"
import { Button } from "components/Button/Button"
import { TableCell } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { TAsset } from "providers/assets"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { SSupplyGigadotDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow.styled"
import { getAddressFromAssetId } from "utils/evm"
import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { GDOTAPY } from "sections/pools/stablepool/components/GDOTIncentives"

type Props = {
  readonly gigadot: TAsset
  readonly onOpenSupply: () => void
}

export const SupplyGigadotDesktopRow: FC<Props> = ({
  gigadot,
  onOpenSupply,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()
  const { account } = useAccount()

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
          <TableCell
            sx={{
              flexBasis: ["44%", "44%", "41.5%"],
            }}
          >
            <AssetNameColumn
              detailsAddress={getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID)}
              symbol={gigadot.symbol}
            />
          </TableCell>
          <TableCell>
            <Text fw={500} fs={11} lh="1.4" tAlign="center" color="whiteish500">
              {t("lending.apy")}
            </Text>
            <GDOTAPY />
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
      </tbody>
    </table>
  )
}
