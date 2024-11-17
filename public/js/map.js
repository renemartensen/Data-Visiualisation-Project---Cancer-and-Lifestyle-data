
import { showOverlay } from "./overlayElement.js";
import { state, setState } from "./state.js";
import { showToast } from "./toast.js";
let dragging = false;
let startX, startY;
let x, y;
let selectedMapType = "bivariate";


export function renderBaseMap(callback) {

    const { width, height, svg } = setupSVG();

    const projection = setupProjection(width, height);
    const path = d3.geoPath().projection(projection);

    const tooltip = d3.select("#tooltip").style("display", "none");
    
    const zoom = setupZoom(svg, width, height);
    svg.call(zoom);

    setupResetZoomButton(svg, zoom);

    setupresetSelectedCountriesBtn(svg)

    loadMapData(svg, path, projection, tooltip, zoom, width, height, callback);
    
}

function setupresetSelectedCountriesBtn(svg) {
    const resetSelectedCountriesBtn = document.querySelector("#resetSelectedCountriesBtn");

    // Function to update button visibility
    function updateButtonVisibility() {
        if (state.selectedCountriesISO.length > 0) {
            resetSelectedCountriesBtn.classList.remove("hidden");
        } else {
            resetSelectedCountriesBtn.classList.add("hidden");
        }
    }

    // Set up the button click event
    resetSelectedCountriesBtn.addEventListener("click", () => {
        state.selectedCountriesISO.forEach(country => {
            deselectCountryBorder(country);
        });
        setState("selectedCountriesISO", []);
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
    const parentDiv = d3.select("#mapContainer");
    const width = parentDiv.node().offsetWidth;
    
    const height = parentDiv.node().offsetHeight;

    const svg = d3.select("#map")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .classed("svg-content-responsive", true);

    return { width, height, svg };
}

function setupProjection(width, height) {
    return d3.geoRobinson()
        .scale(width / 7.7)
        .translate([width / 2.2, height / 1.8]);
}

function setupZoom(svg, width, height) {
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .filter(event => {
            // Only zoom on wheel and single click; ignore double-click
            return !event.ctrlKey && !event.button && event.type !== 'dblclick';
        })
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
function loadMapData(svg, path, projection, tooltip, zoom, width, height, callback) {
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
                .attr("value", d => {return d.properties.name;})
                .attr("id", d => {return d.id;})
                .attr("d", path)
                .style("stroke", "black")
                .style("stroke-width", "0.2px") 
                .on("click", (event,d) => {handleCountrySelect(d.id,d.properties.name)})
                .on("dblclick", (event,d) => showOverlay(d.id, d.properties.name))
                initRangeSelectionRect(svg, zoom, projection, countryData, width, height);
                if (callback) {
                    callback();
                }
            }).catch(error => {
            console.error("Error loading or processing the data:", error);
        });


}

function handleCountrySelect(iso) {
    
    if (Array.isArray(iso)) {
        if (iso.length === 0) return;
        setState("selectedCountriesISO", [...state.selectedCountriesISO, ...iso]);
        iso.forEach(i => {
            toggleResetSelectedCountriesButton(true);
            selectCountryBorder(i);
        });
        
        return
    }

    const isSelected = state.selectedCountriesISO.includes(iso)
    if (isSelected) {
        setState("selectedCountriesISO", state.selectedCountriesISO.filter(c => c !== iso));
        toggleResetSelectedCountriesButton(state.selectedCountriesISO.length > 0);
        deselectCountryBorder(iso);
    } else {
        setState("selectedCountriesISO", [...state.selectedCountriesISO, iso]);
        toggleResetSelectedCountriesButton(true);
        selectCountryBorder(iso);
    }
}

function hoverCountryBorder(iso) {
    const stroke_width = state.selectedCountriesISO.includes(iso) ? 1 : 1;

    d3.select(`[id="${iso}"]`)
        .style("stroke", "black")
        .style("stroke-width", stroke_width + "px"); 
}

function unhoverCountryBorder(iso) {

    const stroke_width = state.selectedCountriesISO.includes(iso) ? 1 : 0.2;
    d3.select(`[id="${iso}"]`)
        .style("stroke", "black")
        .style("stroke-width", stroke_width+"px"); 
}

function selectCountryBorder(iso) {
    // Tone down all countries except the selected one
    d3.selectAll(".country")
        .style("opacity", d => (d.id === iso || state.selectedCountriesISO.includes(d.id) ? "1" : "0.3")); // Adjust opacity to tone down unselected countries

    d3.select(`[id="${iso}"]`)
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "1");
}

