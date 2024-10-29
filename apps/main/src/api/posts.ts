import { queryOptions } from "@tanstack/react-query"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchPosts = async () => {
  await sleep(1000)
  return fetch("https://jsonplaceholder.typicode.com/posts").then((res) =>
    res.json(),
  )
}

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: fetchPosts,
})
