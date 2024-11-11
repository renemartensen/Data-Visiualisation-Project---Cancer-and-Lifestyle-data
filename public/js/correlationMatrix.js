import { state, setState } from './state.js';

let selectedCell = "cell-0-0";



export function renderMatrix(data) {

    if (d3.select("#correlationMatrix svg").empty()) {
        createMatrix(data)
    } else {
        //updateMatrix(data)
        createMatrix(data)
    }
}


function createMatrix(data) {
    // Clear any existing SVG elements in #correlationMatrix
    d3.select("#correlationMatrix").select("svg").remove();
    d3.select("#matrixLegend").select("svg").remove();
    
    const cancerTypes = Object.keys(data.cancerTypes).sort();
    const lifeStyles = Object.keys(data.lifeStyleChoices).sort();
    let correlationCoeffs = pearsonCorrelationCoeff(data);
    
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const tableHeight = 100;  // Fixed height
    const parentDiv = document.querySelector("#correlationMatrix");
    const tableWidth = parentDiv.offsetWidth;   // Dynamic width based on parent div

    const svg = d3.select("#correlationMatrix")
        .append("svg")
        .attr("viewBox", `0 0 ${tableWidth + margin.left + margin.right} ${tableHeight + margin.top + margin.bottom}`)
        .style("overflow", "visible")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .classed("svg-content-responsive", true)
        .on("mouseout", () => { toggleCategoryHighlightOn(state.selectedCancer) });

    // Calculate the size of each cell
    const cellWidth = tableWidth / cancerTypes.length;  
    const cellHeight = tableHeight / lifeStyles.length;

    const xScale = d3.scaleBand()
        .domain(cancerTypes)
        .range([0, tableWidth]);

    const yScale = d3.scaleBand()
        .domain(lifeStyles.map(d => lifeStyleNames[d]))
        .range([0, tableHeight]);

    const colorScale = d3.scaleLinear()
        .domain([-1, 0, 1])
        .range(["red", "white", "steelblue"]);

    const axisGroup = svg.append("g").attr("class", "axis-group");

    const xAxis = axisGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisTop(xScale).tickSize(5).tickSizeOuter(0).tickFormat(cancerType => cancerNameMap[cancerType] || cancerType));

    xAxis.selectAll("text")
        .attr("transform", "translate(0,0) rotate(-45)")
        .style("text-anchor", "start")
        .style("font-size", `${8}px`);
    xAxis.selectAll("path").style("stroke", "#ccc");
    xAxis.selectAll("line").style("stroke", "#ccc");

    const yAxis = axisGroup.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisLeft(yScale).tickSize(5).tickSizeOuter(0));

    yAxis.selectAll("text")
        .attr("transform", "translate(-20, -10) rotate(-45)")
        .style("text-anchor", "middle")
        .style("font-size", `${8}px`);
    yAxis.selectAll("path").style("stroke", "#ccc");
    yAxis.selectAll("line").style("stroke", "#ccc");

    createLegend(colorScale);

    const tooltip = d3.select("#tooltipMatrix").style("display", "none");

    for (let i = 0; i < lifeStyles.length; i++) {
        let lifeStyle = lifeStyles[i];
        svg.selectAll(`.${lifeStyle}-cell`)
            .data(cancerTypes)
            .enter()
            .append("rect")
            .attr("class", "matrix-cell")
            .attr("value", cancerType => cancerType + "," + lifeStyle)
            .attr("id", (cancerType, j) => `cell-${i}-${j}`)
            .attr("x", cancerType => xScale(cancerType))
            .attr("y", yScale([lifeStyleNames[lifeStyle]]))
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .style("fill", cancerType => {
                //console.log(lifeStyle, correlationCoeffs[`${cancerType},${lifeStyle}`])
                return correlationCoeffs[`${cancerType},${lifeStyle}`] ? colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`]): "#ccc"

            } )
            .style("cursor", "pointer")
            .on("mouseover", (event, cancerType) => handleMouseOver(event, cancerType, lifeStyle, svg, cellWidth, cellHeight, correlationCoeffs, colorScale, tooltip))
            .on("mouseout", (event, cancerType) => handleMouseOut(event, cancerType, svg, cellWidth, cellHeight, correlationCoeffs, colorScale, tooltip))
            .on("click", (event, cancerType) => {
                handleCellClick(event.target.getAttribute("id"), true);
            });
    }

    toggleCategoryHighlightOn(state.selectedCancer);
    handleCellClick(getCellIdFromCancerAndLifestyle(data, state.selectedCancer, state.selectedLifestyle));
};

function createLegend(colorScale) {
    const legendWidth = 150;
    const legendHeight = 10;

    // Select the matrixLegend div and append an SVG to it
    const legendSvg = d3.select("#matrixLegend")
        .append("svg")
        .attr("class", "legend")
        .attr("width", legendWidth + 40) // Add padding for labels
        .attr("height", legendHeight + 20); // Add padding for labels

    // Create a gradient using colorScale's colors
    const gradient = legendSvg.append("defs")
        .append("linearGradient")
        .attr("id", "color-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // Set stops for the gradient from -1, 0, to 1
    gradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(-1));
    gradient.append("stop").attr("offset", "50%").attr("stop-color", colorScale(0));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(1));

    // Draw the legend rectangle with the gradient
    legendSvg.append("rect")
        .attr("x", 20)  // Padding for the labels
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#color-gradient)");

    // Add tick labels (-1, 0, 1) directly without an axis line
    const labels = [-1, 0, 1];
    const labelPositions = [0, legendWidth / 2, legendWidth];  // Corresponding positions for each label

    // Append text elements for each label
    legendSvg.selectAll("text")
        .data(labels)
        .enter()
        .append("text")
        .attr("x", (d, i) => 20 + labelPositions[i]) // Position relative to rectangle
        .attr("y", legendHeight + 10) // Position below the gradient
        .attr("text-anchor", "middle")
        .style("font-size", "8px")
        .style("fill", "#666")
        .text(d => d);
}



function handleCellClick(cellId, isClick = false) {

    // deselect the previous cell
    d3.select(`#${selectedCell}`).style("stroke", "none");

    // select the new cell
    selectedCell = cellId;
    const svg = d3.select(`#${selectedCell}`)
    svg.style("stroke", "black")
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", "5,5")
        .raise();

    const cancerType = d3.select(`#${selectedCell}`).attr("value").split(",")[0]
    const lifeStyle = d3.select(`#${selectedCell}`).attr("value").split(",")[1]

    if (isClick) {
        setState("selectedLifestyle", lifeStyle,false);
        setState("selectedCancer", cancerType);
    }
    
}


function handleMouseOver(event, cancerType, lifeStyle, svg, cellWidth, cellHeight, correlationCoeffs, colorScale, tooltip) {

    // Handle Tooltip
    
    const cell = event.target;
    const cellRect = cell.getBoundingClientRect(); // Get the cell's position in page coordinates

    tooltip.style("display", "block")
        .html(`Pearson Correlation Coeff.: ${correlationCoeffs[`${cancerType},${lifeStyle}`].toFixed(2)}`)
        .style("left", `${cellRect.left + window.scrollX + cellRect.width + 10}px`) // Position to the right of the cell
        .style("top", `${cellRect.top + window.scrollY }px`);


    toggleCategoryHighlightOff(state.selectedCancer, lifeStyle)
    toggleCategoryHighlightOn(cancerType, lifeStyle)
            

    const id = event.target.getAttribute("id").split("-");
    const i = parseInt(id[1]);
    const j = parseInt(id[2]);
    // Apply hover effect to the cells above and to the left
    svg.selectAll(".matrix-cell")
        .style("fill", function(d) {
            const new_id = d3.select(this).attr("id").split("-");
            const new_i = parseInt(new_id[1]);
            const new_j = parseInt(new_id[2]);

            const id = d3.select(this).attr("value").split(",")
            const cancerType = id[0]
            const lifeStyle = id[1]

            const OGColor = correlationCoeffs[`${cancerType},${lifeStyle}`] ?  colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`]): "#ccc"

            if ((new_i == i && new_j <= j) || (new_i <= i && new_j == j)) {
                //d3.select(this).style("stroke", "black").style("stroke-width", 2);
                if (new_i == i && new_j == j) {
                    return d3.color(OGColor).darker(1);
                }
                return d3.color(OGColor).darker(0.5);
            } else {
                
                return OGColor
            }
        }
    );
}

function toggleCategoryHighlightOn(cancerType, lifeStyle) {
    d3.selectAll("#correlationMatrix .x-axis text")
            .filter(function(d) { return d === cancerType; }) 
            .attr("transform", "translate(-10,-35) rotate(0)")
            
            .style("font-size", `${12}px`)
            .text(cancerLongNameMap[cancerType] || cancerType)

    d3.selectAll(".y-axis text")
        .filter(function(d) {return d === lifeStyleNames[lifeStyle];})

        .style("font-size", `${12}px`)
}

function toggleCategoryHighlightOff(cancerType, lifeStyle) {
    d3.selectAll("#correlationMatrix .x-axis text")

            .style("font-size", `${8}px`)
            .attr("transform", "translate(0,0) rotate(-45)")
            .text(d => cancerNameMap[d] || d)

    d3.selectAll(".y-axis text")
        .filter(function(d) {
            return d === lifeStyleNames[lifeStyle];
        })
        .style("font-size", `${8}px`)
        
}



function handleMouseOut(event, cancerType, svg, cellWidth, cellHeight, correlationCoeffs, colorScale, tooltip) {
    tooltip.style("display", "none");
    
    const lifeStyle = d3.select(event.target).attr("value").split(",")[1]

    toggleCategoryHighlightOff(cancerType, lifeStyle)

    // Reset colors on mouse out
    svg.selectAll(".matrix-cell")
        .style("fill", function() {
            const id = d3.select(this).attr("value").split(",")
            const cancerType = id[0]
            const lifeStyle = id[1]
            return correlationCoeffs[`${cancerType},${lifeStyle}`] ?  colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`]): "#ccc"
        })
        
}


