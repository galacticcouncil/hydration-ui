# An asset is identified by its EVM address, not its Hydration asset id

On Hydration every money-market asset has two identities: an EVM ERC20 address
and a Substrate asset id. Hollar is `0x531a…f99a` and asset `222`. aTokens are
registered as Hydration assets too, which is why v1 injects a
`getRelatedATokenId` mapping function into the money-market package from the app.

`money-market-v2` speaks **EVM addresses only**. Resolving them to Hydration
asset ids stays the app's job.

This keeps v2 free of any dependency on the Hydration asset registry, and so
free of papi — which is what lets v2 remain a pure EVM module testable without a
Substrate connection. The cost is that consumers must do their own resolution,
duplicating a little of what v1 centralised. Modelling both identities inside v2
was rejected for the dependency it drags in; if a genuine need appears, the
lighter fix is an app-supplied resolver function, not a papi dependency.
