import { FC } from "react"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import {
  MIGRATION_QUERY_PARAM,
  MIGRATION_TARGET_URL,
} from "sections/migration/MigrationProvider.utils"

export const MigrationExportModal: FC<{ data: string }> = ({ data }) => {
  return (
    <Modal open headerVariant="FontOver" title="Hydration Migration">
      <Text sx={{ mb: 20 }} color="basic300">
        HydraDX is migrating to new domain. Click the button below to transfer
        your settings.
      </Text>

      <Button
        variant="primary"
        onClick={() => {
          window.location.href = `${MIGRATION_TARGET_URL}?${MIGRATION_QUERY_PARAM}=${data}`
        }}
      >
        Transfer my settings
      </Button>
    </Modal>
  )
}
