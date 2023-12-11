dataFiltering();

function dataFiltering() {
	let subjects = subjectData;

	subjects.sort(function (a, b) {
		return b.Percentage - a.Percentage;
	})

	let selectBox = document.getElementById("region");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;
	if (selectedValue !== "Default") {
		subjects = subjects.filter(item => item.Category === selectedValue);
	}
	const firstFiveRows = subjects.filter((item, index) => index < 15);
	renderBarChart(firstFiveRows);
}

function dataManipulation() {
	let selectBox = document.getElementById("region");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;

	dataFiltering();
}