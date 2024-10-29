export function renderMatrix(data) {

    createMatrix(data)
}



// Calculate correlations between cancer rate and lifestyle rates
const calculateCorrelation = (cancerRate, lifestyleRate) => {
    return Math.abs(cancerRate - lifestyleRate);  // Simple difference
};


const calculateMeans = (data) => {
    let cancerData = data.cancerTypes;
    let lifeStyleData = data.lifeStyleChoices;

    let lifeStyleAverages = []

    let keysLifeStyle = Object.keys(lifeStyleData)
    for(let i=0; i < keysLifeStyle.length; i++){
        let key = keysLifeStyle[i]
        let avg = calculateAverage(lifeStyleData[key], "both")
        lifeStyleAverages.push({lifeStyleType: key, lifeStyleRate: avg})
    }


    let cancerTypesAverages = []

    let keys = Object.keys(cancerData)
    for(let i=0; i < keys.length; i++){
        let key = keys[i]
        let cancerTypeArray = cancerData[key]
        let avg = calculateAverage(cancerTypeArray, "both")
        cancerTypesAverages.push({cancerType: key, cancerRate: avg})
    }
    return [cancerTypesAverages, lifeStyleAverages]
}


// Function to calculate the average value of "both"
const calculateAverage = (dataArray, gender) => {
    const sum = dataArray.reduce((acc, obj) => {
      const value = parseFloat(obj[gender].split(" ")[0]); // Extract the number before the interval
      return acc + value; // Sum the values
    }, 0);
  
    return sum / dataArray.length; // Calculate average
};


const calculateDifferencesFromMean = (data, meansCancer, meansLifeStyle) => {
    let cancerData = data.cancerTypes;
    let lifeStyleData = data.lifeStyleChoices;

    let diffsFromMeanCancer = {}

    meansCancer.forEach(d => {
        let diffs = {}
        let avg = d.cancerRate
        let currData = cancerData[d.cancerType]
        let values = currData.map(entry => [entry["iso"], parseFloat(entry["both"])])
        values.forEach(entry => diffs[entry[0]] = entry[1] - avg)
        diffsFromMeanCancer[d.cancerType] = diffs
    })

    let diffsFromMeanLifeStyle = {}
    meansLifeStyle.forEach(d => {
        let diffs = {}
        let avg = d.lifeStyleRate
        let currData = lifeStyleData[d.lifeStyleType]
        let values = currData.map(entry => [entry["iso"], parseFloat(entry["both"])])
        values.forEach(entry => diffs[entry[0]] = entry[1] -avg)
        diffsFromMeanLifeStyle[d.lifeStyleType] = diffs
    })
    return [diffsFromMeanCancer, diffsFromMeanLifeStyle]
}

const calculateProductOfDifferences = (diffsFromMeanCancer, diffsFromMeanLifeStyle) => {
    let resultDict = {}
    Object.keys(diffsFromMeanCancer).forEach(cancerType => {
        let diffsCancer = diffsFromMeanCancer[cancerType]
        Object.keys(diffsFromMeanLifeStyle).forEach(lifeStyleType => {
            let diffsLifeStyle = diffsFromMeanLifeStyle[lifeStyleType]
            let sum = 0
            Object.keys(diffsCancer).forEach(countryCode => {
                let cancerDiff = diffsCancer[countryCode]
                let lifeStyleDiff = diffsLifeStyle[countryCode]
                if (!(cancerDiff === undefined || lifeStyleDiff === undefined)){ // Hvis begge er defined
                    sum += cancerDiff * lifeStyleDiff
                }
            })
            resultDict[`${cancerType},${lifeStyleType}`] = sum
        })
    })

    return resultDict

}

