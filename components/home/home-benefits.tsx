import { Truck, Shield, BadgeCheck, Clock } from "lucide-react"
const benefits = [
  { icon: Truck, title: "Быстрая доставка", text: "Доставляем товары в течение 1-3 дней по всему региону" },
  { icon: Shield, title: "Гарантия качества", text: "Все товары проходят строгий контроль качества" },
  { icon: BadgeCheck, title: "Сертифицированные материалы", text: "Используем только проверенные и экологичные материалы" },
  { icon: Clock, title: "Работаем 24/7", text: "Оформляйте заказы в любое удобное для вас время" },
]
export default function HomeBenefits() {
  return <section className="benefits-strip" aria-label="Преимущества"><div className="container mx-auto px-4"><h2 className="pt-6 text-xl font-semibold">Почему выбирают нас</h2><div className="benefits-grid">
    {benefits.map(({icon:Icon,title,text})=><div className="benefit-item" key={title}><Icon size={26} strokeWidth={1.4}/><div><h3>{title}</h3><p>{text}</p></div></div>)}
  </div></div></section>
}