function deselectCountryBorder(iso) {
    // Reset all countries to full opacity


    // Reset the border of the deselected country
    d3.select(`[id="${iso}"]`)
        .style("stroke", "black")
        .style("stroke-width", "0.2px")

        .style("opacity", state.selectedCountriesISO.length > 0 ? "0.3" : "1");
}

// Event handler for mouseover
function handleMouseOver(event, d, tooltip, cancerRateMap, lifestyleRateMap) {
    if (dragging) return;

    const countryName = d.properties.name;
    const countryISO = d.id;

    tooltip.style("display", "block")
        .style("width", "250px")
        .html(`
            <div class="font-bold text-lg mb-1 text-xl text-left">
                ${countryName}
            </div>
            <div class="text-left" style="margin-bottom: 5px;">
                <strong>${lifeStyleNames[state.selectedLifestyle]}:</strong> ${lifestyleRateMap[countryISO] ? lifestyleRateMap[countryISO] : "No Data"}
            </div>
            <div class="text-left">
                <strong>${cancerNames[state.selectedCancer]} (ASR):</strong> ${cancerRateMap[countryISO] ? cancerRateMap[countryISO] : "No Data"}
            </div>
        `);

    positionTooltip(event, tooltip);
    hoverCountryBorder(d.id);
    highlightLegendCell(d.id);
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

    unhoverCountryBorder(d.id);
    unhighlightLegendCell();
}

