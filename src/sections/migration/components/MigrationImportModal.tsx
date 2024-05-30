import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  MIGRATION_COMPLETE_FLAG,
  importToLocalStorage,
} from "sections/migration/MigrationProvider.utils"
import MigrationLogo from "assets/icons/migration/MigrationLogo.svg?react"

const reloadAppWithTimestamp = (ts: string) => {
  window.location.href = window.location.origin
  localStorage.setItem(MIGRATION_COMPLETE_FLAG, ts || "0")
}

export const MigrationImportModal: FC<{ data?: string }> = ({ data }) => {
  const { t } = useTranslation()
  const [lastImportDate, setLastImportDate] = useState<Date | null>(null)

  useEffect(() => {
    const migrationStatus = localStorage.getItem(MIGRATION_COMPLETE_FLAG)
    const migrationCompletedOn =
      migrationStatus && migrationStatus !== "0"
        ? new Date(migrationStatus)
        : null

    if (migrationCompletedOn && !!data) {
      setLastImportDate(new Date(migrationCompletedOn))
      return
    } else if (!!data) {
      importToLocalStorage(data)
    }

    reloadAppWithTimestamp(data ? new Date().toISOString() : "0")
  }, [data])

  if (!lastImportDate) {
    return null
  }

  return (
    <Modal open headerVariant="FontOver">
      <MigrationLogo sx={{ mx: "auto" }} />
      <Text tAlign="center" font="FontOver" fs={19} sx={{ mt: 12 }}>
        {t("migration.import.title")}
      </Text>
      <Text
        tAlign="center"
        sx={{ mt: 12, maxWidth: 500, mx: "auto" }}
        color="basic400"
      >
        {t("migration.import.description", { date: lastImportDate })}
      </Text>
      <Separator
        sx={{ mx: [-20, -32], mt: ["auto", 50], mb: [12, 30], width: "auto" }}
        color="darkBlue401"
      />
      <div sx={{ flex: "row", justify: "space-between" }}>
        <Button
          onClick={() => {
            window.location.href = window.location.origin
          }}
        >
          {t("toast.close")}
        </Button>
        {data && (
          <Button
            variant="mutedError"
            onClick={() => {
              importToLocalStorage(data)
              reloadAppWithTimestamp(new Date().toISOString())
            }}
          >
            {t("migration.import.button")}
          </Button>
        )}
      </div>
    </Modal>
  )
}
