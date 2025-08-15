WITH rates AS (
    SELECT timestamp,
        ('x' || RIGHT(args->>'reserve', 8))::bit(32)::int as reserve,
        (args->>'$rateParam')::numeric / 10 ^ 25 as rate
    FROM logs
        JOIN block ON block_number = block.height
    WHERE event_name = 'ReserveDataUpdated'
        AND timestamp BETWEEN '$from' AND '$to'
),
bucketed_rates AS (
    SELECT floor(
            extract(
                epoch
                from timestamp
            ) / 1800
        ) * 1800 as time,
        reserve,
        LAST(
            rate
            ORDER BY timestamp
        ) as rate
    FROM rates
    where reserve = $assetId
    GROUP BY floor(
            extract(
                epoch
                from timestamp
            ) / 1800
        ) * 1800,
        reserve
)
SELECT time,
    symbol,
    rate
FROM bucketed_rates
    join token_metadata on id = reserve
WHERE reserve IS NOT NULL
    and rate > 0
ORDER BY time ASC