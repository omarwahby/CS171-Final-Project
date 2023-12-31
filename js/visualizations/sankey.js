
/*
 * SankeyVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class SankeyVis {

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
		vis.secondary_color = "#26272f"

		// Initialize the svg essentials
		vis.margin = { top: 80, right: 50, bottom: 20, left: 10, xAxisPadding: -8, yAxisPadding: 10 };

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right - 50,
			vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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

		let bottom_third_threshold = d3.max(vis.data, d => d.avg_fam_inc) * 1 / 3;
		let middle_third_threshold = d3.max(vis.data, d => d.avg_fam_inc) * 2 / 3;
		let upper_third_threshold = d3.max(vis.data, d => d.avg_fam_inc);

		// Group the data based on income brackets
		let groupedData = {
			bottom_third: [],
			middle_third: [],
			upper_third: []
		};

		vis.data.forEach(schoolObject => {
			if (d3.min(vis.data, d => d.avg_fam_inc) < schoolObject.avg_fam_inc && schoolObject.avg_fam_inc < bottom_third_threshold) {
				groupedData.bottom_third.push(schoolObject);
			} else if (bottom_third_threshold < schoolObject.avg_fam_inc && schoolObject.avg_fam_inc < middle_third_threshold) {
				groupedData.middle_third.push(schoolObject);
			} else if (middle_third_threshold < schoolObject.avg_fam_inc && schoolObject.avg_fam_inc < upper_third_threshold) {
				groupedData.upper_third.push(schoolObject);
			}
		});

		let jsonGraph = {
			"nodes": [
			],
			"links": [
			]
		}

		const income_mapping = {
			0: `Lower Third (<=${(d3.format("$,.0f")(bottom_third_threshold))}/yr)`,
			1: `Middle Third (${(d3.format("$,.0f")(bottom_third_threshold))}/yr-${(d3.format("$,.0f")(middle_third_threshold))}/yr)`,
			2: `Upper Third (${(d3.format("$,.0f")(middle_third_threshold))}/yr-${(d3.format("$,.0f")(upper_third_threshold))}/yr)`
		};

		const income_colors = {
			0: vis.primary_color,
			1: "yellow",
			2: "red"
		};

		const withdrawal_mapping = {
			3: "0-10%",
			4: "10%-20%",
			5: "20-30%",
			6: "30-40%",
			7: "40-50%",
			8: "50-60%",
			9: "60-70%"
		};
		let node_offset = Number(Object.keys(income_mapping).length)

		// Create income bracket nodes
		Object.keys(groupedData).forEach((value, index) => {
			let nodeObject = {
				node: index,
				name: income_mapping[index],
				color: income_colors[index]
			}
			jsonGraph["nodes"].push(nodeObject)
		});

		// Create withdrawal rate nodes
		Object.keys(withdrawal_mapping).forEach((value, index) => {
			let nodeObject = {
				node: index + node_offset,
				name: withdrawal_mapping[index + node_offset],
				color: "white"
			}
			jsonGraph["nodes"].push(nodeObject)
		});

		// Create links between income brackets and withdrawal rates
		Object.values(groupedData).forEach((income_bracket, income_node_index) => {
			Object.values(withdrawal_mapping).forEach((withdrawal_label, withdrawal_index) => {
				let linkObject = {
					source: income_node_index,
					target: withdrawal_index + node_offset,
					// value: 2
					value: Object.values(income_bracket).reduce((acc, elt) => {
						return elt.withdraw_rate * 100 < ((withdrawal_index + 1) * 10) && elt.withdraw_rate * 100 > ((withdrawal_index) * 10)
							? acc + 1 : acc;
					}, 0)
				}
				jsonGraph["links"].push(linkObject)
			})
		});


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
			.attr("fill", "white")
			.text("Connection between average student income per year to withdrawal rate");

		// Add income node titles
		vis.svg.append("text")
			.attr("x", 80)
			.attr("y", (vis.height / 8) - 85)
			.attr("text-anchor", "middle")
			.attr("fill", "white")
			.style("font-size", "18px")
			.style("font-weight", "bold")
			.text("Income Bracket ($)");

		// Add withdrawal rate node titles
		vis.svg.append("text")
			.attr("x", vis.width - 50)
			.attr("y", (vis.height / 8) - 85)
			.attr("text-anchor", "middle")
			.attr("fill", "white")
			.style("font-size", "18px")
			.style("font-weight", "bold")
			.text("Withdrawal Rate (%)");

		// Add takeaway label
		vis.svg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", (vis.margin.top / 8) - 20)
			.attr("text-anchor", "middle")
			.attr("fill", vis.primary_color)
			.style("font-size", "18px")
			.style("font-weight", "400")
			.text("The data suggests that schools attended by students from less affluent backgrounds exhibit higher withdrawal rates.");

		// format variables
		var formatNumber = d3.format(",.0f"), // zero decimal places
			format = function (d) { return formatNumber(d); },
			color = d3.scaleOrdinal(d3.schemeCategory10);

		// Set the sankey diagram properties
		var sankey = d3.sankey()
			.nodeWidth(36)
			.nodePadding(30)
			.size([vis.width, vis.height]);

		var path = sankey.links();

		let graph = sankey(jsonGraph);

		// add in the links
		var link = vis.svg.append("g").selectAll(".link")
			.data(graph.links)
			.enter().append("path")
			.attr("class", "link")
			.attr("d", d3.sankeyLinkHorizontal())
			.style("stroke", (d, i) => {
				return d.source.color
			})
			.attr("stroke-width", function (d) { return d.width; });

		// add the link titles
		link.append("title")
			.text(function (d) {
				return d.source.name + " → " +
					d.target.name + "\n" + format(d.value);
			});

		// add in the nodes
		var node = vis.svg.append("g").selectAll(".node")
			.data(graph.nodes)
			.enter().append("g")
			.attr("class", "node");

		// add the rectangles for the nodes
		node.append("rect")
			.attr("x", function (d) { return d.x0; })
			.attr("y", function (d) { return d.y0; })
			.attr("height", function (d) { return d.y1 - d.y0; })
			.attr("width", sankey.nodeWidth())
			.style("fill", function (d, i) {
				return d.color;
			})
			.style("stroke", function (d) {
				return d3.rgb(d.color).darker(2);
			})
			.append("title")
			.text(function (d) {
				return d.name + "\n" + format(d.value);
			});

		// add in the title for the nodes
		node.append("text")
			.attr("x", function (d) { return d.x0 - 6; })
			.attr("y", function (d) { return (d.y1 + d.y0) / 2; })
			.attr("dy", "0.35em")
			.attr("text-anchor", "end")
			.text(function (d) { return d.name; })
			.style("text-shadow", "none")
			.style("font-weight", 700)
			.attr("fill", "white")
			.attr("stroke-width", .8)
			.attr("stroke", "black")
			.filter(function (d) { return d.x0 < width / 2; })
			.attr("x", function (d) { return d.x1 + 6; })
			.attr("text-anchor", "start")
			;
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
