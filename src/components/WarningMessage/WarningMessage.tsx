import { useMatchRoute } from "@tanstack/react-location"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { ExternalLink } from "components/Link/ExternalLink"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import { TWarningsType, useWarningsStore } from "./WarningMessage.utils"
import {
  SSecondaryItem,
  SWarningMessageContainer,
  SWarningMessageContent,
} from "./WarningMessage.styled"

export const WarningMessage = (props: {
  type: TWarningsType
  text: ReactNode
  modalContent?: ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()

  const warnings = useWarningsStore()

  const isWithinVisibility = warnings.warnings[props.type].visibility.some(
    (item) => matchRoute({ to: LINKS[item] }),
  )

  if (!isWithinVisibility) return null

  return (
    <>
      {open && (
        <Modal
          open={true}
          onClose={() => setOpen(false)}
          title={t("depeg.modal.title")}
        >
          <Text css={{ color: "#B2B6C5" }} lh={24} sx={{ mt: 16 }}>
            {t("depeg.modal.description")}
          </Text>

          <div sx={{ flex: "row", justify: "center", mt: 32 }}>
            <ExternalLink
              sx={{ color: "pink600" }}
              href="https://www.coingecko.com/en/coins/dai"
            >
              {t("depeg.modal.check.price")}
            </ExternalLink>
          </div>
        </Modal>
      )}
      <SWarningMessageContainer
        onClick={() => props.modalContent && setOpen(true)}
      >
        <SSecondaryItem />
        <SWarningMessageContent>
          <svg
            width="18"
            height="15"
            viewBox="0 0 18 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            css={{ flexShrink: 0 }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.75753 0.707031L16.7104 14.4818H0.804688L8.75753 0.707031ZM8.01068 10.5323H9.50752V12.0291H8.01068V10.5323ZM9.50752 5.99067H8.01068V9.48331H9.50752V5.99067Z"
              fill="url(#paint0_linear_21027_167880)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_21027_167880"
                x1="8.75753"
                y1="1.38726"
                x2="8.75753"
                y2="14.4818"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.448929" stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0.27" />
              </linearGradient>
            </defs>
          </svg>

          {props.text}
        </SWarningMessageContent>

        <SSecondaryItem
          css={{
            justifyContent: "flex-end",
          }}
        >
          <CrossIcon
            onClick={(e) => {
              e.stopPropagation()
              warnings.setWarnings(props.type, false)
            }}
          />
        </SSecondaryItem>
      </SWarningMessageContainer>
    </>
  )
}
