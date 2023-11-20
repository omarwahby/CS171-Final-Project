
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

		// Initialize the svg essentials
		vis.margin = { top: 40, right: 20, bottom: 60, left: 60, xAxisPadding: -8, yAxisPadding: 10 };

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
			vis.height = 300 - vis.margin.top - vis.margin.bottom;

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
		console.log(vis.data)

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
			.text("Flow of Average student income to withdrawal rate");

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