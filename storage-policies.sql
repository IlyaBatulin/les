-- Проверяем существование бакета "product", если нет - создаем
INSERT INTO storage.buckets (id, name, public)
SELECT 'product', 'product', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product'
);

-- Удаляем существующие политики для бакета "product"
DELETE FROM storage.policies WHERE bucket_id = 'product';

-- Создаем политику для чтения (доступно всем)
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
    'product',
    'Public Read Policy',
    '{"statement": "SELECT", "effect": "ALLOW", "principal": "*", "condition": null}'
);

-- Создаем политику для записи (доступно аутентифицированным пользователям)
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
    'product',
    'Authenticated Users Upload Policy',
    '{"statement": "INSERT", "effect": "ALLOW", "principal": {"type": "user"}, "condition": null}'
);

-- Создаем политику для обновления (доступно аутентифицированным пользователям)
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
    'product',
    'Authenticated Users Update Policy',
    '{"statement": "UPDATE", "effect": "ALLOW", "principal": {"type": "user"}, "condition": null}'
);

-- Создаем политику для удаления (доступно аутентифицированным пользователям)
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
    'product',
    'Authenticated Users Delete Policy',
    '{"statement": "DELETE", "effect": "ALLOW", "principal": {"type": "user"}, "condition": null}'
);
