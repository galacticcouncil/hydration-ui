WITH rates AS (
    SELECT
        block.timestamp,
        (args->>'$rateParam')::numeric / 10^25 AS rate
    FROM logs
    JOIN block ON block_number = block.height
    WHERE event_name = 'ReserveDataUpdated'
        AND LOWER(args->>'reserve') = LOWER('$assetId')
        AND block.timestamp BETWEEN '$from' AND '$to'
)
SELECT
    floor(extract(epoch FROM timestamp) / 1800) * 1800 AS time,
    LAST(rate ORDER BY timestamp) AS rate
FROM rates
GROUP BY 1
HAVING LAST(rate ORDER BY timestamp) > 0
ORDER BY 1 ASC