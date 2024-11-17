import {state, setState} from './state.js';

let sortBy = 'hierarchical'; // Default sort option
let dragging = false
let currentNode = null;

export function renderBarGraphCancerPerCountry(mainData) {
    const chartData = prepareDataForChart();

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const div = d3.select("#barchartCountryContainer");
    const width = div.node().clientWidth - margin.left - margin.right;
    const height = div.node().clientHeight - margin.top - margin.bottom - 20;

    let svg = div.select("svg");
    if (svg.empty()) {
        svg = div.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("overflow", "visible");

        svg.append("g")
            .attr("class", "chart-content")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    } else {
        svg.selectAll(".x-axis, .y-axis, .overlay, .chart-title, .overlay-hierarchical").remove();
    }

    const chartContent = svg.select(".chart-content");

    const value = state.selectedGender;
    let yScale;
    let xScale

    // Check if data is hierarchical
    const isHierarchical = sortBy === 'hierarchical';

    if (isHierarchical) {
        svg.selectAll(".bar").remove();
        const selectedContinent = chartData.find(continent => continent.name === currentNode);

        let hierarchyData = currentNode ? d3.hierarchy({ children: selectedContinent.children }) : d3.hierarchy({ children: chartData });
        let node = hierarchyData
            .eachAfter(d => {
                if (d.children) {
                    // Calculate the average value for nodes with children
                    d.value = d.children.reduce((sum, child) => sum + (child.value || 0), 0) / d.children.length;
                } else {
                    // Use the original value for leaf nodes
                    d.value = d.data.value;
                }
            });
        let data = node.children
        // xScale based on the current level (continent or country names)
        xScale = d3.scaleBand()
            .domain(data.map(d => d.data.name))
            .range([0, width])
            .padding(currentNode ? 0.1 : 0.4);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        const barsOverlay = chartContent.selectAll(".overlay-hierarchical")
            .data(data, d => d.data.name);
    
        // Adding invisible overlay for interactivity
        barsOverlay.enter()
            .append("rect")
            .attr("class", d => {
                return d.data.iso ? `overlay-hierarchical overlay-hierarchical-${d.data.iso}` : `overlay-hierarchical overlay-hierarchical-${d.data.name.replace(/\s+/g, '-')}`
            } )
            .attr("x", d => xScale(d.data.name))
            .attr("y", d => 0)
            .attr("width", xScale.bandwidth())
            .attr("height", d => height- (height - yScale(d.value)) )
            .style("fill", "transparent")
            .style("cursor", "pointer")
            .on("click", (event,d) => {
                if (d.children) {
                    currentNode = d.data.name;
                    renderBarGraphCancerPerCountry(mainData);
                } else {
                    handleClick(event, d.data);
                }
            })
            .on("mouseover", function(event, d) {
                if (d.data.iso) {
                    d3.select(`.bar-hierarchical-${d.data.iso}`).style("fill", "darkgrey");
                } else {
                    d3.select(`.bar-hierarchical-${d.data.name.replace(/\s+/g, '-')}`).style("fill", "darkgrey");
                }
                d3.select(this).style("fill", "#ddd");
                //showToolTip(event, d.data);
            })
            .on("mousemove", positionToolTip)
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", "transparent");
                d3.select(d.data.iso ? `.bar-hierarchical-${d.data.iso}` : `.bar-hierarchical-${d.data.name.replace(/\s+/g, '-')
                }`).style("fill", state.selectedCountriesISO.includes(d.data.iso) ? "darkgrey" : "steelblue");
                hideToolTip();
            })
            barsOverlay.exit().remove();

        // Draw bars at the current level
        const bars = chartContent.selectAll(".bar-hierarchical")
            .data(data, d => d.data.name);

        bars.enter()
            .append("rect")
            .attr("class", d => d.data.iso ? `bar-hierarchical bar-hierarchical-${d.data.iso}` : `bar-hierarchical bar-hierarchical-${d.data.name.replace(/\s+/g, '-')}`)
            .attr("x", d => xScale(d.data.name))
            .attr("y", height)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .style("fill", d => {
                if (d.children) {
                    return "steelblue";
                } else {
                    return state.selectedCountriesISO.includes(d.data.iso) ? "darkgrey" : "steelblue";
                }
            } )
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                if (d.children) {
                    currentNode = d.data.name;
                    renderBarGraphCancerPerCountry(mainData);
                    selectContinent(event, d);
                } else {
                    handleClick(event, d.data);
                }
            })
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "darkgray");
                d3.select(d.data.iso ? `.overlay-hierarchical-${d.data.iso}` : `.overlay-hierarchical-${d.data.name.replace(/\s+/g, '-')}`).style("fill", "#ddd");
                //showToolTip(event, d.data);
            })
            .on("mousemove", positionToolTip)
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", state.selectedCountriesISO.includes(d.data.iso) ? "darkgrey" : "steelblue");
                d3.select(d.data.iso ? `.overlay-hierarchical-${d.data.iso}` : `.overlay-hierarchical-${d.data.name.replace(/\s+/g, '-')}`).style("fill", "transparent");
                hideToolTip();
            })
            .transition()
            .duration(500)
            .attr("y", d => yScale(d.value))
            .attr("height", d => height - yScale(d.value))
        
        bars.transition()
            .duration(500)
            .attr("x", d => xScale(d.data.name))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .style("fill", d => state.selectedCountriesISO.includes(d.data.iso) ? "darkgrey" : "steelblue")


        bars.exit().remove();

        // Append x-axis
        chartContent.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale)
                .tickSize(5)
                .tickSizeOuter(0)
                .tickPadding(15))
            .style("color", "#ccc")
            .selectAll("text")
            .style("color", "black")
            .style("font-size", "9px")
            .attr("dy", (d, i) => currentNode ? i % 2 === 0 ? "1.5em" : "0em" : "0em")
            .style("text-anchor", "middle");

        // Append y-axis
        chartContent.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).ticks(5).tickSize(5).tickFormat(d3.format(".1s")))
            .style("color", "#ccc")
            .select(".domain").remove();

        // Add a chart title
        chartContent.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text((node.data.name ? node.data.name + " - " : "") + `${cancerLongNameMap[state.selectedCancer]} (ASR) - Country Comparison`);

        // Breadcrumb navigation to go back to the previous level
        svg.on("dblclick", () => {
            
            currentNode = null;
            renderBarGraphCancerPerCountry(mainData);
            
        });
        const drag = dragSelection(chartContent, xScale);
        svg.call(drag);

    } else {
        svg.selectAll(".bar-hierarchical").remove();
        // Flat structure for non-hierarchical view
        const value = state.selectedGender;
        xScale = d3.scaleBand()
            .domain(chartData.map(d => d.iso))
            .range([0, width])
            .padding(0.1);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d[value])])
            .range([height, 0]);

        const barsOverlay = chartContent.selectAll(".overlay")
        .data(chartData, d => d.iso);
    
        // Adding invisible overlay for interactivity
        barsOverlay.enter()
            .append("rect")
            .attr("class", d => `overlay overlay-${d.iso}`)
            .attr("x", d => xScale(d.iso))
            .attr("y", d => 0)
            .attr("width", xScale.bandwidth())
            .attr("height", d => height- (height - yScale(d[value])) )
            .style("fill", "transparent")
            .style("cursor", "pointer")
            .on("click", (event,d) => handleClick(event, d))
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "#ddd");
                d3.select(`.bar-${d.iso}`).style("fill", "darkgrey");
                showToolTip(event, d);
            })
            .on("mousemove", positionToolTip)
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", "transparent");
                d3.select(`.bar-${d.iso}`).style("fill", state.selectedCountriesISO.includes(d.iso) ? "darkgrey" : "steelblue");
                hideToolTip();
            })
        barsOverlay.exit().remove();

        const bars = chartContent.selectAll(".bar")
            .data(chartData, d => d.iso);

            bars.enter()
            .append("rect")
            .attr("class", d => `bar bar-${d.iso}`)
            .attr("x", d => xScale(d.iso))
            .attr("y", height)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .style("fill", d => state.selectedCountriesISO.includes(d.iso) ? "darkgrey" : "steelblue")
            .style("cursor", "pointer")
            .on("click", (event,d) => handleClick(event, d))
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "darkgrey");
                d3.select(`.overlay-${d.iso}`).style("fill", "#ddd");
                showToolTip(event, d);
            })
            .on("mousemove", positionToolTip)
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", state.selectedCountriesISO.includes(d.iso) ? "darkgrey" : "steelblue");
                d3.select(`.overlay-${d.iso}`).style("fill", "transparent");
                hideToolTip();
            })
            .transition()
            .duration(500)
            .attr("y", d => yScale(d[value]))
            .attr("height", d => height - yScale(d[value]))

        bars.transition()
            .duration(500)
            .attr("x", d => xScale(d.iso))
            .attr("y", d => yScale(d[value]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[value]))
            .style("fill", d => state.selectedCountriesISO.includes(d.iso) ? "darkgrey" : "steelblue");

        bars.exit().remove();

        chartContent.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale)
                .tickSize(5)
                .tickSizeOuter(0)
                .tickPadding(15)
                .tickFormat((d, i) => {
                    if (sortBy === 'alphabetical') {
                        const countryName = state.countryNames[d].fullname;
                        const firstLetter = countryName[0].toUpperCase();
                        
                        // Only display the letter when it changes
                        if (i === 0 || firstLetter !== state.countryNames[chartData[i - 1].iso].fullname[0].toUpperCase()) {
                            return firstLetter;
                        } else {
                            return ""; // Empty string for non-starting letters
                        }
                    } else {
                        return state.countryNames[d].alpha3; // Default to alpha3 code for other sorting
                    }
                })
            )
            .style("color", "#ccc")
            .selectAll("text")
            .style("color", "black")
            .style("font-size", "9px")
            .attr("dy", (d, i) => {
                if (sortBy === 'alphabetical') {
                    return "0em";
                } else {
                    return i % 3 === 0 ? "-0.5em" : i % 3 === 1 ? "1em" : "2.5em";

                }
            })
            .style("text-anchor", "middle");

        // Append y-axis
        chartContent.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(5).tickFormat(d3.format(".1s")))
        .style("color", "#ccc")
        .select(".domain").remove();



        chartContent.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(`${cancerLongNameMap[state.selectedCancer]} (ASR) - Country Comparison`);
        const drag = dragSelection(chartContent, xScale);
        svg.call(drag);
        
    }

    // Append y-axis label
    chartContent.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(0)")  // Rotate the label vertically
    .attr("y", height / 2)  // Adjust distance from y-axis
    .attr("x", -40)  // Center label vertically
    .attr("dy", "1em")  // Adjust for alignment
    .style("text-anchor", "middle")
    .style("font-size", "9px")
    .text("ASR");  // Replace with your desired label text

    

    
}