const calculateSumOfSquaredDifferences = (diffsFromMeanCancer, diffsFromMeanLifeStyle) => {
    
    let resultDict = {}
    Object.keys(diffsFromMeanCancer).forEach(cancerType => {
        let diffsCancer = diffsFromMeanCancer[cancerType]
        let diffsCancerValues = Object.values(diffsCancer)
        let squaredDiffsCancer = diffsCancerValues.map(d => d**2)
        const sum = squaredDiffsCancer.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        resultDict[cancerType] = sum
    })

    Object.keys(diffsFromMeanLifeStyle).forEach(lifeStyleType => {
        let diffsLifeStyle = diffsFromMeanLifeStyle[lifeStyleType]
        let diffsLifeStyleValues = Object.values(diffsLifeStyle)
        let squaredDiffsLifeStyle = diffsLifeStyleValues.map(d => d**2)
        const sum = squaredDiffsLifeStyle.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        resultDict[lifeStyleType] = sum
    })

    return resultDict
}

const calculateCorrelationCoeffs = (productOfDifferences, sumOfSquaredDifferences) => {
    let resultDict = {}
    Object.keys(productOfDifferences).forEach(key => {
        let valueProductOfDifferences = productOfDifferences[key]
        let cancerType = key.split(",")[0]
        let lifeStyleType = key.split(",")[1]
        let valueSumOfSquaredDiffsCancer = sumOfSquaredDifferences[cancerType]
        let valueSumOfSquaredDiffsLifeStyle = sumOfSquaredDifferences[lifeStyleType]
        let r = (valueProductOfDifferences)/(Math.sqrt(valueSumOfSquaredDiffsCancer) * Math.sqrt(valueSumOfSquaredDiffsLifeStyle))
        resultDict[key] = r
    })

    return resultDict

}

const pearsonCorrelationCoeff = (data) => {
    let result = calculateMeans(data)
    let cancerTypesAverages = result[0];
    let lifeStyleAverages = result[1];

    let resultDiffs = calculateDifferencesFromMean(data, cancerTypesAverages, lifeStyleAverages)
    let diffsFromMeanCancer = resultDiffs[0]
    let diffsFromMeanLifeStyle = resultDiffs[1]

    let productOfDifferences = calculateProductOfDifferences(diffsFromMeanCancer, diffsFromMeanLifeStyle)

    let sumOfSquaredDifferences = calculateSumOfSquaredDifferences(diffsFromMeanCancer, diffsFromMeanLifeStyle)

    let correlationCoeffs = calculateCorrelationCoeffs(productOfDifferences, sumOfSquaredDifferences)
    return correlationCoeffs

}

