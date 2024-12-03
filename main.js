document.addEventListener('DOMContentLoaded', function () {
	// Přepínání záložek
	const tabButtons = document.querySelectorAll('.tab-button');
	const tabContents = document.querySelectorAll('.tab-content');

	tabButtons.forEach((button) => {
		button.addEventListener('click', function () {
			const tab = this.getAttribute('data-tab');

			tabButtons.forEach((btn) => btn.classList.remove('active'));
			tabContents.forEach((content) => content.classList.remove('active'));

			this.classList.add('active');
			document.getElementById(tab).classList.add('active');
		});
	});

	const opListSelect = document.getElementById('opListSelect');
	if (opListSelect) {
		opListSelect.addEventListener('change', enableSubmitButton);
	}

	// Event listenery pro validaci tlačítka upload
	const clientIDOZElement = document.getElementById('clientIDOZ');
	const clientIDOPElement = document.getElementById('clientIDOP');

	if (clientIDOZElement && clientIDOPElement) {
		clientIDOZElement.addEventListener('input', validateUploadButton);
		clientIDOPElement.addEventListener('input', validateUploadButton);
	}

	// Inicializace výpočtu
	calculateEverything();
});

let selectedOPID = null;

function updateSelectedOPID() {
	const opListSelect = document.getElementById('opListSelect');
	selectedOPID = opListSelect.value; // Uložíme vybrané ID do globální proměnné
	console.log('Vybraný OP ID:', selectedOPID); // Pro kontrolu zobrazíme v konzoli
}

let selectedMeasures = {
	insulation: false,
	heatPump: false,
	ventilation: false,
	waterRekuperation: false,
	photovoltaic: false,
	rainwaterTankIrrigation: false,
	rainwaterTankIrrigationWC: false,
	chargingStation: false,
	greenRoof: false,
};

let selectedEnergyMeasures = {
	insulation: false,
	heatPump: false,
	ventilation: false,
	waterRekuperation: false,
	photovoltaic: false,
};

let energyClass = {
	A: 43,
	B: 82,
	C: 120,
	D: 162,
	E: 205,
	F: 245,
	G: 286,
};

function setEnergyClass(className) {
	const buttons = document.querySelectorAll('.energy-class-button');
	buttons.forEach((button) => {
		button.classList.remove('selected');
	});
	document.querySelector(`.energy-class-${className.toLowerCase()}`).classList.add('selected');

	const houseArea = parseFloat(document.getElementById('houseArea').value);
	if (houseArea) {
		const usage = (houseArea * energyClass[className]) / 1000;
		document.getElementById('electricityUsage').value = usage.toFixed(2);
		document.getElementById('electricityUsage').disabled = true;
		document.getElementById('gasUsage').disabled = true;
		document.getElementById('monthlyPayments').disabled = true;
	}
	calculateEverything();
}

function toggleMeasure(measure) {
	selectedMeasures[measure] = !selectedMeasures[measure];
	const button = document.getElementById(`${measure}Button`);
	button.classList.toggle('selected', selectedMeasures[measure]);
	button.classList.toggle('unselected', !selectedMeasures[measure]);

	if (measure === 'photovoltaic') {
		togglePhotovoltaicSlider();
	}
	if (measure === 'greenRoof') {
		toggleGreenRoofFields();
	}
	if (measure === 'heatPump') {
		toggleHeatPumpOptions();
	}
	calculateEverything();
}

function togglePhotovoltaicSlider() {
	const photovoltaicSliderContainer = document.getElementById('photovoltaicSliderContainer');
	photovoltaicSliderContainer.style.display = selectedMeasures.photovoltaic ? 'block' : 'none';
	if (!selectedMeasures.photovoltaic) {
		document.getElementById('photovoltaicSlider').value = 5;
		updatePhotovoltaicValue();
		calculateEverything();
	}
}

function toggleGreenRoofFields() {
	const greenRoofFields = document.getElementById('greenRoofFields');
	greenRoofFields.style.display = selectedMeasures.greenRoof ? 'block' : 'none';
}

function toggleHeatPumpOptions() {
	const heatPumpOptions = document.getElementById('heatPumpOptions');
	if (heatPumpOptions) {
		heatPumpOptions.style.display = selectedMeasures.heatPump ? 'block' : 'none';
		const heatPumpTypeElement = document.getElementById('heatPumpType');
		const heatPumpTypeTextElement = document.getElementById('heatPumpTypeText');
		if (!selectedMeasures.heatPump && heatPumpTypeElement && heatPumpTypeTextElement) {
			heatPumpTypeElement.value = '';
			heatPumpTypeTextElement.value = '';
		}
	} else {
		console.error('Element heatPumpOptions nebyl nalezen.');
	}
}

function toggleRainwaterTankIrrigation(option) {
	if (option === 'rainwaterTankIrrigation') {
		selectedMeasures.rainwaterTankIrrigation = !selectedMeasures.rainwaterTankIrrigation;
		selectedMeasures.rainwaterTankIrrigationWC = false;
	} else {
		selectedMeasures.rainwaterTankIrrigationWC = !selectedMeasures.rainwaterTankIrrigationWC;
		selectedMeasures.rainwaterTankIrrigation = false;
	}
	const rainwaterTankIrrigationButton = document.getElementById('rainwaterTankIrrigationButton');
	const rainwaterTankIrrigationWCButton = document.getElementById('rainwaterTankIrrigationWCButton');

	rainwaterTankIrrigationButton.classList.toggle('selected', selectedMeasures.rainwaterTankIrrigation);
	rainwaterTankIrrigationButton.classList.toggle('unselected', !selectedMeasures.rainwaterTankIrrigation);

	rainwaterTankIrrigationWCButton.classList.toggle('selected', selectedMeasures.rainwaterTankIrrigationWC);
	rainwaterTankIrrigationWCButton.classList.toggle('unselected', !selectedMeasures.rainwaterTankIrrigationWC);

	calculateEverything();
}

