import { Suspense } from "react"

import { EmptyIdenticon } from "@/components/AccountAvatar/identicons/EmptyIdenticon"
import { Identican } from "@/components/AccountAvatar/identicons/Identican"
import { Box, BoxProps } from "@/components/Box"
import { useUiScale } from "@/styles/media"
import { getToken } from "@/utils"

export type AccountAvatarProps = BoxProps & {
  address: string
  size?: number
}

export const AccountAvatar: React.FC<AccountAvatarProps> = ({
  size = 42,
  ...props
}) => {
  const uiScale = useUiScale()
  const scaledSize = size * uiScale

  return (
    <Suspense
      fallback={
        <Box
          size={scaledSize}
          borderRadius="full"
          bg={getToken("surfaces.containers.dim.dimOnHigh")}
        />
      }
    >
      {!props.address ? (
        <EmptyIdenticon size={scaledSize} {...props} />
      ) : (
        <Identican size={scaledSize} {...props} />
      )}
    </Suspense>
  )
}
