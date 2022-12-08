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
  ModalHeader,
  CloseButton,
  ModalContainer,
  SecondaryButton,
  ModalWindowContainer,
} from "./Modal.styled"
import { Backdrop } from "components/Backdrop/Backdrop"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Dialog, DialogDescription, DialogPortal } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { Text } from "components/Typography/Text/Text"
import { Interpolation } from "@emotion/styled"
import { Theme } from "@emotion/react"
import { Spacer } from "components/Spacer/Spacer"

type Props = {
  open: boolean
  onClose: () => void
  title?: string | undefined
  variant?: "default" | "error" | "success"
  secondaryIcon?: { icon: ReactNode; onClick: () => void; name: string }
  topContent?: ReactNode
  withoutClose?: boolean
  width?: number
  isDrawer?: boolean
  titleDrawer?: string
  containerStyles?: Interpolation<Theme>
}

type PropsOverride = Pick<
  Props,
  "variant" | "width" | "secondaryIcon" | "title" | "isDrawer"
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
      secondaryIcon: props.secondaryIcon,
      isDrawer: props.isDrawer,
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
    props.secondaryIcon,
    props.isDrawer,
  ])

  return null
}

export const Modal: FC<PropsWithChildren<Props>> = (props) => {
  const { t } = useTranslation()
  const [propsOverride, setPropsOverride] = useState<PropsOverride | null>(null)

  const mergedProps = { ...props, ...propsOverride }
  const { isDrawer, titleDrawer, secondaryIcon, title, withoutClose } =
    mergedProps

  const visibleHeader = !withoutClose || !!secondaryIcon || titleDrawer

  return (
    <Dialog open={props.open}>
      <DialogPortal>
        <ModalContext.Provider value={setPropsOverride}>
          <ModalContainer css={props.containerStyles}>
            <Backdrop variant={mergedProps.variant ?? "default"} />

            <ModalWindow
              isDrawer={isDrawer}
              maxWidth={mergedProps.width}
              onEscapeKeyDown={!props.withoutClose ? props.onClose : undefined}
              onInteractOutside={
                !props.withoutClose ? props.onClose : undefined
              }
            >
              {props.topContent}
              <ModalWindowContainer isDrawer={isDrawer}>
                {visibleHeader ? (
                  <ModalHeader>
                    {titleDrawer && isDrawer && (
                      <Text color="white" fs={16} fw={500}>
                        {titleDrawer}
                      </Text>
                    )}
                    {!!secondaryIcon && (
                      <SecondaryButton
                        icon={secondaryIcon.icon}
                        onClick={secondaryIcon.onClick}
                        name={secondaryIcon.name}
                      />
                    )}
                    {!mergedProps.withoutClose && (
                      <CloseButton
                        icon={<CrossIcon />}
                        onClick={props.onClose}
                        name={t("modal.closeButton.name")}
                      />
                    )}
                  </ModalHeader>
                ) : (
                  <Spacer size={20} />
                )}
                <RemoveScroll enabled={props.open} css={{ flexGrow: 1 }}>
                  <ModalBody isDrawer={isDrawer}>
                    <ModalTitle>{title}</ModalTitle>
                    {props.children}
                  </ModalBody>
                  <DialogDescription />
                </RemoveScroll>
              </ModalWindowContainer>
            </ModalWindow>
          </ModalContainer>
        </ModalContext.Provider>
      </DialogPortal>
    </Dialog>
  )
}
