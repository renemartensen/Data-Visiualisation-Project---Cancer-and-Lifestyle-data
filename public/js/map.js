
let dragging = false;
let startX, startY;
let selectedCountries =[];
// change

// ererererere

export function renderBaseMap(updateSubPlots) {

    console.log("render base map")
    const { width, height, svg } = setupSVG();

    const projection = setupProjection(width, height);
    const path = d3.geoPath().projection(projection);

    const tooltip = d3.select("#tooltip");
    
    const zoom = setupZoom(svg, width, height);
    svg.call(zoom);

    setupResetZoomButton(svg, zoom);

    setupresetSelectedCountriesBtn(svg, updateSubPlots)

    loadMapData(svg, path, projection, tooltip, zoom, width, height, updateSubPlots);
    
}

function setupresetSelectedCountriesBtn(svg, updateSubPlots) {
    const resetSelectedCountriesBtn = document.querySelector("#resetSelectedCountriesBtn");

    // Function to update button visibility
    function updateButtonVisibility() {
        if (selectedCountries.length > 0) {
            resetSelectedCountriesBtn.classList.remove("hidden");
        } else {
            resetSelectedCountriesBtn.classList.add("hidden");
        }
    }

    // Set up the button click event
    resetSelectedCountriesBtn.addEventListener("click", () => {
        selectedCountries.forEach(country => {
            deselectCountryBorder(country);
        });
        selectedCountries = [];
        updateSubPlots(selectedCountries);
        updateButtonVisibility(); // Update visibility after clearing selection
    });

    // Call it initially to set the correct visibility when the page loads
    updateButtonVisibility();
}

function setupResetZoomButton(svg, zoom) {
    const resetZoomBtn = document.querySelector("#resetZoomBtn");
    resetZoomBtn.addEventListener("click", () => {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    });
}

function setupSVG() {
    const parentDiv = document.querySelector("#mapContainer");
    const width = parentDiv.offsetWidth;
    const height = width / 2;

    const svg = d3.select("#map")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .classed("svg-content-responsive", true);

    return { width, height, svg };
}

function setupProjection(width, height) {
    return d3.geoRobinson()
        .scale(width / 6)
        .translate([width / 2.2, height / 1.8]);
}

function setupZoom(svg, width, height) {
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", (event) => {
            svg.selectAll("path").attr("transform", event.transform);
            toggleResetZoomButton(event.transform.k > 1);
        });

    return zoom;
}

// Function to toggle the visibility of the reset zoom button
function toggleResetZoomButton(show) {
    const resetZoomBtn = document.querySelector("#resetZoomBtn");
    resetZoomBtn.classList.toggle("hidden", !show);
}

function toggleResetSelectedCountriesButton(show) {
    const resetSelectedCountriesBtn = document.querySelector("#resetSelectedCountriesBtn");
    resetSelectedCountriesBtn.classList.toggle("hidden", !show);
}

// loads initial map data and adds the button/zoom/range selection rectangle
function loadMapData(svg, path, projection, tooltip, zoom, width, height, updateSubPlots) {
    Promise.all([
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
        ]).then(([world]) => {
            // Convert TopoJSON to GeoJSON
            const countries = topojson.feature(world, world.objects.countries);
    
            // Filter out Antarctica
            const filteredCountries = countries.features.filter(function(d) {
                return d.properties.name !== "Antarctica";
            });
    
            const countryData = filteredCountries;
    
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
                .on("mouseover", (event, d) => handleMouseOver(event,d, tooltip))
                .on("mousemove", (event) => handleMouseMove(event, tooltip))
                .on("mouseout", (event, d) => handleMouseOut(event,d, tooltip))
                .on("click", (event,d) => {handleCountrySelect(d.properties.name ,updateSubPlots)})
                initRangeSelectionRect(svg, zoom, projection, countryData, width, height, updateSubPlots);
            }).catch(error => {
            console.error("Error loading or processing the data:", error);
        });


}

function handleCountrySelect(country, updateSubPlots) {
    const isSelected = selectedCountries.includes(country)

    if (isSelected) {
        selectedCountries = selectedCountries.filter(c => c !== country);
        toggleResetSelectedCountriesButton(selectedCountries.length > 0);
        deselectCountryBorder(country);
        updateSubPlots(selectedCountries);
    } else {
        selectedCountries.push(country);
        toggleResetSelectedCountriesButton(true);
        selectCountryBorder(country);
        updateSubPlots(selectedCountries);
    }
}

function hoverCountryBorder(country) {
    const stroke_width = selectedCountries.includes(country) ? 4 : 1;

    d3.select(`[value="${country}"]`)
        .style("stroke", "black")
        .style("stroke-width", stroke_width + "px"); 
}

function unhoverCountryBorder(country) {

    const stroke_width = selectedCountries.includes(country) ? 3 : 0.2;
    d3.select(`[value="${country}"]`)
        .style("stroke", "black")
        .style("stroke-width", stroke_width+"px"); 
}

function selectCountryBorder(country) {
    d3.select(`[value="${country}"]`)
        .style("stroke", "black")
        .style("stroke-width", "3px")
}

function deselectCountryBorder(country) {
    d3.select(`[value="${country}"]`)
        .style("stroke", "black")
        .style("stroke-width", "0.2px")
}

// Event handler for mouseover
function handleMouseOver(event, d, tooltip) {
    if (dragging) return;
    tooltip.style("display", "block")
        .html(`${d.properties.name}`)
    positionTooltip(event, tooltip);
    hoverCountryBorder(d.properties.name);
}

