// define margins
// wanted the area chart to be a bit bigger than the bar chart area, so two widths and heights were defined
let margin = {
        top: 10,
        right: 35,
        bottom: 50,
        left: 100},
    width = 850 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// define time parser
let parseTime= d3.timeParse("%Y-%m-%d");

// journey to the promise land
d3.csv("data/zaatari-refugee-camp-population.csv", d => {
    // parse data properly
    d.population = +d.population;
    d.date = parseTime(d.date);
    return d;

}).then(function(data){
    // draw area chart
    drawAreaChart(data);
    // draw bar chart
    drawBarChart(data);
});

function drawBarChart(data){

    // define shelter data
    const shelterData = [
        { type: "Caravans", percentage: 79.68 },
        { type: "Combination*", percentage: 10.81 },
        { type: "Tents", percentage: 9.51 }
    ];

    let padding = 30;

    // define svg area of BAR CHART using said margins
    let barChartSvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top+ ")");

    // Create an ordinal scale for the x-axis
    const xBarScale = d3.scaleBand()
        .domain(shelterData.map(d => d.type))
        .range([padding, width - padding])
        .padding(0.2);
    // Add x-axis
    barChartSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height-2*padding) + ")")
        .call(d3.axisBottom().scale(xBarScale))
        .style("font-size", "12px");

    // Create y-scale for the bar chart
    const yBarScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - 2*padding, 2*padding]);
    // Add y-axis
    barChartSvg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.axisLeft().scale(yBarScale))
        .style("font-size", "12px");

    // Draw bars
    barChartSvg.selectAll(".bar")
        .data(shelterData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xBarScale(d.type))
        .attr("y", d => yBarScale(d.percentage))
        .attr("width", xBarScale.bandwidth())
        .attr("height", d => height - yBarScale(d.percentage) -60)
        .style("font-size", "12px");

    // Add labels above each bar
    barChartSvg.selectAll(".bar-label")
        .data(shelterData)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => xBarScale(d.type) + xBarScale.bandwidth() / 2)
        .attr("y", d => yBarScale(d.percentage) - 5)
        .attr("text-anchor", "middle")
        .text(d => `${d.percentage.toFixed(2)}%`)
        .style("font-size", "12px");

    // Add chart title
    barChartSvg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .style("text-decoration", "underline")
        .text("Type of Shelter")
        .style("font-size", "20px");
}