// Utility function to position the tooltip
function positionTooltip(event, tooltip) {
    tooltip.style("left", `${event.pageX + 5}px`)
            .style("top", `${event.pageY - 250}px`);
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
                    const selectedCountriesAndIso = countryData.filter(d => {
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
                    }).map(d => d.id);
                    handleCountrySelect(selectedCountriesAndIso);
                    

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

function logVariableBinStriation(n, dataMap, scale, variableName) {
    // Initialize an array to hold counts for each bin
    const binCounts = Array(n).fill(0);
  
    // Iterate over all data points
    Object.keys(dataMap).forEach(key => {
      const value = dataMap[key];
      if (value == null) {
        // Handle missing data if necessary
        return;
      }
  
      // Calculate bin index
      const binIndex = scale(value);
  
      // Increment the count for this bin
      binCounts[binIndex] += 1;
    });
  
    // Log the counts
    for (let bin = 0; bin < n; bin++) {
      const count = binCounts[bin];
      console.log(`Bin ${bin}: ${count} data points`);
    }
  }
  
  

export function renderBivariateMap(cancerData, lifestyleData, gender) {

    // Create the SVG canvas
    const svg = d3.select("#map").select("svg");

    const parentDiv = document.querySelector("#mapContainer");
    const height = parentDiv.offsetHeight;

    

  

    const cancerRateMap = {};
    cancerData.forEach(d => {
        cancerRateMap[d["iso"]] = +d[gender];
    });
    const lifestyleRateMap = {};
    lifestyleData.forEach(d => {
        lifestyleRateMap[d["iso"]] = +d[gender]
    });

    const cancerValues = cancerData.map(d => +d[gender]);
    const lifestyleValues = lifestyleData.map(d => +d[gender]);

    const n = 3;
    const color = createColorScale(cancerValues, lifestyleValues, n);



    // Append legend to the SVG
    svg.append(() => legend(n, color, cancerValues, lifestyleValues, height))
        
 

    const tooltip = d3.select("#tooltip");
    // Add paths to the SVG for each geographical region (counties in this case)
    svg.selectAll("path")
        .on("mouseover", (event, d) => handleMouseOver(event,d, tooltip, cancerRateMap, lifestyleRateMap))
        .on("mousemove", (event) => handleMouseMove(event, tooltip))
        .on("mouseout", (event, d) => handleMouseOut(event,d, tooltip))
        .transition()
        .duration(200)
        .style("fill", d => {
            if (d == undefined) {
                return "#ccc"; // Gray for missing data
            } else {
                if (selectedMapType === "bivariate") {
                    return color(cancerRateMap[d.id], lifestyleRateMap[d.id]);
                } else if (selectedMapType === "cancer") {
                    return color(cancerRateMap[d.id]);
                } else if (selectedMapType === "lifestyle") {
                    return color(lifestyleRateMap[d.id]);
                }
                 
            }
        })  

    const selectedCountries = state.selectedCountriesISO;
    toggleResetSelectedCountriesButton(state.selectedCountriesISO.length > 0);
    deSelectAllCountries()
    selectedCountries.forEach(iso => {
        
        if (selectedCountries.includes(iso)) {
            selectCountryBorder(iso);
        } 
    });

}

function deSelectAllCountries() {
    Object.keys(state.countryNames).forEach(iso => {
        deselectCountryBorder(iso);
    })
}

function createColorScale(cancerValues, lifestyleValues, n) { 

    if (selectedMapType === "bivariate") {
        // Cancer data thresholds
        const min_cancer = d3.min(cancerValues);
        const max_cancer = d3.max(cancerValues);

        // Compute thresholds for k from 1 to n - 1
        const thresholds_cancer = d3.range(1, n).map(k => min_cancer + k * (max_cancer - min_cancer) / n);

        // Lifestyle data thresholds
        const min_lifestyle = d3.min(lifestyleValues);
        const max_lifestyle = d3.max(lifestyleValues);

        const thresholds_lifestyle = d3.range(1, n).map(k => min_lifestyle + k * (max_lifestyle - min_lifestyle) / n);


        // Create the threshold scales
        x = d3.scaleThreshold()
        .domain(thresholds_cancer)
        .range(d3.range(n));

        y = d3.scaleThreshold()
        .domain(thresholds_lifestyle)
        .range(d3.range(n));

        // Create a color index combining both variables
        const color = (a, b) => {
            if (a === null || a === undefined || b === null || b === undefined) return "#ccc"; // Gray for missing data
            const res = y(b) + x(a) * n;

            return colors[res];
        };


        return color
    }

    // Continuous color scale for Cancer data
    if (selectedMapType === "cancer") {
        const min_cancer = 0 //d3.min(cancerValues);
        const max_cancer = d3.max(cancerValues);
        

        // Use d3.scaleSequential with a color interpolator (e.g., d3.interpolateBlues)
        const color = d3.scaleSequential()
            .domain([min_cancer, max_cancer])
            .interpolator(d3.interpolateBlues);

        return (a) => a !== null && a !== undefined ? color(a) : "#ccc"; // Gray for missing data
    }

    // Continuous color scale for Lifestyle data
    if (selectedMapType === "lifestyle") {
        
        

        const min_lifestyle = 0 // d3.min(lifestyleValues);
        const max_lifestyle = d3.max(lifestyleValues);
        console.log("min max", min_lifestyle, max_lifestyle)

        // Use d3.scaleSequential with a color interpolator (e.g., d3.interpolateOranges)
        const color = d3.scaleSequential()
            .domain([min_lifestyle, max_lifestyle])
            .interpolator(d3.interpolateGreens);

        return (b) => b !== null && b !== undefined ? color(b) : "#ccc"; // Gray for missing data
    }

    
}


function highlightLegendCell(countryId) {
    // Find the data for the selected country
    const cancerData = state.data.cancerTypes[state.selectedCancer];
    const lifestyleData = state.data.lifeStyleChoices[state.selectedLifestyle];


  
    const cancerRateMap = {};
    cancerData.forEach(d => {
        cancerRateMap[d["iso"]] =+ d[state.selectedGender];
    });
    const lifestyleRateMap = {};
    lifestyleData.forEach(d => {
        lifestyleRateMap[d["iso"]] =+ d[state.selectedGender]
    });
  
    const bin = (a,b) => {
        if (a === null || a === undefined || b === null || b === undefined) return -1; // -1 for missing data
        const res = y(b) + x(a) * 3;

        return res;
    };
  
    // Select the legend SVG
    const legendSvg = d3.select("#map").select("svg").select("#legend");
  
    if (!legendSvg.empty()) {
      // Remove previous highlights
      legendSvg.selectAll("rect.highlight")
        .classed("highlight", false)
        .attr("stroke-width", 0);
  
      // Select the corresponding rect in the legend
      const rect = legendSvg.select(`rect[data-res='${bin(cancerRateMap[countryId], lifestyleRateMap[countryId])}']`);
  
      if (!rect.empty()) {
        // Add border to highlight the cell
        rect.classed("highlight", true)
          .attr("stroke", "black")
          .attr("stroke-width", 2)
          .raise()
      } else {
        return
      }
    } else {
      console.error("Legend SVG not found");
    }
  }

  function unhighlightLegendCell() {
    // Select the legend SVG
    const legendSvg = d3.select("#map").select("svg").select("#legend");
  
    if (!legendSvg.empty()) {
      // Remove highlights from all legend cells
      legendSvg.selectAll("rect.highlight")
        .classed("highlight", false)
        .attr("stroke-width", 0);
    } else {
      console.error("Legend SVG not found");
    }
  }
  




  function legend(n, colorScale, cancerValues, lifestyleValues, height) {
    const k = 20; // Size of each square in the legend grid
    const arrowId = "legend-arrow"; // Unique ID for arrow markers
    const legendWidth = 100;
    const legendHeight = 20;
    const legendMargin = { top: 0, right: 0, bottom: 0, left: 0 };

    // Remove old legend if it exists
    const oldLegend = d3.select("#map").select("svg").select("#legend");
    if (!oldLegend.empty()) {
      oldLegend.remove();
    }

    // Create the legend group
    const legendSvg = d3.select("#map").select("svg")
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("id", "legend");

    if (selectedMapType === "bivariate") {
        const legendGroup = legendSvg.append("g")
          .attr("transform", `translate(${-k * n / 2},${-k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})`);

        // Create marker for the arrow
        legendSvg.append("defs")
          .append("marker")
          .attr("id", arrowId)
          .attr("markerHeight", 10)
          .attr("markerWidth", 10)
          .attr("refX", 6)
          .attr("refY", 3)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,0L9,3L0,6Z")
          .attr("fill", "#ccc");

        // Create the squares in the legend
        legendGroup.selectAll("rect")
        .data(d3.cross(d3.range(n), d3.range(n)))
        .enter()
        .append("rect")
        .attr("width", k)
        .attr("height", k)
        .attr("x", d => d[0] * k)
        .attr("y", d => (n - 1 - d[1]) * k)
        .attr("fill", d => {
            const res = d[1] + d[0] * n; // Compute res the same way as in your color function
            return colors[res];
        })
        .attr("data-res", d => d[1] + d[0] * n) // Assign the res index as a data attribute
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0)
        .append("title")
        .text(d => `Cancer Rate: ${labels[d[1]]}\nLifestyle Rate: ${labels[d[0]]}`);


        // Add the arrows and labels for the axes
        legendGroup.append("line")
          .attr("marker-end", `url(#${arrowId})`)
          .attr("x1", 0)
          .attr("x2", n * k)
          .attr("y1", n * k)
          .attr("y2", n * k)
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5);

        legendGroup.append("line")
          .attr("marker-end", `url(#${arrowId})`)
          .attr("x1", 0)
          .attr("y1", n * k)
          .attr("y2", 0)
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5);

        // Add text labels for axes
        legendGroup.append("text")
          .attr("font-weight", "bold")
          .attr("dy", "0.71em")
          .attr("transform", `rotate(90) translate(${(n / 2) * k},6)`)
          .attr("text-anchor", "middle")
          .text(state.data.lifeStyleNames[state.selectedLifestyle]);

        legendGroup.append("text")
          .attr("font-weight", "bold")
          .attr("dy", "0.71em")
          .attr("transform", `translate(${(n / 2) * k},${n * k + 6})`)
          .attr("text-anchor", "middle")
          .text(cancerNameMap[state.selectedCancer]);

          legendSvg.append("rect")
          .attr("x", legendWidth -25) // Position to the right of the legend
          .attr("y", legendMargin.top)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", "#ccc")
      
          legendSvg.append("text")
          .attr("x", legendWidth -22) // Position to the right of the square
          .attr("y", legendMargin.top +30)
          .attr("text-anchor", "start")
          .attr("font-size", 10)
          .attr("font-family", "sans-serif")
          .text("n/a");

        legendSvg.attr("transform", `translate(70,${0.8 * height})`)
        
        } else if (selectedMapType === "cancer") {
            // Cancer legend with specific color scale
            const gradient = legendSvg.append("defs")
                .append("linearGradient")
                .attr("id", "cancer-legend-gradient")
                .attr("x1", "0%")
                .attr("x2", "100%");
    
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorScale(d3.min(cancerValues)));
    
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorScale(d3.max(cancerValues)));
    
            legendSvg.append("rect")
                .attr("x", legendMargin.left)
                .attr("y", legendMargin.top)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#cancer-legend-gradient)");
    
            const scale = d3.scaleLinear()
                .domain(d3.extent(cancerValues))
                .range([0, legendWidth]);
    
            const axisBottom = d3.axisBottom(scale)
                .ticks(5)
                .tickSize(1);
    
            legendSvg.append("g")
                .attr("transform", `translate(${legendMargin.left},${legendMargin.top + legendHeight})`)
                .call(axisBottom)
                .select(".domain").remove();
    
            legendSvg.append("text")
                .attr("x", legendWidth / 2 + legendMargin.left)
                .attr("y", legendMargin.top + legendHeight + 30)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .text("Cancer Rate");

                legendSvg.append("rect")
                .attr("x", legendWidth + 10) // Position to the right of the legend
                .attr("y", legendMargin.top)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", "#ccc")
            
                legendSvg.append("text")
                .attr("x", legendWidth + 13) // Position to the right of the square
                .attr("y", legendMargin.top +30)
                .attr("text-anchor", "start")
                .attr("font-size", 10)
                .attr("font-family", "sans-serif")
                .text("n/a");
    
            legendSvg.attr("transform", `translate(20,${0.8 * height})`);
        } 
        else if (selectedMapType === "lifestyle") {
            // Lifestyle legend with specific color scale
            const gradient = legendSvg.append("defs")
                .append("linearGradient")
                .attr("id", "lifestyle-legend-gradient")
                .attr("x1", "0%")
                .attr("x2", "100%");
    
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorScale(d3.min(lifestyleValues)));
    
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorScale(d3.max(lifestyleValues)));
    
            legendSvg.append("rect")
                .attr("x", legendMargin.left)
                .attr("y", legendMargin.top)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#lifestyle-legend-gradient)");
    
            const scale = d3.scaleLinear()
                .domain(d3.extent(lifestyleValues))
                .range([0, legendWidth]);
    
            const axisBottom = d3.axisBottom(scale)
                .ticks(5)
                .tickSize(1)
                .tickFormat(d3.format(".1s"));
    
            legendSvg.append("g")
                .attr("transform", `translate(${legendMargin.left},${legendMargin.top + legendHeight})`)
                .call(axisBottom)
                .select(".domain").remove();
    
            legendSvg.append("text")
                .attr("x", legendWidth / 2 + legendMargin.left)
                .attr("y", legendMargin.top + legendHeight + 30)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .text(state.data.lifeStyleNames[state.selectedLifestyle]);
    
            legendSvg.attr("transform", `translate(20,${0.8 * height})`);

            legendSvg.append("rect")
            .attr("x", legendWidth + 10) // Position to the right of the legend
            .attr("y", legendMargin.top)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#ccc")
        
            legendSvg.append("text")
            .attr("x", legendWidth + 13) // Position to the right of the square
            .attr("y", legendMargin.top +30)
            .attr("text-anchor", "start")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .text("n/a");
        }

            



    return legendSvg.node();
}

    
  
  // Sample colors array (you can adapt based on the type of visualization you want)
