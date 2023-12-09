
/*
 * MeritPlotVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class MeritPlotVis {

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

		vis.calloutSchools = new Set([
			"University of California-Berkeley",
			"Michigan State University",
			"University of Florida",
			"Harvard University",
			"University of Texas at Austin",
			"University of Virginia",
			"University of Georgia",
			"Worcester State University",
			"Indiana State University",
		]);

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
				schoolObject.comp_rate !== null &&
				!isNaN(schoolObject.comp_rate) &&
				schoolObject.comp_rate > .02
			);
		});

		vis.displayData = vis.data

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
			.text("Filter data by average SAT score range");

		// Add SAT range score labels
		vis.startScore = vis.svg.append("text")
			.attr("x", (vis.width / 2) - 280)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "white")
			.style("font-weight", "regular")
			.text(d3.format(".0f")(d3.min(vis.displayData, (d) => d.avg_sat)));
		vis.endScore = vis.svg.append("text")
			.attr("x", (vis.width / 2) + 280)
			.attr("y", -45)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "white")
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
			.text("Average SAT Score");

		// Add y-axis label
		vis.svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - vis.margin.left + 10)
			.attr("x", 0 - (vis.height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.style("font-size", "24px")
			.attr("fill", "white")
			.text("Completion Rate (%)");

		// Add plot title
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", 0 - (vis.margin.top / 2) - 35)
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.attr("fill", vis.primary_color)
			.text("SAT Scores vs. Completion Rates (Graduated in 4 years)");


		vis.tooltip = d3.select("body").append("foreignObject")
			.attr("width", 200)
			.attr("height", 300)
			.append("xhtml:div")
			.style("user-select", "none")
			.style("position", "absolute")
			.style("background-color", "white")
			.style("padding", "10px")
			.style("border", "1px solid")
			.style("font-weight", "700")
			.style("border-color", vis.primary_color)
			.style("border-radius", "5px")
			.style("pointer-events", "none")
			.style("font-family", "Arial, sans-serif")
			.style("font-size", "14px")
			.style("color", vis.secondary_color);

		vis.wrangleData();
	}

	wrangleData() {
		let vis = this;
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

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
			.x(d => vis.xScale(d.avg_sat))
			.y(d => vis.yScale(regressionEquation(d.avg_sat)))
			.curve(d3.curveLinear);

		function regressionEquation(x) {
			// simple linear regression: y = mx + b
			const n = vis.displayData.length;
			const sumX = vis.displayData.reduce((acc, d) => acc + d.avg_sat, 0);
			const sumY = vis.displayData.reduce((acc, d) => acc + d.comp_rate, 0);
			const sumXY = vis.displayData.reduce((acc, d) => acc + d.avg_sat * d.comp_rate, 0);
			const sumXSquare = vis.displayData.reduce((acc, d) => acc + d.avg_sat ** 2, 0);

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
			.attr("cx", d => vis.xScale(d.avg_sat))
			.attr("cy", d => vis.yScale(d.comp_rate))
			.attr("stroke", "black");

		old_circles.exit().remove();

		// Add new circles for data points that enter the range
		let new_circles = old_circles.enter()
			.append("circle")
			.attr("class", "dot")
			.attr("r", 5)
			.attr("stroke", "black")
			.style("fill", vis.primary_color)
			.attr("cx", d => vis.xScale(d.avg_sat))
			.attr("cy", d => vis.yScale(d.comp_rate));

		// Logic for adding new callouts
		new_circles.each(d => {
			if (vis.calloutSchools.has(d.school_name)) {

				new_circles.filter(school => school === d)
					.attr("r", 8)
					.style("fill", "crimson")
					.raise();

				let validClassName = getValidClassName(d.school_name);

				vis.svg.append("text")
					.attr("class", `${validClassName}`)
					.attr("x", vis.xScale(d.avg_sat))
					.attr("y", vis.yScale(d.comp_rate) + 10)
					.attr("text-anchor", "left")
					.text(() => {
						if (vis.calloutSchools.has(d.school_name)) {
							return d.school_name;
						}
					})
					.attr("font-weight", "400")
					.attr("fill", "white")
					.style("user-select", "none")
					.style("pointer-events", "none");
			}
		});

		// Logic for updating location of callouts as scatterplot shifts
		old_circles.each(d => {

			if (vis.calloutSchools.has(d.school_name)) {

				let validClassName = getValidClassName(d.school_name);
				vis.svg.selectAll(`.${validClassName}`)
					.attr("x", vis.xScale(d.avg_sat))
					.attr("y", vis.yScale(d.comp_rate) + 10);
			}
		});

		// Logic for removing callouts when circles are removed
		let exitSelection = old_circles.exit();
		exitSelection.each(d => {
			let validClassName = getValidClassName(d.school_name);

			if (vis.calloutSchools.has(d.school_name)) {
				vis.svg.selectAll(`.${validClassName}`).remove();
			}
		});

		// Helper function to get a valid class name
		function getValidClassName(name) {
			let validClassName = name.replace(/\s+/g, "_"); // Replace spaces with underscores
			validClassName = validClassName.replace(/[^a-zA-Z0-9-_]/g, ""); // Remove other special characters
			return validClassName;
		}

		// // Tooltip interactions
		new_circles
			.on("mouseover", function (event, d) {
				d3.select(this)
					.attr("opacity", .6)
					.attr("r", this.r.baseVal.value + 5);
				vis.tooltip.transition()
					.duration(200)
					.style("opacity", 0.8);
				vis.tooltip.html(`${d.school_name}<br>Average SAT Score: ${d.avg_sat}<br> Completion Rate: ${(d.comp_rate * 100).toFixed(2)}%`)
					.style("left", (event.pageX) + "px")
					.style("top", (event.pageY) + "px");
			})
			.on("mouseout", function (d) {
				d3.select(this)
					.attr("opacity", 1)
					.attr("r", this.r.baseVal.value - 5);
				vis.tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

		new_circles.merge(old_circles);
	}
}