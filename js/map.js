// MapVisualization.js

class MapVisualization {
    constructor(parentElement, displayData,) {
        this.parentElement = parentElement;

        this.displayData = displayData

        // Set the dimensions of the SVG container
        this.width = 960;
        this.height = 600;

        this.initVis();

    }

    initVis() {

        let vis = this;

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

        vis.averageTuitionRates = vis.calculateAverageRates(vis.displayData, 'TUITIONFEE_IN');
        vis.averageCompletionRates = vis.calculateAverageRates(vis.displayData, 'COMP_ORIG_YR2_RT');
        vis.averageWithdrawalRates = vis.calculateAverageRates(vis.displayData, 'WDRAW_ORIG_YR4_RT');
        //Set a default value - later sync this up to be whatever the dropdown is defaulted to
        vis.averageRates = vis.averageTuitionRates
        vis.dropdown_mapping = {
            'TUITIONFEE_IN': vis.averageTuitionRates,
            'COMP_ORIG_YR2_RT': vis.averageCompletionRates,
            'WDRAW_ORIG_YR4_RT': vis.averageWithdrawalRates,
        }

        vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        // Set up a geo projection for the map
        vis.projection = d3.geoAlbersUsa()
            .scale(1200)
            .translate([this.width / 2, this.height / 2]);

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
            'Wyoming': 'WY',
            'American Samoa': 'AS',
            'Guam': 'GU',
            'Northern Mariana Islands': 'MP',
            'Puerto Rico': 'PR',
            'Federated States of Micronesia': 'FM',
            'Palau': 'PW',
            'Virgin Islands': 'VI',
            'Marshall Islands': 'MH'
        };

        vis.variableDropdown = document.getElementById('variableDropdown');

        
        console.log(vis.variableDropdown)

        // Load the GeoJSON data
        d3.json("gz_2010_us_040_00_500k.json").then((us) => {

            console.log("map data", us.features);

            vis.selectedVariable = vis.variableDropdown.value;
            vis.minRate = d3.min(vis.displayData, d => +d[vis.selectedVariable]);
            vis.maxRate = d3.max(vis.displayData, d => +d[vis.selectedVariable]);
         
            console.log("Min Rate:",vis.minRate,"Max Rate:",vis.maxRate)

            vis.colorScale = d3.scaleSequential()
                .domain([vis.minRate, vis.maxRate])
                .interpolator(d3.interpolateYlOrRd)
                .clamp(true);

            vis.colorScale.range([d3.rgb('#ffffcc'), d3.rgb('#d73027')]);

            vis.states_drawings = vis.svg.selectAll("path")
                .data(us.features)
                .enter().append("path")
                .attr("d", vis.path)
                .attr("fill", function (currentState) {
                    const stateAbrev = vis.stateMapping[currentState.properties.NAME]
                    const selectedRate = vis.averageRates.find(stateAverageDataObject => stateAverageDataObject.State == stateAbrev).AverageRate
                    return selectedRate ? vis.colorScale(selectedRate) : "lightgray";
                })
                .attr("stroke", "black");

            vis.svg.selectAll("path")
            .on("mouseover", function (event, currentState) {
                vis.selectedVariable = vis.variableDropdown.value;
                vis.selectedState = currentState
                const stateAbrev = vis.stateMapping[currentState.properties.NAME]
                const selectedRate = vis.averageRates.find(stateAverageDataObject => stateAverageDataObject.State == stateAbrev).AverageRate
                const selectedMetricName = vis.variableDropdown.options[vis.variableDropdown.selectedIndex].text
                let displayStat;
                
                if (selectedMetricName == "Average Tuition") {
                    displayStat = `$${(Math.trunc(selectedRate) || 'N/A').toLocaleString()}`;
                }
                else {
                    displayStat = (Math.trunc(selectedRate * 100) + "%") || 'N/A'
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
                console.log(vis.averageRates)
                vis.minRate = d3.min(vis.displayData, d => +d[vis.selectedVariable]);
                console.log(vis.minRate)

                vis.maxRate = d3.max(vis.displayData, d => +d[vis.selectedVariable]);
                console.log(vis.maxRate)

                vis.colorScale = d3.scaleSequential()
                    .domain([vis.minRate, vis.maxRate])
                    .interpolator(d3.interpolateYlOrRd);

                vis.states_drawings
                        .style("fill", function (currentState) {
                            const stateAbrev = vis.stateMapping[currentState.properties.NAME]
                            const selectedRate = vis.averageRates.find(stateAverageDataObject => stateAverageDataObject.State == stateAbrev).AverageRate
                            return vis.colorScale(selectedRate);
                        })
                        .classed("selected-state", x => x.properties.NAME === vis.selectedState);

            });

            });
    }

    // Helper function to calculate average rates from the data
    calculateAverageRates(data, variable) {
        // Use d3.group to group data by state
        const groupedData = d3.group(data, d => d.STABBR);

        // Use Array.from to convert the Map into an array of objects
        const averagesByState = Array.from(groupedData, ([state, countyData]) => ({
            State: state,
            AverageRate: d3.mean(countyData, d => +d[variable])
        }));
        
        return averagesByState;
    }




}