function toggleEnergyMeasure(measure) {
	selectedEnergyMeasures[measure] = !selectedEnergyMeasures[measure];
	const button = document.getElementById(`uspory${measure.charAt(0).toUpperCase() + measure.slice(1)}Button`);
	button.classList.toggle('selected', selectedEnergyMeasures[measure]);
	button.classList.toggle('unselected', !selectedEnergyMeasures[measure]);
	calculateEverything();
}

function toggleCustomEnergyPriceFields() {
	const customEnergyPriceFields = document.getElementById('customEnergyPriceFields');
	const energyCostDisclaimer = document.getElementById('energyCostDisclaimer');
	const isVisible = customEnergyPriceFields.style.display === 'block';

	customEnergyPriceFields.style.display = isVisible ? 'none' : 'block';
	energyCostDisclaimer.style.display = isVisible ? 'block' : 'none';

	if (isVisible) {
		document.getElementById('electricityPrice').value = '';
		document.getElementById('gasPrice').value = '';
		document.getElementById('monthlyPayments').value = '';
		calculateEverything();
	}
}

function toggleEnergyClassButtons() {
	const energyClassButtons = document.querySelector('.button-group.energy-class');
	const isVisible = energyClassButtons.style.display === 'flex';

	energyClassButtons.style.display = isVisible ? 'none' : 'flex';
	document.getElementById('electricityUsage').disabled = !isVisible;
	document.getElementById('gasUsage').disabled = !isVisible;
	document.getElementById('monthlyPayments').disabled = !isVisible;

	if (isVisible) {
		const buttons = document.querySelectorAll('.energy-class-button');
		buttons.forEach((button) => {
			button.classList.remove('selected');
		});
		document.getElementById('electricityUsage').value = '';
		document.getElementById('gasUsage').value = '';
		calculateEverything();
	}
}

function calculateEverything() {
	checkInsulationFields(); // Zkontroluje, jestli jsou vyplněna pole pro zateplení
	calculateMonthlyPayment(); // Spočítá měsíční splátku
	calculateEnergyCost(); // Spočítá náklady na energii
	calculateSavings(); // Spočítá úspory
	calculateSubsidy(); // Spočítá dotaci (pro všechny oblasti a bonusy)
	updateOfferPage(); // Aktualizuje stránku s nabídkou (pokud se nachází na stránce nabídky)
}

function checkInsulationFields() {
	const facadeArea = parseFloat(document.getElementById('facadeArea').value) || 0;
	const cellarCeilingArea = parseFloat(document.getElementById('cellarCeilingArea').value) || 0;
	const combinedFacadeArea = facadeArea + cellarCeilingArea;

	const roofArea = parseFloat(document.getElementById('roofArea').value) || 0;

	const windowArea = parseFloat(document.getElementById('windowArea').value) || 0;
	const doorArea = parseFloat(document.getElementById('doorArea').value) || 0;
	const windowDoorArea = windowArea + doorArea;

	const floorArea = parseFloat(document.getElementById('floorArea').value) || 0;

	const shouldSelect = combinedFacadeArea > 0 || roofArea > 0 || windowDoorArea > 0 || floorArea > 0;
	if (shouldSelect !== selectedMeasures.insulation) {
		toggleMeasure('insulation');
	}
}

function calculateMonthlyPayment() {
	const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
	const interestRate = 0.0319 / 12;
	const totalPayments = 25 * 12;

	let monthlyPayment = 0;
	if (loanAmount <= 2500000 && loanAmount > 0) {
		monthlyPayment =
			(loanAmount * interestRate * Math.pow(1 + interestRate, totalPayments)) /
			(Math.pow(1 + interestRate, totalPayments) - 1);
	}
	document.getElementById('monthlyPayment').innerText = formatNumber(monthlyPayment);
}

function calculateEnergyCost() {
	const electricityUsageInput = document.getElementById('electricityUsage');
	const houseAreaInput = document.getElementById('houseArea');
	const gasUsageInput = document.getElementById('gasUsage');
	const monthlyPaymentsInput = document.getElementById('monthlyPayments');

	let electricityUsage = parseFloat(electricityUsageInput.value) || NaN;
	const houseArea = parseFloat(houseAreaInput.value) || NaN;
	let gasUsage = parseFloat(gasUsageInput.value) || NaN;

	if (
		isNaN(electricityUsage) &&
		!isNaN(houseArea) &&
		document.querySelector('.button-group.energy-class').style.display === 'flex'
	) {
		electricityUsage = (houseArea * 286) / 1000;
	}

	const electricityPrice = parseFloat(document.getElementById('electricityPrice').value) || 6338.95;
	const gasPrice = parseFloat(document.getElementById('gasPrice').value) || 2184;
	const monthlyPayments = parseFloat(monthlyPaymentsInput.value) || 0;

	let monthlyElectricityCost = 0;
	let monthlyGasCost = 0;

	if (monthlyPayments > 0) {
		monthlyElectricityCost = monthlyPayments;
		monthlyGasCost = 0;
		electricityUsage = 0;
		gasUsage = 0;
	} else {
		const annualElectricityCost = (electricityUsage || 0) * electricityPrice;
		monthlyElectricityCost = annualElectricityCost / 12 + 550;

		const annualGasCost = isNaN(gasUsage) ? 0 : gasUsage * gasPrice;
		monthlyGasCost = isNaN(gasUsage) ? 0 : annualGasCost / 12 + 353.1;
	}

	const totalMonthlyEnergyCost = monthlyElectricityCost + monthlyGasCost;
	document.getElementById('monthlyEnergyCost').innerText = formatNumber(totalMonthlyEnergyCost);

	calculateTotalMonthlyCost();
}

