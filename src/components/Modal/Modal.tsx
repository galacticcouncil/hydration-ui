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
import { useMeasure, useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"

const MODAL_WIDTH = 610

const MODAL_WIDTH = 610

type Props = {
  open: boolean
  onClose?: () => void
  title?: string | undefined
  variant?: "default" | "error" | "success"
  secondaryIcon?: { icon: ReactNode; onClick: () => void; name: string }
  topContent?: ReactNode
  withoutClose?: boolean
  withoutOutsideClose?: boolean
  width?: number
  isDrawer?: boolean
  titleHeader?: string
  containerStyles?: Interpolation<Theme>
  secondaryModal?: {
    content: ReactNode
    isOpen: boolean
    title?: string
    onBack?: () => void
  }
}

type PropsOverride = Pick<
  Props,
  | "variant"
  | "secondaryIcon"
  | "title"
  | "isDrawer"
  | "withoutOutsideClose"
  | "titleHeader"
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
      secondaryIcon: props.secondaryIcon,
      isDrawer: props.isDrawer,
      withoutOutsideClose: props.withoutOutsideClose,
      titleHeader: props.titleHeader,
    })
    return () => {
      context(null)
    }
  }, [
    ref,
    context,
    props.title,
    props.variant,
    props.secondaryIcon,
    props.isDrawer,
    props.withoutOutsideClose,
    props.titleHeader,
  ])

  return null
}

const HeaderAnimation = ({
  children,
  direction,
}: PropsWithChildren<{ direction: "right" | "left" }>) => (
  <motion.div
    exit={{
      x: direction === "left" ? -MODAL_WIDTH : MODAL_WIDTH,
      opacity: 0,
    }}
    initial={{
      x: direction === "left" ? -MODAL_WIDTH : MODAL_WIDTH,
      opacity: 0,
    }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    sx={{
      flex: "row",
      align: "center",
      gap: 8,
      justify: "space-between",
    }}
  >
    {children}
  </motion.div>
)

export const Modal: FC<PropsWithChildren<Props>> = (props) => {
  const { t } = useTranslation()
  const [propsOverride, setPropsOverride] = useState<PropsOverride | null>(null)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [refPrimary, sizePrimary] = useMeasure<HTMLDivElement>()
  const [refSecondary, sizeSecondary] = useMeasure<HTMLDivElement>()

  const mergedProps = { ...props, ...propsOverride }
  const { isDrawer, titleHeader, secondaryIcon, title, withoutClose } =
    mergedProps

  const visibleHeader = !withoutClose || !!secondaryIcon || titleHeader

  return (
    <Dialog open={props.open}>
      <DialogPortal>
        <ModalContext.Provider value={setPropsOverride}>
          <ModalContainer css={props.containerStyles}>
            <Backdrop variant={mergedProps.variant ?? "default"} />

            <ModalWindow
              isTopContent={!!props.topContent}
              isDrawer={isDrawer}
              maxWidth={MODAL_WIDTH}
              onEscapeKeyDown={!props.withoutClose ? props.onClose : undefined}
              onInteractOutside={
                props.withoutClose || mergedProps.withoutOutsideClose
                  ? undefined
                  : props.onClose
              }
            >
              {props.topContent}
              <ModalWindowContainer isDrawer={isDrawer}>
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleHeader ? (
                    <ModalHeader>
                      <AnimatePresence initial={false} mode="popLayout">
                        {!props.secondaryModal?.isOpen ? (
                          <HeaderAnimation key="primaryHeader" direction="left">
                            {secondaryIcon && (
                              <SecondaryButton
                                icon={secondaryIcon.icon}
                                onClick={secondaryIcon.onClick}
                                name={secondaryIcon.name}
                              />
                            )}
                            {titleHeader && (
                              <Text
                                color="white"
                                font="FontOver"
                                fs={16}
                                fw={500}
                              >
                                {titleHeader}
                              </Text>
                            )}
                          </HeaderAnimation>
                        ) : (
                          <div css={{ overflow: "hidden", flexGrow: 1 }}>
                            <HeaderAnimation
                              key="secondaryHeader"
                              direction="right"
                            >
                              {props.secondaryModal.onBack && (
                                <SecondaryButton
                                  icon={
                                    <ChevronRight
                                      css={{ transform: "rotate(180deg)" }}
                                    />
                                  }
                                  onClick={props.secondaryModal.onBack}
                                  css={{ position: "initial" }}
                                  name="Back"
                                />
                              )}
                              {props.secondaryModal.title && (
                                <Text
                                  font="FontOver"
                                  tAlign="center"
                                  sx={{ flexGrow: 1 }}
                                >
                                  {props.secondaryModal.title}
                                </Text>
                              )}
                              <div sx={{ width: [72, 0] }} />
                            </HeaderAnimation>
                          </div>
                        )}
                      </AnimatePresence>
                      {!mergedProps.withoutClose && (
                        <CloseButton
                          icon={<CrossIcon />}
                          onClick={mergedProps.onClose}
                          name={t("modal.closeButton.name")}
                        />
                      )}
                    </ModalHeader>
                  ) : (
                    <Spacer size={20} />
                  )}

                  {!props.secondaryModal?.isOpen ? (
                    <motion.div
                      key="primaryContent"
                      exit={{
                        x: -MODAL_WIDTH,
                        height: sizeSecondary.height,
                        opacity: 0,
                      }}
                      initial={{
                        x: -MODAL_WIDTH,
                        height: sizeSecondary.height,
                        opacity: 0,
                      }}
                      animate={{ x: 0, height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <RemoveScroll enabled={props.open} ref={refPrimary}>
                        <ModalBody isDrawer={isDrawer}>
                          {isDesktop ? (
                            <ModalTitle>{title}</ModalTitle>
                          ) : (
                            <Text fs={19} font="FontOver">
                              {title}
                            </Text>
                          )}
                          <div
                            sx={{ flex: "column" }}
                            css={{
                              flex: "1 auto",
                            }}
                          >
                            {mergedProps.children}
                          </div>
                        </ModalBody>
                        <DialogDescription />
                      </RemoveScroll>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="secondaryContent"
                      exit={{
                        x: MODAL_WIDTH,
                        height: sizePrimary.height,
                        opacity: 0,
                      }}
                      initial={{
                        x: MODAL_WIDTH,
                        height: sizePrimary.height,
                        opacity: 0,
                      }}
                      animate={{ x: 0, height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <RemoveScroll enabled={props.open} ref={refSecondary}>
                        <ModalBody isDrawer={isDrawer}>
                          {props.secondaryModal?.content}
                        </ModalBody>
                      </RemoveScroll>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModalWindowContainer>
            </ModalWindow>
          </ModalContainer>
        </ModalContext.Provider>
      </DialogPortal>
    </Dialog>
  )
}
