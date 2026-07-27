import { LinkTextButton, Stack } from "@galacticcouncil/ui/components"
import { Alert } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { ENV } from "@/config/env"
import { xcmQueryParamsSchema } from "@/modules/xcm/transfer/utils/query"
import { XcmPage } from "@/modules/xcm/XcmPage"
import { XcmPageSkeleton } from "@/modules/xcm/XcmPageSkeleton"

const Page = () => {
  const { t } = useTranslation(["common", "xcm"])
  return (
    <Stack gap="xl">
      {ENV.VITE_WORMHOLE_DISABLED && (
        <Alert
          sx={{ width: "fit-content", mx: "auto" }}
          variant="info"
          description={t("xcm:wormhole.disabled.banner")}
          action={
            <LinkTextButton href="https://x.com/hydration_net/status/2074890386275770872">
              {t("readMore")}
            </LinkTextButton>
          }
        />
      )}
      <XcmPage />
    </Stack>
  )
}

export const Route = createFileRoute("/cross-chain/")({
  component: Page,
  pendingComponent: XcmPageSkeleton,
  validateSearch: xcmQueryParamsSchema,
})