function calculateSavings() {
	const monthlyEnergyCostText = document.getElementById('monthlyEnergyCost').innerText;
	let monthlyEnergyCost = parseFloat(monthlyEnergyCostText.replace(/\s/g, '')) || 0;

	let oldElectricityUsage = parseFloat(document.getElementById('electricityUsage').value) || 0;
	let oldGasUsage = parseFloat(document.getElementById('gasUsage').value) || 0;

	const oldTotalEnergyUsage = oldElectricityUsage + oldGasUsage;

	for (let measure in selectedEnergyMeasures) {
		if (selectedEnergyMeasures[measure]) {
			switch (measure) {
				case 'insulation':
					monthlyEnergyCost *= 0.5;
					oldElectricityUsage *= 0.5;
					oldGasUsage *= 0.5;
					break;
				case 'heatPump':
					monthlyEnergyCost *= 0.5;
					oldElectricityUsage *= 0.5;
					oldGasUsage *= 0.5;
					break;
				case 'ventilation':
					monthlyEnergyCost /= 1.3;
					oldElectricityUsage /= 1.3;
					oldGasUsage /= 1.3;
					break;
				case 'waterRekuperation':
					monthlyEnergyCost /= 1.4;
					oldElectricityUsage /= 1.4;
					oldGasUsage /= 1.4;
					break;
			}
		}
	}

	const photovoltaicSlider = document.getElementById('photovoltaicSlider');
	const photovoltaicKwp =
		photovoltaicSlider && selectedMeasures.photovoltaic ? parseFloat(photovoltaicSlider.value) : 0;
	const photovoltaicMwh = photovoltaicKwp;

	const energyPrice = parseFloat(document.getElementById('electricityPrice').value) || 6338.95;
	const surplusPrice = 2000;

	let newElectricityUsage = oldElectricityUsage;
	if (photovoltaicMwh > oldElectricityUsage) {
		const surplusEnergy = photovoltaicMwh - oldElectricityUsage;
		newElectricityUsage = 0;
		monthlyEnergyCost -= (oldElectricityUsage * energyPrice) / 12;
		monthlyEnergyCost -= (surplusEnergy * surplusPrice) / 12;
		document.getElementById('energySurplusDisclaimer').style.display = 'block';
	} else {
		newElectricityUsage = oldElectricityUsage - photovoltaicMwh;
		monthlyEnergyCost -= (photovoltaicMwh * energyPrice) / 12;
		document.getElementById('energySurplusDisclaimer').style.display = 'none';
	}

	const newTotalEnergyUsage = newElectricityUsage + oldGasUsage;

	document.getElementById('finalMonthlyPayment').innerText = formatNumber(monthlyEnergyCost);
	document.getElementById('finalEnergyUsage').innerText = formatNumber(newTotalEnergyUsage * 1000);

	const totalCo2Savings = (oldTotalEnergyUsage - newTotalEnergyUsage) * 1.17;
	document.getElementById('totalCo2Savings').innerText = totalCo2Savings.toFixed(2);

	updateEnergyClass(newTotalEnergyUsage);
	calculateTotalMonthlyCost();
}

function updatePhotovoltaicValue() {
	const photovoltaicKwp = document.getElementById('photovoltaicSlider').value;
	document.getElementById('photovoltaicValue').innerText = `${photovoltaicKwp} kWp`;
	calculateEverything();
}

function updateEnergyClass(newTotalEnergyUsage) {
	const houseArea = parseFloat(document.getElementById('houseArea').value) || 0;
	const energyClassElement = document.getElementById('finalEnergyClass');

	if (houseArea === 0) {
		energyClassElement.innerText = '-';
		energyClassElement.className = 'result energy-class-display disabled';
		return;
	}

	const energyUsagePerSquareMeter = (newTotalEnergyUsage * 1000) / houseArea;

	let newEnergyClass = 'G';
	for (let [key, value] of Object.entries(energyClass)) {
		if (energyUsagePerSquareMeter <= value) {
			newEnergyClass = key;
			break;
		}
	}

	energyClassElement.innerText = newEnergyClass;
	energyClassElement.className = `result energy-class-display energy-class-${newEnergyClass.toLowerCase()}`;
}

function calculateTotalMonthlyCost() {
	const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').innerText.replace(/\s/g, '')) || 0;
	const finalMonthlyPayment = document.getElementById('finalMonthlyPayment').innerText;
	const monthlyEnergyCostAfterSavings = parseFloat(finalMonthlyPayment.replace(/\s/g, '')) || 0;

	const totalMonthlyCost = monthlyPayment + monthlyEnergyCostAfterSavings;
	document.getElementById('totalMonthlyCost').innerText = formatNumber(totalMonthlyCost);

	calculateTotalSavings();
}

function calculateTotalSavings() {
	const initialMonthlyElectricityCost = parseFloat(
		document.getElementById('monthlyEnergyCost').innerText.replace(/\s/g, '')
	);
	const finalMonthlyCost = parseFloat(document.getElementById('totalMonthlyCost').innerText.replace(/\s/g, ''));
	const totalSavings = initialMonthlyElectricityCost - finalMonthlyCost;

	document.getElementById('totalSavings').innerText = formatNumber(totalSavings);
}

