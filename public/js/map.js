
export function renderBaseMap() {

    console.log("render base map")
    const width = 960;
    const height = 600;

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoRobinson();
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
        .attr("value", d => {
            return d.properties.name;
        })
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

export function renderBivariateMap(cancerData, lifestyleData, gender) {

    console.log("render bivariate map", cancerData, lifestyleData)
    // Create the SVG canvas
    const svg = d3.select("#map").select("svg");

    
    // Append legend to the SVG
    svg.append(() => legend())
       .attr("transform", "translate(150,330)");
  

    const cancerRateMap = {};
    cancerData.forEach(d => {
        cancerRateMap[d["iso"]] =+ d[gender];
    });
    const lifestyleRateMap = {};
    lifestyleData.forEach(d => {
        lifestyleRateMap[d["iso"]] =+ d[gender]
    });
    // Define the number of quantiles (3 categories: low, medium, high)
    const n = 3;

  
    // Define scales for cancer and lifestyle data
    // d3.scaleQuantile takes as input an array of values and returns an array of n quantiles ()
    //  it divides the input data into “n” quantiles (or buckets) and then assigns a corresponding output value to each quantile

    // Array.from(cancerData, d => d.gender) just makes an array of all cancer rates
    // d3.range(n) creates an array of n elements, from 0 to n-1 [0, 1, 2]
    const x = d3.scaleQuantile(Array.from(cancerData, d => d[gender]), d3.range(n));
    const y = d3.scaleQuantile(Array.from(lifestyleData, d => d[gender]), d3.range(n));


  
    // Create a color index combining both variables
    const color = (a,b) => {
        if (!a || !b) return "#ccc"; // Gray for missing data
        const res = y(b) + x(a) * n;

        return colors[res];
    };
  
    // Format tooltips for cancer and lifestyle rates
    const format = (value) => {
        if (!value) return "N/A";
        const { cancerRate: a, lifestyleRate: b } = value;
        return `${a}% Cancer Rate ${labels[x(a)] && `(${labels[x(a)]})`}
        ${b}% Lifestyle Rate ${labels[y(b)] && `(${labels[y(b)]})`}`;
    };
    // Add paths to the SVG for each geographical region (counties in this case)
    svg.selectAll("path")
        .style("fill", d => {
            if (d == undefined || !cancerRateMap[d.id] || !lifestyleRateMap[d.id]) {
                return "#ccc"; // Gray for missing data
            } else {
                return color(cancerRateMap[d.id], lifestyleRateMap[d.id]);
            }
            
        }) 
        .append("title")
        // .text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name}
        //     ${format(index.get(d.id))}`); // Tooltip with formatted data

  

}
  
  // Legend for the bivariate map
  function legend() {
    const k = 24; // Size of each square in the legend grid
    const n = 3
    const arrowId = "legend-arrow"; // Unique ID for arrow markers
    const legendSvg = document.createElementNS("http://www.w3.org/2000/svg", "g");
    legendSvg.setAttribute("font-family", "sans-serif");
    legendSvg.setAttribute("font-size", "10");
  
    const legendGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    legendGroup.setAttribute("transform", `translate(${-k * n / 2},${-k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})`);
  
    // Create marker for the arrow
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", arrowId);
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");
  
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,0L9,3L0,6Z");
    path.setAttribute("fill", "black")
    marker.appendChild(path);
    legendSvg.appendChild(marker);
  
    // Create the squares in the legend
    d3.cross(d3.range(n), d3.range(n)).forEach(([i, j]) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", k);
      rect.setAttribute("height", k);
      rect.setAttribute("x", i * k);
      rect.setAttribute("y", (n - 1 - j) * k);
      rect.setAttribute("fill", colors[j * n + i]);
      rect.setAttribute("title", `Cancer Rate${labels[j] ? ` (${labels[j]})` : ""}
  Lifestyle Rate${labels[i] ? ` (${labels[i]})` : ""}`);
      legendGroup.appendChild(rect);
    });
  
    // Add the arrows and labels for the axes
    const xLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xLine.setAttribute("marker-end", `url(#${arrowId})`);
    xLine.setAttribute("x1", 0);
    xLine.setAttribute("x2", n * k);
    xLine.setAttribute("y1", n * k);
    xLine.setAttribute("y2", n * k);
    xLine.setAttribute("stroke", "black");
    xLine.setAttribute("stroke-width", 1.5);
    legendGroup.appendChild(xLine);
  
    const yLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yLine.setAttribute("marker-end", `url(#${arrowId})`);
    yLine.setAttribute("x1", 0);
    yLine.setAttribute("y1", n * k);
    yLine.setAttribute("y2", 0);
    yLine.setAttribute("stroke", "black");
    yLine.setAttribute("stroke-width", 1.5);
    legendGroup.appendChild(yLine);
  
    // Add text labels for axes
    const cancerLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    cancerLabel.setAttribute("font-weight", "bold");
    cancerLabel.setAttribute("dy", "0.71em");
    cancerLabel.setAttribute("transform", `rotate(90) translate(${n / 2 * k},6)`);
    cancerLabel.setAttribute("text-anchor", "middle");
    cancerLabel.textContent = "Cancer Rate";
    legendGroup.appendChild(cancerLabel);
  
    const lifestyleLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lifestyleLabel.setAttribute("font-weight", "bold");
    lifestyleLabel.setAttribute("dy", "0.71em");
    lifestyleLabel.setAttribute("transform", `translate(${n / 2 * k},${n * k + 6})`);
    lifestyleLabel.setAttribute("text-anchor", "middle");
    lifestyleLabel.textContent = "Lifestyle Rate";
    legendGroup.appendChild(lifestyleLabel);
  
    legendSvg.appendChild(legendGroup);
    return legendSvg;
  }
  
  // Sample colors array (you can adapt based on the type of visualization you want)
  const colors = [
    "#e8e8e8", "#ace4e4", "#5ac8c8",
    "#dfb0d6", "#a5add3", "#5698b9",
    "#be64ac", "#8c62aa", "#3b4994"
  ];
  
  // Labels for the legend (low, medium, high)
  const labels = ["low", "medium", "high"];
  




























export function renderMap(data, gender) {
    console.log("render map", data);
    
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

