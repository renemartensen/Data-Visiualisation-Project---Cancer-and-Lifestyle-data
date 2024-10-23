

export function renderMatrix(data) {

    let cancerTypes = data.cancerTypes;
    let lifeStyleChoices = data.lifeStyleChoices;
    
    let avgTobacco = calculateAverage(lifeStyleChoices["tobacco_2005"], "both");
    let avgAlcohol = calculateAverage(lifeStyleChoices["alcohol_2019"], "both");

    let cancerTypesAverages = []

    let keys = Object.keys(cancerTypes)
    for(let i=0; i < keys.length; i++){
        let key = keys[i]
        let cancerTypeArray = cancerTypes[key]
        let avg = calculateAverage(cancerTypeArray, "both")
        cancerTypesAverages.push({cancerType: key, cancerRate: avg})
    }


    createMatrix(avgTobacco, avgAlcohol, cancerTypesAverages)
}


// Function to calculate the average value of "both"
const calculateAverage = (dataArray, gender) => {
    const sum = dataArray.reduce((acc, obj) => {
      const value = parseFloat(obj[gender].split(" ")[0]); // Extract the number before the interval
      return acc + value; // Sum the values
    }, 0);
  
    return sum / dataArray.length; // Calculate average
};


const createMatrix = (avgTobacco, avgAlcohol, cancerTypesAverages) => {


    // Define margins at the top, before usage
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    // const cancerTypesAverages = [
    //     { cancerType: "Breast Cancer", cancerRate: 25 },
    //     { cancerType: "Lung Cancer", cancerRate: 50 },
    //     { cancerType: "Colorectal Cancer", cancerRate: 30 },
    //     { cancerType: "Colorectal Cancer1", cancerRate: 37 },
    //     { cancerType: "Colorectal Cancer3", cancerRate: 20 },
    //     { cancerType: "Colorectal Cancer4", cancerRate: 40 },
    //     { cancerType: "Colorectal Cancer5", cancerRate: 32 },
    //     { cancerType: "Colorectal Cancer6", cancerRate: 45 },
    //     { cancerType: "Colorectal Cancer7", cancerRate: 42 }
    //     // Add more cancer types and rates as needed
    // ];

    // Calculate correlations between cancer rate and lifestyle rates
    const calculateCorrelation = (cancerRate, lifestyleRate) => {
        return Math.abs(cancerRate - lifestyleRate);  // Simple difference
    };

    // Add correlation values to the cancerRates array
    cancerTypesAverages.forEach(d => {
        d.tobaccoCorrelation = calculateCorrelation(d.cancerRate, avgTobacco);
        d.alcoholCorrelation = calculateCorrelation(d.cancerRate, avgAlcohol);
    });

    // Cancer types and lifestyle factors
    const cancerTypes = cancerTypesAverages.map(d => d.cancerType);
    const lifestyles = ["Tobacco", "Alcohol"];

    // Set fixed width and height for the entire table
    const tableWidth = 300;   // Fixed width
    const tableHeight = 300;  // Fixed height

    // Create the SVG canvas with fixed width and height
    const svg = d3.select("#correlationMatrix")
    .append("svg")
        .attr("width", tableWidth + margin.left + margin.right)
        .attr("height", tableHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // Dynamically calculate the size of each cell based on the number of rows and columns
    const cellWidth = tableWidth / cancerTypes.length;  // Adjusted cell width based on number of columns
    const cellHeight = tableHeight / lifestyles.length; // Adjusted cell height based on number of rows

    // Scales adjusted based on the fixed table size
    const xScale = d3.scaleBand()
        .domain(cancerTypes)
        .range([0, tableWidth])

    const yScale = d3.scaleBand()
        .domain(lifestyles)
        .range([0, tableHeight])

    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(cancerTypesAverages, d => Math.max(d.tobaccoCorrelation, d.alcoholCorrelation))])
        .range(["white", "steelblue"]);


    // Add Tobacco Correlation Cells
    svg.selectAll(".tobacco-cell")
        .data(cancerTypesAverages)
        .enter()
        .append("rect")
        .attr("class", "tobacco-cell")
        .attr("id", d => d.cancerType + "," + d.tobaccoCorrelation)
        .attr("x", d => xScale(d.cancerType))
        .attr("y", yScale("Tobacco"))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .style("fill", d => colorScale(d.tobaccoCorrelation));

    // Add Alcohol Correlation Cells
    svg.selectAll(".alcohol-cell")
        .data(cancerTypesAverages)
        .enter()
        .append("rect")
        .attr("class", "alcohol-cell")
        .attr("id", d => d.cancerType + "," + d.alcoholCorrelation)
        .attr("x", d => xScale(d.cancerType))
        .attr("y", yScale("Alcohol"))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .style("fill", d => colorScale(d.alcoholCorrelation));

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

    // No Y axis for Lifestyle Factors, handled by manual row headers



        
}; 






//TODO: Find out how to calc correlation
//