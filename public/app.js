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



// Event listeners for dropdown filters
document.getElementById('lifestyle-choice').addEventListener('change', (event) => {
  selectedLifestyle = event.target.value;
  console.log(selectedLifestyle);
  updateMap(selectedLifestyle, selectedCancer, selectedGender);
});

document.getElementById('cancer-type').addEventListener('change', (event) => {
  selectedCancer = event.target.value;
  console.log(selectedCancer);
  updateMap(selectedLifestyle, selectedCancer, selectedGender);
});

document.getElementById('gender-choice').addEventListener('change', (event) => {
  selectedGender = event.target.value;
  console.log(selectedGender);
  updateMap(selectedLifestyle, selectedCancer, selectedGender);
});

document.getElementById('update-map').addEventListener('click', () => {
  updateMap(selectedLifestyle, selectedCancer, selectedGender);  // Update the map when filters are changed
});


























