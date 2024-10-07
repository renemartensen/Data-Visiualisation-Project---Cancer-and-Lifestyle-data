
export function renderBaseMap() {
    const width = 960;
    const height = 600;

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoEquirectangular()

    const path = d3.geoPath().projection(projection);

    const tooltip = d3.select("#tooltip");

    Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    ]).then(([world]) => {
    // Convert TopoJSON to GeoJSON
    const countries = topojson.feature(world, world.objects.countries);

    // Filter out Antarctica
    const filteredCountries = countries.features.filter(function(d) {
        return d.properties.name !== "Antarctica";
    });
        

    svg.append("g")
        .selectAll("path")
        .data(filteredCountries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("stroke", "black")
        .style("stroke-width", "0.2px") 
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`${d.properties.name}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");

            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2px"); 
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function(event, d) {
            tooltip.style("display", "none");

            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "0.2px"); 
        });
    }).catch(error => {
    console.error("Error loading or processing the data:", error);
    });

}


export function renderMap(data, gender) {
    
    const svg = d3.select("#map").select("svg");
    const tooltip = d3.select("#tooltip");
    console.log("data",data);


    const cancerData = data;
   

    const cancerRateMap = {};
    cancerData.forEach(d => {
        cancerRateMap[d["iso"]] =+ d[gender];
    });


    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(cancerData, d => +d[gender])]);
        
        

    svg.selectAll("path")
        .style("fill", d => {
            const cancerRate = cancerRateMap[d.id]; 
            return cancerRate ? colorScale(cancerRate) : "#ccc"; // Default color for countries without data
        })
        .style("stroke", "black")
        .style("stroke-width", "0.2px") 
        .on("mouseover", function(event, d) {
            const cancerRate = cancerRateMap[d.id]; 
            tooltip.style("display", "block")
                .html(`${d.properties.name}: ${cancerRate ? cancerRate : "No data"} per 100,000`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");

            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2px"); 
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function(event, d) {
            tooltip.style("display", "none");

            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "0.2px"); 
        });


}

