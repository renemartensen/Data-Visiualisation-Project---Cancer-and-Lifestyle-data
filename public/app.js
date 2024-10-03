import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap } from './js/map.js';

let mainData;
loadData().then(d => {
    mainData = d;
});

let selectedLifestyle = "tobacco";
let selectedCancer = "all";
let selectedGender = "both";

function updateMap() {
    console.log(selectedLifestyle, selectedCancer, selectedGender);
    const filteredData = mainData.cancerTypes[selectedCancer];
    renderMap(filteredData)
}


renderBaseMap();















// Event listeners for dropdown filters
document.getElementById('lifestyle-choice').addEventListener('change', (event) => {
    selectedLifestyle = event.target.value;
    console.log(selectedLifestyle);
  });
  
  document.getElementById('cancer-type').addEventListener('change', (event) => {
    selectedCancer = event.target.value;
    console.log(selectedCancer);
  });
  
  document.getElementById('gender-choice').addEventListener('change', (event) => {
    selectedGender = event.target.value;
    console.log(selectedGender);
  });
  
  document.getElementById('update-map').addEventListener('click', () => {
    updateMap();  // Update the map when filters are changed
  });







