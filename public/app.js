import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap, renderBivariateMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';
import { renderSubPlot } from './js/subPlot.js';
import { state, setState } from './js/state.js';
import { showToast } from './js/toast.js';
import { showHelpOverlay } from './js/overlayElement.js';





const updateMap = (selectedLifestyle, selectedCancer, selectedGender) => {
  const cancerData = state.data.cancerTypes[selectedCancer];
  const lifestyleData = state.data.lifeStyleChoices[selectedLifestyle];
  //renderMap(lifestyleData, selectedGender)
  renderBivariateMap(cancerData, lifestyleData, selectedGender)
}


let mainData
loadData()
  .then(data => {
    mainData = data
    console.log("mainData", mainData)
    setState("data", data);
    renderBaseMap(() => {
      updateMap("alcohol_2019", "all-cancers", "both");  // Run updateMap as a callback
      renderMatrix(mainData);
      renderSubPlot(mainData);
  });
});






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

  if (key === 'selectedGender') {
    console.log("selectedGender", state.selectedGender)
    updateMap(state.selectedLifestyle, state.selectedCancer, state.selectedGender);
    renderSubPlot(mainData);
    renderMatrix(mainData);
  }
  
});


document.getElementById("gender").addEventListener("change", (event) => {
  setState("selectedGender", event.target.value);
});

document.getElementById("helpButton").addEventListener("click", () => {
  showHelpOverlay()
});


