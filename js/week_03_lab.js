dataFiltering();

function dataFiltering() {
	let attractions = attractionData;

	attractions.sort(function (a, b) {
		return b.Visitors - a.Visitors;
	})

	let selectBox = document.getElementById("attraction-category");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;
	if (selectedValue !== "Default") {
		attractions = attractions.filter(item => item.Category === selectedValue);
	}
	const firstFiveRows = attractions.filter((item, index) => index < 15);
	renderBarChart(firstFiveRows);
}

function dataManipulation() {
	let selectBox = document.getElementById("attraction-category");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;

	dataFiltering();
}