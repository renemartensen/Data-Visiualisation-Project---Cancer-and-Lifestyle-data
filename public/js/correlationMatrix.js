




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

const createMatrix = (data) => {
    
    let lifeStyleNames = data.lifeStyleNames;
    
    let result = calculateMeans(data)
    let cancerTypesAverages = result[0];
    let lifeStyleAverages = result[1];

    let resultDiffs = calculateDifferencesFromMean(data, cancerTypesAverages, lifeStyleAverages)
    let diffsFromMeanCancer = resultDiffs[0]
    let diffsFromMeanLifeStyle = resultDiffs[1]

    let productOfDifferences = calculateProductOfDifferences(diffsFromMeanCancer, diffsFromMeanLifeStyle)
    console.log(productOfDifferences)

    // Define margins at the top, before usage
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    // Add correlation values to the cancerRates array
    cancerTypesAverages.forEach(d => {
        for(let i=0; i < lifeStyleAverages.length; i++){
            let lifeStyle = lifeStyleAverages[i]
            let lifeStyleType = lifeStyle.lifeStyleType
            let correlation = calculateCorrelation(d.cancerRate, lifeStyle.lifeStyleRate)
            d[lifeStyleType + "Correlation"] = correlation
        }
    });

    // Cancer types and lifestyle factors
    const cancerTypes = cancerTypesAverages.map(d => d.cancerType);
    const lifeStyles = lifeStyleAverages.map(d => d.lifeStyleType);

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
    .domain([0, d3.max(cancerTypesAverages, d => {
        const correlations = Object.entries(d)
            .filter(([key, value]) => key.includes("Correlation"))
            .map(([key, value]) => value); 

        return Math.max(...correlations);
    })])
    .range(["white", "steelblue"]);
    
    
    for(let i=0; i < lifeStyles.length; i++){
        let lifeStyle = lifeStyles[i]
        svg.selectAll(`.${lifeStyle}-cell`)
        .data(cancerTypesAverages)
        .enter()
        .append("rect")
        .attr("id", d => d.cancerType + "," + lifeStyle)
        .attr("x", d => xScale(d.cancerType))
        .attr("y", yScale([lifeStyleNames[lifeStyle]]))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .style("fill", d => colorScale(d[lifeStyle + "Correlation"]));
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
        .style("font-size", `${Math.min(cellWidth, cellHeight) / 12}px`);


    // Rotate the x-axis labels to fit longer text
    xAxis.selectAll("text")
        .attr("transform", "rotate(-45)")  // Rotate by 45 degrees
        .style("text-anchor", "end")       // Adjust text-anchor for readability
        .style("font-size", `${Math.min(cellWidth, cellHeight) / 12}px`);  // Adjust font size

        
};