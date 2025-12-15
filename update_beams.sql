-- Обновление брусов обрезных
-- Группа 5: Брусы

-- Брус 100х100х6000 мм (16шт в м3, цена 19000 за м3, всего 1187шт)
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 1187,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '16'::jsonb
    )
WHERE name ILIKE '%брус%100х100х6000%';

-- Брус 100х150х6000 мм (11шт в м3, цена 19000 за м3, всего 1727шт)
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 1727,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '11'::jsonb
    )
WHERE name ILIKE '%брус%100х150х6000%';

-- Брус 100х200х6000 мм (8шт в м3, цена 19000 за м3, всего 2375шт)
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 2375,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '8'::jsonb
    )
WHERE name ILIKE '%брус%100х200х6000%';

-- Брус 150х150х6000 мм (7шт в м3, цена 19000 за м3, всего 2714шт)
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 2714,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '7'::jsonb
    )
WHERE name ILIKE '%брус%150х150х6000%';

-- Брус 150х200х6000 мм (5шт в м3, цена 19000 за м3, всего 3800шт)
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 3800,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '5'::jsonb
    )
WHERE name ILIKE '%брус%150х200х6000%';

-- Брус 200х200х6000 мм (4шт в м3, цена 19000 за м3, всего 4750шт)
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 4750,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '4'::jsonb
    )
WHERE name ILIKE '%брус%200х200х6000%';
