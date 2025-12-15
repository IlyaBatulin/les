-- ПРОСТОЙ СКРИПТ ДЛЯ ИСПРАВЛЕНИЯ АВТОИНКРЕМЕНТА В SUPABASE
-- Выполните этот запрос в SQL Editor в Supabase Dashboard

-- Устанавливаем правильное значение для автоинкремента
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Проверяем результат
SELECT 
    'Максимальный ID в таблице:' as info,
    MAX(id) as max_id
FROM products;

SELECT 
    'Текущее значение последовательности:' as info,
    last_value as sequence_value
FROM products_id_seq;