function getCellIdFromCancerAndLifestyle(data, cancerType, lifeStyle) {
    const cancerTypes = Object.keys(data.cancerTypes).sort();
    const lifeStyles = Object.keys(data.lifeStyleChoices).sort();
    const x = cancerTypes.findIndex(d => d === cancerType);
    const y = lifeStyles.findIndex(d => d === lifeStyle);
    return `cell-${y}-${x}`;
}



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


let lifeStyleNames = {"tobacco_2005": "Tobacco", "alcohol_2019": "Alcohol", "uv_radiation": "UV", "physical_activity": "Inactivity" }






const calculateMeans = (data) => {
    let cancerData = data.cancerTypes;
    let lifeStyleData = data.lifeStyleChoices;
    let lifeStyleAverages = []

    let keysLifeStyle = Object.keys(lifeStyleData)
    for(let i=0; i < keysLifeStyle.length; i++){
        let key = keysLifeStyle[i]
        let avg = calculateAverage(lifeStyleData[key], state.selectedGender)
        lifeStyleAverages.push({lifeStyleType: key, lifeStyleRate: avg})
    }


    let cancerTypesAverages = []

    let keys = Object.keys(cancerData)
    for(let i=0; i < keys.length; i++){
        let key = keys[i]
        let cancerTypeArray = cancerData[key]
        let avg = calculateAverage(cancerTypeArray, state.selectedGender)
        cancerTypesAverages.push({cancerType: key, cancerRate: avg})
    }
    return [cancerTypesAverages, lifeStyleAverages]
}


