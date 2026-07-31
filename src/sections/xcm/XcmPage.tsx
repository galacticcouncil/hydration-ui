import { Trans, useTranslation } from "react-i18next"

import { Alert } from "components/Alert"
import { ExternalLink } from "components/Link/ExternalLink"
import { Text } from "components/Typography/Text/Text"
import { NEXT_APP_URL } from "utils/constants"

const CROSS_CHAIN_URL = `${NEXT_APP_URL}/cross-chain`

export function XcmPage() {
  const { t } = useTranslation()

  return (
    <Alert variant="info" sx={{ maxWidth: 640, mx: "auto" }}>
      <Text fs={18} lh={30} fw={500}>
        <Trans
          t={t}
          i18nKey="xcm.unavailable"
          tOptions={{ url: CROSS_CHAIN_URL }}
        >
          <ExternalLink href={CROSS_CHAIN_URL} />
        </Trans>
      </Text>
    </Alert>
  )
}
