# TWAP fee savings

> Reference for the locally backed-up fee-focused card experiment. The current UI shows the estimated amount received for both Single trade and TWAP.

ICE does not submit a native Buy TWAP order. Every TWAP is an intent DCA Sell order. If the user enters the Buy amount, the UI first obtains a Buy quote and converts its required input into the Sell budget used by the TWAP.

The displayed saving should be calculated as:

```text
estimated fee saving = single-trade fee value - total TWAP fee value
```

- **Single-trade fee:** the router's estimated trading fee for executing the whole order immediately.
- **TWAP fee:** the estimated fee for one smaller Sell slice multiplied by the number of slices.
- **Fee value:** each fee must first be converted from its own fee asset into the selected display currency, then subtracted.

The saving mainly comes from splitting a large order and spacing its slices so the Omnipool dynamic/max-slip fee can remain closer to its floor. It is not the user's slippage tolerance, price-impact improvement, or network transaction cost.

The value is an estimate based on the current route, pool state, dynamic fees, and asset prices. It may change while the TWAP executes, so the UI should retain the `~` marker.
