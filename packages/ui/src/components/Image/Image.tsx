import { ImgHTMLAttributes, useState } from "react"

export type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "loading"
> & {
  lazy?: boolean
  placeholder?: React.ReactNode
}

export const Image = ({
  src,
  placeholder,
  onError,
  lazy = true,
  ...props
}: ImageProps) => {
  const [hasError, setHasError] = useState(false)

  const handleError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    setHasError(true)
    onError?.(event)
  }

  if (placeholder && (!src || hasError)) {
    return placeholder
  }

  return (
    <img
      {...props}
      loading={lazy ? "lazy" : "eager"}
      src={src}
      onError={handleError}
    />
  )
}
