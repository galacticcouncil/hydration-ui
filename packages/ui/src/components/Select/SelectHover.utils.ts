export const getSelectHoverTarget = <TKey extends string>(
  items: ReadonlyArray<{ key: TKey; label: string }>,
  activeKey: TKey | undefined,
  key: string,
  search = "",
): TKey | undefined => {
  if (!items.length) return
  const index = items.findIndex((item) => item.key === activeKey)
  if (key === "Home") return items[0]?.key
  if (key === "End") return items.at(-1)?.key
  if (key === "ArrowDown") return items[(index + 1) % items.length]?.key
  if (key === "ArrowUp")
    return items[
      index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length
    ]?.key
  if (!search) return

  const query = [...search].every((letter) => letter === search[0])
    ? search[0]!
    : search
  const startOffset = query.length > 1 && index >= 0 ? 0 : 1
  for (
    let offset = startOffset;
    offset < items.length + startOffset;
    offset++
  ) {
    const item = items[(index + offset) % items.length]
    if (item?.label.toLowerCase().startsWith(query)) return item.key
  }
}
