import { Subscription } from "rxjs"

const subscriptions = new Set<Subscription>()

export const addTxSubscription = (sub: Subscription) => {
  subscriptions.add(sub)
}

export const deleteTxSubscription = (sub: Subscription) => {
  subscriptions.delete(sub)
}

export const unsubscribeAllTxs = () => {
  subscriptions.forEach((sub) => sub.unsubscribe())
  subscriptions.clear()
}
