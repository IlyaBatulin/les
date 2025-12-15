export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">О компании</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-lg mb-4">
            Компания ВЫБОР+ - ведущий поставщик строительных материалов в регионе. Мы работаем с 2005 года и за это
            время заслужили доверие тысяч клиентов.
          </p>
          <p className="text-lg mb-4">
            Наша миссия - обеспечивать строителей и частных застройщиков качественными материалами по доступным ценам с
            быстрой доставкой.
          </p>
          <p className="text-lg mb-4">
            Мы сотрудничаем только с проверенными производителями и гарантируем качество каждого товара в нашем
            ассортименте.
          </p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Наши преимущества</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-600 rounded-full"></span>
              <span>Более 10 000 наименований товаров</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-600 rounded-full"></span>
              <span>Собственный автопарк для быстрой доставки</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-600 rounded-full"></span>
              <span>Профессиональные консультации по выбору материалов</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-600 rounded-full"></span>
              <span>Гибкая система скидок для постоянных клиентов</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-600 rounded-full"></span>
              <span>Возможность отсрочки платежа для юридических лиц</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Наша команда</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-bold">Сотрудник {i}</h3>
                <p className="text-sm text-gray-600">Должность</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
