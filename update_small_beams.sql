-- Обновление брусков
-- Группа 6: Бруски

-- Брусок 25х50х3000 мм (266шт в м3, цена 19500 за м3, всего 73шт)
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

-- Брусок 50х50х6000 мм (66шт в м3, цена 19500 за м3, всего 295шт)
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

-- Брусок 50х50х3000 мм (132шт в м3, цена 19500 за м3, всего 147шт)
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