// First color array
const colors1 = [
    "#e8e8e8", "#e4acac", "#c85a5a",
    "#b0d5df", "#ad9ea5", "#985356",
    "#64acbe", "#627f8c", "#574249"
];

// Second color array
const colors2 = [
    "#e8e8e8", "#ace4e4", "#5ac8c8",
    "#dfb0d6", "#a5add3", "#5698b9",
    "#be64ac", "#8c62aa", "#3b4994"
];

// Third color array
const colors3 = [
    "#e8e8e8", "#b5c0da", "#6c83b5",
    "#b8d6be", "#90b2b3", "#567994",
    "#73ae80", "#5a9178", "#2a5a5b"
];

// Fourth color array
const colors4 = [
    "#e8e8e8", "#cbb8d7", "#9972af",
    "#e4d9ac", "#c8ada0", "#976b82",
    "#c8b35a", "#af8e53", "#804d36"
]

const colors_4_bins = [
    // Y=0 (lowest), X from 0 to 3
    "#f0f0f0", // X=0, Y=0
    "#e8e8e8", // X=1, Y=0
    "#d9d9d9", // X=2, Y=0
    "#bdbdbd", // X=3, Y=0
  
    // Y=1, X from 0 to 3
    "#c7e9b4", // X=0, Y=1
    "#a1dab4", // X=1, Y=1
    "#7fcdbb", // X=2, Y=1
    "#4eb3d3", // X=3, Y=1
  
    // Y=2, X from 0 to 3
    "#7fcdbb", // X=0, Y=2
    "#41b6c4", // X=1, Y=2
    "#1d91c0", // X=2, Y=2
    "#225ea8", // X=3, Y=2
  
    // Y=3 (highest), X from 0 to 3
    "#2c7fb8", // X=0, Y=3
    "#253494", // X=1, Y=3
    "#081d58", // X=2, Y=3
    "#000000"  // X=3, Y=3
  ];

