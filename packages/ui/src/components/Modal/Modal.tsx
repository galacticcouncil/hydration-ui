import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { X } from "lucide-react"
import { forwardRef, ReactNode } from "react"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
} from "@/components/Drawer"
import { Flex, FlexProps } from "@/components/Flex"
import { useBreakpoints } from "@/theme"

import { AnimatePresence } from "../AnimatePresence"
import {
  SModalBody,
  SModalClose,
  SModalContent,
  SModalDescription,
  SModalFooter,
  SModalHeader,
  SModalOverlay,
  SModalPaper,
  SModalTitle,
  SModalWrapper,
} from "./Modal.styled"

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
    <SModalWrapper>
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

const ModalHeader = ({
  title,
  description,
  customHeader,
  customTitle,
  ...props
}: FlexProps & {
  title: string
  description?: string
  customHeader?: ReactNode
  customTitle?: ReactNode
}) => (
  <SModalHeader {...props}>
    <Flex>
      {customTitle ? (
        <>
          <VisuallyHidden.Root>
            <ModalTitle>{title}</ModalTitle>
          </VisuallyHidden.Root>
          {customTitle}
        </>
      ) : (
        <ModalTitle>{title}</ModalTitle>
      )}

      <SModalClose className="close">
        <X sx={{ width: 20, height: 20 }} />
      </SModalClose>
    </Flex>

    {description && <ModalDescription>{description}</ModalDescription>}
    {customHeader}
  </SModalHeader>
)
ModalHeader.displayName = "ModalHeader"

const ModalBody = (props: FlexProps) => (
  <SModalBody {...props}>{props.children}</SModalBody>
)
ModalBody.displayName = "ModalBody"

const ModalFooter = (props: FlexProps) => <SModalFooter {...props} />
ModalFooter.displayName = "ModalFooter"

export type ModalProps = React.ComponentProps<typeof ModalRoot> & {
  disableInteractOutside?: boolean
} & ModalHeaderProps

type ModalHeaderProps = {
  title: string
  description?: string
  customHeader?: ReactNode
  customTitle?: ReactNode
}

const Modal = ({
  children,
  disableInteractOutside = false,
  title,
  description,
  customHeader,
  customTitle,
  ...props
}: ModalProps) => {
  const { gte } = useBreakpoints()

  if (!gte("md")) {
    return (
      <Drawer
        title={title}
        description={description}
        disableInteractOutside={disableInteractOutside}
        customHeader={customHeader}
        customTitle={customTitle}
        {...props}
      >
        {children}
      </Drawer>
    )
  }

  return (
    <ModalRoot {...props}>
      <ModalContent
        onInteractOutside={
          disableInteractOutside ? (e) => e.preventDefault() : undefined
        }
      >
        <AnimatePresence open={!!props.open}>
          <ModalHeader
            title={title}
            description={description}
            customHeader={customHeader}
            customTitle={customTitle}
          />
          {children}
        </AnimatePresence>
      </ModalContent>
    </ModalRoot>
  )
}

const ModalMounted = (
  props: React.ComponentProps<typeof ModalRoot> & {
    disableInteractOutside?: boolean
  },
) => {
  const { gte } = useBreakpoints()

  if (!gte("md")) {
    return (
      <DrawerRoot {...props}>
        <DrawerContent
          onInteractOutside={
            props.disableInteractOutside ? (e) => e.preventDefault() : undefined
          }
        >
          {props.children}
        </DrawerContent>
      </DrawerRoot>
    )
  }

  return (
    <ModalRoot {...props}>
      <ModalContent
        onInteractOutside={
          props.disableInteractOutside ? (e) => e.preventDefault() : undefined
        }
      >
        {props.children}
      </ModalContent>
    </ModalRoot>
  )
}

const ModalUnmounted = ({
  open,
  title,
  description,
  customHeader,
  customTitle,
  children,
}: ModalProps) => {
  const { gte } = useBreakpoints()

  if (!gte("md")) {
    return (
      <AnimatePresence open={!!open}>
        <DrawerHeader
          title={title}
          description={description}
          customHeader={customHeader}
          customTitle={customTitle}
        />
        {children}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence open={!!open}>
      <ModalHeader
        title={title}
        description={description}
        customHeader={customHeader}
        customTitle={customTitle}
      />
      {children}
    </AnimatePresence>
  )
}

export {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalMounted,
  ModalOverlay,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
  ModalUnmounted,
}
