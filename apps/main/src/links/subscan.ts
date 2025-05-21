export const getSubscanLink = (paraBlockHeight: number, indexInBlock: number) =>
  `https://hydration.subscan.io/block/${paraBlockHeight}?tab=event&event=${paraBlockHeight}-${indexInBlock}`
