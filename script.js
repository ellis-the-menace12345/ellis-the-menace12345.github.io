
let infoSection = document.getElementById('country-info');
let borderingCountriesSection = document.getElementById('bordering-countries');
let submitButton = document.getElementById('form-submit-button');
let formInput = document.getElementById("form-input");

function findCountryByPredicate(json, predicate) {
	let result = [];
	for (countryId in json) {
		let country = json[countryId];

		if (predicate(country)) {
			result.push(country);
		}
	}

	return result;
}

function findCountryByName(json, countryName) {
	let result = findCountryByPredicate(json, (country) => countryName === country["name"]["common"]);
	if (result.length === 0) {
		return null;
	}
	return result[0];
}

function findCountryByCode(json, countryCode) {
	let result = findCountryByPredicate(json, (country) => countryCode === country["cca3"]);
	if (result.length === 0) {
		return null;
	}
	return result[0];
}

function toCountry(country) {
	return {
		"capital": country["capital"],
		"name": country["name"]["common"],
		"population": country["population"],
		"region": country["region"],
		"flag": country["flag"],
	};
}

async function getCountryInfo(countryName) {
	let url = `https://restcountries.com/v3.1/all?fileds=${countryName}`;
	let response = await fetch(url);
	let responseJSON = await response.json();
	let country = findCountryByName(responseJSON, countryName);

	if (country === null) {
		return null;
	}
	console.log(country);
	
	let result = toCountry(country);
	result["neighbors"] = country["borders"].map((x) => toCountry(findCountryByCode(responseJSON, x)));
	return result;
}

function changeSections(country) {
	if (country === null) {
		showErrors();
		return;
	}
	infoSection.innerHTML = `<h1>Information</h1><p>${country["name"]} is a country with the flag ${country["flag"]} and a total population of ${country["population"]}. It is located in ${country["region"]}.</p>`;	

	if (country["neighbors"].length == 0) {
		borderingCountriesSection.innerHTML = `<h1>Neighbors</h1><p>${country["name"]} has no neighbors.`;
	}

	let borderingString = `<h1>Neighbors</h1><p>${country["name"]} has neighbors: `;
	let neighbors = country["neighbors"];
	for (let i = 0; i < neighbors.length - 1; i++) {
		borderingString += neighbors[i]["name"] + neighbors[i]["flag"] + ", ";
	}
	console.log(neighbors[neighbors.length - 1]);
	let last = neighbors[neighbors.length - 1];
	borderingString += last["name"] + last["flag"];
	borderingString += "</p>";
	borderingCountriesSection.innerHTML = borderingString;
}

function showErrors() {
	infoSection.innerHTML = `<h1>Information</h1><p>No information available for given country.</p>`;	
}

function displayCountryInfo(country) {
	let info = getCountryInfo(country)
		.then((country) => changeSections(country))
		.catch((error) => console.log(error));
}


submitButton.addEventListener("click", () => displayCountryInfo(formInput.value));
