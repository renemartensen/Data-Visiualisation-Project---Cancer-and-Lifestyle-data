import { state, setState } from './state.js';

export function showOverlay(iso, countryName) {

    const cancers = getSortedCancerRatesForCountry(state.data.cancerTypes, iso) 
    const top5CancerTypes = cancers.slice(0, 5);
    const bottom5CancerTypes = cancers.slice(-5)

    top5CancerTypes.forEach(element => {
        const cancerType = element.cancerType
        const mean = getMean(state.data.cancerTypes[cancerType], cancerType)
        element["mean"] = mean.toFixed(2)
    })

    bottom5CancerTypes.forEach(element => {
        const cancerType = element.cancerType
        const mean = getMean(state.data.cancerTypes[cancerType], cancerType)
        element["mean"] = mean.toFixed(2)
    })
    

    const lifeStyleData = []
    const lifeStyles = state.data.lifeStyleChoices
    const lifestyleUnits = {
        "tobacco_2005": "%",
        "alcohol_2019": "L/capita/year",
        "physical_activity": "%",
        "uv_radiation": "j/m2"
    };
    
    Object.entries(lifeStyles).forEach(([lifeStyle, countries]) => {
        const countryData = countries.find(country => country.iso === iso);
        // Check if countryData is defined
        if (countryData) {
            const rate = countryData.both;
            const mean = getMean(countries).toFixed(2);
            lifeStyleData.push({
                value: rate,
                mean: mean,
                unit: lifestyleUnits[lifeStyle],
                type: state.data.lifeStyleNames[lifeStyle]
            });
        }
        else {
            lifeStyleData.push({
                value: -1,
                mean: -1,
                unit: lifestyleUnits[lifeStyle],
                type: state.data.lifeStyleNames[lifeStyle]
            });
        }
    })

    const overlay = document.createElement("div");
    overlay.id = "overlay"
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    document.body.appendChild(overlay)

    // Create content container
    const contentContainer = document.createElement("div");
    contentContainer.className = "max-w-3xl w-full bg-white rounded-lg shadow-lg relative p-6";
    contentContainer.style.maxHeight = "80vh";  // Limits height for scrollability within overlay
    contentContainer.style.overflowY = "auto";   // Enables scrolling within this container

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.className = "absolute top-2 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl focus:outline-none";
    closeButton.onclick = closeOverlay;
    contentContainer.appendChild(closeButton);

    // Create title and content
    const title2 = document.createElement("h2");
    title2.className = "text-2xl font-bold text-center";
    title2.innerText = `Country: ${countryName} (${iso})`;
    contentContainer.appendChild(title2);

    const description = document.createElement("p");
    description.className = "text-gray-700 text-center";
    description.innerText = "Summary";
    contentContainer.appendChild(description);

    overlay.appendChild(contentContainer)
    document.body.appendChild(overlay)
    

    // Chart container for side-by-side display
    const chartsContainer = document.createElement("div");
    chartsContainer.style.display = "flex";
    chartsContainer.style.gap = "20px";
    chartsContainer.style.justifyContent = "center";
    contentContainer.appendChild(chartsContainer);


    // Define dimensions
    const width = 250;
    const height = 200;
    const margin = { top: 80, right: 20, bottom: 125, left: 50 };


    // Create bar charts
    createBarChart(chartsContainer, top5CancerTypes, `5 Cancers with Highest ASR`);
    createBarChart(chartsContainer, bottom5CancerTypes, `5 Cancers with Lowest ASR`);


    // The function to create individual bar charts
    function createBarChart(container, data, titleText) {

        const svg = d3.select(container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Set up x-axis and y-axis scales
        const x0 = d3.scaleBand()
            .domain(data.map(d => cancerNames[d.cancerType] || d.cancerType))
            .range([0, width])
            .padding(0.2);
        
        const x1 = d3.scaleBand()
            .domain(["ASR", "MeanASR"])
            .range([0, x0.bandwidth()])
            .padding(0.05);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.bothRate, d.mean)) * 1.1])
            .range([height, 0]);
        
        // Create axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .attr("class", "axis-label")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)") // Rotate labels further to avoid overlap
            .style("font-size", "8px") // Smaller font size to fit within chart bounds
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em"); // Position rotated labels to avoid overlap
        
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(10));
        
        // Add bars for each group with different colors
        svg.selectAll("g.bar-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(${x0(cancerNames[d.cancerType] || d.cancerType)},0)`)
            .selectAll("rect")
            .data(d => [
                { key: "ASR", value: d.bothRate },
                { key: "MeanASR", value: d.mean }
            ])
            .enter()
            .append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("class", d => d.key === "ASR" ? "bar" : "mean-bar")
            .style("fill", d => d.key === "ASR" ? "#1f77b4" : "#ff7f0e");
        
        // Add labels above bars with smaller font
        svg.selectAll("g.bar-group")
            .selectAll("text.bar-label")
            .data(d => [
                { key: "ASR", value: d.bothRate, type: d.cancerType },
                { key: "MeanASR", value: d.mean, type: d.cancerType }
            ])
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "7px") // Smaller font for labels above bars
            .text(d => d.value);
        
        // Add chart title
        svg.append("text")
            .attr("x", 90) // Center horizontally            
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(titleText);
        
        console.log(data)
        if (data.length == 0){
            svg.append("text")
            .attr("x",  125)  // Center horizontally
            .attr("y", 100) // Center vertically
            .attr("text-anchor", "middle") // Center the text horizontally
            .attr("dominant-baseline", "middle") // Center the text vertically
            .style("font-size", "14px")
            .style("fill", "gray")
            .text("No Data Available");
        }
        
        // Call the createLegend function for each chart
        createLegend(svg);
    }

    // Function to create the legend
    function createLegend(svg) {
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, -30)`);

        const legendData = [
            { label: "Country ASR", color: "#1f77b4" },
            { label: "Mean ASR", color: "#ff7f0e" }
        ];
        
        legendData.forEach((d, i) => {
            legend.append("rect")
                .attr("x", i * 100)
                .attr("y", 0)
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", d.color);
            
            legend.append("text")
                .attr("x", i * 100 + 20)
                .attr("y", 12)
                .text(d.label)
                .style("font-size", "10px")
                .attr("alignment-baseline", "middle");
        });
    }

    // Add this function to create the small multiples for lifestyle types
    function createLifestyleCharts(container, lifestyleData) {
        // Define dimensions for the mini-charts
        const miniWidth = 100;
        const miniHeight = 100;
        const miniMargin = { top: 20, right: 10, bottom: 40, left: 40 };

        // Create a container for the mini-charts
        const lifestyleContainer = d3.select(container)
            .append("div")
            .attr("class", "lifestyle-charts")
            .style("display", "flex")
            .style("gap", "20px")
            .style("justify-content", "center")
            .style("margin-top", "20px");

        // Iterate over each lifestyle type and create a mini-chart
        lifestyleData.forEach(({ type, value, mean, unit }) => {
            // Create a mini SVG for each lifestyle chart
            const svg = lifestyleContainer.append("svg")
                .attr("width", miniWidth + miniMargin.left + miniMargin.right)
                .attr("height", miniHeight + miniMargin.top + miniMargin.bottom)
                .append("g")
                .attr("transform", `translate(${miniMargin.left},${miniMargin.top})`);

            // X and Y scales
            const x = d3.scaleBand()
                .domain(["Value", "Mean"])
                .range([0, miniWidth])
                .padding(0.4);
            
            const y = d3.scaleLinear()
                .domain([0, Math.max(value, mean) * 1.1])
                .range([miniHeight, 0]);

            
            // X-axis
            svg.append("g")
            .attr("transform", `translate(0,${miniHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "10px");

            svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(4)) // Set the number of ticks
            .style("font-size", "12px") // Larger font size for visibility
            .style("font-family", "Arial, sans-serif"); // Use a readable font

            // Bars for value and mean
            svg.selectAll(".bar")
                .data([{ label: "Value", value }, { label: "Mean", value: mean }])
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.label))
                .attr("y", d => y(d.value))
                .attr("width", x.bandwidth())
                .attr("height", d => miniHeight - y(d.value))
                .style("fill", (d, i) => i === 0 ? "#1f77b4" : "#ff7f0e"); // Different colors for Value and Mean

            // Labels above bars
            svg.selectAll(".bar-label")
                .data([{ label: "Value", value }, { label: "Mean", value: mean }])
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.label) + x.bandwidth() / 2)
                .attr("y", d => y(d.value) - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .text(d => d.value);

            // Title for each lifestyle type
            svg.append("text")
                .attr("x", miniWidth / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(type);

            // Unit label below the mini-chart
            svg.append("text")
                .attr("x", miniWidth / 2)
                .attr("y", miniHeight + 25)
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .text(`(${unit})`);

            if (value == -1){
                svg.append("text")
                .attr("x", 50)  // Center horizontally
                .attr("y", 50) // Center vertically
                .attr("text-anchor", "middle") // Center the text horizontally
                .attr("dominant-baseline", "middle") // Center the text vertically
                .style("font-size", "12px")
                .style("fill", "black")
                .text("No Data Available");
            } 
        });
    }

    // Call the createLifestyleCharts function within the showOverlay function
    createLifestyleCharts(contentContainer, lifeStyleData);


    // Close overlay function
    function closeOverlay() {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }

    // Close overlay on Escape key or click outside content
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeOverlay();
    });
}


