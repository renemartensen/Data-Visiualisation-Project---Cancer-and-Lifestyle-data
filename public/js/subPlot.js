import { state , setState } from './state.js';


export function renderSubPlot(mainData) {
    const chartData = prepareDataForChart(mainData, state.selectedCountriesISO, state.selectedGender);

    const margin = { top: 0, right:0, bottom: 0, left: 0};
    const div = d3.select("#barchartContainer");
    const width = div.node().clientWidth;
    const height = div.node().clientHeight;

    // Select or create the SVG element
    let svg = div.select("svg");
    if (svg.empty()) {
        svg = div.append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("overflow", "visible")
    } else {
        svg.selectAll(".row-background, .x-axis, .y-axis").remove();
    }

    // Define scales
    const yScale = d3.scaleBand()
        .domain(chartData.map(d => d.cancerType))
        .range([0, height])
        .padding(0.01);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.value)])
        .range([width, 0]); 

    // Add row backgrounds for hover effect
    const rowBackgrounds = svg.selectAll(".row-background")
        .data(chartData);

    rowBackgrounds.enter()
        .append("rect")
        .attr("class", d =>`row-background row-background-${d.cancerType.replace(/\s+/g, '-')}`)
        .merge(rowBackgrounds)  // Combine enter and update selections
        .attr("x", 0)
        .attr("y", d => yScale(d.cancerType))
        .attr("width",d =>  width- (width - xScale(d.value)))
        .attr("height", yScale.bandwidth())
        .style("fill", d => d.cancerType === state.selectedCancer ? "#ddd" : "transparent")
        .style("cursor", "pointer")
        .on("click", event => setState( "selectedCancer", event.target.__data__.cancerType))
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "#ddd");
            d3.select(`.bar-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", "darkgrey");
            d3.select(`.y-axis-label-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", "black");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("fill", d.cancerType === state.selectedCancer ? "#ddd" : "transparent");
            d3.select(`.bar-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", "steelblue");
            d3.select(`.y-axis-label-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", c => c === state.selectedCancer ? "black" : "#ccc");
        });

    rowBackgrounds.exit().remove();  // Remove any old elements

    const bars = svg.selectAll(".bar")
    .data(chartData, d => d.cancerType);  // Use cancerType as the key for consistency

    // Handle new bars (enter selection)
    bars.enter()
        .append("rect")
        .attr("class", d => `bar bar-${d.cancerType.replace(/\s+/g, '-')}`)
        .attr("y", d => yScale(d.cancerType))
        .attr("height", yScale.bandwidth())
        .attr("x", width)  // Start from the right edge
        .attr("width", 0)  // Start width at 0 for animation
        .style("fill", d => d.cancerType === state.selectedCancer ? "darkgrey" : "steelblue")
        .style("cursor", "pointer")
        .on("click", event => setState( "selectedCancer", event.target.__data__.cancerType))
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "darkgrey");
            d3.select(`.row-background-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", "#ddd");
            d3.select(`.y-axis-label-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", "black");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("fill", d.cancerType === state.selectedCancer ? "darkgrey" : "steelblue");
            d3.select(`.row-background-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", d.cancerType === state.selectedCancer ? "#ddd" : "transparent");
            d3.select(`.y-axis-label-${d.cancerType.replace(/\s+/g, '-')}`).style("fill", c => c === state.selectedCancer ? "black" : "#ccc");
        })
        .transition()
        .duration(500)
        .attr("x", d => xScale(d.value))  // Animate to target x position based on value
        .attr("width", d => width - xScale(d.value));

    // Handle updated bars (update selection)
    bars.transition()
        .duration(500)
        .attr("y", d => yScale(d.cancerType))
        .attr("height", yScale.bandwidth())
        .attr("x", d => xScale(d.value))  // Animate x position based on new data
        .attr("width", d => width - xScale(d.value))
        .style("fill", d => d.cancerType === state.selectedCancer ? "darkgrey" : "steelblue");
    
    bars.exit().remove();  // Remove old bars



    // Update x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 0)`)
        .style("color", "#ccc")
        .call(d3.axisTop(xScale).tickSize(5).tickSizeOuter(0).tickFormat(d3.format(".2s")));

    // Add x-axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)  // Center label horizontally
        .attr("y", (-margin.top / 2)-20)  // Position above the x-axis
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .text("Avg. ASR. of selected countries");  // Replace with the actual label text

    // Update y-axis with labels
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisRight(yScale).tickSize(5).tickSizeOuter(0).tickFormat(cancerType => `${cancerLongNameMap[cancerType] || cancerType}: ${chartData.find(d => d.cancerType === cancerType).value.toFixed(2)}`))
        .style("color", "#ccc")
        .transition()  // Apply transition for animation
        .duration(500)  // Animation duration in milliseconds
        .selectAll("text")
        .attr("class", d => `y-axis-label-${d.replace(/\s+/g, '-')}`)
        .style("font-size", "10px")
        .style("fill", (c => c === state.selectedCancer ? "black" : "#ccc"))
        .style("pointer-events", "none");

    // Add y-axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", width + margin.right / 2)  // Position to the right of the y-axis
        .attr("y", (height / 2)-10 )  // Center label vertically
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .attr("transform", `rotate(90 ${width + margin.right / 2}, ${height / 2})`)
        .text("Cancer Types"); 
}




function prepareDataForChart(data, selectedCountries, gender) {
    
    return Object.keys(data.cancerTypes)
        .filter(cancerType => cancerType !== "all-cancers")
        .map(cancerType => {
            // If selectedCountries is empty, use all entries; otherwise, filter by selectedCountries
            const entries = selectedCountries.length > 0
                ? data.cancerTypes[cancerType].filter(entry =>
                    selectedCountries.includes(entry.iso)
                  )
                : data.cancerTypes[cancerType];

            // Calculate the total and average for the specified gender
            const validEntries = entries.filter(entry => !isNaN(parseFloat(entry[gender])));
            const total = validEntries.reduce((acc, entry) => {
                return acc + parseFloat(entry[gender]);
            }, 0);

            // Calculate the average, accounting for the case of no entries
            const avg = entries.length > 0 ? total / entries.length : 0;
            return { cancerType, value: avg };
        })
        .sort((a, b) =>  b.value - a.value );
}


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