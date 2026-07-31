SELECT
    SUM(
        CAST(event.args ->> '$amountField' AS numeric)
    )
FROM event
WHERE
    event.args ->> 'id' = '$scheduleId'
    AND event.name = 'DCA.TradeExecuted';