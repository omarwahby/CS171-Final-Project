// MapVisualization.js

class MapVisualization {
    constructor(parentElement, displayData,) {
        this.parentElement = parentElement;

        this.displayData = displayData

        this.initVis();

    }

    initVis() {

        let vis = this;
        // Set the dimensions of the SVG container
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;
        vis.primary_color = "#ff6127"
        vis.secondary_color = "26272f"

        vis.tooltip = d3.select("body").append("foreignObject")
            .attr("width", 200)
            .attr("height", 300)
            .append("xhtml:div")
            .style("user-select", "none")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "10px")
            .style("border", "1px solid")
            .style("font-weight", "700")
            .style("border-color", vis.primary_color)
            .style("border-radius", "5px")
            .style("pointer-events", "none");

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);



        // Set up a geo projection for the map
        vis.projection = d3.geoAlbersUsa()
            .scale(vis.width / 1.3)
            .translate([vis.width / 2, (vis.height / 2) + 50]);

        vis.path = d3.geoPath().projection(vis.projection);

        vis.stateMapping = {
            'Alabama': 'AL',
            'Illinois': 'IL',
            'Alaska': 'AK',
            'Washington': 'WA',
            'Arizona': 'AZ',
            'New Mexico': 'NM',
            'Arkansas': 'AR',
            'California': 'CA',
            'Minnesota': 'MN',
            'Colorado': 'CO',
            'Connecticut': 'CT',
            'New York': 'NY',
            'Delaware': 'DE',
            'District of Columbia': 'DC',
            'Virginia': 'VA',
            'Florida': 'FL',
            'Georgia': 'GA',
            'Hawaii': 'HI',
            'Idaho': 'ID',
            'Indiana': 'IN',
            'Tennessee': 'TN',
            'Michigan': 'MI',
            'Iowa': 'IA',
            'Kansas': 'KS',
            'Missouri': 'MO',
            'Kentucky': 'KY',
            'Louisiana': 'LA',
            'Maine': 'ME',
            'Maryland': 'MD',
            'Massachusetts': 'MA',
            'Mississippi': 'MS',
            'Montana': 'MT',
            'Nebraska': 'NE',
            'Nevada': 'NV',
            'New Hampshire': 'NH',
            'New Jersey': 'NJ',
            'North Carolina': 'NC',
            'North Dakota': 'ND',
            'Ohio': 'OH',
            'West Virginia': 'WV',
            'Oklahoma': 'OK',
            'Oregon': 'OR',
            'Pennsylvania': 'PA',
            'Rhode Island': 'RI',
            'South Carolina': 'SC',
            'South Dakota': 'SD',
            'Texas': 'TX',
            'Utah': 'UT',
            'Vermont': 'VT',
            'Wisconsin': 'WI',
            'Wyoming': 'WY'
        };
        vis.averageTuitionRates_in = vis.calculateAverageRates(vis.displayData, 'tuition_in');
        vis.averageTuitionRates_out = vis.calculateAverageRates(vis.displayData, 'tuition_out');
        vis.averageCompletionRates = vis.calculateAverageRates(vis.displayData, 'comp_rate');
        vis.averageWithdrawalRates = vis.calculateAverageRates(vis.displayData, 'withdraw_rate');

        // Filter out US territories and anything else not in our mapping
        vis.averageTuitionRates_in = vis.averageTuitionRates_in.filter(state_obj => {
            return Object.values(vis.stateMapping).includes(state_obj.State);
        });
        vis.averageTuitionRates_out = vis.averageTuitionRates_out.filter(state_obj => {
            return Object.values(vis.stateMapping).includes(state_obj.State);
        });
        vis.averageCompletionRates = vis.averageCompletionRates.filter(state_obj => {
            return Object.values(vis.stateMapping).includes(state_obj.State);
        });
        vis.averageWithdrawalRates = vis.averageWithdrawalRates.filter(state_obj => {
            return Object.values(vis.stateMapping).includes(state_obj.State);
        });

        vis.dropdown_mapping = {
            'TUITIONFEE_IN': vis.averageTuitionRates_in,
            'TUITIONFEE_OUT': vis.averageTuitionRates_out,
            'COMP_ORIG_YR2_RT': vis.averageCompletionRates,
            'WDRAW_ORIG_YR4_RT': vis.averageWithdrawalRates,
        }

        vis.variableDropdown = document.getElementById('variableDropdown');
        vis.selectedVariable = vis.variableDropdown.value;

        //Ensures default display is whatever is selected in dropdown
        vis.averageRates = vis.dropdown_mapping[vis.selectedVariable]

        vis.minRate = d3.min(vis.averageRates, d => d.AverageRate);
        vis.maxRate = d3.max(vis.averageRates, d => d.AverageRate);

        vis.colorScale = d3.scaleSequential()
            .domain([vis.minRate, vis.maxRate])
            .interpolator(d3.interpolateYlOrRd)
            .clamp(true);

        // Add plot title
        vis.svg.append("text")
            .attr("x", (vis.width / 2))
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .attr("fill", "white")
            .text("U.S. Statewise Education Metrics Map");

        // Add plot instructions
        vis.svg.append("text")
            .attr("x", (vis.width / 2))
            .attr("y", 55)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", 400)
            .attr("fill", "white")
            .text("Choose a metric from the dropdown menu to explore financial data across U.S. states. Hover over a state for more info.");

        //// Data takeaway label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", 80)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("fill", vis.primary_color)
            .style("font-weight", 400)
            .text("The data suggests that states with higher tuition experience higher completion rates");

        vis.legendWidth = vis.width * .8;
        vis.legendHeight = 30;
        vis.legendX = vis.width / 8;
        vis.legendY = 90;

        vis.legendScale = d3.scaleLinear()
            .domain([vis.minRate, vis.maxRate])
            .range([vis.legendX, vis.legendX + vis.legendWidth]);

        vis.legendFormat = d3.format(
            vis.selectedVariable === 'TUITIONFEE_IN' || vis.selectedVariable === 'TUITIONFEE_OUT'
                ? "$,.0f" : ".0%");

        vis.legendAxis = d3.axisBottom(vis.legendScale)
            .tickSize(13)
            .ticks(5)
            .tickFormat(vis.legendFormat);


        // Create a group for the legend
        vis.legendGroup = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${vis.legendY})`);

        vis.legendGroup.selectAll("rect")
            .data(d3.range(vis.minRate, vis.maxRate, (vis.maxRate - vis.minRate) / 500))
            .enter().append("rect")
            .attr("x", d => vis.legendScale(d))
            .attr("width", vis.legendWidth / 500)
            .attr("height", vis.legendHeight)
            .attr("fill", d => vis.colorScale(d));

        vis.legendGroup.call(vis.legendAxis);

        // Load the GeoJSON data
        d3.json("data/us_map.json").then((us) => {

            // Filter out US territories and anything else not in our mapping
            us.features = us.features.filter(state_feature => {
                return Object.keys(vis.stateMapping).includes(state_feature.properties.NAME);
            });

            vis.states_drawings = vis.svg.selectAll(".map-path")
                .data(us.features)
                .enter().append("path")
                .attr("class", "map-path")
                .attr("d", vis.path)
                .attr("fill", function (currentState) {
                    const stateAbrev = vis.stateMapping[currentState.properties.NAME]
                    const selected_metric = vis.averageRates.find(stateAverageDataObject => stateAverageDataObject.State == stateAbrev).AverageRate
                    return selected_metric ? vis.colorScale(selected_metric) : "lightgray";
                })
                .attr("stroke", "black");

            vis.svg.selectAll(".map-path")
                .on("mouseover", function (event, currentState) {
                    vis.selectedVariable = vis.variableDropdown.value;
                    vis.selectedState = currentState
                    const stateAbrev = vis.stateMapping[currentState.properties.NAME]
                    const selected_metric = vis.averageRates.find(stateAverageDataObject => stateAverageDataObject.State == stateAbrev).AverageRate
                    const selectedMetricName = vis.variableDropdown.options[vis.variableDropdown.selectedIndex].text
                    let displayStat;

                    if (selectedMetricName == "Average Tuition (In-State)" || selectedMetricName == "Average Tuition (Out-of-State)") {
                        displayStat = `$${(Math.trunc(selected_metric) || 'N/A').toLocaleString()}`;
                    }
                    else {
                        displayStat = (Math.trunc(selected_metric * 100) + "%") || 'N/A'
                    }
                    vis.states_drawings
                        .classed("selected-state", x => x.properties.NAME === currentState.properties.NAME);
                    vis.tooltip.transition().duration(200).style("opacity", 0.8);
                    vis.tooltip
                        .html(
                            `State: ${currentState.properties.NAME || "N/A"}<br>${vis.variableDropdown.options[vis.variableDropdown.selectedIndex].text}:
                            ` + `${displayStat}`)
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 85 + "px");
                })
                .on("mouseout", function (event, currentState) {
                    vis.selectedState = null

                    vis.states_drawings
                        .classed("selected-state", false);

                    // Hide tooltip on mouseout
                    vis.tooltip.transition().duration(500).style("opacity", 0);
                });

            // Change the state data when metric is changed through dropdown menu
            vis.variableDropdown.addEventListener('change', function () {

                vis.selectedVariable = vis.variableDropdown.value;
                vis.averageRates = vis.dropdown_mapping[vis.selectedVariable]
                vis.minRate = d3.min(vis.averageRates, d => d.AverageRate);
                vis.maxRate = d3.max(vis.averageRates, d => d.AverageRate);

                vis.colorScale = d3.scaleSequential()
                    .domain([vis.minRate, vis.maxRate])
                    .interpolator(d3.interpolateYlOrRd)
                    .clamp(true);

                vis.legendScale = d3.scaleLinear()
                    .domain([vis.minRate, vis.maxRate])
                    .range([vis.legendX, vis.legendX + vis.legendWidth]);

                vis.legendFormat = d3.format(
                    vis.selectedVariable === 'TUITIONFEE_IN' || vis.selectedVariable === 'TUITIONFEE_OUT'
                        ? "$,.0f" : ".0%");

                vis.legendAxis = d3.axisBottom(vis.legendScale)
                    .tickSize(13)
                    .ticks(5)
                    .tickFormat(vis.legendFormat);

                vis.legendGroup.call(vis.legendAxis);


                vis.states_drawings
                    .style("fill", function (currentState) {
                        const stateAbrev = vis.stateMapping[currentState.properties.NAME]
                        const selected_metric = vis.averageRates.find(stateAverageDataObject => stateAverageDataObject.State == stateAbrev).AverageRate
                        return vis.colorScale(selected_metric);
                    })
                    .classed("selected-state", x => x.properties.NAME === vis.selectedState);

            });

        });

    }

    // Helper function to calculate average rates from the data
    calculateAverageRates(data, variable) {
        // Use d3.group to group data by state
        const groupedData = d3.group(data, d => d.state_abbr);
        // Use Array.from to convert the Map into an array of objects
        const averagesByState = Array.from(groupedData, ([state, countyData]) => ({
            State: state,
            AverageRate: d3.mean(countyData, d => +d[variable])
        }));

        return averagesByState;
    }
}
