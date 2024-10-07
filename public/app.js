import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';

let mainData;
loadData().then(d => {
    mainData = d;
    console.log(mainData);
    updateMap();
});

let selectedLifestyle = "tobacco";
let selectedCancer = "all";
let selectedGender = "both";

function updateMap() {
    const filteredData = mainData.cancerTypes[selectedCancer];
    renderMap(filteredData, selectedGender)
}


renderBaseMap();
renderMatrix();
















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







