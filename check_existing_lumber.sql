-- Проверка существующих досок, брусов и брусков
-- Этот запрос покажет, какие товары уже есть в базе

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
