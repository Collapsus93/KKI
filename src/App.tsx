import { useMemo, useState } from 'react'
import './App.css'
import { AddRepresentativeForm } from './components/AddRepresentativeForm'
import { FileUpload } from './components/FileUpload'
import { MetricsCard } from './components/MetricsCard'
import { RepresentativeTable } from './components/RepresentativeTable'
import { Tabs } from './components/Tabs/Tabs'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
	ProductType,
	Representative,
	SalesData,
	SalesReport,
	TimePeriod,
	normalizeName,
	parseFullName,
} from './types'

function App() {
	const [state, setState] = useLocalStorage()
	const [activeTab, setActiveTab] = useState<TimePeriod>('currentMonth')

	const existingRepresentativeNames = useMemo(
		() => state.representatives.map(rep => rep.fullName),
		[state.representatives]
	)

	// Получаем данные для активной вкладки
	const currentSalesData = state.salesData[activeTab]

	const addRepresentative = (representative: Representative) => {
		const newSalesDataCurrent: SalesData = {
			representativeId: representative.id,
			creditCards: {
				offers: 0,
				issuance: 0,
				utilization: 0,
			},
			simCards: {
				offers: 0,
				tariffPayments: 0,
				tariffPaymentPercent: 0,
			},
			investments: {
				offers: 0,
				accountOpening: 0,
				utilization: 0,
			},
			dataUpdate: 0,
		}

		const newSalesDataLast3: SalesData = {
			representativeId: representative.id,
			creditCards: {
				offers: 0,
				issuance: 0,
				utilization: 0,
			},
			simCards: {
				offers: 0,
				tariffPayments: 0,
				tariffPaymentPercent: 0,
			},
			investments: {
				offers: 0,
				accountOpening: 0,
				utilization: 0,
			},
			dataUpdate: 0,
		}

		setState({
			representatives: [...state.representatives, representative],
			salesData: {
				currentMonth: {
					...state.salesData.currentMonth,
					[representative.id]: newSalesDataCurrent,
				},
				last3Months: {
					...state.salesData.last3Months,
					[representative.id]: newSalesDataLast3,
				},
			},
		})
	}

	const updateRepresentative = (updatedRepresentative: Representative) => {
		setState({
			...state,
			representatives: state.representatives.map(rep =>
				rep.id === updatedRepresentative.id ? updatedRepresentative : rep
			),
		})
	}

	const removeRepresentative = (id: string) => {
		if (
			!window.confirm('Вы уверены, что хотите удалить этого представителя?')
		) {
			return
		}

		const { [id]: removedCurrent, ...newSalesDataCurrent } = state.salesData.currentMonth
		const { [id]: removedLast3, ...newSalesDataLast3 } = state.salesData.last3Months

		setState({
			representatives: state.representatives.filter(rep => rep.id !== id),
			salesData: {
				currentMonth: newSalesDataCurrent,
				last3Months: newSalesDataLast3,
			},
		})
	}

	const handleFileUpload = (
		reports: SalesReport[],
		productType: ProductType,
		newRepresentatives: string[],
		period: TimePeriod
	) => {
		console.log('📥 Начало обработки загрузки:', {
			reportsCount: reports.length,
			productType,
			newRepresentativesCount: newRepresentatives.length,
			period,
		})

		let processed = 0
		let skipped = 0

		// Добавляем новых представителей
		const representativesToAdd: Representative[] = []

		newRepresentatives.forEach(fullName => {
			const { firstName, lastName } = parseFullName(fullName)
			const representative: Representative = {
				id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
				firstName,
				lastName,
				fullName: fullName.trim(),
				successRate: 0,
				courseProgress: 0,
			}
			representativesToAdd.push(representative)
		})

		// Создаем обновленное состояние
		const newRepresentativesDataCurrent: Record<string, SalesData> = {}
		const newRepresentativesDataLast3: Record<string, SalesData> = {}
		
		representativesToAdd.forEach(rep => {
			newRepresentativesDataCurrent[rep.id] = {
				representativeId: rep.id,
				creditCards: {
					offers: 0,
					issuance: 0,
					utilization: 0,
				},
				simCards: {
					offers: 0,
					tariffPayments: 0,
					tariffPaymentPercent: 0,
				},
				investments: {
					offers: 0,
					accountOpening: 0,
					utilization: 0,
				},
				dataUpdate: 0,
			}
			newRepresentativesDataLast3[rep.id] = {
				representativeId: rep.id,
				creditCards: {
					offers: 0,
					issuance: 0,
					utilization: 0,
				},
				simCards: {
					offers: 0,
					tariffPayments: 0,
					tariffPaymentPercent: 0,
				},
				investments: {
					offers: 0,
					accountOpening: 0,
					utilization: 0,
				},
				dataUpdate: 0,
			}
		})

		const updatedRepresentatives = [
			...state.representatives,
			...representativesToAdd,
		]

		// Обновляем данные только для указанного периода
		const updatedSalesDataForPeriod = { 
			...state.salesData[period], 
			...newRepresentativesDataCurrent 
		}

		const updatedSalesData = {
			...state.salesData,
			[period]: updatedSalesDataForPeriod
		}

		// Обрабатываем отчеты
		reports.forEach((report, index) => {
			console.log(`📋 Обработка отчета ${index + 1}:`, report)

			// ОБНОВЛЕННЫЙ ПОИСК ПРЕДСТАВИТЕЛЯ С НОРМАЛИЗАЦИЕЙ ИМЕН
			const representative = updatedRepresentatives.find(rep => {
				const normalizedRepName = normalizeName(rep.fullName)
				const normalizedReportName = normalizeName(report.representativeName)
				const normalizedAltName = normalizeName(
					`${rep.lastName} ${rep.firstName}`
				)

				const isMatch =
					normalizedRepName.toLowerCase() ===
						normalizedReportName.toLowerCase() ||
					normalizedAltName.toLowerCase() === normalizedReportName.toLowerCase()

				if (isMatch) {
					console.log(
						`✅ Совпадение имен: "${rep.fullName}" ↔ "${report.representativeName}"`
					)
				}

				return isMatch
			})

			if (representative) {
				console.log(`👤 Найден представитель: ${representative.fullName}`)

				if (
					productType === 'creditCards' &&
					report.offers !== undefined &&
					report.issuance !== undefined &&
					report.utilization !== undefined
				) {
					updatedSalesData[period][representative.id] = {
						...updatedSalesData[period][representative.id],
						creditCards: {
							offers: report.offers,
							issuance: report.issuance,
							utilization: report.utilization,
						}
					}
					console.log(
						`💳 Обновлены кредитные карты для ${representative.fullName} (${period})`
					)
					processed++
				} else if (
					productType === 'simCards' &&
					report.offers !== undefined &&
					report.tariffPayments !== undefined &&
					report.tariffPaymentPercent !== undefined
				) {
					updatedSalesData[period][representative.id] = {
						...updatedSalesData[period][representative.id],
						simCards: {
							offers: report.offers,
							tariffPayments: report.tariffPayments,
							tariffPaymentPercent: report.tariffPaymentPercent,
						}
					}
					console.log(`📱 Обновлены SIM-карты для ${representative.fullName} (${period})`)
					processed++
				} else if (
					productType === 'investments' &&
					report.offers !== undefined &&
					report.accountOpening !== undefined &&
					report.utilization !== undefined
				) {
					updatedSalesData[period][representative.id] = {
						...updatedSalesData[period][representative.id],
						investments: {
							offers: report.offers,
							accountOpening: report.accountOpening,
							utilization: report.utilization,
						}
					}
					console.log(`📈 Обновлены инвестиции для ${representative.fullName} (${period})`)
					processed++
				} else if (
					productType === 'successRate' &&
					report.successRate !== undefined
				) {
					const repIndex = updatedRepresentatives.findIndex(
						rep => rep.id === representative.id
					)
					if (repIndex !== -1) {
						updatedRepresentatives[repIndex] = {
							...updatedRepresentatives[repIndex],
							successRate: report.successRate,
						}
						console.log(
							`📊 Обновлена успешность встреч для ${representative.fullName}: ${report.successRate}%`
						)
					}
					processed++
				} else if (
					productType === 'courseProgress' &&
					report.courseProgress !== undefined
				) {
					const repIndex = updatedRepresentatives.findIndex(
						rep => rep.id === representative.id
					)
					if (repIndex !== -1) {
						updatedRepresentatives[repIndex] = {
							...updatedRepresentatives[repIndex],
							courseProgress: report.courseProgress,
						}
						console.log(
							`📚 Обновлен прогресс по курсам для ${representative.fullName}: ${report.courseProgress}%`
						)
					}
					processed++
				} else if (
					productType === 'dataUpdate' &&
					report.salesCount !== undefined
				) {
					updatedSalesData[period][representative.id] = {
						...updatedSalesData[period][representative.id],
						dataUpdate: report.salesCount,
					}
					console.log(
						`🔄 Обновлены данные для ${representative.fullName}: ${report.salesCount} (${period})`
					)
					processed++
				} else if (
					productType === 'completionData' &&
					(report.trainingCompletionDate !== undefined || report.profileUrl !== undefined)
				) {
					// НОВАЯ ОБРАБОТКА: ДАННЫЕ О ЗАВЕРШЕНИИ ПОДГОТОВКИ
					const repIndex = updatedRepresentatives.findIndex(
						rep => rep.id === representative.id
					)
					if (repIndex !== -1) {
						const updatedRep = {
							...updatedRepresentatives[repIndex],
							...(report.trainingCompletionDate && { 
								trainingCompletionDate: report.trainingCompletionDate 
							}),
							...(report.profileUrl && { 
								profileUrl: report.profileUrl 
							})
						};
						
						updatedRepresentatives[repIndex] = updatedRep;
						console.log(
							`🎓 Обновлены данные завершения для ${representative.fullName}:`,
							`дата: ${report.trainingCompletionDate}, профиль: ${report.profileUrl}`
						);
					}
					processed++
				} else {
					console.log(
						`❌ Не удалось обработать отчет для ${representative.fullName}:`,
						report
					)
					skipped++
				}
			} else {
				console.log(
					`❌ Представитель не найден: "${report.representativeName}"`
				)
				console.log(
					`   Доступные представители:`,
					updatedRepresentatives.map(r => r.fullName)
				)
				skipped++
			}
		})

		console.log('📈 Финальное состояние перед сохранением:', {
			representatives: updatedRepresentatives,
			salesData: updatedSalesData,
		})

		setState({
			representatives: updatedRepresentatives,
			salesData: updatedSalesData,
		})

		// Показываем результаты
		let message = `Обработано: ${processed} записей (${period === 'currentMonth' ? 'текущий месяц' : 'последние 3 месяца'})`
		if (newRepresentatives.length > 0) {
			message += `\nДобавлено новых представителей: ${newRepresentatives.length}`
		}
		if (skipped > 0) {
			message += `\nНе обработано: ${skipped} записей`
		}

		alert(message)

		// Логируем итоговое состояние
		setTimeout(() => {
			console.log('✅ Финальное состояние после сохранения:', state)
			console.log(
				'📊 Представители с прогрессом:',
				state.representatives.filter(
					rep => rep.courseProgress !== undefined && rep.courseProgress > 0
				)
			)
		}, 100)
	}

	return (
		<div className='App'>
			<div className='container'>
				<h1>📊 Кабинет контроля исполнителей</h1>

				{/* Добавляем вкладки */}
				<Tabs activeTab={activeTab} onTabChange={setActiveTab} />

				<div className='controls'>
					<AddRepresentativeForm onAdd={addRepresentative} />
					<FileUpload
						onUpload={handleFileUpload}
						existingRepresentativeNames={existingRepresentativeNames}
						period={activeTab}
					/>
				</div>

				<MetricsCard
					salesData={currentSalesData}
					representatives={state.representatives}
				/>

				<RepresentativeTable
					representatives={state.representatives}
					salesData={currentSalesData}
					onRemove={removeRepresentative}
					onUpdate={updateRepresentative}
				/>

				{/* Отладочная информация */}
				<div
					style={{
						marginTop: '20px',
						padding: '10px',
						background: '#f5f5f5',
						borderRadius: '5px',
					}}
				>
					<h4>Сводка ({activeTab === 'currentMonth' ? 'Текущий месяц' : 'Последние 3 месяца'}):</h4>
					<p>Всего представителей: {state.representatives.length}</p>
					<p>
						Представители с данными о продажах:{' '}
						{
							Object.keys(currentSalesData).length
						}
					</p>
					<p>
						Представители с планом подготовки:{' '}
						{
							state.representatives.filter(
								rep =>
									rep.courseProgress !== undefined && rep.courseProgress > 0
							).length
						}
					</p>
					<button
						onClick={() => console.log('Текущее состояние:', state)}
						style={{ padding: '5px 10px', margin: '5px' }}
					>
						Логировать состояние
					</button>
				</div>
			</div>
		</div>
	)
}

export default App