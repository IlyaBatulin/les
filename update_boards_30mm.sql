-- Обновление досок обрезных
-- Группа 2: Доски обрезные 30мм

-- Доска обрезная 30х100х6000 мм (55шт в м3, цена 19140 за м3, всего 348шт)
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

-- Доска обрезная 30х150х6000 мм (37шт в м3, цена 19500 за м3, всего 527шт)
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

-- Доска обрезная 30х200х6000 мм (27шт в м3, цена 19500 за м3, всего 722шт)
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
