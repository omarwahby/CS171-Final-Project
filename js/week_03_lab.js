
// Global variable with 60 attractions (JSON format)
// console.log(attractionData);

dataFiltering();

function dataFiltering() {
	let attractions = attractionData;

	console.log('hello from your js file. Good luck with the lab!')

	
	// Sorting code fixed (needed to change from 'visitors' to 'Visitors')
	attractions.sort(function (a, b) {
		return b.Visitors - a.Visitors;
	})

	console.log('Sorted Array', attractions);

	/* **************************************************
	 *
	 * ADD YOUR CODE HERE FILTERING THE ARRAY HERE
	 *
	 * CALL THE FOLLOWING FUNCTION TO RENDER THE BAR-CHART:
	 *
	 * renderBarChart(data)
	 *
	 * - 'data' must be an array of JSON objects
	 * - the max. length of 'data' is 5
	 *
	 * **************************************************/
	// Check if the selected category is “all”, otherwise filter the attractions by category.
	let selectBox = document.getElementById("attraction-category");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;
	if (selectedValue !== "Default") {
		attractions = attractions.filter(item => item.Category === selectedValue);
	}
	console.log('Sorted Array filtered by the \'' + selectedValue + '\' category', attractions);
	// Use the filter() method to get the first five rows
	const firstFiveRows = attractions.filter((item, index) => index < 15);
	renderBarChart(firstFiveRows);
}

function dataManipulation() {
	let selectBox = document.getElementById("attraction-category");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;

	// You can now use the selectedValue variable for further manipulation
	console.log("Selected Value:", selectedValue);

	dataFiltering();
}