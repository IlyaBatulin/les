import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Info, Clock, FileText, Shield, MapPin } from "lucide-react"

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-8">Условия доставки</h1>
      
      <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-10">
        <p className="text-gray-700">
          Пожалуйста, ознакомьтесь с правилами доставки — их соблюдение поможет нам привезти Ваш заказ максимально быстро и качественно.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Info className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl">Необходимая информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">При заказе доставки просим Вас предоставить следующую информацию:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>адрес строительного объекта, дома (корпус, особенности или приметы);</li>
              <li>подъезд к объекту (с какой улицы, двор, арка, пропуск, место для разгрузки);</li>
              <li>контактные данные ответственного за прием материала.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Truck className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl">Стоимость</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>В зависимости от веса, объема и габаритов приобретенного Вами товара, а также вида доставки Вам будет предложена машина грузоподъемностью от 3 до 15 тонн, с манипулятором или без.</li>
              <li>Стоимость доставки зависит от грузоподъемности ТС, адреса и вида доставки, количества точек разгрузки.</li>
              <li>Если Вы оплатили заказ по безналичному расчёту, при доставке Вас попросят предъявить доверенность.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Clock className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl">Время доставки</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Время доставки зависит от выбранного Вами вида доставки.</li>
              <li>В случае если Вы оформляете несколько доставок на один адрес, время доставки на каждую следующую машину выставляется с интервалом от одного до 2 часов.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" /> 
            Общие правила
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-3 text-gray-700">
            <li>Водитель позвонит в момент выезда на Ваш адрес.</li>
            <li>В день доставки Вам следует быть постоянно на связи по указанным в заказе контактным телефонам (доставка осуществляется только после того, как Вы подтвердите свою готовность принять машину).</li>
            <li>Позаботьтесь о том, чтобы обеспечить машине беспрепятственный подъезд к месту разгрузки. В ином случае доставка будет осуществлена максимально близко к месту планируемой выгрузки без нарушения ПДД и вероятности повреждения автомобиля.</li>
            <li>На то, чтобы разгрузить машину, Вам будет выделено 30 минут с момента подачи, если речь идёт об автомобиле до 3 тонн включительно, и 1 часа для автомобилей свыше 3 тонн. Далее оплачивается простой в размере 300 руб. за каждый час — для машин до 3 тонн и 600 руб. за каждый час простоя — для машин свыше 3 тонн.</li>
            <li>Оплата заказа водителю производится возле автомобиля до начала разгрузки товара.</li>
            <li>В случае возникновения вопросов по количеству или качеству товара вы можете обратиться к представителю компании Выбор+.</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" /> 
            Разгрузка манипулятором
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li>Услуга «Разгрузка манипулятором» включает только разгрузку товара. К сожалению, мы не осуществляем иные виды работ манипулятором.</li>
            <li>Разгрузка манипулятором запрещена под линией электропередач, над бытовыми объектами и заборами.</li>
            <li>Разгрузка манипулятором осуществляется на расстоянии 2-15 метров от кузова автомобиля в зависимости от технических характеристик манипулятора, т. е. в радиусе действия стрелы и в зоне прямой видимости места разгрузки.</li>
          </ul>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Прайс-лист на доставку
        </h2>
        
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-green-600 text-white p-3 text-left border border-gray-200">Масса груза</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">до 1.5 т.</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">до 3 т.</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">до 5 т.</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">до 8 т.</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">до 10 т.</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">Манипулятор</th>
                <th className="bg-green-600 text-white p-3 text-center border border-gray-200">Манипулятор</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50">Объём утеплителя</td>
                <td className="p-3 border border-gray-200 text-center">до 10 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 76 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 95 м³</td>
                <td className="p-3 border border-gray-200 text-center">-</td>
                <td className="p-3 border border-gray-200 text-center">-</td>
                <td className="p-3 border border-gray-200 text-center">-</td>
                <td className="p-3 border border-gray-200 text-center">-</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Объём пиломатериалов</td>
                <td className="p-3 border border-gray-200 text-center">до 2 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 7 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 10 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 12 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 16 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 10 м³</td>
                <td className="p-3 border border-gray-200 text-center">до 15 м³</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50">Зона 1</td>
                <td className="p-3 border border-gray-200 text-center">7000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">8000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">9500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">11000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">17000 руб.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Зона 2</td>
                <td className="p-3 border border-gray-200 text-center">7000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">8000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">9500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">11000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">17000 руб.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50">Зона 3</td>
                <td className="p-3 border border-gray-200 text-center">8000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">9000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">10500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">13500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">13000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">18000 руб.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Зона 4</td>
                <td className="p-3 border border-gray-200 text-center">8000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">9000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">10500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">13500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">13000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">18000 руб.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50">VIP</td>
                <td className="p-3 border border-gray-200 text-center">10000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">11000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">12500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">14000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">15500 руб.</td>
                <td className="p-3 border border-gray-200 text-center">15000 руб.</td>
                <td className="p-3 border border-gray-200 text-center">20000 руб.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Выезд за пределы МКАД в зоне 1 и 3</td>
                <td className="p-3 border border-gray-200 text-center">60 р.</td>
                <td className="p-3 border border-gray-200 text-center">60 р.</td>
                <td className="p-3 border border-gray-200 text-center">70 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50">Выезд за пределы МКАД в зоне 2</td>
                <td className="p-3 border border-gray-200 text-center">60 р.</td>
                <td className="p-3 border border-gray-200 text-center">60 р.</td>
                <td className="p-3 border border-gray-200 text-center">70 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Выезд за пределы Московкой области</td>
                <td className="p-3 border border-gray-200 text-center">60 р.</td>
                <td className="p-3 border border-gray-200 text-center">60 р.</td>
                <td className="p-3 border border-gray-200 text-center">70 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
                <td className="p-3 border border-gray-200 text-center">80 р.</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50 font-medium">Стоимость простоя транспорта за 1 час</td>
                <td className="p-3 border border-gray-200 text-center font-bold">500 р.</td>
                <td className="p-3 border border-gray-200 text-center font-bold">650 р.</td>
                <td className="p-3 border border-gray-200 text-center font-bold">950 р.</td>
                <td className="p-3 border border-gray-200 text-center font-bold">1 100 р.</td>
                <td className="p-3 border border-gray-200 text-center font-bold">1 200 р.</td>
                <td className="p-3 border border-gray-200 text-center font-bold">1 250 р.</td>
                <td className="p-3 border border-gray-200 text-center font-bold">1 350 р.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-xl font-bold mb-4">Зоны доставки</h3>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border-collapse">
            <tbody>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50 w-1/4 font-medium">Зона 1</td>
                <td className="p-3 border border-gray-200">СЗАО, ЗАО, ЮЗАО, ЮАО;</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50 font-medium">Зона 2</td>
                <td className="p-3 border border-gray-200">САО, СВАО, ВАО, ЮВАО;</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50 font-medium">Зона 3</td>
                <td className="p-3 border border-gray-200">от ТТК до СК; Рублевское шоссе в области;</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200 bg-gray-50 font-medium">Зона 4</td>
                <td className="p-3 border border-gray-200">внутри СК;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 