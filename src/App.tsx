import React, {useState, useEffect} from 'react';
import moment from 'moment/min/moment-with-locales';
import _ from 'lodash';
import './index.css';

moment.locale('fr');

const currentYear = new Date().getFullYear();
const holidays = ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'];

interface ContactData {
	company?: string;
	companyAddresse?: string;
	devName?: string;
	signature?: string;
	clientName?: string;
	clientAddress?: string;
	clientResp?: string;
	clientContact?: string;
}

const App: React.FC = () => {
	const [month, setMonth] = useState<number>(moment().month() + 1);
	const [year, setYear] = useState<number>(currentYear);
	const [timeTable, setTimeTable] = useState<Record<string, number>>({});
	const [contactData, setContactData] = useState<ContactData>(
		JSON.parse(localStorage.getItem('contactData') || '{}')
	);

	const ttKey = `tt-${month}-${year}`;

	const updateTimetable = (data: Record<string, number>) => {
		setTimeTable(data);
		localStorage.setItem(ttKey, JSON.stringify(data));
	};

	const updateContactData = (k: keyof ContactData, el: HTMLInputElement | HTMLTextAreaElement) => {
		const newContactData = {...contactData, [k]: el.value || ''};
		setContactData(newContactData);
		localStorage.setItem('contactData', JSON.stringify(newContactData));
	};

	const updateTimetableEntry = (k: string, v: string | number) => {
		const n = parseFloat(String(v));
		updateTimetable({...timeTable, [k]: isNaN(n) ? 0 : n});
	};

	const initTimeTable = () => {
		const date = moment([year, month - 1]);
		const end = date.clone().add(1, 'month');
		const data: Record<string, number> = {};

		while (date.isBefore(end)) {
			data[date.format('YYYY-MM-DD')] =
				[0, 6].includes(date.day()) || holidays.includes(date.format('MM-DD')) ? 0 : 1;
			date.add(1, 'day');
		}

		updateTimetable(data);
	};

	const resetTimetable = (defaultValue: number | null = null) => {
		if (defaultValue !== null) {
			const newData = Object.fromEntries(Object.keys(timeTable).map(k => [k, defaultValue]));
			updateTimetable(newData);
		} else {
			initTimeTable();
		}
	};

	const processSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
			alert('Fichier non supporté');
			return;
		}

		const reader = new FileReader();
		reader.onload = ev => {
			const newContactData = {...contactData, signature: ev.target?.result as string};
			setContactData(newContactData);
			localStorage.setItem('contactData', JSON.stringify(newContactData));
		};
		reader.readAsDataURL(file);
	};

	useEffect(() => {
		try {
			const tt = JSON.parse(localStorage.getItem(ttKey) || '{}');
			if (Object.keys(tt).length) {
				updateTimetable(tt);
				return;
			}
		} catch {
		}

		initTimeTable();
	}, [month, year]);

	const totalDays = Object.values(timeTable).reduce((a, b) => a + b, 0);

	return (
		<div className="max-w-6xl mx-auto px-4 py-4">
			<div className="flex items-center gap-2 mb-4 print:hidden">
				<h2 className="font-semibold pr-2">Date: </h2>

				<select
					className="border rounded px-2 py-1"
					value={month}
					onChange={e => setMonth(parseInt(e.target.value))}
				>
					{_.range(1, 13).map(m => <option key={m}>{m}</option>)}
				</select>

				<span>/</span>

				<select
					className="border rounded px-2 py-1"
					value={year}
					onChange={e => setYear(parseInt(e.target.value))}
				>
					{_.range(currentYear - 1, currentYear + 2).map(y => <option key={y}>{y}</option>)}
				</select>

				<div className="ml-auto text-xs font-semibold text-indigo-500 space-x-2">
					<button className="cursor-pointer bg-indigo-100 rounded px-3"
						onClick={() => resetTimetable()}>Reset
					</button>
					<button className="cursor-pointer bg-indigo-100 rounded px-3" onClick={() => resetTimetable(1)}>Tout
						remplir
					</button>
					<button className="cursor-pointer bg-indigo-100 rounded px-3" onClick={() => resetTimetable(0)}>Tout
						vider
					</button>
				</div>
			</div>

			<h2 className="font-semibold mb-3 text-2xl">
				Compte rendu d'activité – <span
				className="capitalize">{moment().format('MMMM YYYY')}</span> – {contactData.devName || '<Nom Dev>'}
			</h2>

			<div className="flex gap-4">
				<div className="w-1/2 space-y-4">
					<div className="bg-white rounded-lg shadow p-4">
						<h4 className="text-blue-600 font-semibold border-b pb-2 border-neutral-200 flex items-center gap-1">
							<svg xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6 inline-block mr-1">
								<path strokeLinecap="round" strokeLinejoin="round"
									d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>

							Jours prestés
						</h4>
						<div className="text-2xl font-bold text-blue-600 mt-2">{totalDays} jours</div>
					</div>

					<div className="bg-white rounded-lg shadow p-4 space-y-2">
						<h4 className="text-blue-600 font-semibold border-b pb-2 border-neutral-200 flex items-center gap-1">
							<svg xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6 inline-block mr-1">
								<path strokeLinecap="round" strokeLinejoin="round"
									d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
							</svg>

							Prestataire
						</h4>
						<input
							className="w-full font-semibold focus:outline-none"
							placeholder="Nom entreprise"
							value={contactData.company || ''}
							onChange={e => updateContactData('company', e.target)}
						/>
						<textarea
							rows={3}
							className="w-full resize-none focus:outline-none"
							placeholder="Adresse entreprise"
							value={contactData.companyAddresse || ''}
							onChange={e => updateContactData('companyAddresse', e.target)}
						/>
						<div className="flex gap-4 mt-2 border-t pt-4 border-neutral-200 border-dashed">
							<div className="w-1/2">
								<div className="font-semibold text-blue-600">Signé par</div>
								<input
									className="w-full focus:outline-none"
									placeholder="Nom développeur"
									value={contactData.devName || ''}
									onChange={e => updateContactData('devName', e.target)}
								/>
								<div className="mt-2 font-semibold text-blue-600">Date</div>
								<div>{moment().format('DD/MM/YYYY')}</div>
							</div>
							<div className="w-1/2 relative">
								<div className="font-semibold text-blue-600">Signature</div>
								<input type="file" className="absolute inset-0 opacity-0 cursor-pointer"
									onChange={processSignature} />
								{
									contactData.signature
										? <img src={contactData.signature} className="h-[70px] mt-2" />
										: <svg xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="size-6 ml-5 mt-5 upload-signature">
											<path strokeLinecap="round"
												strokeLinejoin="round"
												d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
										</svg>
								}
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-4 space-y-2">
						<h4 className="text-blue-600 font-semibold border-b pb-2 border-neutral-200 flex items-center gap-1">
							<svg xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6 inline-block mr-1">
								<path strokeLinecap="round" strokeLinejoin="round"
									d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
							</svg>

							Client
						</h4>
						<input
							className="w-full font-semibold focus:outline-none"
							placeholder="Nom client"
							value={contactData.clientName || ''}
							onChange={e => updateContactData('clientName', e.target)}
						/>
						<textarea
							rows={3}
							className="w-full resize-none focus:outline-none"
							placeholder="Adresse client"
							value={contactData.clientAddress || ''}
							onChange={e => updateContactData('clientAddress', e.target)}
						/>
						<div className="flex gap-4 mt-2 border-t pt-4 border-neutral-200 border-dashed">
							<div className="w-1/2">
								<div className="font-semibold text-blue-600">Signé par</div>
								<textarea
									className="w-full resize-none focus:outline-none"
									placeholder="Responsable client"
									value={contactData.clientResp || ''}
									onChange={e => updateContactData('clientResp', e.target)}
								/>
								<div className="mt-2 font-semibold text-blue-600">Date</div>
								<div>&nbsp;</div>
							</div>
							<div className="w-1/2 relative">
								<div className="font-semibold text-blue-600">Signature</div>
							</div>
						</div>
					</div>
				</div>

				<div className="w-1/2 bg-white rounded-lg shadow overflow-hidden text-[12px] capitalize">
					<table className="w-full">
						<thead className="bg-gray-100">
							<tr>
								<th className="text-left p-1">Date</th>
								<th className="text-left p-1">Temps</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(timeTable).map(([k, v]) => {
								const d = moment(k);
								return (
									<tr key={k} className={v ? 'bg-blue-100' : 'bg-gray-100'}>
										<td className="p-1">{d.format('dddd')} <b>{d.format('DD')}</b></td>
										<td className="p-1">
											<input
												type="number"
												min={0}
												step={0.5}
												className="w-full bg-transparent focus:outline-none"
												value={v}
												onChange={e => updateTimetableEntry(k, e.target.value)}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default App;
