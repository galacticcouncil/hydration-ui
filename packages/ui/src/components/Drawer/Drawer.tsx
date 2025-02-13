import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { forwardRef, ReactNode } from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { Flex, FlexProps } from "@/components/Flex"

import {
  SDrawerBody,
  SDrawerContent,
  SDrawerDescription,
  SDrawerFooter,
  SDrawerHandle,
  SDrawerHeader,
  SDrawerOverlay,
  SDrawerTitle,
} from "./Drawer.styled"

const DrawerRoot = DrawerPrimitive.Root

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>((props, ref) => <SDrawerOverlay ref={ref} {...props} />)
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <SDrawerContent ref={ref} className={className} {...props}>
      <SDrawerHandle />
      {children}
    </SDrawerContent>
  </DrawerPortal>
))
DrawerContent.displayName = DrawerPrimitive.Content.displayName

const DrawerBody = (props: FlexProps) => (
  <SDrawerBody {...props}>{props.children}</SDrawerBody>
)
DrawerBody.displayName = "DrawerBody"

const DrawerTitle = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ children, ...props }, ref) => (
  <DrawerPrimitive.Title ref={ref} asChild {...props}>
    <SDrawerTitle as="h2">{children}</SDrawerTitle>
  </DrawerPrimitive.Title>
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ children, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} asChild {...props}>
    <SDrawerDescription>{children}</SDrawerDescription>
  </DrawerPrimitive.Description>
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

const DrawerHeader = ({
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
  <SDrawerHeader {...props}>
    <Flex width="100%">
      {customTitle ? (
        <>
          <VisuallyHidden.Root>
            <DrawerTitle>{title}</DrawerTitle>
          </VisuallyHidden.Root>
          {customTitle}
        </>
      ) : (
        <DrawerTitle>{title}</DrawerTitle>
      )}
    </Flex>

    {description && <DrawerDescription>{description}</DrawerDescription>}
    {customHeader}
  </SDrawerHeader>
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = (props: FlexProps) => <SDrawerFooter {...props} />
DrawerFooter.displayName = "DrawerFooter"

export type DrawerProps = React.ComponentProps<typeof DrawerRoot> & {
  disableInteractOutside?: boolean
  title: string
  description?: string
  customHeader?: ReactNode
  customTitle?: ReactNode
}

const Drawer = ({
  children,
  disableInteractOutside = false,
  title,
  description,
  customHeader,
  customTitle,
  ...props
}: DrawerProps) => {
  return (
    <DrawerRoot {...props}>
      <DrawerContent
        onInteractOutside={
          disableInteractOutside ? (e) => e.preventDefault() : undefined
        }
      >
        <DrawerHeader
          title={title}
          description={description}
          customHeader={customHeader}
          customTitle={customTitle}
        />
        {children}
      </DrawerContent>
    </DrawerRoot>
  )
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
}
