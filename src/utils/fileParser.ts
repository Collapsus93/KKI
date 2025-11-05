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

					jsonData.forEach((row: any, index: number) => {
						// Поиск имени представителя с нормализацией - ОБНОВЛЕННЫЙ ПОИСК
						const rawRepresentativeName = 
							row['Представитель'] || // ← ОСНОВНОЙ ВАРИАНТ ДЛЯ ВАШЕГО ФАЙЛА
							row['ФИ'] ||
							row['ФИО'] ||
							row['Единица по группировке'] ||
							row['Единица группировки'] ||
							''

						const representativeName = normalizeName(rawRepresentativeName)

						if (!representativeName) {
							console.log(`❌ Пропуск строки ${index}: не найдено имя представителя`, row)
							return
						}

						console.log(`👤 Строка ${index}: "${rawRepresentativeName}" → "${representativeName}"`)

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
							const tariffPaymentPercent = this.parsePercentage(
								row['% оплат тарифа/офферы'] || 
								row['Tariff Payment %'] || 
								row['Процент оплаты'] || 
								0
							) * 100;

							reports.push({
								representativeName,
								productType,
								offers: this.parseNumber(row['Офферов'] || row['Offers'] || 0),
								tariffPayments: this.parseNumber(row['Оплата тарифа'] || row['Tariff Payments'] || 0),
								tariffPaymentPercent: Math.min(100, Math.max(0, tariffPaymentPercent)),
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
							const progressValue = 
								row['Прогресс'] ||           
								row['Progress'] ||             
								row['Процент от максимума'] || 
								0

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
						} else if (productType === 'completionData') {
							// НОВЫЙ ТИП: ДАННЫЕ О ЗАВЕРШЕНИИ ПОДГОТОВКИ
							const completionDate = row['Завершение периода адаптации'];
							
							// Извлекаем и очищаем ссылку на AGS
							const rawProfileUrl = row['Ссылка на AGS'];
							let cleanProfileUrl = '';
							
							if (rawProfileUrl) {
								// Извлекаем URL из HTML ссылки
								const urlMatch = rawProfileUrl.match(/href="([^"]*)"/);
								if (urlMatch && urlMatch[1]) {
									cleanProfileUrl = urlMatch[1];
								} else {
									// Если это уже чистый URL, используем как есть
									cleanProfileUrl = rawProfileUrl;
								}
							}

							// ПРЕОБРАЗОВАНИЕ ДАТЫ ИЗ EXCEL ФОРМАТА
							let formattedDate = completionDate;
							if (completionDate && typeof completionDate === 'number') {
								// Excel даты хранятся как числа (дни с 1900-01-01)
								formattedDate = this.excelDateToJSDate(completionDate);
							}
							
							console.log(`🎓 Данные завершения для ${representativeName}:`, {
								rawDate: completionDate,
								formattedDate: formattedDate,
								rawUrl: rawProfileUrl,
								cleanUrl: cleanProfileUrl
							});
							
							reports.push({
								representativeName,
								productType,
								trainingCompletionDate: formattedDate || undefined,
								profileUrl: cleanProfileUrl || undefined
							});
						}
					})

					console.log(`✅ Обработка завершена: ${reports.length} отчетов, ${newRepresentatives.length} новых представителей`)
					console.log(`📊 Примеры отчетов:`, reports.slice(0, 3)) // Покажем первые 3 отчета для дебага
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

	// Конвертация Excel даты в JS Date string
	private static excelDateToJSDate(serial: number): string {
		// Excel даты начинаются с 1900-01-01
		const utc_days = Math.floor(serial - 25569);
		const utc_value = utc_days * 86400;                                        
		const date_info = new Date(utc_value * 1000);
		
		const year = date_info.getUTCFullYear();
		const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
		const day = String(date_info.getUTCDate()).padStart(2, '0');
		
		return `${year}-${month}-${day}`;
	}
}