const colors = colors4;
  
  // Labels for the legend (low, medium, high)
const labels = ["low", "medium", "high"];
  








// Toggle dropdown visibility on click
document.getElementById("mapTypeToggle").addEventListener("click", function() {
    const dropdown = document.getElementById("mapTypeDropdown");
    dropdown.classList.toggle("hidden");
});

// Handle dropdown option clicks
document.querySelectorAll("#mapTypeDropdown button").forEach(button => {
    button.addEventListener("click", function() {
        const selectedValue = this.textContent;

        // Update toggle button text
        document.getElementById("mapTypeToggle").textContent = selectedValue;

        // Highlight the selected option
        document.querySelectorAll("#mapTypeDropdown button").forEach(btn => btn.classList.remove("bg-gray-200"));
        this.classList.add("bg-gray-200"); // Add background to the selected option

        // Hide the dropdown
        document.getElementById("mapTypeDropdown").classList.add("hidden");

        selectedMapType = this.getAttribute("value");

        setState("selectedCancer", state.selectedCancer, true);
    });
});

// Optional: Hide dropdown if clicking outside
document.addEventListener("click", function(event) {
    const toggle = document.getElementById("mapTypeToggle");
    const dropdown = document.getElementById("mapTypeDropdown");
    if (!toggle.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add("hidden");
    }
});










