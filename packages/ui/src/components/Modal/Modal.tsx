import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { ArrowLeft, X } from "lucide-react"
import {
  createContext,
  FC,
  forwardRef,
  ReactNode,
  useContext,
  useMemo,
} from "react"

import { BoxProps } from "@/components/Box"
import { DrawerContent, DrawerHeader, DrawerRoot } from "@/components/Drawer"
import { Flex, FlexProps } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { useBreakpoints } from "@/theme"

import { Paper } from "../Paper"
import {
  SModalBody,
  SModalClose,
  SModalContent,
  SModalContentDivider,
  SModalDescription,
  SModalFooter,
  SModalHeader,
  SModalOverlay,
  SModalPaper,
  SModalTitle,
  SModalWrapper,
} from "./Modal.styled"

export type ModalVariant = "auto" | "drawer" | "popup"

const ModalContext = createContext<{
  variant: ModalVariant
}>({
  variant: "auto",
})

const ModalRoot = DialogPrimitive.Root

const ModalTrigger = DialogPrimitive.Trigger

const ModalPortal = DialogPrimitive.Portal

const ModalClose = DialogPrimitive.Close

const ModalOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>((props, ref) => <SModalOverlay ref={ref} {...props} />)
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const ModalContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <SModalWrapper onClick={(e) => e.stopPropagation()}>
      <SModalContent ref={ref} {...props}>
        <SModalPaper>{children}</SModalPaper>
      </SModalContent>
    </SModalWrapper>
  </ModalPortal>
))
ModalContent.displayName = DialogPrimitive.Content.displayName

const ModalTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} asChild {...props}>
    <SModalTitle as="h2">{children}</SModalTitle>
  </DialogPrimitive.Title>
))
ModalTitle.displayName = DialogPrimitive.Title.displayName

const ModalDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} asChild {...props}>
    <SModalDescription>{children}</SModalDescription>
  </DialogPrimitive.Description>
))
ModalDescription.displayName = DialogPrimitive.Description.displayName

type ModalHeaderProps = Omit<FlexProps, "title"> & {
  title: string
  description?: string
  align?: "default" | "center"
  customHeader?: ReactNode
  customTitle?: ReactNode
  onBack?: () => void
  closable?: boolean
}

const ModalHeader: FC<ModalHeaderProps> = ({
  title,
  description,
  align = "default",
  customHeader,
  customTitle,
  onBack,
  closable = true,
  ...props
}: FlexProps & ModalHeaderProps) => {
  const { variant } = useContext(ModalContext)

  if (variant === "drawer") {
    return (
      <DrawerHeader
        title={title}
        description={description}
        customHeader={customHeader}
        customTitle={customTitle}
      />
    )
  }

  return (
    <SModalHeader {...props}>
      <Flex>
        {onBack && (
          <Icon
            component={ArrowLeft}
            size={18}
            css={{ cursor: "pointer", maxWidth: "fit-content" }}
            onClick={onBack}
          />
        )}

        {customTitle ? (
          <>
            <VisuallyHidden.Root>
              <ModalTitle>{title}</ModalTitle>
            </VisuallyHidden.Root>
            {customTitle}
          </>
        ) : (
          <ModalTitle
            sx={{ textAlign: align === "center" ? "center" : "left" }}
          >
            {title}
          </ModalTitle>
        )}

        {closable && (
          <SModalClose className="close">
            <X sx={{ width: 20, height: 20 }} />
          </SModalClose>
        )}
      </Flex>

      {description && <ModalDescription>{description}</ModalDescription>}
      {customHeader}
    </SModalHeader>
  )
}
ModalHeader.displayName = "ModalHeader"

const ModalBody = (props: BoxProps) => (
  <SModalBody {...props}>{props.children}</SModalBody>
)
ModalBody.displayName = "ModalBody"

const ModalFooter = (props: FlexProps) => <SModalFooter {...props} />
ModalFooter.displayName = "ModalFooter"

export type ModalProps = React.ComponentProps<typeof ModalRoot> & {
  variant?: ModalVariant
  disableInteractOutside?: boolean
}

const Modal = ({
  children,
  variant = "auto",
  disableInteractOutside = false,
  ...props
}: ModalProps) => {
  const { gte } = useBreakpoints()

  const isDrawer = variant === "auto" ? !gte("md") : variant === "drawer"
  const context = useMemo(() => ({ variant }), [variant])

  if (isDrawer) {
    return (
      <ModalContext.Provider value={context}>
        <DrawerRoot {...props}>
          <DrawerContent
            onInteractOutside={
              disableInteractOutside ? (e) => e.preventDefault() : undefined
            }
          >
            {children}
          </DrawerContent>
        </DrawerRoot>
      </ModalContext.Provider>
    )
  }

  return (
    <ModalContext.Provider value={context}>
      <ModalRoot {...props}>
        <ModalContent
          onClick={(e) => e.stopPropagation()}
          onInteractOutside={
            disableInteractOutside ? (e) => e.preventDefault() : undefined
          }
        >
          {children}
        </ModalContent>
      </ModalRoot>
    </ModalContext.Provider>
  )
}

const ModalContainer = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ModalRoot> & {
  className?: string
}) => (
  <ModalRoot {...props} modal={false}>
    <SModalContent sx={{ position: "unset" }} className={className}>
      <Paper>{children}</Paper>
    </SModalContent>
  </ModalRoot>
)

const ModalContentDivider = SModalContentDivider

export {
  Modal,
  ModalBody,
  ModalClose,
  ModalContainer,
  ModalContent,
  ModalContentDivider,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
}