function calculateSubsidy() {
	// Dotace oblast A (zateplení)
	const facadeArea = parseFloat(document.getElementById('facadeArea').value) || 0;
	const cellarCeilingArea = parseFloat(document.getElementById('cellarCeilingArea').value) || 0;
	const combinedFacadeArea = facadeArea + cellarCeilingArea;

	const roofArea = parseFloat(document.getElementById('roofArea').value) || 0;

	const windowArea = parseFloat(document.getElementById('windowArea').value) || 0;
	const doorArea = parseFloat(document.getElementById('doorArea').value) || 0;
	const windowDoorArea = windowArea + doorArea;

	const floorArea = parseFloat(document.getElementById('floorArea').value) || 0;
	const shadingArea = parseFloat(document.getElementById('shadingArea').value) || 0;

	// Výpočet rozpočtu pro oblast A
	const areaCost =
		combinedFacadeArea * 1300 + roofArea * 1300 + windowDoorArea * 4900 + floorArea * 1700 + shadingArea * 1500;

	// Základní dotace 50 000 Kč za projekt
	let areaSubsidy = areaCost + 50000;

	// Limit dotace pro oblast A (1 000 000 Kč), ale rozpočet se musí zvednout i nad tento limit
	const maxAreaSubsidy = 1000000;
	areaSubsidy = Math.min(areaSubsidy, maxAreaSubsidy);

	// Dotace oblast C (zdroje energie)
	let energySubsidy = 0;
	if (selectedMeasures.ventilation) {
		energySubsidy += 105000; // Rekuperace vzduchu
	}
	if (selectedMeasures.waterRekuperation) {
		energySubsidy += 50000; // Rekuperace teplé vody (opraveno)
	}
	if (selectedMeasures.heatPump) {
		const heatPumpType = document.getElementById('heatPumpType').value;
		switch (heatPumpType) {
			case 'VzduchVzduchUT':
				energySubsidy += 60000;
				break;
			case 'VzduchVzduchUTWater':
				energySubsidy += 80000;
				break;
			case 'VzduchVzduchUTWaterFVE':
				energySubsidy += 140000;
				break;
			case 'VzduchVodaUT':
				energySubsidy += 80000;
				break;
			case 'VzduchVodaUTWater':
				energySubsidy += 100000;
				break;
			case 'VzduchVodaUTWaterFVE':
				energySubsidy += 140000;
				break;
			case 'ZemeVodaUTWater':
				energySubsidy += 140000;
				break;
			case 'ZemeVodaUT':
				energySubsidy += 120000;
				break;
			case 'VodaVodaUTWater':
				energySubsidy += 140000;
				break;
			case 'VodaVodaUT':
				energySubsidy += 120000;
				break;
			case 'KotelBio':
				energySubsidy += 80000;
				break;
		}
	}
	if (selectedMeasures.photovoltaic) {
		energySubsidy += 200000; // Fotovoltaika
	}

	// Dotace oblast D (elektronabíječka, zálivka, zelená střecha)
	let greenRoofSubsidy = 0;
	if (selectedMeasures.chargingStation) {
		greenRoofSubsidy += 15000; // Elektronabíječka
	}
	if (selectedMeasures.rainwaterTankIrrigation) {
		const tankVolume = parseFloat(document.getElementById('tankVolume').value) || 0;
		greenRoofSubsidy += 20000 + 3500 * Math.min(tankVolume, 10); // Nádrž na dešťovou vodu pro zálivku
	}
	if (selectedMeasures.rainwaterTankIrrigationWC) {
		const tankVolume = parseFloat(document.getElementById('tankVolume').value) || 0;
		greenRoofSubsidy += 30000 + 3500 * Math.min(tankVolume, 10); // Nádrž na dešťovou vodu pro zálivku + WC
	}
	const extensiveRoofArea = parseFloat(document.getElementById('extensiveRoofArea').value) || 0;
	const semiIntensiveRoofArea = parseFloat(document.getElementById('semiIntensiveRoofArea').value) || 0;
	const intensiveRoofArea = parseFloat(document.getElementById('intensiveRoofArea').value) || 0;
	const steepRoofArea = parseFloat(document.getElementById('steepRoofArea').value) || 0;
	greenRoofSubsidy += Math.min(
		extensiveRoofArea * 800 + semiIntensiveRoofArea * 900 + intensiveRoofArea * 1000 + steepRoofArea * 1000,
		100000
	); // Limit na zelenou střechu je 100 000 Kč

	// Kombinační bonus: 10 000 Kč za každé další opatření (mimo první)
	const selectedMeasuresCount = Object.values(selectedMeasures).filter(Boolean).length;
	let combinationBonus = selectedMeasuresCount > 1 ? (selectedMeasuresCount - 1) * 10000 : 0;

	// Bonus za děti (rodinný bonus)
	const numChildrenFullCare = parseFloat(document.getElementById('numChildrenFullCare').value) || 0;
	const numChildrenSharedCare = parseFloat(document.getElementById('numChildrenSharedCare').value) || 0;
	let familyBonus = numChildrenFullCare * 50000 + numChildrenSharedCare * 25000;

	// Bonus za vymezenou obec
	const selectedRegionBonus = document.getElementById('selectedRegionBonus').checked;
	let regionBonus = 0;
	if (selectedRegionBonus) {
		regionBonus = (areaSubsidy + energySubsidy + greenRoofSubsidy) * 0.1;
	}

	// Celková dotace
	const totalSubsidy = areaSubsidy + energySubsidy + greenRoofSubsidy + combinationBonus + familyBonus + regionBonus;

	// Aktualizace na úvodní stránce výpočtu dotace
	document.getElementById('totalSubsidy').innerText = formatNumber(totalSubsidy);

	// Předběžný rozpočet na rekonstrukci - bez limitu na 1 000 000 Kč pro oblast A
	const estimatedBudget = (areaCost * 2 + 100000 + energySubsidy * 2 + greenRoofSubsidy * 2) * 1.1;
	document.getElementById('estimatedBudget').innerText = formatNumber(estimatedBudget);
	document.getElementById('recommendedLoanAmount').innerText = formatNumber(estimatedBudget - totalSubsidy);

	// Aktualizace na stránce nabídky
	if (document.getElementById('offerTotalSubsidy')) {
		document.getElementById('offerTotalSubsidy').innerText = formatNumber(totalSubsidy) + ' Kč';
		document.getElementById('offerEstimatedBudget').innerText = formatNumber(estimatedBudget) + ' Kč';
	}

	// Aktualizace jednotlivých dotací a bonusů na stránce nabídky
	document.getElementById('areaSubsidy').innerText = formatNumber(areaSubsidy) + ' Kč';
	document.getElementById('energySubsidy').innerText = formatNumber(energySubsidy) + ' Kč';
	document.getElementById('greenRoofSubsidy').innerText = formatNumber(greenRoofSubsidy) + ' Kč';
	document.getElementById('bonusSubsidy').innerText =
		formatNumber(combinationBonus + familyBonus + regionBonus) + ' Kč';
}

