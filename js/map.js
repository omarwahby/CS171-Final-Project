// MapVisualization.js

class MapVisualization {
    constructor(parentElement, displayData,) {
        this.parentElement = parentElement;

        this.displayData = displayData

        // Set the dimensions of the SVG container
        this.width = 960;
        this.height = 600;

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.initVis();

    }

    initVis() {

        let vis = this;
        let states;

        function getAverageRate(state, variable) {
            const stateData = vis.calculateAverageRates(vis.displayData, variable).find((d) => d.State === state);
            return stateData ? stateData.AverageRate : null;
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


        const stateMapping = {
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


        const variableDropdown = document.getElementById('variableDropdown');


        console.log(variableDropdown)



        // Set the default value for the dropdown
        variableDropdown.value = 'TUITIONFEE_IN';


        // Load the GeoJSON data
        d3.json("gz_2010_us_040_00_500k.json").then((us) => {


            // const states = topojson.feature(us, us.objects.states);
            // Assuming you have functions to calculate average rates for each state

            //  console.log("features:", states.features);

            // Draw the state boundaries initially
            console.log("US", us)
            // vis.svg.selectAll("path")
            //     .data(us.features)
            //     .enter().append("path")
            //     .attr("d", vis.path)
            //     .attr("fill", "lightgray")
            //     .attr("stroke", "white");


            // Feel free to remove after thursday's check-in - just a temporary fix
            vis.svg.selectAll("path")
                .data(us.features)
                .enter().append("path")
                .attr("d", vis.path)
                .attr("fill", "lightgray")
                .attr("stroke", "white")
                .on("mouseover", function (event, d) {
                    // Show tooltip on hover
                    vis.tooltip.transition().duration(200).style("opacity", 0.9);
                    const selectedVariable = variableDropdown.value;
                    vis.tooltip
                        .html(
                            `State: ${stateMapping[d.properties.NAME] || "N/A"}<br>${variableDropdown.options[variableDropdown.selectedIndex].text}: ${getAverageRate(
                                stateMapping[d.properties.NAME],
                                selectedVariable
                            ) || "N/A"}`
                        )
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function () {
                    // Hide tooltip on mouseout
                    vis.tooltip.transition().duration(500).style("opacity", 0);
                });






            variableDropdown.addEventListener('change', function () {


                vis.svg.selectAll("path")
                    .data(us.features)
                    .enter().append("path")
                    .attr("d", vis.path)
                    .attr("fill", "lightgray")
                    .attr("stroke", "white")
                    .on("mouseover", function (event, d) {
                        // Show tooltip on hover
                        vis.tooltip.transition().duration(200).style("opacity", 0.9);
                        const selectedVariable = variableDropdown.value;
                        vis.tooltip
                            .html(
                                `State: ${stateMapping[d.properties.NAME] || "N/A"}<br>${variableDropdown.options[variableDropdown.selectedIndex].text}: ${getAverageRate(
                                    stateMapping[d.properties.NAME],
                                    selectedVariable
                                ) || "N/A"}`
                            )
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY - 28 + "px");
                    })
                    .on("mouseout", function () {
                        // Hide tooltip on mouseout
                        vis.tooltip.transition().duration(500).style("opacity", 0);
                    });
            });

        });

        const averageTuitionRates = vis.calculateAverageRates(vis.displayData, 'TUITIONFEE_IN');
        const averageCompletionRates = vis.calculateAverageRates(vis.displayData, 'COMP_ORIG_YR2_RT');
        const averageWithdrawalRates = vis.calculateAverageRates(vis.displayData, 'WDRAW_ORIG_YR4_RT');


        console.log(averageTuitionRates);
        console.log(averageCompletionRates);
        console.log(averageWithdrawalRates);
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
