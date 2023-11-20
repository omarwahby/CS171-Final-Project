// define margins
// wanted the area chart to be a bit bigger than the bar chart area, so two widths and heights were defined
let margin = {
        top: 10,
        right: 35,
        bottom: 200,
        left: 100},
    width = 850 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// journey to the promise land
d3.csv("data/BarChartData.csv", d => {

    return d;

}).then(function(data){
    // draw bar chart
    drawBarChart(data);
});

function drawBarChart(data){

    // define shelter data
    const degreeDate = [
        { type: "Business, Management, Marketing", percentage: 9.289 },
        { type: "Liberal Arts And Sciences, General Studies And Humanities", percentage: 5.619 },
        { type: "Visual And Performing Arts", percentage: 3.370 },
        { type: "Computer And Information Sciences", percentage: 2.972 },
        { type: "Mechanic And Repair Technologies/Technicians", percentage: 2.785 },
        { type: "Theology And Religious Vocations", percentage: 2.564 },
        { type: "Homeland Security, Law Enforcement, Firefighting", percentage: 2.430 },
        { type: "Engineering Technologies", percentage: 2.159 },
        { type: "Education", percentage: 2.080 },
        { type: "Communication, Journalism", percentage: 1.247 },
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
        .domain(degreeDate.map(d => d.type))
        .range([padding, width - padding])
        .padding(0.2);

    // Add x-axis
    const xAxis = barChartSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - 2 * padding})`)
        .call(d3.axisBottom().scale(xBarScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0) rotate(-45)") // Rotate and adjust position
        .style("text-anchor", "end")
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
        .data(degreeDate)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xBarScale(d.type))
        .attr("y", d => yBarScale(d.percentage))
        .attr("width", xBarScale.bandwidth())
        .attr("height", d => height - yBarScale(d.percentage) -60)
        .style("font-size", "12px");


    // Add labels above each bar
    barChartSvg.selectAll(".bar-label")
        .data(degreeDate)
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
        .text("Top 10 Colleges by Highest Percentage of Graduates in Specific Degree Types")
        .style("font-size", "20px");
}
svg.append('g').attr('transform', `translate(0,${height})`).call(xAxis);
svg.append('g').call(yAxis);
