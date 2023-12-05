
/*
 * ScatterPlotVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class ScatterPlotVis {

	constructor(_parentElement, _data, _eventHandler) {
		this.parentElement = _parentElement;
		this.data = _data;
		//this.eventHandler =

		this.initVis();
	}


	/*
	 * Initialize visualization (static content, e.g. SVG area or axes)
	 */

	initVis() {
		let vis = this;

		// Initialize the svg essentials
		vis.margin = { top: 120, right: 220, bottom: 80, left: 100, xAxisPadding: -8, yAxisPadding: 10 };

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
			vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// Clean the data before we initialize the vis
		vis.data = vis.data.filter(function (schoolObject) {
			// Check if any attribute is null or NaN
			return (
				schoolObject.avg_sat !== null &&
				!isNaN(schoolObject.avg_sat) &&
				schoolObject.comp_rate !== null &&
				!isNaN(schoolObject.comp_rate)
			);
		});

		vis.displayData = vis.data
		console.log(vis.displayData)

		// Scatterplot Scales
		vis.xScale = d3.scaleLinear()
			.domain([d3.min(vis.displayData, d => d.avg_sat), d3.max(vis.displayData, d => d.avg_sat)])
			.range([0, vis.width]);

		vis.yScale = d3.scaleLinear()
			.domain([0, d3.max(vis.displayData, d => d.comp_rate)])
			.range([vis.height, 0]);

		// Add axes
		vis.xAxis = d3.axisBottom(vis.xScale);
		vis.yAxis = d3.axisLeft(vis.yScale).tickFormat(d3.format(".0%")); // Format ticks as percentages
		// Add axes groups
		vis.svg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + (vis.height + vis.margin.yAxisPadding) + ")")
			.call(vis.xAxis);
		vis.svg.append("g")
			.attr("class", "y-axis")
			// .attr("transform", "translate(0," + (0 - vis.margin.xAxisPadding) + ")")
			.attr("transform", "translate(" + (vis.margin.xAxisPadding) + ", 0)")
			.call(vis.yAxis);

		// Add SAT range instructions label
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", -70)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "red")
			.style("font-weight", "bold")
			.text("Filter data by averge SAT score range");

		// Add SAT range score labels
		vis.startScore = vis.svg.append("text")
			.attr("x", (vis.width / 2) - 270)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "black")
			.style("font-weight", "regular")
			.text(d3.format(".0f")(d3.min(vis.displayData, (d) => d.avg_sat)));
		vis.endScore = vis.svg.append("text")
			.attr("x", (vis.width / 2) + 271)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "black")
			.style("font-weight", "regular")
			.text(d3.format(".0f")(d3.max(vis.displayData, (d) => d.avg_sat)));

		// SLIDER
		// Create a foreignObject within the SVG
		const sliderObject = vis.svg
			.append("foreignObject")
			.attr("width", 500)
			.attr("height", 20)
			.attr("y", vis.margin.top - 180)
			.attr("x", (vis.width / 2) - 250);

		// Create an HTML div inside the sliderObject to contain the slider
		const divContainer = sliderObject
			.append("xhtml:div")
			.style("width", "100%")
			.style("height", "100%");

		// Create the slider inside the divContainer
		const slider = divContainer.node();
		noUiSlider.create(slider, {
			start: [d3.min(vis.displayData, (d) => d.avg_sat), d3.max(vis.displayData, (d) => d.avg_sat)],
			connect: true,
			step: 1,
			range: {
				min: d3.min(vis.displayData, (d) => d.avg_sat),
				max: d3.max(vis.displayData, (d) => d.avg_sat)
			}
		});

		// Attach an event listener to the slider
		slider.noUiSlider.on('slide', function (values, handle) {
			// Get the start and end date values from the slider
			const [startScore, endScore] = values.map(score => d3.format(".0f")(score));

			// Set the text content with rounded values
			vis.startScore.text(startScore);
			vis.endScore.text(endScore);
			// Filter the data based on the selected date range
			vis.displayData = vis.data.filter(d => d.avg_sat >= startScore && d.avg_sat <= endScore);

			// Update the visualization
			vis.updateVis();
		});

		// // Add range sliders for min and max values
		// vis.minSlider = vis.svg
		// 	.append("foreignObject")
		// 	.attr("width", 350)
		// 	.attr("height", 50)
		// 	.attr("y", vis.margin.top - 60)
		// 	.attr("x", vis.margin.left - 25)
		// 	.append("xhtml:input")
		// 	.attr("type", "range")
		// 	.attr("min", d3.min(vis.displayData, (d) => d.avg_sat))
		// 	.attr("max", d3.max(vis.displayData, (d) => d.avg_sat))
		// 	.attr("value", d3.min(vis.displayData, (d) => d.avg_sat))
		// 	.attr("step", 1)
		// 	.style("width", "100%")
		// 	.style("height", "100%");

		// vis.maxSlider = vis.svg
		// 	.append("foreignObject")
		// 	.attr("width", 350)
		// 	.attr("height", 50)
		// 	.attr("y", vis.margin.top - 60)
		// 	.attr("x", vis.margin.left - 25)
		// 	.append("xhtml:input")
		// 	.attr("type", "range")
		// 	.attr("min", d3.min(vis.displayData, (d) => d.avg_sat))
		// 	.attr("max", d3.max(vis.displayData, (d) => d.avg_sat))
		// 	.attr("value", d3.max(vis.displayData, (d) => d.avg_sat))
		// 	.attr("step", 1)
		// 	.style("width", "100%")
		// 	.style("height", "100%");

		// // SAT Score Label
		// vis.scoreLabel = vis.svg
		// 	.append("text")
		// 	.attr("x", vis.margin.left + 150)
		// 	.attr("y", vis.margin.top - 5)
		// 	.attr("text-anchor", "middle")
		// 	.style("font-size", "20px")
		// 	.style("fill", "black")
		// 	.style("font-weight", "regular")
		// 	.text(
		// 		"Selected SAT Score Range: " +
		// 		vis.minSlider.property("value") +
		// 		" - " +
		// 		vis.maxSlider.property("value")
		// 	);

		// // Add event listeners to both sliders
		// vis.minSlider.on("input", updateSliderValues);
		// vis.maxSlider.on("input", updateSliderValues);

		// function updateSliderValues() {
		// 	// Update the displayed value
		// 	vis.scoreLabel.text(
		// 		"Selected SAT Score Range: " +
		// 		vis.minSlider.property("value") +
		// 		" - " +
		// 		vis.maxSlider.property("value")
		// 	);

		// 	// Filter data based on the selected range
		// 	vis.displayData = vis.data.filter(
		// 		(d) =>
		// 			d.avg_sat >= vis.minSlider.property("value") &&
		// 			d.avg_sat <= vis.maxSlider.property("value")
		// 	);

		// 	vis.svg
		// 		.selectAll(".dot")
		// 		.data(vis.displayData, (d) => d.school_id)
		// 		.selectAll("circle")
		// 		.transition()
		// 		.attr("cx", (d) => vis.xScale(d.avg_sat))
		// 		.attr("cy", (d) => vis.yScale(d.comp_rate));

		// 	// Update the visualization
		// 	vis.updateVis();
		// }

		// Hover instructions label
		vis.svg.append("text")
			.attr("x", vis.width / 2)
			.attr("y", -15)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "red")
			.style("font-weight", "bold")
			.text("Hover over a point to view info about a specific school");

		// Add x-axis label
		vis.svg.append("text")
			.attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + 50) + ")")
			.style("text-anchor", "middle")
			.style("font-size", "24px")
			.text("Average SAT Score");

		// Add y-axis label
		vis.svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - vis.margin.left + 10)
			.attr("x", 0 - (vis.height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.style("font-size", "24px")
			.text("Completion Rate (%)");

		// Add plot title
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", 0 - (vis.margin.top / 2) - 35)
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.text("SAT Scores vs. 4-Year Bachelor's Degree Completion Rates");


		vis.tooltip = vis.svg.append("foreignObject")
			.attr("width", 200)
			.attr("height", 300)
			// .attr("x", 10)
			// .attr("y", 90)
			.attr("x", 100)
			.attr("y", -115)
			.append("xhtml:div")
			.style("opacity", 0)
			.style("user-select", "none")
			.style("position", "absolute")
			.style("background-color", "green")
			.style("padding", "10px")
			.style("border", "1px solid #ccc")
			.style("border-radius", "5px")
			.style("pointer-events", "none");

		vis.wrangleData();
	}

	wrangleData() {
		let vis = this;
		vis.updateVis();
	}

	updateVis() {
		let vis = this;
		// console.log(vis.displayData.length)

		// Scatterplot Scales
		vis.xScale = d3.scaleLinear()
			.domain([d3.min(vis.displayData, d => d.avg_sat), d3.max(vis.displayData, d => d.avg_sat)])
			.range([0, vis.width]);

		vis.yScale = d3.scaleLinear()
			.domain([0, d3.max(vis.displayData, d => d.comp_rate)])
			.range([vis.height, 0]);

		// Add axes
		vis.xAxis = d3.axisBottom(vis.xScale);
		vis.yAxis = d3.axisLeft(vis.yScale).tickFormat(d3.format(".0%")); // Format ticks as percentages
		// Add axes groups

		// Update x-axis and y-axis based on the new scales
		vis.svg.select(".x-axis")
			.transition()  // You can add transitions for a smooth update
			.call(vis.xAxis);

		vis.svg.select(".y-axis")
			.transition()
			.call(vis.yAxis);

		// // Calculate the least squares regression line
		// const regressionLine = d3.line()
		// 	.x(d => vis.xScale(d.avg_sat))
		// 	.y(d => vis.yScale(regressionEquation(d.avg_sat)))
		// 	.curve(d3.curveLinear);

		// function regressionEquation(x) {
		// 	// Implement your regression equation here
		// 	// This is a simple linear regression for demonstration purposes
		// 	// You may want to use a library like 'regression-js' for more complex regressions
		// 	// For a simple linear regression: y = mx + b
		// 	const n = vis.displayData.length;
		// 	const sumX = vis.displayData.reduce((acc, d) => acc + d.avg_sat, 0);
		// 	const sumY = vis.displayData.reduce((acc, d) => acc + d.comp_rate, 0);
		// 	const sumXY = vis.displayData.reduce((acc, d) => acc + d.avg_sat * d.comp_rate, 0);
		// 	const sumXSquare = vis.displayData.reduce((acc, d) => acc + d.avg_sat ** 2, 0);

		// 	const m = (n * sumXY - sumX * sumY) / (n * sumXSquare - sumX ** 2);
		// 	const b = (sumY - m * sumX) / n;
		// 	return m * x + b;
		// }

		// // Draw the line of best fit
		// vis.svg.append("path")
		// 	.datum(vis.displayData)
		// 	.attr("class", "line")
		// 	.attr("d", regressionLine)
		// 	.style("stroke-width", 5)
		// 	.style("stroke", "red")
		// 	.style("opacity", ".7");

		// Update circles based on the new scales
		let circles = vis.svg.selectAll(".dot")
			.data(vis.displayData, d => d.school_id);

		circles.enter()
			.append("circle")
			.attr("class", "dot")
			.attr("fill", "green")
			.attr("stroke", "yellow")
			.attr("r", 5)
			.merge(circles)  // Merge enter and update selections
			.transition()
			.attr("cx", d => vis.xScale(d.avg_sat))
			.attr("cy", d => vis.yScale(d.comp_rate));

		circles.exit().remove();  // Remove unused circles

		// Tooltip interactions
		circles.on("mouseover", function (event, d) {
			d3.select(this)
				.attr("fill", "red")
				.attr("opacity", .6)
				.attr("r", 10);
			vis.tooltip.transition()
				.duration(200)
				.style("opacity", 1);
			vis.tooltip.html(`<strong>${d.school_name}</strong><br>Average SAT Score: ${d.avg_sat}<br> Completion Rate: ${(d.comp_rate * 100).toFixed(2)}%`)
				.style("font-family", "Arial, sans-serif")
				.style("font-size", "14px")
				.style("color", "yellow");
		})
			.on("mouseout", function (d) {
				d3.select(this)
					.attr("fill", "green")
					.attr("opacity", 1)
					.attr("r", 5);
				vis.tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});
	}
}