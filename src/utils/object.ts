export const mapObj = <T, K>(
  fn: (v: T) => K,
  obj: Record<string, T>
): Record<string, K> => {
  return Object.keys(obj).reduce(
    (acc, cur) => ({ ...acc, [cur]: fn(obj[cur]) }),
    {}
  );
};