function formatNumber(num) {
	num = parseFloat(num);
	if (!isNaN(num)) {
		return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	} else {
		console.error('Chyba: Hodnota není číslo:', num);
		return '0.00';
	}
}

const measuresInfo = {
	heatPump: {
		name: 'Tepelné čerpadlo',
		icon: 'fa-solid fa-fire-flame-curved',
		description: 'Tepelné čerpadlo snižuje náklady na vytápění a zvyšuje energetickou účinnost vašeho domu.',
	},
	ventilation: {
		name: 'Rekuperace vzduchu',
		icon: 'fa-solid fa-wind',
		description: 'Rekuperace zajišťuje čerstvý vzduch v domě a snižuje tepelné ztráty větráním.',
	},
	waterRekuperation: {
		name: 'Rekuperace teplé vody',
		icon: 'fa-solid fa-water',
		description: 'Rekuperace teplé vody umožňuje znovu využít teplo z odpadní vody a snížit spotřebu energie.',
	},
	photovoltaic: {
		name: 'Fotovoltaika',
		icon: 'fa-solid fa-solar-panel',
		description: 'Instalace fotovoltaických panelů umožňuje vyrábět vlastní elektřinu ze sluneční energie.',
	},
	rainwaterTankIrrigation: {
		name: 'Nádrž na dešťovou vodu - Zálivka',
		icon: 'fa-solid fa-cloud-rain',
		description: 'Sběr dešťové vody pro zálivku zahrady snižuje spotřebu pitné vody.',
	},
	rainwaterTankIrrigationWC: {
		name: 'Nádrž na dešťovou vodu - Zálivka + WC',
		icon: 'fa-solid fa-toilet',
		description: 'Využití dešťové vody pro zálivku a splachování WC výrazně snižuje spotřebu pitné vody.',
	},
	chargingStation: {
		name: 'Elektro nabíječka',
		icon: 'fa-solid fa-charging-station',
		description: 'Instalace nabíječky pro elektromobil podporuje využití ekologické dopravy.',
	},
	greenRoof: {
		name: 'Zelená střecha',
		icon: 'fa-solid fa-leaf',
		description: 'Zelená střecha zlepšuje tepelnou izolaci a přispívá k lepšímu mikroklimatu.',
	},
};

