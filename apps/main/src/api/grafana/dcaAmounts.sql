SELECT
    event.args ->> 'id' AS schedule_id,
    SUM(
        CAST(event.args ->> 'amountIn' AS numeric)
    ) AS amount_in,
    SUM(
        CAST(event.args ->> 'amountOut' AS numeric)
    ) AS amount_out
FROM event
WHERE
    event.args ->> 'id' IN ($scheduleIds)
    AND event.name = 'DCA.TradeExecuted'
GROUP BY
    schedule_id;
