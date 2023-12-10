let margin = { top: 40, right: 200, bottom: 200, left: 200 },
    width = $('#chart-area').width() - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
    .tickFormat(d3.format(".0%")) // Formats ticks as percentages
    .scale(y);

let xAxisGroup = svg.append("g")
    .attr("class", "x-axis axis");

let yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");

svg.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .attr("fill", "white")
    .text(`Try clicking on one of the bars to generate a scatterplot!`);

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
                .style("fill", "white")
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
        .attr("fill", "white")
        .attr("transform", "rotate(-45)");

    
    yAxisGroup = svg.select(".y-axis")
        .call(yAxis);
    
    svg.select("text.axis-title").remove();
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("class", "axis-title")
        .attr("x", -200)
        .attr("y", 100 - margin.left)
        .attr("dy", ".1em")
        .style("text-anchor", "end")
        .attr("fill", "white")
        .text("Completion Rate");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 70) + ")")
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .text(`Degree Type`);


    svg.selectAll(".axis path")
        .style("fill", "none")
        .style("stroke", "white")
        .style("shape-rendering", "crispEdges");
    
    svg.selectAll(".axis line")
        .style("fill", "none")
        .style("stroke", "white")
        .style("shape-rendering", "crispEdges");
    
    svg.selectAll(".axis text")
        .style("fill", "white");
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
    const pcipMapping = {
        'Communications': 'PCIP09',
        'Education': 'PCIP13',
        'General Studies': 'PCIP24',
        'Theology': 'PCIP39',
        'Homeland Security': 'PCIP43',
        'Repair Technologies': 'PCIP47',
        'Visual & Performing Arts': 'PCIP50', 
        'Business & Management': 'PCIP52',
        'Engineering': 'PCIP14',

    };
    
    function renderScatterPlot(selectedData, selectedAttraction) {

        selectedData = data.filter(
            d => !isNaN(d.PCIP) && !isNaN(d.COMP_ORIG_YR2_RT) && d.PCIP !== 0.00
        );
        console.log("Test", selectedData)

        d3.select("#scatterplot-area").selectAll("*").remove();
		console.log(data.map(d => d.PCIP));
		console.log(data.map(d => d.COMP_ORIG_YR2_RT));

        let scatterWidth = $('#scatterplot-area').width() - margin.left - margin.right;
        let scatterHeight = 500 - margin.top - margin.bottom;

        let scatterSvg = d3.select("#scatterplot-area").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

        let xScatter = d3.scaleLinear()
            .domain([d3.min(data, d => d.PCIP), d3.max(data, d => d.PCIP)])
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
            .attr("fill", "white")
            .call(xAxisScatter);

        scatterSvg.append("g")
            .attr("class", "y-axis-scatter")
            .call(yAxisScatter.tickFormat(d3.format(".0%")));
		
		scatterSvg.append("text")
			.attr("transform", "translate(" + (scatterWidth / 2) + " ," + (scatterHeight + margin.top + 20) + ")")
			.style("text-anchor", "middle")
			.attr("fill", "white")
            .text(`Percentage of Degrees that are Related to ${selectedAttraction}`);

		scatterSvg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 100 - margin.left)
			.attr("x", 0 - (scatterHeight / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.attr("fill", "white")
			.text("Completion Rate");
	
		scatterSvg.append("text")
			.attr("x", scatterWidth / 2)
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "24px")
			.attr("fill", "white")
            .text(`Scatterplot of Proportion of Degrees Related to ${selectedAttraction} Against Overall Completion Rate`);


		scatterSvg.selectAll("circle")
			.data(data) 
			.enter()
			.append("circle")
			.attr("cx", d => xScatter(d.PCIP))
			.attr("cy", d => yScatter(d.COMP_ORIG_YR2_RT))
			.attr("r", 5)
			.style("fill", "orange");	
        
        scatterSvg.selectAll(".x-axis-scatter path")
            .style("fill", "none")
            .style("stroke", "white")
            .style("shape-rendering", "crispEdges");
        
        scatterSvg.selectAll(".x-axis-scatter line")
            .style("fill", "none")
            .style("stroke", "white")
            .style("shape-rendering", "crispEdges");
        
        scatterSvg.selectAll(".x-axis-scatter text")
            .style("fill", "white");
        
        scatterSvg.selectAll(".y-axis-scatter path")
            .style("fill", "none")
            .style("stroke", "white")
            .style("shape-rendering", "crispEdges");
        
        scatterSvg.selectAll(".y-axis-scatter line")
            .style("fill", "none")
            .style("stroke", "white")
            .style("shape-rendering", "crispEdges");
        
        scatterSvg.selectAll(".y-axis-scatter text")
            .style("fill", "white");
    }

    svg.selectAll(".bar")
    .on("click", function(event, d) {
        let selectedAttraction = d.Location;
        let selectedPCIP = pcipMapping[selectedAttraction];

        let selectedData = data.map(item => {
            return {
                Location: item.Location,
                PCIP: item[selectedPCIP],
                COMP_ORIG_YR2_RT: item.COMP_ORIG_YR2_RT
            };
        });
        console.log(selectedData);
        
        data.forEach(function(d) {
            d.PCIP = +d[selectedPCIP];
            d.COMP_ORIG_YR2_RT = +d.COMP_ORIG_YR2_RT;
        });
        renderScatterPlot(selectedData, selectedAttraction);
    });
});
