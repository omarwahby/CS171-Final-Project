
/*
 * BarChartVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class BarChartVis {

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
		vis.margin = { top: 50, right: 20, bottom: 170, left: 100, xAxisPadding: -8, yAxisPadding: 10 };

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
			vis.height = 500 - vis.margin.top - vis.margin.bottom;

		vis.padding = 30

		//Clean the data before we use it
		vis.data = vis.data.filter(function (schoolObject) {
			// Check if any attribute is null or NaN
			return (
				Object.values(schoolObject.degPercents).every(value => value !== null && !isNaN(value))
			);
		});

		// Aggregate the data so we can represent it by degree category instead of by school
		vis.degreeData = {}

		Object.keys(vis.data[0].degPercents).forEach(category => {
			let categoryAveragePercentage = d3.mean(vis.data, d => d.degPercents[category]);
			vis.degreeData[category] = categoryAveragePercentage
		});
		// console.log(vis.degreeData)

		vis.degreeLabelMapping = {
			"bizdegpercent": "Business, Management, Marketing",
			"libartsdegpercent": "Liberal Arts And Sciences,Humanities",
			"vizartsdegpercent": "Visual And Performing Arts",
			"csdegpercent": "Computer And Information Sciences",
			"mechdegpercent": "Mechanic And Repair Technicians",
			"phildegpercent": "Theology And Religious Vocations",
			"lawenfdegpercent": "Law Enforcement, Firefighting",
			"engdegpercent": "Engineering",
			"edudegpercent": "Education",
			"commdegpercent": "Communication, Journalism",
			"healthdegpercent": "Health Professions",
			"fooddegpercent": "Culinary Services"
		}

		// SVG drawing area
		vis.barChartSvg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		vis.xScale = d3.scaleBand()
			.domain(Object.keys(vis.degreeData))
			.range([0, vis.width])
			.padding(0.1);

		vis.yScale = d3.scaleLinear()
			.domain([0, d3.max(Object.values(vis.degreeData))])
			.range([vis.height, 0]);

		// Create bars
		vis.barChartSvg.selectAll(".bar")
			.data(Object.entries(vis.degreeData))
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", d => vis.xScale(d[0]))
			.attr("width", vis.xScale.bandwidth())
			.attr("y", d => vis.yScale(d[1]))
			.attr("height", d => vis.height - vis.yScale(d[1]));

		// Add x-axis
		vis.barChartSvg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + vis.height + ")")
			.call(d3.axisBottom(vis.xScale))
			.selectAll("text")
			.attr("transform", "rotate(-45)")
			.style("text-anchor", "end");

		// Update the x-axis tick labels
		vis.barChartSvg.selectAll(".x-axis text")
			.text((d, i) => vis.degreeLabelMapping[d]);
		// Add y-axis
		vis.barChartSvg.append("g")
			.attr("class", "y-axis")
			.call(d3.axisLeft(vis.yScale).tickFormat(d3.format(".0%")));

		// Add plot title
		vis.barChartSvg.append("text")
			.attr("x", (vis.width / 2))
			.attr("y", 0 - (vis.margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.text("Average percentage of degrees awarded by degree category");

		// Add labels
		vis.barChartSvg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - vis.margin.left)
			.attr("x", 0 - (vis.height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Average percentage of degrees awarded");

		vis.barChartSvg.append("text")
			.attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + vis.margin.top + 80) + ")")
			.style("text-anchor", "middle")
			.text("Degree Category");

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