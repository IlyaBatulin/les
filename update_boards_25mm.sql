-- Обновление досок обрезных
-- Группа 1: Доски обрезные 25мм

-- Доска обрезная 25х100х6000 мм (66шт в м3, цена 19140 за м3, всего 290шт)
UPDATE products 
SET 
    price = 19140,  -- цена за кубометр
    price_per_cubic = 19140,  -- цена за кубометр
    stock = 290,  -- всего штук
    characteristics = jsonb_set(
        COALESCE(characteristics, '{}'::jsonb),
        '{pieces_per_cubic_meter}',
        '66'::jsonb
    )
WHERE name ILIKE '%доска%25х100х6000%';

-- Доска обрезная 25х150х6000 мм (44шт в м3, цена 19140 за м3, всего 435шт)
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

-- Доска обрезная 25х200х6000 мм (33шт в м3, цена 19140 за м3, всего 1197шт)
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
