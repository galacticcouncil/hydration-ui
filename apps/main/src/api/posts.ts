import { sleep } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

const fetchPosts = async () => {
  await sleep(1000)
  return fetch("https://jsonplaceholder.typicode.com/todos").then((res) =>
    res.json(),
  )
}

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: fetchPosts,
})