const lifeStyleNames = {"tobacco_2005": "Tobacco", "alcohol_2019": "Alcohol", "uv_radiation": "UV Radiation", "physical_activity": "Physical Activity"}

const cancerNames = {
    "all-cancers": "All Types of Cancer",
    "anus": "Anus Cancer",
    "bladder": "Bladder Cancer",
    "brain-central-nervous-system": "Brain and Central Nervous System Cancer",
    "breast": "Breast Cancer",
    "cervix-uteri": "Cervical Cancer (Cervix Uteri)",
    "colon": "Colon Cancer",
    "colorectum": "Colorectal Cancer",
    "corpus-uteri": "Uterine Corpus Cancer",
    "gallbladder": "Gallbladder Cancer",
    "hodgkin-lymphoma": "Hodgkin Lymphoma",
    "hypopharynx": "Hypopharyngeal Cancer",
    "kaposi-sarcoma": "Kaposi Sarcoma",
    "kidney": "Kidney Cancer",
    "larynx": "Laryngeal Cancer",
    "leukaemia": "Leukemia",
    "lip-oral-cavity": "Lip and Oral Cavity Cancer",
    "liver-and-intrahepatic-bile-ducts": "Liver and Intrahepatic Bile Duct Cancer",
    "melanoma-of-skin": "Melanoma of the Skin",
    "mesothelioma": "Mesothelioma",
    "multiple-myeloma": "Multiple Myeloma",
    "nasopharynx": "Nasopharyngeal Cancer",
    "non-hodgkin-lymphoma": "Non-Hodgkin Lymphoma",
    "non-melanoma-skin-cancer": "Non-Melanoma Skin Cancer",
    "oesophagus": "Esophageal Cancer",
    "oropharynx": "Oropharyngeal Cancer",
    "ovary": "Ovarian Cancer",
    "pancreas": "Pancreatic Cancer",
    "penis": "Penile Cancer",
    "prostate": "Prostate Cancer",
    "rectum": "Rectal Cancer",
    "salivary-glands": "Salivary Gland Cancer",
    "testis": "Testicular Cancer",
    "thyroid": "Thyroid Cancer",
    "trachea-bronchus-and-lung": "Trachea, Bronchus, and Lung Cancer",
    "vagina": "Vaginal Cancer",
    "vulva": "Vulvar Cancer"
};