// Event handler for mousemove
function handleMouseMove(event, tooltip) {
    if (dragging) return;
    positionTooltip(event, tooltip);
}

// Event handler for mouseout
function handleMouseOut(event,d, tooltip) {
    if (dragging) return;
    tooltip.style("display", "none");

    unhoverCountryBorder(d.properties.name);
}

// Utility function to position the tooltip
function positionTooltip(event, tooltip) {
    tooltip.style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 200}px`);
}




function initRangeSelectionRect(svg, zoom, projection, countryData,  width, height, updateSubPlots) {
    // Add a rectangle for the selection
    const selectionRect = svg.append("rect")
        .attr("class", "selection")
        .attr("fill", "rgba(211, 211, 211, 0.3)")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.1)
        .style("display", "none");

        
    
        // Drag behavior for the selection, only works when Cmd/Ctrl is pressed
        const drag = d3.drag()
            .on("start", function(event) {
                if (dragging) {
                    console.log("drag start")
    
                    // Record the start position
                    startX = event.x;
                    startY = event.y;
    
                    // Show and position the selection rectangle
                    selectionRect
                        .style("display", "block")
                        .attr("x", startX)
                        .attr("y", startY)
                        .attr("width", 0)
                        .attr("height", 0);
                }
            })
            .on("drag", function(event) {
                if (dragging) {
                    // Calculate the width and height based on the current mouse position
                    const currentX = event.x;
                    const currentY = event.y;
                    selectionRect
                        .attr("width", Math.abs(currentX - startX))
                        .attr("height", Math.abs(currentY - startY))
                        .attr("x", Math.min(currentX, startX))
                        .attr("y", Math.min(currentY, startY));
                }
            })
            .on("end", function(event) {
                if (dragging) {
                    dragging = false;
                    svg.call(zoom);  // Re-enable zoom behavior
    
                    // Log the final position of the rectangle
                    const endX = event.x;
                    const endY = event.y;
    
                    const xMin = Math.min(startX, endX);
                    const yMin = Math.min(startY, endY);
                    const xMax = Math.max(startX, endX);
                    const yMax = Math.max(startY, endY);
    
    
                    // Find countries that intersect with the selection rectangle
                    const selectedCountries = countryData.filter(d => {
                        const type = d.geometry.type;
                        const coordinates = d.geometry.coordinates;
    
                        if (type === "Polygon") {
                            return checkPolygonIntersection(coordinates, xMin, xMax, yMin, yMax);
                        } else if (type === "MultiPolygon") {
                            // Iterate over each polygon in the MultiPolygon
                            for (let i = 0; i < coordinates.length; i++) {
                                if (checkPolygonIntersection(coordinates[i], xMin, xMax, yMin, yMax)) {
                                    return true;
                                }
                            }
                        }
    
                        return false;  // No intersection found for this country
                    }).map(d => d.properties.name);

                    selectedCountries.forEach(country => {
                        handleCountrySelect(country, updateSubPlots);
                    });

                    // Calculate the scale and translation for the zoom
                    const scaleX = width / (xMax - xMin);
                    const scaleY = height / (yMax - yMin);
                    const scale = Math.min(scaleX, scaleY);
    
                    const translateX = width / 2 - scale * (xMin + (xMax - xMin) / 2);
                    const translateY = height / 2 - scale * (yMin + (yMax - yMin) / 2);
    
                    // Apply the zoom transformation
                    svg.transition()
                        .duration(750)
                        .call(
                            zoom.transform,
                            d3.zoomIdentity
                                .translate(translateX, translateY)
                                .scale(scale)
                        );
    
                    // Hide the rectangle after the drag
                    selectionRect.style("display", "none");
                }
            });

    // Apply drag behavior to the SVG
    svg.call(drag);

    // Function to check if any point in the polygon intersects with the selection rectangle
    function checkPolygonIntersection(polygon, xMin, xMax, yMin, yMax) {
        for (let i = 0; i < polygon.length; i++) {
            const ring = polygon[i];
            for (let j = 0; j < ring.length; j++) {
                const point = ring[j];
                const [x, y] = projection(point);

                if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
                    return true;  // This point intersects with the rectangle
                }
            }
        }
        return false;
    }


    // Disable zoom when Cmd/Ctrl is pressed and enable drag
    function enableDrag() {
        svg.on(".zoom", null);  // Disable zoom behavior
        svg.call(drag);         // Enable drag behavior
        dragging = true;        // Set the dragging flag
    }

    // Re-enable zoom when Cmd/Ctrl is released
    function enableZoom() {
        svg.on(".drag", null);  // Disable drag behavior
        svg.call(zoom);         // Enable zoom behavior
        dragging = false;       // Reset the dragging flag
    }

    // Event listeners for keydown and keyup
    window.addEventListener("keydown", (event) => {
        if (event.key === "Meta" || event.key === "Alt") {
            enableDrag();
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.key === "Meta" || event.key === "Alt") {
            enableZoom();
        }
    });
}

export function renderBivariateMap(cancerData, lifestyleData, gender) {

    console.log("render bivariate map", cancerData, lifestyleData)
    // Create the SVG canvas
    const svg = d3.select("#map").select("svg");

    
    // Append legend to the SVG
    svg.append(() => legend())
       .attr("transform", "translate(70,370)");
  

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
        .append("title") // Tooltip with formatted data

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

