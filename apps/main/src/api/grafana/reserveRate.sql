SELECT
    floor(extract(epoch FROM block.timestamp) / 14400) * 14400 AS time,
    LAST((args->>'liquidityRate')::numeric / 10^25 ORDER BY block.timestamp) AS supply_rate,
    LAST((args->>'variableBorrowRate')::numeric / 10^25 ORDER BY block.timestamp) AS borrow_rate
FROM logs
JOIN block ON block_number = block.height
WHERE event_name = 'ReserveDataUpdated'
    AND args->>'reserve' = '$assetId'
    AND block.timestamp BETWEEN '$from' AND '$to'
GROUP BY 1
HAVING LAST((args->>'liquidityRate')::numeric / 10^25 ORDER BY block.timestamp) > 0
    OR LAST((args->>'variableBorrowRate')::numeric / 10^25 ORDER BY block.timestamp) > 0
ORDER BY 1 ASC
