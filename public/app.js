import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap, renderBivariateMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';

// import { svg } from 'd3';



let selectedLifestyle= "alcohol_2019"
let selectedCancer= "all-cancers"
let selectedGender= "both"

const updateMap = (selectedLifestyle, selectedCancer, selectedGender) => {
  const cancerData = mainData.cancerTypes[selectedCancer];
  const lifestyleData = mainData.lifeStyleChoices[selectedLifestyle];
  //renderMap(lifestyleData, selectedGender)
  renderBivariateMap(cancerData, lifestyleData, selectedGender)
}

renderBaseMap();

let mainData;

loadData()
  .then(data => {
    mainData = data;
    console.log(mainData);
    updateMap("alcohol_2019", "all-cancers", "both");
    renderMatrix(mainData)
});



const svg = d3.select("#correlationMatrix")


// Add an event listener to the SVG element
svg.on("click", function(event) {
  // Get the target element that was clicked
  const target = event.target;

  // Check if the clicked element is a tobacco cell
  if (target.classList.contains("tobacco-cell")) {
      const cancerType = target.id.split(",")[0]
      const tobaccoCorrelation = target.id.split(",")[1]

      console.log(`Tobacco correlation for ${cancerType}: ${tobaccoCorrelation}`);

      // Call your updateMap function as needed
      updateMap("tobacco_2005", cancerType, selectedGender);
  }
    // Check if the clicked element is a tobacco cell
  if (target.classList.contains("alcohol-cell")) {
      const cancerType = target.id.split(",")[0]
      const alcoholCorrelation = target.id.split(",")[1]

      console.log(`Alcohol correlation for ${cancerType}: ${alcoholCorrelation}`);

      // Call your updateMap function as needed
      updateMap("alcohol_2019", cancerType, selectedGender);
  }

});

/* svg.on("click", function(event) {
  const value = event.target.value;
  selectedCancer = value.split(",")[0]
  selectedLifestyle = value.split(",")[1]
  updateMap(selectedLifestyle, selectedCancer, selectedGender);

}) */


























