-- Обновление досок обрезных
-- Группа 4: Доски обрезные 50мм

-- Доска обрезная 50х100х6000 мм (33шт в м3, цена 19000 за м3, всего 575шт)
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

-- Доска обрезная 50х150х6000 мм (22шт в м3, цена 19000 за м3, всего 863шт)
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

-- Доска обрезная 50х200х6000 мм (16шт в м3, цена 19000 за м3, всего 1188шт)
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
