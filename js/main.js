// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises

let promises = [
    d3.csv("data/satvscomprate.csv")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let perSchoolData = data[0]

    // Make our data look nicer and more useful
    allData = perSchoolData.map(function (d) {

        let schoolObject = {
            schoolID: +d.UNITID,
            avg_sat: +d.SAT_AVG,
            comp_rate: +d.C100_4
        };
        return schoolObject;
    });
    // console.log(allData)


    // (3) Create event handler
    // *** TO-DO ***

    // (4) Create visualization instances
    let scatterplotVis = new ScatterPlotVis("scatterplotvis", allData);
    let pictogramVis = new PictoGramVis("pictogramvis", allData);

    // *** TO-DO ***
    //  pass event handler to CountVis, at constructor of CountVis above

    // *** TO-DO ***
    //let ageVis = new AgeVis("agevis", allData);
    //let prioVis =


    // (5) Bind event handler

    // *** TO-DO ***
    // eventHandler.bind("selectionChanged", function(event){ ...

}