const createMatrix = (data) => {
    
    let lifeStyleNames = data.lifeStyleNames;

    const cancerTypes = Object.keys(data.cancerTypes);
    const lifeStyles = Object.keys(data.lifeStyleChoices);

    let correlationCoeffs = pearsonCorrelationCoeff(data)
    console.log(correlationCoeffs)
    

    // Define margins at the top, before usage
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    // Set fixed width and height for the entire table
    const tableHeight = 100;  // Fixed height
    const parentDiv = document.querySelector("#correlationMatrix");
    const tableWidth = parentDiv.offsetWidth;   // Dynamic width based on parent div

    // Create the SVG canvas with fixed width and height
    const svg = d3.select("#correlationMatrix")
    .append("svg")
        .attr("viewBox", `0 0 ${tableWidth + margin.left + margin.right} ${tableHeight + margin.top + margin.bottom}`)
        .style("overflow", "visible") // Set overflow to visible to prevent clipping
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        



    // Dynamically calculate the size of each cell based on the number of rows and columns
    const cellWidth = tableWidth / cancerTypes.length;  // Adjusted cell width based on number of columns
    const cellHeight = tableHeight / lifeStyles.length; // Adjusted cell height based on number of rows

    // Scales adjusted based on the fixed table size
    const xScale = d3.scaleBand()
        .domain(cancerTypes)    // change this with names!!!!
        .range([0, tableWidth])

    const yScale = d3.scaleBand()
        .domain(lifeStyles.map(d => lifeStyleNames[d]))
        .range([0, tableHeight])


    const colorScale = d3.scaleLinear()
    .domain([-1,0,1])
    .range(["red", "white", "steelblue"]);

    // Separate g container for axes to simulate absolute positioning
    const axisGroup = svg.append("g").attr("class", "axis-group");

    // X axis for Cancer Types (below the matrix)
    const xAxis = axisGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisTop(xScale).tickSize(5).tickSizeOuter(0).tickFormat(cancerType => cancerNameMap[cancerType] || cancerType)); // Remove tick lines

    xAxis.selectAll("text")
        .attr("transform", "translate(0,0) rotate(-45)")  // Shift down further to be outside
        .style("text-anchor", "start")
        .style("font-size", `${Math.min(cellWidth, cellHeight) / 4}px`);

    xAxis.selectAll("path")
        .style("stroke", "#ccc"); 
    xAxis.selectAll("line")
        .style("stroke", "#ccc");

    // Y axis for Life Styles (left of the matrix)
    const yAxis = axisGroup.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisLeft(yScale).tickSize(5).tickSizeOuter(0)); // Remove tick lines

    yAxis.selectAll("text")
        .attr("transform", "translate(-5, -10) rotate(-45)")  // Shift left further to be outside
        .style("text-anchor", "end")
        .style("font-size", `${Math.min(cellWidth, cellHeight) / 4}px`);

        // Customize Y-axis tick and line color
    yAxis.selectAll("path")
        .style("stroke", "#ccc"); 
    yAxis.selectAll("line")
        .style("stroke", "#ccc");  
    
    
    for(let i=0; i < lifeStyles.length; i++){
        let lifeStyle = lifeStyles[i]
        svg.selectAll(`.${lifeStyle}-cell`)
        .data(cancerTypes)
        .enter()
        .append("rect")
        .attr("class", "matrix-cell")
        .attr("value", cancerType => cancerType + "," + lifeStyle)
        .attr("id", (cancerType, j) => `${i}-${j}`)
        .attr("x", cancerType => xScale(cancerType))
        .attr("y", yScale([lifeStyleNames[lifeStyle]]))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .style("fill", cancerType => colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`]))
        .style("cursor", "pointer")
        .on("mouseover", function(event, cancerType) {
            d3.select(this).style("stroke", "black").style("stroke-width", 2);

            svg.selectAll(".x-axis text")
                    .filter(function(d) { return d === cancerType; })  // Select the specific x-axis label
                    .transition()
                    .duration(100)
                    .style("font-size", `${(Math.min(cellWidth, cellHeight) / 4)*2}px`)
                    .attr("transform", "translate(-10,-25) rotate(0)")
                    .text(cancerType)
                    

            const id = event.target.getAttribute("id").split("-");
            const i = parseInt(id[0]);
            const j = parseInt(id[1]);
            // Apply hover effect to the cells above and to the left
            svg.selectAll(".matrix-cell")
                .style("fill", function(d) {
                    const new_id = d3.select(this).attr("id").split("-");
                    const new_i = parseInt(new_id[0]);
                    const new_j = parseInt(new_id[1]);

                    const id = d3.select(this).attr("value").split(",")
                    const cancerType = id[0]
                    const lifeStyle = id[1]

                    const OGColor = colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`])

                    if ((new_i == i && new_j <= j) || (new_i <= i && new_j == j)) {
                        d3.select(this).style("stroke", "black").style("stroke-width", 2);
                        return d3.color(OGColor).brighter(0.1);
                    } else {
                        d3.select(this).style("stroke", "none");
                        return OGColor
                    }
                        

                }
            );
        })
        .on("mouseout", function(d, cancerType) {
            d3.select(this).style("stroke", "none");
            svg.selectAll(".x-axis text")
                .filter(function(d) { return d === cancerType; })  // Select the specific x-axis label
                .transition()
                .duration(100)
                .style("font-size", `${Math.min(cellWidth, cellHeight) / 4}px`)
                .attr("transform", "translate(0,0) rotate(-45)")
                .text(cancerNameMap[cancerType] || cancerType);
            // Reset colors on mouse out
            svg.selectAll(".matrix-cell")
                .style("fill", function() {
                    const id = d3.select(this).attr("value").split(",")
                    const cancerType = id[0]
                    const lifeStyle = id[1]
                    return colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`])
                })
                .style("stroke", "none");
        });
    }
};

const cancerNameMap = {
    "all-cancers": "AllCancers",
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





        
