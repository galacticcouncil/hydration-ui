import { FC, useEffect, useState } from "react"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import {
  MIGRATION_CHECK_KEY,
  importToLocalStorage,
} from "sections/migration/MigrationProvider.utils"

export const MigrationImportModal: FC<{ data: string }> = ({ data }) => {
  const [lastImportDate, setLastImportDate] = useState<Date | null>(null)
  const handleImport = (data: string) => {
    if (data) {
      importToLocalStorage(data)
      window.location.href = window.location.origin
      localStorage.setItem(MIGRATION_CHECK_KEY, new Date().toISOString())
    }
  }

  useEffect(() => {
    const migrationStatus = localStorage.getItem(MIGRATION_CHECK_KEY)
    const migrationCompletedOn = migrationStatus
      ? new Date(migrationStatus)
      : null

    if (migrationCompletedOn) {
      setLastImportDate(new Date(migrationCompletedOn))
    } else {
      handleImport(data)
    }
  }, [data])

  if (!lastImportDate) {
    return null
  }

  return (
    <Modal open headerVariant="FontOver" title="Hydration Migration">
      <Text sx={{ mb: 20 }} color="basic300">
        You already transferred your settings on{" "}
        {lastImportDate.toLocaleString()}. Do you want to overwrite your current
        settings?
      </Text>

      <div sx={{ flex: "row", gap: 20, justify: "space-between" }}>
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = window.location.origin
          }}
        >
          Close
        </Button>
        <Button
          variant="mutedError"
          onClick={() => {
            handleImport(data)
          }}
        >
          Overwrite my settings
        </Button>
      </div>
    </Modal>
  )
}