function getSortedCancerRatesForCountry(data, code) {
    const cancerRates = [];
    // Iterate through each cancer type
    for (const [cancerType, countries] of Object.entries(data)) {
        if (cancerType == "all-cancers"){
            continue
        }

        // Find the entry for the given country code
        const countryData = countries.find(country => country.iso === code);
        if (countryData) {
            // Push the cancer type and its "both" rate to the array
            cancerRates.push({ cancerType, bothRate: countryData.both });
        }
    }

    // Sort by the "both" rate in descending order
    cancerRates.sort((a, b) => b.bothRate - a.bothRate);
    return cancerRates
}

function getMean(data){
    const meanBoth = data.reduce((sum, item) => sum + parseFloat(item.both), 0) / data.length;
    return meanBoth
}



export function showHelpOverlay() {
    // Create overlay background
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    // Create content container
    const contentContainer = document.createElement("div");
    contentContainer.className = "max-w-3xl w-full bg-white rounded-lg shadow-lg relative p-6";
    contentContainer.style.maxHeight = "80vh";  // Limits height for scrollability within overlay
    contentContainer.style.overflowY = "auto";   // Enables scrolling within this container

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.className = "absolute top-2 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl focus:outline-none";
    closeButton.onclick = closeOverlay;
    contentContainer.appendChild(closeButton);

    // Create title and content
    const title = document.createElement("h2");
    title.className = "text-2xl font-bold text-center";
    title.innerText = "Help Document";

    const description = document.createElement("p");
    description.className = "text-gray-700 text-center";
    description.innerText = "Description of units of mesaurement and methods used.";

    const helpContent = document.createElement("div");
    helpContent.className = "space-y-10 text-left mt-4";
    helpContent.innerHTML = `
        <section class="mb-8">
            <h3 class="text-xl font-semibold mb-2">Lifestyle Factors</h3>
            <ul class="list-disc ml-8 text-gray-700 space-y-1">
                <li><strong>Alcohol Consumption:</strong> The total alcohol consumption per adult aged over 15 years, measured in liters of pure alcohol per year. Estimates are based on national consumption, sales, surveys, and expert judgment of unrecorded alcohol consumption. </li>
                <li><strong>Tobacco Usage:</strong> The percentage (%) of the population aged 15 years and over who currently use any tobacco product (smoked and/or smokeless tobacco) on a daily or non-daily basis. Tobacco products include cigarettes, pipes, cigars, cigarillos, waterpipes (hookah, shisha), bidis, kretek, heated tobacco products, and all forms of smokeless (oral and nasal) tobacco. Tobacco products exclude e-cigarettes (which do not contain tobacco), “e-cigars”, “e-hookahs”, JUUL and “e-pipes”.  (Age-Standardized).</li>
                <li><strong>Physical Inactivity:</strong> Percentage (%) of population attaining less than 150 minutes of moderate-intensity physical activity per week, or less than 75 minutes of vigorous-intensity physical activity per week, or equivalent. (Age-Standardized).</li>
                <li><strong>UV Radiation:</strong> The estimates are population-weighted average daily ambient UVR level (in J/m2) for the years 1997–2003. The estimations of UVR involve assuming a population-level exposure represented by annual ambient erythemally weighted UVR (calculated from satellite data) or a proxy such as latitudinal position.  </li>
            </ul>
        </section>

        <section class="mb-8">  
            <h3 class="text-xl font-semibold mb-2 ">Cancer Types</h3>
            <ul class="list-disc ml-8 text-gray-700 space-y-2">
                <li><strong>ASR (Age-Standardized Rate) per 100,000 individuals:</strong> Standardizing rates across populations with different age distributions and population sizes.</li>
                
            </ul>
        </section>

        <section>
            <h3 class="text-xl font-semibold mb-2">Understanding ASR (Age-Standardized Rate)</h3>
            <p class="text-gray-600"> The age-standardized rate (ASR) is a statistical measure used to compare the rate of a condition across different populations with varying age distribution</p>
        </section>

        <section>
            <h3 class="text-xl font-semibold mb-2">Understanding Pearson Correlation</h3>
            <p class="text-gray-600">The Pearson Correlation Coefficient describes the relationship between lifestyle factors and cancer rates:</p>
            <ul class="list-disc ml-8 text-gray-700 space-y-2">
                <li><strong>Range:</strong> Values between -1 and 1 indicate negative, positive, or no correlation.</li>
                <li><strong>Interpretation:</strong> Positive correlation indicates that as one factor increases, so does another (e.g., smoking and lung cancer).</li>
                <li><strong>Limitations:</strong> Correlation does not imply causation; high correlation does not mean one factor causes the other.</li>
            </ul>
        </section>
    `;

    // Append title, description, and content to content container
    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(helpContent);

    // Append content container to overlay
    overlay.appendChild(contentContainer);

    // Add overlay to the body
    document.body.appendChild(overlay);

    // Close overlay function
    function closeOverlay() {
        document.body.removeChild(overlay);
    }

    // Close overlay on Escape key or click outside content
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeOverlay();
    });
}


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