function prepareDataForChart() {
    const isos = state.selectedCountriesISO;
    const gender = state.selectedGender;
    const cancerData = state.data.cancerTypes[state.selectedCancer];
    let chartData;

    if (sortBy === 'hierarchical') {
        // Group data by continent
        const continents = {};

        cancerData.forEach(item => {
            const iso = item.iso;
            const country = state.countryNames[iso];
            const continent = country.continent;

            // Ensure continent exists in structure
            if (!continents[continent]) {
                continents[continent] = { name: continent, children: [] };
            }

            // Add country data to the continent's children array
            continents[continent].children.push({
                name: country.fullname,
                iso: iso,
                value: +item[gender]
            });
        });

        // Convert continents object to array format
        chartData = Object.values(continents);

    } else {
        // Flat structure for non-hierarchical views
        chartData = cancerData
            .map(item => ({
                iso: item.iso,
                [gender]: +item[gender]
            }));

        chartData = sortCountryData(chartData, sortBy);
    }

    return chartData;
}

function selectContinent(event, d) {
    console.log("Selected continent", d);
    //setState("selectedCountriesISO", [...state.selectedCountriesISO, ...selectedBars], true);
}



function handleClick(event, d) {
    if (state.selectedCountriesISO.includes(d.iso)) {
        setState("selectedCountriesISO", state.selectedCountriesISO.filter(iso => iso !== d.iso), true);
    } else {
        setState("selectedCountriesISO", [...state.selectedCountriesISO, d.iso], true);
    }
}

