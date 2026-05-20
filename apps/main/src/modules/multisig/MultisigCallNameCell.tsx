import { LinkTextButton, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

type Props = {
  methodName: string
  fallbackLabel: string
  subscanHref: string | undefined
  isLoading: boolean
}

export const MultisigCallNameCell: React.FC<Props> = ({
  methodName,
  fallbackLabel,
  subscanHref,
  isLoading,
}) => {
  if (isLoading) {
    return <Skeleton sx={{ width: "3xl" }} />
  }

  const label = methodName || fallbackLabel

  if (!subscanHref) {
    return (
      <Text fs="p4" fw={600} truncate color={getToken("text.high")}>
        {label}
      </Text>
    )
  }

  return (
    <LinkTextButton
      href={subscanHref}
      direction="external"
      variant="plain"
      sx={{
        minWidth: 0,
        maxWidth: "100%",
        "&:hover": { textDecoration: "underline" },
      }}
    >
      <Text as="span" fs="p4" fw={600} truncate color={getToken("text.high")}>
        {label}
      </Text>
    </LinkTextButton>
  )
}