function updateOfferPage() {
	// Datum nabídky
	const today = new Date();
	const offerDate = today.toLocaleDateString('cs-CZ');
	document.getElementById('offerDate').innerText = offerDate;

	// Jméno klienta
	const clientName = document.getElementById('clientName').value || 'Neuvedeno';
	const clientSurname = document.getElementById('clientSurname').value || '';
	document.getElementById('offerClientName').innerText = `${clientName} ${clientSurname}`;

	// Rozměry domu
	document.getElementById('offerFacadeArea').innerText = document.getElementById('facadeArea').value || '0';
	document.getElementById('offerCellarCeilingArea').innerText =
		document.getElementById('cellarCeilingArea').value || '0';
	document.getElementById('offerRoofArea').innerText = document.getElementById('roofArea').value || '0';
	document.getElementById('offerWindowArea').innerText = document.getElementById('windowArea').value || '0';
	document.getElementById('offerDoorArea').innerText = document.getElementById('doorArea').value || '0';
	document.getElementById('offerFloorArea').innerText = document.getElementById('floorArea').value || '0';
	document.getElementById('offerShadingArea').innerText = document.getElementById('shadingArea').value || '0';

	// Celková dotace a náklady
	document.getElementById('offerTotalSubsidy').innerText = document.getElementById('totalSubsidy').innerText;
	document.getElementById('offerEstimatedBudget').innerText = document.getElementById('estimatedBudget').innerText;
	document.getElementById('offerTotalSavings').innerText = document.getElementById('totalSavings').innerText;

	// Financování
	const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
	const formattedLoanAmount = loanAmount.toLocaleString('cs-CZ', {
		style: 'currency',
		currency: 'CZK',
	});
	document.getElementById('offerLoanAmount').innerText = formattedLoanAmount;

	const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').innerText.replace(/\s/g, '')) || 0;
	const formattedMonthlyPayment = monthlyPayment.toLocaleString('cs-CZ', {
		style: 'currency',
		currency: 'CZK',
	});
	document.getElementById('offerMonthlyPayment').innerText = formattedMonthlyPayment;

	// Délka financování a úroková sazba
	const offerLoanDuration = 25;
	const offerInterestRate = 3.19;

	document.getElementById('offerLoanDuration').innerText = `${offerLoanDuration} let`;
	document.getElementById('offerInterestRate').innerText = `${offerInterestRate}% p.a.`;

	// Generování seznamu zvolených opatření
	const offerMeasuresList = document.getElementById('offerMeasures');
	offerMeasuresList.innerHTML = ''; // Vyprázdnění před přidáním

	for (let measure in selectedMeasures) {
		if (selectedMeasures[measure]) {
			const measureInfo = measuresInfo[measure];
			if (measureInfo) {
				const listItem = document.createElement('li');
				listItem.classList.add('measure-item'); // Přidání CSS třídy kontejneru

				// Vytvoření ikony
				const iconElement = document.createElement('i');
				iconElement.className = measureInfo.icon;

				// Vytvoření obsahu
				const contentDiv = document.createElement('div');

				const measureTitle = document.createElement('h5');
				measureTitle.innerText = measureInfo.name;

				const measureDescription = document.createElement('p');
				measureDescription.innerText = measureInfo.description;

				contentDiv.appendChild(measureTitle);
				contentDiv.appendChild(measureDescription);

				// Sestavení položky seznamu
				listItem.appendChild(iconElement);
				listItem.appendChild(contentDiv);

				offerMeasuresList.appendChild(listItem);
			}
		}
	}

	// Doporučení pro úsporu (pokud nejsou zvolená opatření)
	let recommendedMeasuresText = '';
	if (!selectedMeasures.heatPump) {
		recommendedMeasuresText += 'Zvažte přidání tepelného čerpadla pro snížení nákladů na vytápění. ';
	}
	if (!selectedMeasures.photovoltaic) {
		recommendedMeasuresText += 'Instalace fotovoltaiky by výrazně snížila Vaše účty za elektřinu. ';
	}
	if (!selectedMeasures.insulation) {
		recommendedMeasuresText += 'Zateplení domu je zásadní pro snížení energetických ztrát. ';
	}
	document.getElementById('offerSavingsRecommendation').innerText =
		recommendedMeasuresText || 'Vaše opatření jsou optimální.';

	// Pokud úspory nejsou vyšší než splátky, zobrazíme doporučení
	const totalSavings = parseFloat(document.getElementById('totalSavings').innerText.replace(/\s/g, '')) || 0;

	const recommendedMeasuresList = document.getElementById('offerRecommendedMeasures');
	recommendedMeasuresList.innerHTML = '';

	if (totalSavings < monthlyPayment) {
		const recommendations = [];

		if (!selectedMeasures.insulation) {
			recommendations.push('Zateplení pro snížení tepelných ztrát.');
		}
		if (!selectedMeasures.heatPump) {
			recommendations.push('Tepelné čerpadlo pro efektivní vytápění.');
		}
		if (!selectedMeasures.photovoltaic) {
			recommendations.push('Fotovoltaika pro snížení nákladů na elektřinu.');
		}

		recommendations.forEach((recommendation) => {
			const listItem = document.createElement('li');
			listItem.innerText = recommendation;
			recommendedMeasuresList.appendChild(listItem);
		});
	} else {
		recommendedMeasuresList.innerHTML = '<li>Vaše úspory jsou vyšší než splátky. Výborně!</li>';
	}
}

// Globální pole pro ukládání všech OP
let allOpList = [];

// Funkce pro přidání jednotlivých OP do seznamu
function addOpToList(opData) {
	const [name, id] = opData.split('ID');
	if (name && id) {
		allOpList.push({ id: id.trim(), name: name.trim() });
	}
}

// Funkce pro zobrazení OP po dokončení všech operací
function displayOpList() {
	if (allOpList.length > 0) {
		const opListSelect = document.getElementById('opListSelect');
		opListSelect.innerHTML = '<option value="">-- Vyberte obchodní případ --</option>';

		allOpList.forEach((op) => {
			const option = document.createElement('option');
			option.value = op.id;
			option.text = op.name || op.id;
			opListSelect.appendChild(option);
		});

		// Zobrazíme kontejner
		document.getElementById('opListContainer').style.display = 'block';
	} else {
		alert('Žádné obchodní případy nebyly nalezeny.');
	}
}

// Funkce pro odeslání požadavku na server (například na webhook)
function getOPList() {
	const ozID = document.getElementById('clientIDOZ').value;

	if (!ozID) {
		alert('Prosím zadejte ID OZ.');
		return;
	}

	fetch('https://hook.eu2.make.com/ons91s93vaj1kalosj5s6nwgvxvw7bk4', {
		// Zadejte URL vašeho webhooku
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ozID: ozID }),
	})
		.then((response) => response.json()) // Očekáváme JSON odpověď
		.then((data) => {
			if (Array.isArray(data)) {
				populateOPList(data); // Pokud je odpověď pole, zavoláme funkci pro zobrazení OP
			} else {
				console.error('Chyba: ', data); // V případě jiné než očekávané odpovědi
				alert(`Chyba: ${data}`);
			}
		})
		.catch((error) => {
			console.error('Chyba při načítání:', error);
		});
}

