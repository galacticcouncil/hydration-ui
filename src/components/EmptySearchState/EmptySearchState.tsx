import { Text } from "components/Typography/Text/Text"
import EmptyStateIcon from "assets/icons/EmptySearchIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"

export const EmptySearchState = () => {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        flex: "column",
        align: "center",
        justify: "center",
        gap: 10,
        py: 50,
      }}
    >
      <Icon icon={<EmptyStateIcon />} />
      <Text font="FontOver" color="white" css={{ opacity: 0.6 }}>
        {t("searchFilter.empty.title")}
      </Text>
      <div sx={{ flex: "row", gap: 2, flexWrap: "wrap", justify: "center" }}>
        <Text color="darkBlue100" fs={14}>
          {t("searchFilter.empty.desc")}
        </Text>
        <a href="https://t.me/hydradx" target="blank" rel="noreferrer">
          <Text
            fs={14}
            color="brightBlue100"
            css={{
              textDecoration: "underline",
              "&:hover": {
                opacity: 0.6,
              },
            }}
          >
            {t("searchFilter.empty.link")}
          </Text>
        </a>
      </div>
    </div>
  )
}