function showToolTip(event, d) {
    const tooltip = d3.select("#tooltipBar");
    tooltip
        .style("display", "block")
        .style("left", `${event.pageX}+10px`)
        .style("top", `${event.pageY}px`)

        .html(`
            <div class="font-bold text-lg mb-1 text-left">
                ${state.countryNames[d.iso].fullname}
            </div>

            <div class="text-left">
                <strong>${state.selectedGender} (ASR):</strong> ${d[state.selectedGender]}
            </div>
        `);
}

function positionToolTip(event) {
    const tooltip = d3.select("#tooltipBar");
    const tooltipWidth = tooltip.node().offsetWidth;
    const tooltipHeight = tooltip.node().offsetHeight;
    const offsetX = 10; // Standard horizontal offset from the mouse pointer
    const offsetY = 0;  // Standard vertical offset from the mouse pointer

    // Determine initial tooltip position based on the mouse position
    let leftPosition = event.pageX + offsetX;
    let topPosition = event.pageY + offsetY;

    // Flip to the left side of the mouse if the mouse is past halfway horizontally
    if (event.pageX > window.innerWidth *0.5) {
        leftPosition = event.pageX - tooltipWidth - offsetX;
    }

    // Flip to above the mouse if the mouse is past halfway vertically
    if (event.pageY > window.innerHeight *0.5) {
        topPosition = event.pageY - tooltipHeight - offsetY;
    }

    // Apply the position
    tooltip
        .style("width", "200px")
        .style("left", `${leftPosition}px`)
        .style("top", `${topPosition}px`);
}

