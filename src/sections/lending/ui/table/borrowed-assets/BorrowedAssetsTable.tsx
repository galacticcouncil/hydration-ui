import { useNavigate } from "@tanstack/react-location"
import { Button } from "components/Button/Button"
import { DataTable } from "components/DataTable"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { EmodeModalType } from "sections/lending/components/transactions/Emode/EmodeModalContent"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { BorrowedAssetsMobileRow } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsMobileRow"
import { BorrowedAssetsStats } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsStats"
import {
  useBorrowedAssetsTableColumns,
  useBorrowedAssetsTableData,
} from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable.utils"
import { theme } from "theme"
import SettingsIcon from "assets/icons/SettingsIcon.svg?react"

export const BorrowedAssetsTable = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()
  const { data, isLoading } = useBorrowedAssetsTableData()
  const columns = useBorrowedAssetsTableColumns()
  const { openEmode } = useModalContext()
  const { user, reserves } = useAppDataContext()
  console.log(user, "user")
  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const isEModeDisabled = user.userEmodeCategoryId === 0

  const disableEModeSwitch =
    user.isInEmode &&
    reserves.filter(
      (reserve) =>
        reserve.eModeCategoryId === user.userEmodeCategoryId &&
        reserve.borrowingEnabled,
    ).length < 2

  return (
    <DataTable
      table={table}
      spacing="large"
      title={t("lending.borrowed.table.title")}
      background="transparent"
      addons={<BorrowedAssetsStats />}
      renderRow={isDesktop ? undefined : BorrowedAssetsMobileRow}
      hoverable
      onRowClick={(row) => {
        navigate({
          to: ROUTES.reserveOverview(
            row.original.underlyingAsset,
            currentMarket,
          ),
        })
      }}
      emptyFallback={
        <Text color="basic700" fs={14}>
          {t("lending.borrowed.table.empty")}
        </Text>
      }
      action={
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Text fs={12} lh={12} color="basic300">
            E-Mode
          </Text>
          <Button
            size="micro"
            onClick={() =>
              openEmode(
                isEModeDisabled ? EmodeModalType.ENABLE : EmodeModalType.SWITCH,
              )
            }
          >
            {isEModeDisabled ? "Disabled" : "Enabled"}
            <Icon icon={<SettingsIcon />} size={12} />
          </Button>
        </div>
      }
    />
  )
}
