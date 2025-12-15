-- ПОЛНЫЙ SQL ЗАПРОС ДЛЯ ОБНОВЛЕНИЯ ПИЛОМАТЕРИАЛОВ
-- Выполняйте по порядку, проверяя результат после каждой группы

-- 1. Сначала проверьте существующие товары:
SELECT 
    id,
    name,
    price,
    price_per_cubic,
    stock,
    characteristics,
    category_id
FROM products 
WHERE 
    name ILIKE '%доска%' 
    OR name ILIKE '%брус%' 
    OR name ILIKE '%брусок%'
ORDER BY name;

-- 2. Обновление досок обрезных 25мм
UPDATE products 
SET 
    price = ROUND(19140 / 66, 2),  -- цена за штуку (19140/66 = 290₽)
    price_per_cubic = 19140,       -- цена за кубометр
    stock = 290,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '66'::jsonb
    )
WHERE name ILIKE '%доска%25х100х6000%';

UPDATE products 
SET 
    price = 19140,
    price_per_cubic = 19140,
    stock = 435,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '44'::jsonb
    )
WHERE name ILIKE '%доска%25х150х6000%';

UPDATE products 
SET 
    price = 19140,
    price_per_cubic = 19140,
    stock = 1197,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '33'::jsonb
    )
WHERE name ILIKE '%доска%25х200х6000%';

-- 3. Обновление досок обрезных 30мм
UPDATE products 
SET 
    price = 19140,
    price_per_cubic = 19140,
    stock = 348,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '55'::jsonb
    )
WHERE name ILIKE '%доска%30х100х6000%';

UPDATE products 
SET 
    price = 19500,
    price_per_cubic = 19500,
    stock = 527,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '37'::jsonb
    )
WHERE name ILIKE '%доска%30х150х6000%';

UPDATE products 
SET 
    price = 19500,
    price_per_cubic = 19500,
    stock = 722,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '27'::jsonb
    )
WHERE name ILIKE '%доска%30х200х6000%';

-- 4. Обновление досок обрезных 40мм
UPDATE products 
SET 
    price = 19140,
    price_per_cubic = 19140,
    stock = 466,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '41'::jsonb
    )
WHERE name ILIKE '%доска%40х100х6000%';

UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 703,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '27'::jsonb
    )
WHERE name ILIKE '%доска%40х150х6000%';

UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 950,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '20'::jsonb
    )
WHERE name ILIKE '%доска%40х200х6000%';

-- 5. Обновление досок обрезных 50мм
UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 575,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '33'::jsonb
    )
WHERE name ILIKE '%доска%50х100х6000%';

UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 863,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '22'::jsonb
    )
WHERE name ILIKE '%доска%50х150х6000%';

UPDATE products 
SET 
    price = 19000,
    price_per_cubic = 19000,
    stock = 1188,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '16'::jsonb
    )
WHERE name ILIKE '%доска%50х200х6000%';

-- 6. Обновление брусов
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

-- 7. Обновление брусков
UPDATE products 
SET 
    price = 19500,
    price_per_cubic = 19500,
    stock = 73,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '266'::jsonb
    )
WHERE name ILIKE '%брусок%25х50х3000%';

UPDATE products 
SET 
    price = 19500,
    price_per_cubic = 19500,
    stock = 295,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '66'::jsonb
    )
WHERE name ILIKE '%брусок%50х50х6000%';

UPDATE products 
SET 
    price = 19500,
    price_per_cubic = 19500,
    stock = 147,
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '132'::jsonb
    )
WHERE name ILIKE '%брусок%50х50х3000%';

-- 8. Проверка результата
SELECT 
    id,
    name,
    price,
    price_per_cubic,
    stock,
    characteristics->>'pieces_per_cubic_meter' as pieces_per_cubic,
    ROUND(price / CAST(characteristics->>'pieces_per_cubic_meter' AS NUMERIC), 2) as price_per_piece
FROM products 
WHERE 
    name ILIKE '%доска%' 
    OR name ILIKE '%брус%' 
    OR name ILIKE '%брусок%'
ORDER BY name;