function dragSelection(chartContent, xScale) {
    let startX;
    return d3.drag()
        .on("start", (event) => {
            if (!dragging) return;
            startX = event.x;

            chartContent.selectAll(".bar, .bar-hierarchical")
                .classed("selected", d => {
                    let barX, isSelected;
                    
                    if (sortBy === 'hierarchical') {
                        barX = xScale(d.data.iso) + xScale.bandwidth() / 2;
                        isSelected = startX <= barX && barX <= event.x;
                        d3.select(`.bar-hierarchical-${d.data.iso}`)
                            .style("fill", isSelected ? "darkgrey" : state.selectedCountriesISO.includes(d.data.iso) ? "darkgrey" : "steelblue");
                    } else {
                        barX = xScale(d.iso) + xScale.bandwidth() / 2;
                        isSelected = startX <= barX && barX <= event.x;
                        d3.select(`.bar-${d.iso}`)
                            .style("fill", isSelected ? "darkgrey" : state.selectedCountriesISO.includes(d.iso) ? "darkgrey" : "steelblue");
                    }
                    
                    return isSelected;
                });
        })
        .on("drag", (event) => {
            if (!dragging) return;

            const endX = event.x;

            chartContent.selectAll(".bar, .bar-hierarchical")
                .classed("selected", d => {
                    let barX, isSelected;

                    if (sortBy === 'hierarchical') {
                        barX = xScale(d.data.name) + xScale.bandwidth() / 2;
                        isSelected = Math.min(startX, endX) <= barX && barX <= Math.max(startX, endX);
                        const obj = d3.select(`.bar-hierarchical-${d.data.iso}`)
                            .style("fill", isSelected ? "darkgrey" : state.selectedCountriesISO.includes(d.data.iso) ? "darkgrey" : "steelblue");
                    } else {
                        barX = xScale(d.iso) + xScale.bandwidth() / 2;
                        isSelected = Math.min(startX, endX) <= barX && barX <= Math.max(startX, endX);
                        d3.select(`.bar-${d.iso}`)
                            .style("fill", isSelected ? "darkgrey" : state.selectedCountriesISO.includes(d.iso) ? "darkgrey" : "steelblue");
                    }

                    return isSelected;
                });
        })
        .on("end", () => {
            if (!dragging) return;

            // Select the bars based on the selection
            let selectedBars;
            if (sortBy === 'hierarchical') {
                selectedBars = chartContent.selectAll(".bar-hierarchical.selected").data().map(d => d.data.iso);
            } else {
                selectedBars = chartContent.selectAll(".bar.selected, .bar-hierarchical.selected").data().map(d => d.iso);
            }

            // Update the global selected countries state
            setState("selectedCountriesISO", [...state.selectedCountriesISO, ...selectedBars], true);

            // Reset color for all bars based on the updated state
            chartContent.selectAll(".bar, .bar-hierarchical").style("fill", d => {
                const iso = sortBy === 'hierarchical' ? d.data.iso : d.iso;
                return state.selectedCountriesISO.includes(iso) ? "darkgrey" : "steelblue";
            });
        });
}




function hideToolTip() {
    d3.select("#tooltipBar").style("display", "none");
}


function sortCountryData(data) {
    const gender = state.selectedGender; // assuming state.selectedGender is defined

    return data
        .sort((a, b) => {
            if (sortBy === 'alphabetical') {
                // Use countryNames to get the full name for sorting
                const nameA = state.countryNames[a.iso].fullname;
                const nameB = state.countryNames[b.iso].fullname;
                return nameA.localeCompare(nameB);
            } else if (sortBy === 'value') {
                return a[gender] - b[gender]; // Sort by the selected gender value
            } else if (sortBy === 'hierarchical') {
                return 0
            }
            return 0;
        });
}


document.querySelectorAll('input[name="sortOption"]').forEach(option => {
    option.addEventListener('change', (event) => {
        const option = event.target.value;
        sortBy = option
        setState("selectedCancer", state.selectedCancer, true)
    });
});


const cancerLongNameMap = {
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


document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.altKey) {
        dragging = true;
    }
})

document.addEventListener("keyup", (event) => {
    if (!event.metaKey && !event.altKey) {
        dragging = false;
    }
})