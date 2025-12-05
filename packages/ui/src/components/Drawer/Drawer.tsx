import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { FC, ReactNode, Ref } from "react"
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

const DrawerOverlay: FC<
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & {
    ref?: Ref<React.ElementRef<typeof DrawerPrimitive.Overlay>>
  }
> = ({ ref, ...props }) => <SDrawerOverlay ref={ref} {...props} />

const DrawerContent: FC<
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    ref?: Ref<React.ElementRef<typeof DrawerPrimitive.Content>>
  }
> = ({ className, children, ref, forceMount, ...props }) => (
  <DrawerPortal forceMount={forceMount}>
    <DrawerOverlay />
    <SDrawerContent ref={ref} className={className} {...props}>
      <SDrawerHandle />
      {children}
    </SDrawerContent>
  </DrawerPortal>
)

const DrawerBody = (props: FlexProps) => (
  <SDrawerBody {...props}>{props.children}</SDrawerBody>
)

const DrawerTitle: FC<
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> & {
    ref?: Ref<React.ElementRef<typeof DrawerPrimitive.Title>>
  }
> = ({ children, ref, ...props }) => (
  <DrawerPrimitive.Title ref={ref} asChild {...props}>
    <SDrawerTitle as="h2">{children}</SDrawerTitle>
  </DrawerPrimitive.Title>
)

const DrawerDescription: FC<
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description> & {
    ref?: Ref<React.ElementRef<typeof DrawerPrimitive.Description>>
  }
> = ({ children, ref, ...props }) => (
  <DrawerPrimitive.Description ref={ref} asChild {...props}>
    <SDrawerDescription>{children}</SDrawerDescription>
  </DrawerPrimitive.Description>
)

const DrawerHeader = ({
  title,
  description,
  customDescription,
  customHeader,
  customTitle,
  ...props
}: FlexProps & {
  title: string
  description?: string
  customDescription?: ReactNode
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

    {customDescription ? (
      <>
        {description && (
          <VisuallyHidden.Root>
            <DrawerDescription>{description}</DrawerDescription>
          </VisuallyHidden.Root>
        )}
        {customDescription}
      </>
    ) : (
      description && <DrawerDescription>{description}</DrawerDescription>
    )}
    {customHeader}
  </SDrawerHeader>
)

const DrawerFooter = (props: FlexProps) => <SDrawerFooter {...props} />

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
