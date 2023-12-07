
/*
 * NotMeritPlotVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class NotMeritPlotVis {

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

		vis.primary_color = "#ff6127"
		vis.secondary_color = "26272f"

		// Initialize the svg essentials
		vis.margin = { top: 120, right: 180, bottom: 80, left: 100, xAxisPadding: -8, yAxisPadding: 10 };

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
				schoolObject.avg_fam_inc !== null &&
				!isNaN(schoolObject.avg_fam_inc)
			);
		});

		vis.displayData = vis.data
		// console.log(vis.displayData)

		// Scatterplot Scales
		vis.xScale = d3.scaleLinear()
			.domain([d3.min(vis.displayData, d => d.avg_fam_inc), d3.max(vis.displayData, d => d.avg_fam_inc)])
			.range([0, vis.width]);

		vis.yScale = d3.scaleLinear()
			.domain([0, d3.max(vis.displayData, d => d.avg_sat)])
			.range([vis.height, 0]);

		// Add axes
		vis.xAxis = d3.axisBottom(vis.xScale);
		vis.yAxis = d3.axisLeft(vis.yScale);

		// Add axes groups
		vis.xAxisGroup = vis.svg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + (vis.height + vis.margin.yAxisPadding) + ")")
			.call(vis.xAxis);
		vis.yAxisGroup = vis.svg.append("g")
			.attr("class", "y-axis")
			// .attr("transform", "translate(0," + (0 - vis.margin.xAxisPadding) + ")")
			.attr("transform", "translate(" + (vis.margin.xAxisPadding) + ", 0)")
			.call(vis.yAxis);

		vis.yAxisGroup.selectAll("path")
			.attr("fill", "none")
			.attr("stroke", "white");
		vis.yAxisGroup.selectAll("line")
			.attr("fill", "white")
			.attr("stroke", "white");
		vis.yAxisGroup.selectAll("text")
			.attr("fill", "white");
		vis.xAxisGroup.selectAll("path")
			.attr("fill", "none")
			.attr("stroke", "white");
		vis.xAxisGroup.selectAll("line")
			.attr("fill", "white")
			.attr("stroke", "white");
		vis.xAxisGroup.selectAll("text")
			.attr("fill", "white");

		// Add SAT range instructions label
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", -70)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "white")
			.style("font-weight", "light")
			.text("Filter data by average household income range");

		// Add SAT range score labels
		vis.startIncome = vis.svg.append("text")
			.attr("x", (vis.width / 2) - 290)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "white")
			.style("font-weight", "regular")
			.text("$" + d3.format(".0f")(d3.min(vis.displayData, (d) => d.avg_fam_inc)));
		vis.endIncome = vis.svg.append("text")
			.attr("x", (vis.width / 2) + 290)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "white")
			.style("font-weight", "regular")
			.text("$" + d3.format(".0f")(d3.max(vis.displayData, (d) => d.avg_fam_inc)));

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
			start: [d3.min(vis.displayData, (d) => d.avg_fam_inc), d3.max(vis.displayData, (d) => d.avg_fam_inc)],
			connect: true,
			step: 1,
			range: {
				min: d3.min(vis.displayData, (d) => d.avg_fam_inc),
				max: d3.max(vis.displayData, (d) => d.avg_fam_inc)
			}
		});

		// Attach an event listener to the slider
		slider.noUiSlider.on('slide', function (values, handle) {
			// Get the start and end date values from the slider
			const [startIncome, endIncome] = values.map(score => d3.format(".0f")(score));

			// Set the text content with rounded values
			vis.startIncome.text("$" + startIncome);
			vis.endIncome.text("$" + endIncome);
			// Filter the data based on the selected date range
			vis.displayData = vis.data.filter(d => d.avg_fam_inc >= startIncome && d.avg_fam_inc <= endIncome);

			// Update the visualization
			vis.updateVis();
		});

		// Hover instructions label
		vis.svg.append("text")
			.attr("x", vis.width / 2)
			.attr("y", -15)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "white")
			.style("font-weight", "light")
			.text("Hover over a point to view info about a specific school");

		// Add x-axis label
		vis.svg.append("text")
			.attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + 57) + ")")
			.style("text-anchor", "middle")
			.style("font-size", "24px")
			.attr("fill", "white")
			.text("Average Household Income per year ($)");

		// Add y-axis label
		vis.svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - vis.margin.left + 10)
			.attr("x", 0 - (vis.height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.style("font-size", "24px")
			.attr("fill", "white")
			.text("Average SAT Score");

		// Add plot title
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", 0 - (vis.margin.top / 2) - 35)
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.attr("fill", vis.primary_color)
			.text("Relationship between Avg. Household Income and SAT Scores");


		vis.tooltip = d3.select("body").append("foreignObject")
			.attr("width", 200)
			.attr("height", 300)
			.append("xhtml:div")
			.style("opacity", .5)
			.style("user-select", "none")
			.style("position", "absolute")
			.style("background-color", "white")
			.style("padding", "10px")
			.style("border", "1px solid")
			.style("border-color", vis.primary_color)
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
			.domain([d3.min(vis.displayData, d => d.avg_fam_inc), d3.max(vis.displayData, d => d.avg_fam_inc)])
			.range([0, vis.width]);

		vis.yScale = d3.scaleLinear()
			.domain([0, d3.max(vis.displayData, d => d.avg_sat)])
			.range([vis.height, 0]);

		// Add axes
		vis.xAxis = d3.axisBottom(vis.xScale)
			.tickFormat(d3.format("$,")); // Format ticks as dollars
		vis.yAxis = d3.axisLeft(vis.yScale);

		vis.yAxisGroup.selectAll("path")
			.attr("fill", "none")
			.attr("stroke", "white");
		vis.yAxisGroup.selectAll("line")
			.attr("fill", "white")
			.attr("stroke", "white");
		vis.yAxisGroup.selectAll("text")
			.attr("fill", "white");
		vis.xAxisGroup.selectAll("path")
			.attr("fill", "none")
			.attr("stroke", "white");
		vis.xAxisGroup.selectAll("line")
			.attr("fill", "white")
			.attr("stroke", "white");
		vis.xAxisGroup.selectAll("text")
			.attr("fill", "white");

		// Update x-axis and y-axis based on the new scales
		vis.svg.select(".x-axis")
			.transition()  // You can add transitions for a smooth update
			.call(vis.xAxis);

		vis.svg.select(".y-axis")
			.transition()
			.call(vis.yAxis);

		// Calculate the least squares regression line
		const regressionLine = d3.line()
			.x(d => vis.xScale(d.avg_fam_inc))
			.y(d => vis.yScale(regressionEquation(d.avg_fam_inc)))
			.curve(d3.curveLinear);

		function regressionEquation(x) {
			// simple linear regression: y = mx + b
			const n = vis.displayData.length;
			const sumX = vis.displayData.reduce((acc, d) => acc + d.avg_fam_inc, 0);
			const sumY = vis.displayData.reduce((acc, d) => acc + d.avg_sat, 0);
			const sumXY = vis.displayData.reduce((acc, d) => acc + d.avg_fam_inc * d.avg_sat, 0);
			const sumXSquare = vis.displayData.reduce((acc, d) => acc + d.avg_fam_inc ** 2, 0);

			const m = (n * sumXY - sumX * sumY) / (n * sumXSquare - sumX ** 2);
			const b = (sumY - m * sumX) / n;
			return m * x + b;
		}

		// Remove previous regression line before drawing new one
		vis.svg.selectAll(".reg-line").remove();
		// Draw the line of best fit
		vis.svg.append("path")
			.datum(vis.displayData)
			.attr("class", "reg-line")
			.attr("d", regressionLine)
			.style("stroke-width", 5)
			.style("stroke", "white")
			.style("opacity", ".7");



		let old_circles = vis.svg.selectAll(".dot")
			.data(vis.displayData, d => d.school_id);

		old_circles // Add new circles for data points that enter the range
			.attr("class", "dot")
			.merge(old_circles) // Merge with existing circles
			.transition()
			.duration(200)
			.attr("cx", d => vis.xScale(d.avg_fam_inc))
			.attr("cy", d => vis.yScale(d.avg_sat))
			.attr("r", 5)
			.attr("stroke", "black")
			.style("fill", vis.primary_color);

		old_circles.exit().remove();

		// Add new circles for data points that enter the range
		let new_circles = old_circles.enter()
			.append("circle")
			.attr("class", "dot")
			.attr("r", 5)
			.attr("stroke", "black")
			.style("fill", vis.primary_color);

		new_circles
			.attr("cx", d => vis.xScale(d.avg_fam_inc))
			.attr("cy", d => vis.yScale(d.avg_sat));

		// // Tooltip interactions
		new_circles
			.on("mouseover", function (event, d) {
				d3.select(this)
					.attr("opacity", .6)
					.attr("r", 10);
				vis.tooltip.transition()
					.duration(200)
					.style("opacity", 1);
				vis.tooltip.html(`${d.school_name}<br>Average Household Income/yr : ${Math.round(d.avg_fam_inc)}$<br> Average SAT Score: ${(d.avg_sat)}`)
					.style("left", (event.pageX) + "px")
					.style("top", (event.pageY) + "px")
					.style("font-family", "Arial, sans-serif")
					.style("font-size", "14px")
					.style("color", vis.primary_color);
			})
			.on("mouseout", function (d) {
				d3.select(this)
					.attr("opacity", 1)
					.attr("r", 5);
				vis.tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

		new_circles.merge(old_circles);
	}
}