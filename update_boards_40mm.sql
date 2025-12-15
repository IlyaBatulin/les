-- Обновление досок обрезных
-- Группа 3: Доски обрезные 40мм

-- Доска обрезная 40х100х6000 мм (41шт в м3, цена 19140 за м3, всего 466шт)
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

-- Доска обрезная 40х150х6000 мм (27шт в м3, цена 19000 за м3, всего 703шт)
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

-- Доска обрезная 40х200х6000 мм (20шт в м3, цена 19000 за м3, всего 950шт)
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