const cancerNameMap = {
    "all-cancers": "All Cancers",
    "anus": "Anus",
    "bladder": "Bladder",
    "brain-central-nervous-system": "BrainCNS",
    "breast": "Breast",
    "cervix-uteri": "Cervix",
    "colon": "Colon",
    "colorectum": "ColRectum",
    "corpus-uteri": "Corpus",
    "gallbladder": "Gallblad",
    "hodgkin-lymphoma": "Hodgkin",
    "hypopharynx": "HypoPhar",
    "kaposi-sarcoma": "Kaposi",
    "kidney": "Kidney",
    "larynx": "Larynx",
    "leukaemia": "Leukemia",
    "lip-oral-cavity": "LipOral",
    "liver-and-intrahepatic-bile-ducts": "LiverIBD",
    "melanoma-of-skin": "MelSkin",
    "mesothelioma": "Mesothlm",
    "multiple-myeloma": "MultMyel",
    "nasopharynx": "NasoPhar",
    "non-hodgkin-lymphoma": "NonHodgk",
    "non-melanoma-skin-cancer": "NonMelSk",
    "oesophagus": "Oesoph",
    "oropharynx": "OroPhar",
    "ovary": "Ovary",
    "pancreas": "Pancreas",
    "penis": "Penis",
    "prostate": "Prostate",
    "rectum": "Rectum",
    "salivary-glands": "Salivary",
    "testis": "Testis",
    "thyroid": "Thyroid",
    "trachea-bronchus-and-lung": "Lung",
    "vagina": "Vagina",
    "vulva": "Vulva"
};
