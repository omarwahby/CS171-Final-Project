// define margins and drawing area
let margin = {top: 40, right: 60, bottom: 60, left: 60};

let width = 1200 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

let svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var padding = 10;
// Scales
let x = d3.scaleBand()
    .rangeRound([padding, width])
    .paddingInner(0.3);

let y = d3.scaleLinear()
    .range([height, 0]);

// Initialize variables
var initialValue = d3.select("#ranking-type").property("value");
var toggle = true;

// Initialize data
loadData();

// Create a 'data' property under the window object
// to store the coffee chain data
Object.defineProperty(window, 'data', {
    // data getter
    get: function() { return _data; },
    // data setter
    set: function(value) {
        _data = value;
        // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
        updateVisualization(initialValue, toggle)
    }
});

// Load CSV file
function loadData() {
    d3.csv("data/coffee-house-chains.csv").then(csv=> {

        csv.forEach(function(d){
            d.revenue = +d.revenue;
            d.stores = +d.stores;
        });

        // Store csv data in global variable
        data = csv;
    });
}

// Render visualization
function updateVisualization(selectedValue) {

    // redefine the data to only include the selected parameter (stores v revenue)
    var dataFilter = data.map(function(d){return {company: d.company, value: d[selectedValue]}});

    //function to sort and return data;
    sortedData = sortData(dataFilter,toggle);

    //update domains of scales
    y.domain([0, d3.max(sortedData, d=> d.value)]);
    x.domain(sortedData.map(d => d.company));

    // define svg area
    let bar = svg.selectAll("rect")
        .data(sortedData);

    // create x axis, y axis, and chart title
    var xAxis = svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0,"+ (height) +")");

    var yAxis = svg.append("g")
        .attr("class", "yaxis");

    svg.append("text")
        .attr("class", "title")
        .attr("x", (padding))
        .attr("y", padding-(margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("opacity", "0.8")
        .text("Optional Title");

    // exit
    bar.exit().remove();

    // enter and update
    bar.enter().append("rect")
        .merge(bar)
        .transition()
        .duration(2000)
        .attr("class", "mybar")
        .attr("x", function (d) { return x(d.company);} )
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return (height-y(d.value)); })
        .attr("width", x.bandwidth() )
        .attr("fill", "#6E4B2B")
        .attr("stroke", "#6E4B2B")
        .attr("stroke-width", "4");

    // update x axis
    svg.selectAll('.xaxis')
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x));

    // update y axis
    svg.selectAll('.yaxis')
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

    // update title
    svg.selectAll('.title')
        .transition()
        .duration(500)
        .text(selectedValue)

    // when the drop-down options are changed, update the value param and recall the graphing function
    d3.select("#ranking-type").on("change", function(d){
        var newData = d3.select("#ranking-type").property("value");
        updateVisualization(newData);
    });

    // when the sort button is clicked, toggle the toggle and recall the graphing function
    d3.select("#change-sorting").on("click", function() {
        toggle = !toggle;
        updateVisualization(selectedValue);
    });

}

function sortData(data,toggle){
    if (toggle){
        return data.sort((a,b)=> b.value - a.value);
    } else {
        return data.sort((a,b)=> a.value - b.value);
    }
}