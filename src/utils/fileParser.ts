import * as XLSX from 'xlsx'
import { ProductType, SalesReport, normalizeName } from '../types'

export interface ProcessedReport {
	reports: SalesReport[]
	newRepresentatives: string[]
}

export class FileParser {
	static async parseSalesReport(
		file: File,
		productType: ProductType,
		existingRepresentatives: string[]
	): Promise<ProcessedReport> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()

			reader.onload = e => {
				try {
					const data = e.target?.result as ArrayBuffer
					const workbook = XLSX.read(data, { type: 'array' })
					const firstSheetName = workbook.SheetNames[0]
					const worksheet = workbook.Sheets[firstSheetName]
					const jsonData = XLSX.utils.sheet_to_json(worksheet)

					const reports: SalesReport[] = []
					const newRepresentatives: string[] = []
					const existingNames = new Set(
						existingRepresentatives.map(name => normalizeName(name).toLowerCase())
					)

					// Отладочная информация о структуре файла
					if (jsonData.length > 0) {
						console.log('🔍 Структура файла (первая строка):', jsonData[0])
						console.log('📋 Доступные столбцы:', Object.keys(jsonData[0] as any))
					}

					jsonData.forEach((row: any) => {
						// Поиск имени представителя с нормализацией
						const rawRepresentativeName = 
							row['ФИ'] ||
							row['ФИО'] ||
							row['Единица по группировке'] ||
							row['Единица группировки'] ||
							''

						const representativeName = normalizeName(rawRepresentativeName)

						if (!representativeName) return

						console.log(`👤 Нормализованное имя: "${rawRepresentativeName}" → "${representativeName}"`)

						// Проверка нового представителя (с нормализованными именами)
						if (!existingNames.has(representativeName.toLowerCase())) {
							newRepresentatives.push(representativeName)
							console.log(`🆕 Новый представитель: ${representativeName}`)
						}

						// Обработка в зависимости от типа отчета
						if (productType === 'creditCards') {
							reports.push({
								representativeName,
								productType,
								offers: this.parseNumber(row['Офферов'] || row['Offers'] || 0),
								issuance: this.parseNumber(row['Продаж'] || row['Issuance'] || 0),
								utilization: this.parsePercentage(row['% утиль / продаж'] || row['Utilization'] || 0),
							})
						} else if (productType === 'simCards') {
							// ДЛЯ SIM-КАРТ - УМНОЖАЕМ ПРОЦЕНТЫ НА 100
							const tariffPaymentPercent = this.parsePercentage(
								row['% оплат тарифа/офферы'] || 
								row['Tariff Payment %'] || 
								row['Процент оплаты'] || 
								0
							) * 100; // ← УМНОЖАЕМ НА 100

							reports.push({
								representativeName,
								productType,
								offers: this.parseNumber(row['Офферов'] || row['Offers'] || 0),
								tariffPayments: this.parseNumber(row['Оплата тарифа'] || row['Tariff Payments'] || 0),
								tariffPaymentPercent: Math.min(100, Math.max(0, tariffPaymentPercent)), // ← ОГРАНИЧИВАЕМ 0-100%
							})
							console.log(`📱 SIM-карты для ${representativeName}:`, {
								offers: reports[reports.length - 1].offers,
								tariffPayments: reports[reports.length - 1].tariffPayments,
								tariffPaymentPercent: reports[reports.length - 1].tariffPaymentPercent
							})
						} else if (productType === 'investments') {
							reports.push({
								representativeName,
								productType,
								offers: this.parseNumber(row['Офферов'] || row['Offers'] || 0),
								accountOpening: this.parseNumber(row['Открытие счета'] || row['Открытых БС'] || 0),
								utilization: this.parsePercentage(row['% утилизаци/офферы'] || row['Utilization'] || 0),
							})
						} else if (productType === 'successRate') {
							const successRate = this.parsePercentage(
								row['% успешности встреч'] || 
								row['Success Rate'] || 
								row['Успешность'] || 
								0
							)
							if (successRate > 0) {
								reports.push({
									representativeName,
									productType,
									successRate: Math.min(100, Math.max(0, successRate)),
								})
							}
						} else if (productType === 'courseProgress') {
							// ПРОГРЕСС ПО КУРСАМ
							const progressValue = 
								row['Прогресс'] ||           // Основной вариант
								row['Progress'] ||           // Английский вариант  
								row['Процент от максимума'] || // Альтернативный вариант из вашего файла
								0

							console.log(`📚 Прогресс для ${representativeName}:`, {
								сыроеЗначение: progressValue,
								тип: typeof progressValue
							})

							const courseProgress = this.parsePercentage(progressValue) * 100
							
							if (courseProgress > 0) {
								reports.push({
									representativeName,
									productType,
									courseProgress: Math.round(Math.min(100, Math.max(0, courseProgress))),
								})
							}
						} else if (productType === 'dataUpdate') {
							const dataUpdateValue = this.parseNumber(
								row['Продаж'] || row['Количество'] || row['Sales'] || 0
							)
							if (dataUpdateValue > 0) {
								reports.push({
									representativeName,
									productType,
									salesCount: dataUpdateValue,
								})
							}
						}
					})

					console.log(`✅ Обработка завершена: ${reports.length} отчетов, ${newRepresentatives.length} новых представителей`)
					resolve({ reports, newRepresentatives })

				} catch (error) {
					console.error('❌ Ошибка парсинга:', error)
					reject(new Error('Ошибка при обработке Excel файла'))
				}
			}

			reader.onerror = () => reject(new Error('Ошибка чтения файла'))
			reader.readAsArrayBuffer(file)
		})
	}

	// Простой парсинг чисел
	private static parseNumber(value: any): number {
		if (typeof value === 'number') return value
		if (typeof value === 'string') {
			const clean = value.replace(/,/g, '.').replace(/\s/g, '')
			return parseFloat(clean) || 0
		}
		return 0
	}

	// Простой парсинг процентов
	private static parsePercentage(value: any): number {
		if (typeof value === 'number') return value
		if (typeof value === 'string') {
			let clean = value.replace(/%/g, '').replace(/,/g, '.').replace(/\s/g, '')
			const parsed = parseFloat(clean) || 0
			// Если число больше 1 - это уже проценты, если меньше - дробь
			return parsed > 1 ? parsed : parsed * 100
		}
		return 0
	}
}