
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
		vis.margin = { top: 50, right: 80, bottom: 80, left: 100, xAxisPadding: -8, yAxisPadding: 10 };

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
		// console.log(vis.data)

		let lowestSatDataPoint = allData.reduce((min, current) => {
			return current.avg_sat < min.avg_sat ? current : min;
		}, allData[0]);
		let highestSatDataPoint = allData.reduce((max, current) => {
			return current.avg_sat > max.avg_sat ? current : max;
		}, allData[0]);


		// Scatterplot Scales
		vis.xScale = d3.scaleLinear()
			.domain([d3.min(vis.data, d => d.avg_sat), d3.max(vis.data, d => d.avg_sat)])
			.range([0, vis.width]);

		vis.yScale = d3.scaleLinear()
			.domain([0, d3.max(vis.data, d => d.comp_rate)])
			.range([vis.height, 0]);

		// Calculate the least squares regression line
		const regressionLine = d3.line()
			.x(d => vis.xScale(d.avg_sat))
			.y(d => vis.yScale(regressionEquation(d.avg_sat)))
			.curve(d3.curveLinear);

		function regressionEquation(x) {
			// Implement your regression equation here
			// This is a simple linear regression for demonstration purposes
			// You may want to use a library like 'regression-js' for more complex regressions
			// For a simple linear regression: y = mx + b
			const n = vis.data.length;
			const sumX = vis.data.reduce((acc, d) => acc + d.avg_sat, 0);
			const sumY = vis.data.reduce((acc, d) => acc + d.comp_rate, 0);
			const sumXY = vis.data.reduce((acc, d) => acc + d.avg_sat * d.comp_rate, 0);
			const sumXSquare = vis.data.reduce((acc, d) => acc + d.avg_sat ** 2, 0);

			const m = (n * sumXY - sumX * sumY) / (n * sumXSquare - sumX ** 2);
			const b = (sumY - m * sumX) / n;
			return m * x + b;
		}

		// Draw the line of best fit
		vis.svg.append("path")
			.datum(vis.data)
			.attr("class", "line")
			.attr("d", regressionLine)
			.style("stroke-width", 5)
			.style("stroke", "red")
			.style("opacity", ".7");

		vis.tooltip = vis.svg.append("foreignObject")
			.attr("width", 200)
			.attr("height", 300)
			.attr("x", 10)
			.attr("y", 20)
			.append("xhtml:div")
			.style("opacity", 0)
			.style("user-select", "none")
			.style("position", "absolute")
			.style("background-color", "green")
			.style("padding", "10px")
			.style("border", "1px solid #ccc")
			.style("border-radius", "5px")
			.style("pointer-events", "none");

		// Draw circles for each data point
		vis.svg.selectAll(".dot")
			.data(vis.data)
			.enter()
			.append("circle")
			.attr("class", "dot")
			.attr("fill", "green")
			.attr("stroke", "yellow")
			.attr("cx", d => vis.xScale(d.avg_sat))
			.attr("cy", d => vis.yScale(d.comp_rate))
			.attr("r", 5)
			.on("mouseover", function (event, d) {
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


		// Add axes
		vis.xAxis = d3.axisBottom(vis.xScale);
		vis.yAxis = d3.axisLeft(vis.yScale).tickFormat(d3.format(".0%")); // Format ticks as percentages

		vis.svg.append("g")
			.attr("transform", "translate(0," + (vis.height + vis.margin.yAxisPadding) + ")")
			.call(vis.xAxis);

		vis.svg.append("g")
			// .attr("transform", "translate(0," + (0 - vis.margin.xAxisPadding) + ")")
			.attr("transform", "translate(" + (vis.margin.xAxisPadding) + ", 0)")
			.call(vis.yAxis);

		// Add x-axis label
		vis.svg.append("text")
			.attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + vis.margin.top + 8) + ")")
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
			.attr("y", 0 - (vis.margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.text("SAT Scores vs. 4-Year Bachelor's Degree Completion Rates");

		// Add instructions label
		vis.svg.append("text")
			.attr("x", vis.margin.left + 130)
			.attr("y", vis.margin.top - 40)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("fill", "red")
			.style("font-weight", "bold")
			.text("Hover over a point to view info about a specific school");

		vis.wrangleData();
	}

	wrangleData() {
		let vis = this;

		vis.displayData = vis.data;

		vis.updateVis();
	}

	updateVis() {
		let vis = this;
	}
}