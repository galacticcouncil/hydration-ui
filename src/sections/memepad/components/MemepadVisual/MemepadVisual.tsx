import React, { useEffect, useRef } from "react"
import { SBottleCaps, SContainer } from "./MemepadVisual.styled"
import {
  useAnimation,
  useReducedMotion,
  m as motion,
  LazyMotion,
  domAnimation,
} from "framer-motion"
import { useMedia } from "react-use"
import { theme } from "theme"

export type MemepadVisualProps = {
  className?: string
}

export const MemepadVisual: React.FC<MemepadVisualProps> = ({ className }) => {
  const animationRef = useRef<number>()
  const shouldReduceMotion = useReducedMotion()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const animation = useAnimation()

  const shouldAnimate = isDesktop && !shouldReduceMotion

  useEffect(() => {
    const update = (e: MouseEvent) => {
      const clientX = e.x
      const clientY = e.y

      const moveX = clientX - window.innerWidth / 2
      const moveY = clientY - window.innerHeight / 2
      const offseFactor = 200

      animationRef.current = window.requestAnimationFrame(() => {
        animation.start({
          x: (moveX / offseFactor) * -1,
          y: (moveY / offseFactor) * -1,
        })
      })
    }

    if (shouldAnimate) {
      window.addEventListener("mousemove", update)
      return () => {
        window.removeEventListener("mousemove", update)
        animationRef.current &&
          window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animation, shouldAnimate])

  return (
    <LazyMotion features={domAnimation}>
      <SContainer className={className} as={motion.div}>
        <motion.div animate={animation}>
          <SBottleCaps />
        </motion.div>
      </SContainer>
    </LazyMotion>
  )
}