// Function to calculate the average value of "both"
const calculateAverage = (dataArray, gender) => {
    
    const sum = dataArray.reduce((acc, obj) => {
      const value = +obj[gender];
      return acc + value; // Sum the values
    }, 0);
    const avg = sum / dataArray.length;
    
    return avg  
};


const calculateDifferencesFromMean = (data, meansCancer, meansLifeStyle) => {
    let cancerData = data.cancerTypes;
    let lifeStyleData = data.lifeStyleChoices;

    let diffsFromMeanCancer = {}

    meansCancer.forEach(d => {
        let diffs = {}
        let avg = d.cancerRate
        let currData = cancerData[d.cancerType]
        let values = currData.map(entry => [entry["iso"], parseFloat(entry[state.selectedGender])])
        values.forEach(entry => diffs[entry[0]] = entry[1] - avg)
        diffsFromMeanCancer[d.cancerType] = diffs
    })

    let diffsFromMeanLifeStyle = {}
    meansLifeStyle.forEach(d => {
        let diffs = {}
        let avg = d.lifeStyleRate
        
        let currData = lifeStyleData[d.lifeStyleType]
        
        let values = currData.map(entry => [entry["iso"], parseFloat(entry[state.selectedGender])])
        values.forEach(entry => {
            diffs[entry[0]] = isNaN(entry[1] - avg) ? 0 : entry[1] - avg;
        });
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


        
