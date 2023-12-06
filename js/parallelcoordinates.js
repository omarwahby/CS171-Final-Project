
/*
 * ParallelCoordinatesVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class ParallelCoordinatesVis {

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
		vis.margin = { top: 40, right: 20, bottom: 0, left: 60, xAxisPadding: -8, yAxisPadding: 10 };

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right
		vis.height = 500 - vis.margin.top - vis.margin.bottom;

		// Clean the data before we initialize the vis
		vis.data = vis.data.filter(function (schoolObject) {
			// Check if any attribute is null or NaN
			return (
				schoolObject.withdraw_rate !== null &&
				!isNaN(schoolObject.withdraw_rate) &&
				schoolObject.avg_fam_inc !== null &&
				!isNaN(schoolObject.avg_fam_inc)
			);
		});
		vis.data = vis.data.map(schoolObject => {
			return {
				avg_fam_inc: schoolObject.avg_fam_inc,
				withdraw_rate: schoolObject.withdraw_rate
			}
		})
		// console.log("ParallelCoordinates data", vis.data)

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
		// Add plot title
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", 0 - (vis.margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.text("Flow of Average student income to withdrawal rate by college");

		// Source code for parallel coordinate graph from https://d3-graph-gallery.com/graph/parallel_basic.html
		// Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
		let dimensions = Object.keys(vis.data[0]).filter(function (d) { return d })
		// console.log(vis.data)
		// For each dimension, I build a linear scale. I store all in a y object
		const y = {}
		for (let i in dimensions) {
			let name = dimensions[i]
			y[name] = d3.scaleLinear()
				.domain(d3.extent(vis.data, function (d) { return +d[name]; }))
				.range([height, 0])
		}

		// Build the X scale -> it find the best position for each Y axis
		x = d3.scalePoint()
			.range([0, width])
			.padding(0)
			.domain(dimensions);

		// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
		function path(d) {
			return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
		}

		// Import the color scale from d3
		const colorScale = d3.scaleSequential(d3.interpolateRgb("yellow", "red"))
			.domain([d3.min(vis.data, d => d.avg_fam_inc), d3.max(vis.data, d => d.avg_fam_inc)]);

		// Draw the lines
		vis.svg
			.selectAll("myPath")
			.data(vis.data)
			.join("path")
			.attr("d", path)
			.style("fill", "none")
			.style("stroke", d => colorScale(d.avg_fam_inc))
			.style("opacity", 0.3);

		// Draw the axis:
		vis.svg.selectAll("myAxis")
			// For each dimension of the dataset I add a 'g' element:
			.data(dimensions).enter()
			.append("g")
			// Translate this element to its right position on the x axis
			.attr("transform", function (d) { return "translate(" + x(d) + ")"; })
			// Build the axis with the call function
			.each(function (d, i) {
				const axis = d3.axisLeft().scale(y[d]);

				// For the second axis (index 1), multiply tick values by 100
				if (i === 1) {
					axis.tickFormat(d => Math.round(d * 100));
				}

				// Apply the modified axis
				d3.select(this).call(axis);
			})
			// Add axis title
			.append("text")
			.style("text-anchor", "middle")
			.attr("y", -9)
			.text(function (d, i) { return i == 0 ? "Average family income ($)" : "Withdrawal Rate(%)"; })
			.style("fill", "black")
			.attr("class", "myAxis")

		// Add Legend
		const legendWidth = 200;
		const legendHeight = 20;

		// Create an SVG group for the legend
		const legend = vis.svg.append("g")
			.attr("class", "legend")
			.attr("transform", "translate(" + (vis.width / 3) + ",20)"); // Adjust the position of the legend

		// Create a color gradient for the legend
		const defs = legend.append("defs");
		const linearGradient = defs.append("linearGradient")
			.attr("id", "colorGradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%");

		// Add color stops to the gradient
		linearGradient.append("stop")
			.attr("offset", "0%")
			.style("stop-color", colorScale.range()[0]);

		linearGradient.append("stop")
			.attr("offset", "100%")
			.style("stop-color", colorScale.range()[1]);

		// Draw the color scale rectangle
		legend.append("rect")
			.attr("width", legendWidth)
			.attr("height", legendHeight)
			.style("fill", "url(#colorGradient)");

		// Add Legend label
		legend.append("text")
			.attr("class", "legendLabel")
			.attr("y", -10)
			.attr("x", legendWidth / 2)
			.style("text-anchor", "middle")
			.text("Average Family Income")
			.style("font-weight", "bold");

		// Add Legend label
		legend.append("text")
			.attr("class", "legendLabel")
			.attr("y", 40)
			.attr("x", legendWidth)
			.style("text-anchor", "middle")
			.text("High Income")
		// Add Legend label
		legend.append("text")
			.attr("class", "legendLabel")
			.attr("y", 40)
			.attr("x", 0)
			.style("text-anchor", "middle")
			.text("Low Income")
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