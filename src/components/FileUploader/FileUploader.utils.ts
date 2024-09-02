import {
  Batch,
  FileFilterMethod,
  UPLOADER_EVENTS,
  UploadOptions,
  useUploady,
} from "@rpldy/uploady"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

export const ALL_FILE_TYPES = ["png", "jpg", "svg", "webp"] as const
export const DEFAULT_MAX_SIZE = 5242880
export const DEFAULT_MIN_WIDTH = 0
export const DEFAULT_MIN_HEIGHT = 0
export const DEFAULT_MAX_WIDTH = 1000
export const DEFAULT_MAX_HEIGHT = 1000
export type FileType = Readonly<(typeof ALL_FILE_TYPES)[number]>

export type FileOptions = {
  maxSize: number
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  allowedTypes?: readonly FileType[]
}

const fileTypeToMimeType = (type: FileType) => {
  const mimeTypeMap: Record<FileType, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    svg: "image/svg+xml",
    webp: "image/webp",
  }

  return mimeTypeMap[type]
}

export enum FileError {
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  INVALID_FILE_SIZE = "INVALID_FILE_SIZE",
  INVALID_FILE_DIMENSIONS = "INVALID_FILE_DIMENSIONS",
}

class InvalidFileError extends Error {
  code: FileError
  constructor(code: FileError) {
    super(code)
    this.code = code
  }
}

const getFileDimensions = (
  file: File,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    try {
      let img = new Image()

      img.onload = () => {
        const width = img.naturalWidth,
          height = img.naturalHeight

        window.URL.revokeObjectURL(img.src)

        return resolve({ width, height })
      }

      img.src = window.URL.createObjectURL(file)
    } catch (exception) {
      return reject(exception)
    }
  })

const isFileTypeValid = (
  file: File,
  allowedTypes: readonly FileType[] = [],
) => {
  if (file instanceof File) {
    return allowedTypes.map(fileTypeToMimeType).includes(file.type)
  }

  return false
}

const isFileSizeValid = (file: File, maxSize: number = DEFAULT_MAX_SIZE) => {
  if (file instanceof File) {
    return file.size <= maxSize
  }

  return false
}

const isImageDimensionsValid = async (
  file: File,
  {
    minWidth = DEFAULT_MIN_WIDTH,
    maxWidth = DEFAULT_MAX_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    maxHeight = DEFAULT_MAX_HEIGHT,
  },
) => {
  if (file instanceof File) {
    // skip of MIME type is not an image
    if (!file.type.startsWith("image/")) return true

    const dimensions = await getFileDimensions(file)
    if (!dimensions) return false

    return (
      dimensions.width >= minWidth &&
      dimensions.height >= minHeight &&
      dimensions.width <= maxWidth &&
      dimensions.height <= maxHeight
    )
  }

  return false
}

export const createFileFilter = ({
  maxSize,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  allowedTypes,
  onError,
}: {
  maxSize: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  allowedTypes?: readonly FileType[]
  onError?: (error: InvalidFileError) => void
}) => {
  const fileFilter: FileFilterMethod = async (file) => {
    if (file instanceof File) {
      if (!isFileTypeValid(file, allowedTypes)) {
        const error = new InvalidFileError(FileError.INVALID_FILE_TYPE)
        onError?.(error)
        throw error
      }

      if (!isFileSizeValid(file, maxSize)) {
        const error = new InvalidFileError(FileError.INVALID_FILE_SIZE)
        onError?.(error)
        throw error
      }

      if (
        !(await isImageDimensionsValid(file, {
          minWidth,
          maxWidth,
          minHeight,
          maxHeight,
        }))
      ) {
        const error = new InvalidFileError(FileError.INVALID_FILE_DIMENSIONS)
        onError?.(error)
        throw error
      }

      return true
    }
  }

  return fileFilter
}

export const useFileErrorMessage = (
  errorCode: FileError | null,
  options: FileOptions,
) => {
  const { t } = useTranslation()
  const { maxSize, minWidth, minHeight, maxWidth, maxHeight } = options

  return useMemo(() => {
    switch (errorCode) {
      case FileError.INVALID_FILE_TYPE:
        return t("fileUploader.error.type", {
          types: options.allowedTypes?.join(", ") ?? "",
        })
      case FileError.INVALID_FILE_SIZE:
        return t("fileUploader.error.size", {
          maxSize: formatBytes(maxSize),
        })
      case FileError.INVALID_FILE_DIMENSIONS:
        const isExact = minWidth === maxWidth && minHeight === maxHeight
        return isExact
          ? t("fileUploader.error.dimensions.exact", {
              width: minWidth,
              height: maxHeight,
            })
          : t("fileUploader.error.dimensions.range", {
              minWidth,
              minHeight,
              maxWidth,
              maxHeight,
            })
      default:
        return ""
    }
  }, [
    errorCode,
    maxHeight,
    maxSize,
    maxWidth,
    minHeight,
    minWidth,
    options.allowedTypes,
    t,
  ])
}

export const useUploadPendingFiles = () => {
  const uploady = useUploady()

  return useCallback(
    async (options: UploadOptions) => {
      return new Promise<void>((resolve, reject) => {
        uploady.processPending(options)

        const onProgress = (batch: Batch) => {
          if (batch.completed === 100) {
            resolve()
          }
        }

        uploady.on(UPLOADER_EVENTS.BATCH_PROGRESS, onProgress)
        uploady.on(UPLOADER_EVENTS.BATCH_ERROR, reject)

        uploady.once(UPLOADER_EVENTS.BATCH_FINALIZE, () => {
          uploady.off(UPLOADER_EVENTS.BATCH_PROGRESS, onProgress)
          uploady.off(UPLOADER_EVENTS.BATCH_ERROR, reject)
        })
      })
    },
    [uploady],
  )
}

export const parseDimensions = (dimensions: string) => {
  try {
    const [width, height] = dimensions.toLowerCase().split("x").map(Number)
    if (isNaN(width) || isNaN(height)) return [0, 0]
    return [width, height]
  } catch (e) {
    return [0, 0]
  }
}

export const formatBytes = (bytes: number) => {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

export const isFile = (value: unknown): value is File => value instanceof File
