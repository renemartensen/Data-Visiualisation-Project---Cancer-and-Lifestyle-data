import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap, renderBivariateMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';



let selectedLifestyle= "alcohol"
let selectedCancer= "all"
let selectedGender= "both"

function updateMap() {
  const cancerData = mainData.cancerTypes[selectedCancer];
  const lifestyleData = mainData.lifeStyleChoices[selectedLifestyle];
  //renderMap(lifestyleData, selectedGender)

  renderBivariateMap(cancerData, lifestyleData, selectedGender);
}

renderBaseMap();

let mainData;

loadData()
  .then(data => {
    mainData = data;
    console.log("Main data", mainData);
    updateMap();
});









// Event listeners for dropdown filters
document.getElementById('lifestyle-choice').addEventListener('change', (event) => {
  selectedLifestyle = event.target.value;
  console.log(selectedLifestyle);
  updateMap();
});

document.getElementById('cancer-type').addEventListener('change', (event) => {
  selectedCancer = event.target.value;
  console.log(selectedCancer);
  updateMap();
});

document.getElementById('gender-choice').addEventListener('change', (event) => {
  selectedGender = event.target.value;
  console.log(selectedGender);
  updateMap();
});

document.getElementById('update-map').addEventListener('click', () => {
  updateMap();  // Update the map when filters are changed
});


























