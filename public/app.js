import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap, renderBivariateMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';
import { renderSubPlot } from './js/subPlot.js';
import { state, setState } from './js/state.js';




let selectedLifestyle= "alcohol_2019"
let selectedCancer= "all-cancers"
let selectedGender= "both"
let selectedCountries = []

const updateMap = (selectedLifestyle, selectedCancer, selectedGender) => {
  const cancerData = mainData.cancerTypes[selectedCancer];
  const lifestyleData = mainData.lifeStyleChoices[selectedLifestyle];
  //renderMap(lifestyleData, selectedGender)
  renderBivariateMap(cancerData, lifestyleData, selectedGender)
}



//renderBaseMap(updateSubPlots);

let mainData;

loadData()
  .then(data => {
    mainData = data;
    console.log("load_data:", mainData);
    renderBaseMap(() => {
      updateMap("alcohol_2019", "all-cancers", "both");  // Run updateMap as a callback
      renderMatrix(mainData);
      renderSubPlot(mainData);
  });
});




// evetn handlers
const svgMatrix = d3.select("#correlationMatrix")


svgMatrix.on("click", function(event) {
  const id = event.target.getAttribute("value");
  selectedCancer = id.split(",")[0]
  selectedLifestyle = id.split(",")[1]
  renderSubPlot(mainData, selectedCountries, selectedGender, selectedCancer, renderMatrix)
  updateMap(selectedLifestyle, selectedCancer, selectedGender);
})


document.addEventListener('stateChange', (event) => {
  const { key, value } = event.detail;
  if (key === 'selectedCountriesISO') {
    renderSubPlot(mainData);
  } 

  if (key === "selectedCancer") {
    renderMatrix(mainData)
    renderSubPlot(mainData);
  }

  if (key === 'selectedCancer' || key === 'selectedLifestyle') updateMap(state.selectedLifestyle, state.selectedCancer, state.selectedGender);

  if (key === 'selectedCancer' && key === 'selectedLifestyle') renderSubPlot(mainData);
  
});





























