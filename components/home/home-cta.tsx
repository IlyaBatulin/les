import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
export default function HomeCta() {
  return <section className="home-cta container mx-auto px-4"><div className="cta-panel">
    <div><h2>Нужна консультация по выбору материалов?</h2><p className="cta-description">Наши специалисты помогут подобрать оптимальные материалы для вашего проекта с учетом всех требований и бюджета.</p></div>
    <Link href="/contacts" className="primary-link">Связаться с нами <ArrowUpRight size={22}/></Link>
  </div></section>
}
