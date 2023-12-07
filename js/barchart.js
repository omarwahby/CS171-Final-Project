let margin = { top: 40, right: 20, bottom: 300, left: 90 },
    width = $('#chart-area').width() - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.1);

let y = d3.scaleLinear()
    .range([height, 0]);

let xAxis = d3.axisBottom()
    .scale(x);

let yAxis = d3.axisLeft()
    .scale(y);

let xAxisGroup = svg.append("g")
    .attr("class", "x-axis axis");

let yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");

function renderBarChart(data) {
    if (data.length > 15) {
        errorMessage("Max 5 rows");
        return;
    }
    
    if (!data[0].hasOwnProperty("Visitors") || !data[0].hasOwnProperty("Location") || !data[0].hasOwnProperty("Category")) {
        errorMessage("The Object properties are not correct! An attraction should include at least: 'Visitors', 'Location', 'Category'");
        return;
    }
    
    x.domain(data.map(d => d.Location));
    y.domain([0, d3.max(data, d => d.Visitors)]);
    
    let bars = svg.selectAll(".bar")
        .remove()
        .exit()
        .data(data);
    
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Location))
        .attr("y", d => y(d.Visitors))
        .attr("height", d => (height - y(d.Visitors)))
        .attr("width", x.bandwidth())
        .on("mouseover", function (event, d) {
            let xPosition = margin.left + parseFloat(d3.select(this).attr("x"));
            let yPosition = margin.top + y(d.Visitors / 2);
    
            let tooltipSVG = d3.select("#tooltip").append("svg")
                .attr("class", "tooltip-svg")
                .attr("width", 150)
                .attr("height", 150)
                .style("position", "absolute")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px");
                
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#value")
                .text(d.Visitors);
                
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function () {
            d3.select("#tooltip").classed("hidden", true);
            d3.select(".tooltip-svg").remove();
        });
    
    xAxisGroup = svg.select(".x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    
    yAxisGroup = svg.select(".y-axis")
        .call(yAxis);
    
    svg.select("text.axis-title").remove();
    svg.append("text")
        .attr("class", "axis-title")
        .attr("x", -5)
        .attr("y", -15)
        .attr("dy", ".1em")
        .style("text-anchor", "end")
        .text("percentage");
}

function errorMessage(message) {
    console.log(message);
}

function shortenString(content, maxLength) {
    let trimmedString = content.substr(0, maxLength);
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
    return trimmedString;
}

d3.csv("data/NEW_16_PP.csv").then(function(data) {
    data.forEach(function(d) {
        d.PCIP12 = +d.PCIP12; 
        d.COMP_ORIG_YR2_RT = +d.COMP_ORIG_YR2_RT;
    });
    function renderScatterPlot(selectedData) {

		data = data.filter(d => !isNaN(d.PCIP12) && !isNaN(d.COMP_ORIG_YR2_RT));

        d3.select("#scatterplot-area").selectAll("*").remove();

		console.log(data.map(d => d.PCIP12));
		console.log(data.map(d => d.COMP_ORIG_YR2_RT));

        let scatterWidth = $('#scatterplot-area').width() - margin.left - margin.right;
        let scatterHeight = 800 - margin.top - margin.bottom;

        let scatterSvg = d3.select("#scatterplot-area").append("svg")
            .attr("width", scatterWidth)
            .attr("height", scatterHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScatter = d3.scaleLinear()
            .domain([d3.min(data, d => d.PCIP12), d3.max(data, d => d.PCIP12)])
            .range([0, scatterWidth]);
		
        let yScatter = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.COMP_ORIG_YR2_RT)])
            .range([scatterHeight, 0]);

        let xAxisScatter = d3.axisBottom()
            .scale(xScatter);

        let yAxisScatter = d3.axisLeft()
            .scale(yScatter);

		console.log('xScatter domain:', d3.max(data, d => d.COMP_ORIG_YR2_RT));

        scatterSvg.append("g")
            .attr("class", "x-axis-scatter")
            .attr("transform", "translate(0," + scatterHeight + ")")
            .call(xAxisScatter);

        scatterSvg.append("g")
            .attr("class", "y-axis-scatter")
            .call(yAxisScatter);
		
		scatterSvg.append("text")
			.attr("transform", "translate(" + (scatterWidth / 2) + " ," + (scatterHeight + margin.top + 20) + ")")
			.style("text-anchor", "middle")
			.text("Percentage of Degrees that are Business");
	
		scatterSvg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left)
			.attr("x", 0 - (scatterHeight / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Completion Rate");
	
		scatterSvg.append("text")
			.attr("x", scatterWidth / 2)
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text("Scatterplot of Proportion of Degrees Being Business-Related Against Overall Completion Rate");

		scatterSvg.selectAll("circle")
			.data(data) 
			.enter()
			.append("circle")
			.attr("cx", d => xScatter(d.PCIP12))
			.attr("cy", d => yScatter(d.COMP_ORIG_YR2_RT))
			.attr("r", 5)
			.style("fill", "steelblue");	
    }

    svg.selectAll(".bar")
        .on("click", function(event, d) {
            let selectedAttraction = d.Location; 
            let selectedData = data.filter(item => item.Location === selectedAttraction);
            
            renderScatterPlot(selectedData);
        });
});
