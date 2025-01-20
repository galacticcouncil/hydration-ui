import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { forwardRef } from "react"

import { FlexProps } from "@/components/Flex"

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
        <SModalClose>
          <X sx={{ width: 20, height: 20 }} />
        </SModalClose>
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
  children,
  ...props
}: FlexProps & { title?: string; description?: string }) => (
  <SModalHeader {...props}>
    {title && <ModalTitle>{title}</ModalTitle>}
    {description && <ModalDescription>{description}</ModalDescription>}
    {children}
  </SModalHeader>
)
ModalHeader.displayName = "ModalHeader"

const ModalBody = (props: FlexProps) => <SModalBody {...props} />
ModalBody.displayName = "ModalBody"

const ModalFooter = (props: FlexProps) => <SModalFooter {...props} />
ModalFooter.displayName = "ModalFooter"

export type ModalProps = React.ComponentProps<typeof ModalRoot> & {
  disableInteractOutside?: boolean
}

const Modal = ({
  children,
  disableInteractOutside = false,
  ...props
}: ModalProps) => {
  return (
    <ModalRoot {...props}>
      <ModalContent
        onInteractOutside={
          disableInteractOutside ? (e) => e.preventDefault() : undefined
        }
      >
        {children}
      </ModalContent>
    </ModalRoot>
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
  ModalOverlay,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
}
