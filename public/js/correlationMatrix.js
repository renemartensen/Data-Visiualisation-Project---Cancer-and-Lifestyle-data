export function renderMatrix(data) {

    createMatrix(data)
}

// Test branching


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
    const tableHeight = 150;  // Fixed height
    const parentDiv = document.querySelector("#correlationMatrix");
    const tableWidth = parentDiv.offsetWidth;   // Dynamic width based on parent div

    // Create the SVG canvas with fixed width and height
    const svg = d3.select("#correlationMatrix")
    .append("svg")
        .attr("viewBox", `0 0 ${tableWidth + margin.left + margin.right} ${tableHeight + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // Dynamically calculate the size of each cell based on the number of rows and columns
    const cellWidth = tableWidth / cancerTypes.length;  // Adjusted cell width based on number of columns
    const cellHeight = tableHeight / lifeStyles.length; // Adjusted cell height based on number of rows

    // Scales adjusted based on the fixed table size
    const xScale = d3.scaleBand()
        .domain(cancerTypes)
        .range([0, tableWidth])

    const yScale = d3.scaleBand()
        .domain(lifeStyles.map(d => lifeStyleNames[d]))
        .range([0, tableHeight])


    const colorScale = d3.scaleLinear()
    .domain([-1,0,1])
    .range(["red", "white", "steelblue"]);
    
    
    for(let i=0; i < lifeStyles.length; i++){
        let lifeStyle = lifeStyles[i]
        svg.selectAll(`.${lifeStyle}-cell`)
        .data(cancerTypes)
        .enter()
        .append("rect")
        .attr("id", cancerType => cancerType + "," + lifeStyle)
        .attr("x", cancerType => xScale(cancerType))
        .attr("y", yScale([lifeStyleNames[lifeStyle]]))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .style("fill", cancerType => colorScale(correlationCoeffs[`${cancerType},${lifeStyle}`]));
    }

    // X axis for Cancer Types (below the matrix)
    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisBottom(xScale));


    const yAxis = svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(0, 0)`)
    .call(d3.axisRight(yScale));

    yAxis.selectAll("text")
        .attr("transform", "rotate(-45)")  // Rotate by 45 degrees
        .style("text-anchor", "start")       // Align text for readability
        .style("font-size", `${Math.min(cellWidth, cellHeight) / 4}px`);


    // Rotate the x-axis labels to fit longer text
    xAxis.selectAll("text")
        .attr("transform", "rotate(-45)")  // Rotate by 45 degrees
        .style("text-anchor", "end")       // Adjust text-anchor for readability
        .style("font-size", `${Math.min(cellWidth, cellHeight) / 4}px`);  // Adjust font size

        
};