-- SQL СКРИПТ ДЛЯ ИСПРАВЛЕНИЯ АВТОИНКРЕМЕНТА ID В ТАБЛИЦЕ PRODUCTS
-- Этот скрипт исправляет проблему с автоинкрементом ID после добавления товаров через SQL запросы

-- 1. Сначала проверим текущее состояние таблицы
SELECT 
    'Текущее состояние:' as info,
    COUNT(*) as total_products,
    MAX(id) as max_id,
    MIN(id) as min_id
FROM products;

-- 2. Проверим, есть ли дублирующиеся ID
SELECT 
    'Дублирующиеся ID:' as info,
    id, 
    COUNT(*) as count
FROM products 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 3. Найдем максимальный ID и установим правильное значение для автоинкремента
-- Для PostgreSQL (Supabase) используем:
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 4. Альтернативный способ для PostgreSQL, если первый не сработал:
-- ALTER SEQUENCE products_id_seq RESTART WITH (SELECT MAX(id) + 1 FROM products);

-- 5. Проверим, что автоинкремент установлен правильно
SELECT 
    'Проверка автоинкремента:' as info,
    last_value as current_sequence_value
FROM products_id_seq;

-- 6. Проверим, что следующий ID будет корректным
SELECT 
    'Следующий ID будет:' as info,
    nextval('products_id_seq') as next_id;

-- 7. Сбросим последовательность обратно к правильному значению
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 8. Финальная проверка
SELECT 
    'Финальная проверка:' as info,
    MAX(id) as max_id_in_table,
    last_value as sequence_value
FROM products, products_id_seq;

-- ВАЖНО: После выполнения этого скрипта попробуйте добавить товар через админку
-- Если все еще есть проблемы, возможно потребуется:
-- 1. Проверить, что в таблице нет товаров с ID больше текущего значения последовательности
-- 2. Убедиться, что все товары имеют корректные ID без пропусков