// Funkce pro naplnění seznamu OP daty
function populateOPList(opList) {
	const opListSelect = document.getElementById('opListSelect');
	opListSelect.innerHTML = ''; // Vyprázdnit seznam před přidáním nových OP

	opList.forEach((op) => {
		const option = document.createElement('option');
		option.value = op.id; // Uložíme ID do value
		option.text = `${op.code} - ${op.name}`; // Zobrazí se formát: Kód - Název
		opListSelect.appendChild(option);
	});

	// Zobrazíme kontejner s OP listem
	document.getElementById('opListContainer').style.display = 'block';
}

// Zpracování dat obchodních případů
function processOpData(opList) {
	opList.forEach((op) => {
		handleOpResponse(op); // Předáme každý obchodní případ ke zpracování
	});

	finishLoadingOps(); // Po zpracování všech volání zobrazíme seznam
}

// Funkce pro každou odpověď z webhooku
function handleOpResponse(opData) {
	addOpToList(opData); // Přidáme aktuální OP do seznamu
}

// Když jsou všechna data načtena, zobrazíme seznam OP
function finishLoadingOps() {
	displayOpList(); // Zobrazí seznam všech OP
}

// Funkce pro odeslání dat do Raynetu
function prepareDataForRaynet() {
	const selectedOPID = document.getElementById('opListSelect').value;
	if (!selectedOPID) {
		alert('Prosím vyberte obchodní případ.');
		return; // Zastaví funkci, pokud není vybrán žádný OP
	}

	// Získání údajů klienta z formuláře
	const clientData = {
		clientName: document.getElementById('clientName') ? document.getElementById('clientName').value : '',
		clientSurname: document.getElementById('clientSurname') ? document.getElementById('clientSurname').value : '',
		clientBirth: document.getElementById('clientBirth') ? document.getElementById('clientBirth').value : '',
		clientEmail: document.getElementById('clientEmail') ? document.getElementById('clientEmail').value : '',
		clientPhone: document.getElementById('clientPhone') ? document.getElementById('clientPhone').value : '',
		clientAIS: document.getElementById('clientAIS') ? document.getElementById('clientAIS').value : '',
		clientPermanentAddress: document.getElementById('clientPermanentAddress')
			? document.getElementById('clientPermanentAddress').value
			: '',
		clientCorrespondenceAddress: document.getElementById('clientCorrespondenceAddress')
			? document.getElementById('clientCorrespondenceAddress').value
			: '',
	};

	// Další údaje o nemovitosti
	const propertyData = {
		propertyType: document.getElementById('propertyType') ? document.getElementById('propertyType').value : '',
		cadastralTerritory: document.getElementById('cadastralTerritory')
			? document.getElementById('cadastralTerritory').value
			: '',
		plotNumber: document.getElementById('plotNumber') ? document.getElementById('plotNumber').value : '',
		municipality: document.getElementById('municipality') ? document.getElementById('municipality').value : '',
		street: document.getElementById('street') ? document.getElementById('street').value : '',
		electricityMeterNumber: document.getElementById('electricityMeterNumber')
			? document.getElementById('electricityMeterNumber').value
			: '',
		eanCode: document.getElementById('eanCode') ? document.getElementById('eanCode').value : '',
		eicCode: document.getElementById('eicCode') ? document.getElementById('eicCode').value : '',
		ownershipType: document.getElementById('ownershipType') ? document.getElementById('ownershipType').value : '',
	};
	// Proměnná pro dynamické přepsání textu tepelného čerpadla
	let heatPumpInfo = '';

	// Získání hodnot pro výpočet
	const facadeArea = parseFloat(document.getElementById('facadeArea').value) || 0;
	const cellarCeilingArea = parseFloat(document.getElementById('cellarCeilingArea').value) || 0;
	const combinedFacadeArea = facadeArea + cellarCeilingArea;

	const roofArea = parseFloat(document.getElementById('roofArea').value) || 0;

	// Vypočítání součtu combinedFacadeArea a roofArea
	const totalArea = combinedFacadeArea + roofArea;

	// Získání údajů o výpočtech a opatřeních
	const calculationData = {
		facadeArea: document.getElementById('facadeArea') ? document.getElementById('facadeArea').value : '',
		cellarCeilingArea: document.getElementById('cellarCeilingArea')
			? document.getElementById('cellarCeilingArea').value
			: '',
		roofArea: document.getElementById('roofArea') ? document.getElementById('roofArea').value : '',
		totalArea: totalArea, // Součet plochy fasády a střechy
		windowArea: document.getElementById('windowArea') ? document.getElementById('windowArea').value : '',
		doorArea: document.getElementById('doorArea') ? document.getElementById('doorArea').value : '',
		floorArea: document.getElementById('floorArea') ? document.getElementById('floorArea').value : '',
		shadingArea: document.getElementById('shadingArea') ? document.getElementById('shadingArea').value : '',
		totalSubsidy: document.getElementById('totalSubsidy') ? document.getElementById('totalSubsidy').innerText : '',
		loanAmount: document.getElementById('loanAmount') ? document.getElementById('loanAmount').value : '',
		electricityUsage: document.getElementById('electricityUsage')
			? document.getElementById('electricityUsage').value
			: '',
		gasUsage: document.getElementById('gasUsage') ? document.getElementById('gasUsage').value : '',
		houseArea: document.getElementById('houseArea') ? document.getElementById('houseArea').value : '',
		heatPumpType: selectedMeasures.heatPump ? document.getElementById('heatPumpType').value : '',
		photovoltaic: selectedMeasures.photovoltaic ? document.getElementById('photovoltaicSlider').value : '',
		ventilation: selectedMeasures.ventilation,
		waterRekuperation: selectedMeasures.waterRekuperation,
		chargingStation: selectedMeasures.chargingStation,
		greenRoof: {
			extensiveRoofArea: parseFloat(document.getElementById('extensiveRoofArea').value) || 0,
			semiIntensiveRoofArea: parseFloat(document.getElementById('semiIntensiveRoofArea').value) || 0,
			intensiveRoofArea: parseFloat(document.getElementById('intensiveRoofArea').value) || 0,
			steepRoofArea: parseFloat(document.getElementById('steepRoofArea').value) || 0,
		},
		rainwaterTank: {
			tankVolume: document.getElementById('tankVolume').value,
			type: selectedMeasures.rainwaterTankIrrigationWC ? 'Zálivka + WC' : 'Zálivka',
		},
		// Nové přidané dotace a bonusy
		areaSubsidy: document.getElementById('areaSubsidy').innerText,
		energySubsidy: document.getElementById('energySubsidy').innerText,
		greenRoofSubsidy: document.getElementById('greenRoofSubsidy').innerText,
		combinationBonus: document.getElementById('bonusSubsidy').innerText, // Kombinační bonus
		familyBonus: document.getElementById('bonusSubsidy').innerText, // Rodinný bonus
		regionBonus: document.getElementById('bonusSubsidy').innerText, // Bonus za vymezenou obec
		// Počet dětí v plné a střídavé péči
		numChildrenFullCare: document.getElementById('numChildrenFullCare')
			? document.getElementById('numChildrenFullCare').value
			: 0,
		numChildrenSharedCare: document.getElementById('numChildrenSharedCare')
			? document.getElementById('numChildrenSharedCare').value
			: 0,
		// Celkový rozpočet
		totalBudget: document.getElementById('estimatedBudget') ? document.getElementById('estimatedBudget').innerText : '',
		heatPumpInfo: '', // Placeholder pro tepelné čerpadlo
	};
	// Dynamické přepsání textu tepelného čerpadla a jeho dotace
	if (selectedMeasures.heatPump) {
		const heatPumpType = document.getElementById('heatPumpType').value;
		let heatPumpSubsidy = 0;

		// Výše dotace na tepelné čerpadlo podle jeho typu
		switch (heatPumpType) {
			case 'VzduchVzduchUT':
				heatPumpSubsidy = 60000;
				break;
			case 'VzduchVzduchUTWater':
				heatPumpSubsidy = 80000;
				break;
			case 'VzduchVzduchUTWaterFVE':
				heatPumpSubsidy = 140000;
				break;
			case 'VzduchVodaUT':
				heatPumpSubsidy = 80000;
				break;
			case 'VzduchVodaUTWater':
				heatPumpSubsidy = 100000;
				break;
			case 'VzduchVodaUTWaterFVE':
				heatPumpSubsidy = 140000;
				break;
			case 'ZemeVodaUTWater':
				heatPumpSubsidy = 140000;
				break;
			case 'ZemeVodaUT':
				heatPumpSubsidy = 120000;
				break;
			case 'VodaVodaUTWater':
				heatPumpSubsidy = 140000;
				break;
			case 'VodaVodaUT':
				heatPumpSubsidy = 120000;
				break;
			case 'KotelBio':
				heatPumpSubsidy = 80000;
				break;
		}

		// Přepsání textu tepelného čerpadla
		heatPumpInfo = `Tepelné čerpadlo (${heatPumpType}) - Výše dotace: ${heatPumpSubsidy.toLocaleString('cs-CZ')} Kč.`;
		calculationData.heatPumpInfo = heatPumpInfo; // Přidání textu tepelného čerpadla do dat

		console.log('Selected heat pump info:', heatPumpInfo);
	}
	// Příprava dat pro odeslání
	const dataToSend = {
		opID: selectedOPID,
		clientData: clientData,
		propertyData: propertyData,
		calculationData: calculationData,
	};

	console.log('Data odeslána do Raynet:', dataToSend);

	// Odeslání dat na Make webhook
	fetch('https://hook.eu2.make.com/ons91s93vaj1kalosj5s6nwgvxvw7bk4', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(dataToSend),
	})
		.then((response) => {
			if (response.ok) {
				return response.text();
			} else {
				throw new Error('Chyba při odesílání: ' + response.statusText);
			}
		})
		.then((data) => {
			console.log('Odpověď:', data);
			if (data === 'Accepted') {
				alert('Data úspěšně odeslána.');
			} else {
				console.log('Odpověď není ve formátu JSON, přijatý text:', data);
			}
		})
		.catch((error) => {
			console.error('Chyba při odesílání:', error);
			alert('Chyba při odesílání dat.');
		});
}

// Povolení odesílacího tlačítka po výběru OP
function enableSubmitButton() {
	const opListSelect = document.getElementById('opListSelect');
	const uploadDataButton = document.getElementById('uploadDataButton');

	if (opListSelect && opListSelect.value) {
		uploadDataButton.disabled = false;
	} else {
		uploadDataButton.disabled = true;
	}
}

document.getElementById('opListSelect').addEventListener('change', enableSubmitButton);
function printOffer() {
	window.print(); // Přímo spustí tisk bez manipulace s DOM
}
document.getElementById('selectedRegionBonus').addEventListener('change', function () {
	calculateEverything();
});
