"use client"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, FileText, CalculatorIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Добавьте интерфейс для пропсов компонента
interface PriceCalculatorProps {
  product: {
    id: any;
    name: any;
    price: any;
    image_url: any;
    unit: any;
    category_id: any;
  }
}

const PriceCalculator = ({ product }: PriceCalculatorProps) => {
  const { toast } = useToast()
  const [length, setLength] = useState<number>(6000)
  const [width, setWidth] = useState<number>(150)
  const [height, setHeight] = useState<number>(50)
  const [woodType, setWoodType] = useState<string>("pine")
  const [treatment, setTreatment] = useState<string>("standard")
  const [quantity, setQuantity] = useState<number>(1)
  const [includeDelivery, setIncludeDelivery] = useState<boolean>(false)
  const [deliveryDistance, setDeliveryDistance] = useState<number>(10)
  const [includeInstallation, setIncludeInstallation] = useState<boolean>(false)
  const [calculationMode, setCalculationMode] = useState<"dimensions" | "volume">("dimensions")
  const [volume, setVolume] = useState<number>(0)
  const [result, setResult] = useState<{
    volume: number
    price: number
    breakdown: {
      base: number
      treatment: number
      delivery?: number
      installation?: number
      quantity: number
      total: number
    }
  } | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [savedCalculations, setSavedCalculations] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("calculator")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonWoodType, setComparisonWoodType] = useState<string>("oak")

  const woodPrices: Record<string, { price: number; displayName: string; durability: number; eco: number }> = {
    pine: { price: 12000, displayName: "Сосна", durability: 3, eco: 4 },
    spruce: { price: 11500, displayName: "Ель", durability: 3, eco: 4 },
    oak: { price: 45000, displayName: "Дуб", durability: 5, eco: 5 },
    beech: { price: 38000, displayName: "Бук", durability: 4, eco: 4 },
    ash: { price: 40000, displayName: "Ясень", durability: 5, eco: 4 },
    birch: { price: 25000, displayName: "Берёза", durability: 3, eco: 5 },
    alder: { price: 22000, displayName: "Ольха", durability: 3, eco: 4 },
    teak: { price: 85000, displayName: "Тик", durability: 5, eco: 3 },
    mahogany: { price: 78000, displayName: "Махагони", durability: 5, eco: 2 },
    larch: { price: 17500, displayName: "Лиственница", durability: 4, eco: 5 },
    cedar: { price: 32000, displayName: "Кедр", durability: 4, eco: 5 },
    maple: { price: 35000, displayName: "Клён", durability: 4, eco: 4 },
  }

  const treatmentTypes: Record<string, { multiplier: number; displayName: string; description: string }> = {
    standard: {
      multiplier: 1,
      displayName: "Обрезная",
      description: "Стандартная обработка пиломатериалов с ровными краями",
    },
    planed: {
      multiplier: 1.25,
      displayName: "Строганная",
      description: "Гладкая поверхность, точные размеры, подходит для чистовой отделки",
    },
    dried: {
      multiplier: 1.35,
      displayName: "Сухая",
      description: "Камерная сушка для минимальной влажности и стабильности материала",
    },
    tongue_groove: {
      multiplier: 1.5,
      displayName: "Шпунтованная",
      description: "С пазами и гребнями для плотного соединения элементов",
    },
    anti_septic: {
      multiplier: 1.4,
      displayName: "Антисептированная",
      description: "Обработка защитными составами от гниения и насекомых",
    },
    fire_resistant: {
      multiplier: 1.55,
      displayName: "Огнезащитная",
      description: "Обработка составами, повышающими огнестойкость древесины",
    },
  }

  useEffect(() => {
    // Загружаем сохраненные расчеты
    const saved = JSON.parse(localStorage.getItem("savedCalculations") || "[]")
    setSavedCalculations(saved)
  }, [])

  const calculatePrice = () => {
    let calculatedVolume: number

    if (calculationMode === "dimensions") {
      if (!length || !width || !height) {
        toast({
          title: "Ошибка расчёта",
          description: "Пожалуйста, заполните все размеры",
          variant: "destructive",
        })
        return
      }

      // Вычисляем объём в кубометрах (переводим из мм в м)
      calculatedVolume = (length * width * height) / 1000000000
    } else {
      if (!volume || volume <= 0) {
        toast({
          title: "Ошибка расчёта",
          description: "Пожалуйста, введите объём материала",
          variant: "destructive",
        })
        return
      }

      calculatedVolume = volume
    }

    const basePrice = woodPrices[woodType]?.price || woodPrices.pine.price
    const multiplier = treatmentTypes[treatment]?.multiplier || treatmentTypes.standard.multiplier

    const baseCost = basePrice * calculatedVolume
    const treatmentCost = baseCost * (multiplier - 1)
    let totalMaterialCost = baseCost + treatmentCost

    // Умножаем на количество
    totalMaterialCost *= quantity

    // Добавляем стоимость доставки, если выбрана
    let deliveryCost = 0
    if (includeDelivery) {
      // Базовая ставка + стоимость за км
      deliveryCost = 1500 + deliveryDistance * 50
    }

    // Добавляем стоимость монтажа, если выбран
    let installationCost = 0
    if (includeInstallation) {
      // 15% от стоимости материала
      installationCost = totalMaterialCost * 0.15
    }

    const totalCost = totalMaterialCost + deliveryCost + installationCost

    setResult({
      volume: calculatedVolume * quantity,
      price: totalCost,
      breakdown: {
        base: baseCost * quantity,
        treatment: treatmentCost,
        delivery: includeDelivery ? deliveryCost : undefined,
        installation: includeInstallation ? installationCost : undefined,
        quantity: quantity,
        total: totalCost,
      },
    })

    toast({
      title: "Расчёт выполнен",
      description: "Стоимость материалов рассчитана",
      variant: "default",
    })
  }

  const saveCalculation = () => {
    if (!result) return

    const calculationData = {
      id: Date.now(),
      dimensions: calculationMode === "dimensions" ? { length, width, height } : null,
      volume: calculationMode === "volume" ? volume : null,
      calculationMode,
      woodType,
      woodTypeName: woodPrices[woodType]?.displayName,
      treatment,
      treatmentName: treatmentTypes[treatment]?.displayName,
      quantity,
      includeDelivery,
      deliveryDistance: includeDelivery ? deliveryDistance : null,
      includeInstallation,
      result,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    }

    const saved = [...savedCalculations, calculationData]
    setSavedCalculations(saved)
    localStorage.setItem("savedCalculations", JSON.stringify(saved))

    toast({
      title: "Расчёт сохранен",
      description: "Вы можете найти его в истории расчётов",
      variant: "default",
    })
  }

  const deleteCalculation = (id: number) => {
    const filtered = savedCalculations.filter((calc) => calc.id !== id)
    setSavedCalculations(filtered)
    localStorage.setItem("savedCalculations", JSON.stringify(filtered))

    toast({
      title: "Расчёт удален",
      description: "Выбранный расчёт удален из истории",
    })
  }

  const loadCalculation = (calculation: any) => {
    if (calculation.calculationMode === "dimensions" && calculation.dimensions) {
      setLength(calculation.dimensions.length)
      setWidth(calculation.dimensions.width)
      setHeight(calculation.dimensions.height)
    } else if (calculation.calculationMode === "volume" && calculation.volume) {
      setVolume(calculation.volume)
    }

    setCalculationMode(calculation.calculationMode)
    setWoodType(calculation.woodType)
    setTreatment(calculation.treatment)
    setQuantity(calculation.quantity || 1)
    setIncludeDelivery(calculation.includeDelivery || false)
    setDeliveryDistance(calculation.deliveryDistance || 10)
    setIncludeInstallation(calculation.includeInstallation || false)
    setResult(calculation.result)
    setActiveTab("calculator")

    toast({
      title: "Расчёт загружен",
      description: "Данные из сохраненного расчёта восстановлены",
    })
  }

  const copyResultToClipboard = () => {
    if (!result) return

    const woodName = woodPrices[woodType]?.displayName || "Сосна"
    const treatmentName = treatmentTypes[treatment]?.displayName || "Обрезная"

    let textToCopy = `
Расчет стоимости пиломатериала:
- Порода дерева: ${woodName}
- Обработка: ${treatmentName}`

    if (calculationMode === "dimensions") {
      textToCopy += `
- Размеры: ${length}x${width}x${height} мм`
    } else {
      textToCopy += `
- Объем: ${volume} м³`
    }

    textToCopy += `
- Количество: ${quantity} шт.
- Общий объем: ${result.volume.toFixed(4)} м³
- Стоимость материалов: ${result.breakdown.base.toFixed(0)} ₽`

    if (result.breakdown.treatment > 0) {
      textToCopy += `
- Стоимость обработки: ${result.breakdown.treatment.toFixed(0)} ₽`
    }

    if (includeDelivery && result.breakdown.delivery) {
      textToCopy += `
- Доставка: ${result.breakdown.delivery.toFixed(0)} ₽`
    }

    if (includeInstallation && result.breakdown.installation) {
      textToCopy += `
- Монтаж: ${result.breakdown.installation.toFixed(0)} ₽`
    }

    textToCopy += `
- ИТОГО: ${result.price.toFixed(0)} ₽
    `.trim()

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedToClipboard(true)
      toast({
        title: "Скопировано в буфер обмена",
        description: "Результат расчета скопирован",
      })

      setTimeout(() => setCopiedToClipboard(false), 3000)
    })
  }

  const generatePDF = () => {
    toast({
      title: "Готово к скачиванию",
      description: "Файл с расчетом готов к скачиванию",
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  }

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="w-full max-w-xl shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white pb-5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-6 w-6" />
            Расчёт стоимости материала
          </CardTitle>
          <CardDescription className="text-green-100 mt-1">
            Рассчитайте необходимое количество и стоимость пиломатериалов для вашего проекта
          </CardDescription>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
            <TabsList className="w-full bg-green-700/40 border border-green-500/30">
              <TabsTrigger
                value="calculator"
                className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white text-green-100"
              >
                <CalculatorIcon className="h-4 w-4 mr-2" /> Калькулятор
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white text-green-100"
              >
                <FileText className="h-4 w-4 mr-2" /> История расчётов
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        {/* Остальной код компонента */}
      </Card>
    </motion.div>
  )
}

export default PriceCalculator
