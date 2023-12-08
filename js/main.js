// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises

let promises = [

    d3.csv("data/collegeData.csv"),
    d3.csv("data/data.csv")

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
            school_id: +d.UNITID,
            school_name: d.INSTNM,
            avg_sat: +d.SAT_AVG,
            comp_rate: +d.C100_4,
            degPercents: {
                "bizdegpercent": +d.PCIP52,
                "libartsdegpercent": +d.PCIP24,
                "vizartsdegpercent": +d.PCIP50,
                "csdegpercent": +d.PCIP11,
                "mechdegpercent": +d.PCIP47,
                "phildegpercent": +d.PCIP39,
                "lawenfdegpercent": +d.PCIP43,
                "engdegpercent": +d.PCIP15,
                "edudegpercent": +d.PCIP13,
                "commdegpercent": +d.PCIP09,
                "healthdegpercent": +d.PCIP51,
                "fooddegpercent": +d.PCIP12
            },
            avg_fam_inc: +d.FAMINC,
            withdraw_rate: +d.WDRAW_ORIG_YR4_RT

        };
        return schoolObject;
    });


    // (4) Create visualization instances
    let meritplotVis = new MeritPlotVis("meritplotvis", allData);
    let notmeritplotVis = new NotMeritPlotVis("notmeritplotvis", allData);
    // let barchartVis = new BarChartVis("barchartvis", allData);
    let sankeyVis = new SankeyVis("sankeyvis", allData);
    const map =  new MapVisualization('#mapContainer', data[1]);

    // let barchartVis = new BarChartVis("barchartvis", allData);

}
