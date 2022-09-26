import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  ModalWindow,
  ModalTitle,
  ModalBody,
  IconsWrapper,
  CloseButton,
  ModalContainer,
} from "./Modal.styled"
import { Backdrop } from "components/Backdrop/Backdrop"
import { IconButton } from "components/IconButton/IconButton"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Dialog, DialogDescription, DialogPortal } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { SizeProps } from "utils/styles"
import { theme } from "theme"

type Props = {
  open: boolean
  onClose: () => void
  title?: string | undefined
  variant?: "default" | "error"
  secondaryIcon?: { icon: ReactNode; onClick: () => void; name: string }
  withoutClose?: boolean
} & Pick<SizeProps, "width">

type PropsOverride = Pick<
  Props,
  "variant" | "width" | "withoutClose" | "secondaryIcon" | "title"
>

const ModalContext = createContext<(override: PropsOverride | null) => void>(
  () => void 0,
)

export const ModalMeta = (props: PropsOverride) => {
  const ref = useRef(true)
  const context = useContext(ModalContext)

  useLayoutEffect(() => {
    context({
      title: props.title,
      variant: props.variant,
      width: props.width,
      withoutClose: props.withoutClose,
      secondaryIcon: props.secondaryIcon,
    })
    return () => {
      context(null)
    }
  }, [
    ref,
    context,
    props.title,
    props.variant,
    props.width,
    props.withoutClose,
    props.secondaryIcon,
  ])

  return null
}

export const Modal: FC<PropsWithChildren<Props>> = (props) => {
  const { t } = useTranslation()

  const [propsOverride, setPropsOverride] = useState<PropsOverride | null>(null)
  const mergedProps = { ...props, ...propsOverride }

  return (
    <Dialog open={props.open}>
      <DialogPortal>
        <ModalContext.Provider value={setPropsOverride}>
          <ModalContainer>
            <Backdrop variant={mergedProps.variant} />
            <ModalWindow
              width={mergedProps.width}
              onEscapeKeyDown={props.onClose}
            >
              <IconsWrapper>
                {!!mergedProps.secondaryIcon && (
                  <IconButton
                    icon={mergedProps.secondaryIcon.icon}
                    onClick={mergedProps.secondaryIcon.onClick}
                    name={mergedProps.secondaryIcon.name}
                    css={{ color: theme.colors.white }}
                  />
                )}
                {!mergedProps.withoutClose && (
                  <CloseButton
                    icon={<CrossIcon />}
                    onClick={props.onClose}
                    name={t("modal.closeButton.name")}
                    css={{ color: theme.colors.white }}
                  />
                )}
              </IconsWrapper>
              <ModalBody>
                <ModalTitle>{mergedProps.title}</ModalTitle>
                {props.children}
              </ModalBody>
              <DialogDescription />
            </ModalWindow>
          </ModalContainer>
        </ModalContext.Provider>
      </DialogPortal>
    </Dialog>
  )
}
