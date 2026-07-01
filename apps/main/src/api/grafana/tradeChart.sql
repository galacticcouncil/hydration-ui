WITH metadata_extended AS (
    select * from token_metadata
    union all select $assetInId as id, '$assetInSymbol' as symbol, $assetInDecimals as decimals
    union all select $assetOutId as id, '$assetOutSymbol' as symbol, $assetOutDecimals as decimals
),
filtered_trades AS (
    SELECT
        timestamp,
        (e.args->>'assetIn')::integer AS asset_in,
        (e.args->>'assetOut')::integer AS asset_out,
        (e.args->>'amountIn')::numeric AS amount_in_raw,
        (e.args->>'amountOut')::numeric AS amount_out_raw
    FROM event e
    INNER JOIN block b ON e.block_id = b.id
    INNER JOIN call c ON e.call_id = c.id
    WHERE
        ((c.name != 'Router.buy' AND e.name = 'Router.RouteExecuted')
         OR e.name IN ('Omnipool.BuyExecuted', 'Omnipool.SellExecuted', 'Router.Executed'))
        AND timestamp BETWEEN '$from' AND '$to'
        AND (
            ((e.args->>'assetIn')::integer = $assetOutId AND (e.args->>'assetOut')::integer = $assetInId)
            OR
            ((e.args->>'assetIn')::integer = $assetInId AND (e.args->>'assetOut')::integer = $assetOutId)
        )
),
nor_trades AS (
    SELECT
        timestamp,
        asset_in,
        asset_out,
        amount_in_raw / (10 ^ token_metadata_in.decimals) AS amount_in,
        amount_out_raw / (10 ^ token_metadata_out.decimals) AS amount_out
    FROM filtered_trades
    INNER JOIN metadata_extended AS token_metadata_in ON asset_in = token_metadata_in.id
    INNER JOIN metadata_extended AS token_metadata_out ON asset_out = token_metadata_out.id
    WHERE amount_in_raw > 0 AND amount_out_raw > 0
),
pair_price AS (
    SELECT
        timestamp,
        CASE
            WHEN asset_in = $assetInId AND asset_out = $assetOutId AND amount_in != 0 AND amount_out != 0 THEN amount_in / amount_out
            WHEN asset_in = $assetOutId AND asset_out = $assetInId AND amount_in != 0 AND amount_out != 0 THEN amount_out / amount_in
        END AS price,
        CASE
            WHEN asset_in = $assetInId THEN amount_in
            WHEN asset_in = $assetOutId THEN amount_out
        END AS volume
    FROM nor_trades
),
prev_price AS (
    SELECT
        *,
        lag(price) over (order by timestamp) as prev_price
    FROM pair_price
    WHERE price IS NOT NULL
),
filtered_price AS (
    SELECT *
    FROM prev_price
    WHERE prev_price IS NULL
        OR (prev_price < price * 2 AND price < prev_price * 2)
),
buckets AS (
    SELECT
        $__timeGroupAlias("timestamp", '$interval'),
        avg(price) AS price,
        sum(volume) as volume
    FROM filtered_price
    GROUP BY 1
    ORDER BY 1
)
select time, price, volume
FROM buckets
where volume * 1000 > (select avg(volume) from buckets);
