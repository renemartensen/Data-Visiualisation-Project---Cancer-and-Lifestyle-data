import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap, renderBivariateMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';
import { renderSubPlot } from './js/subPlot.js';
import { state, setState } from './js/state.js';
import { showToast } from './js/toast.js';
import { showHelpOverlay } from './js/overlayElement.js';
import { renderBarGraphCancerPerCountry } from './js/barGraphCancerPerCountry.js';





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
    setState("data", data, false);
    renderBaseMap(() => {
      updateMap("alcohol_2019", "all-cancers", "both");  // Run updateMap as a callback
      renderMatrix(mainData);
      renderSubPlot(mainData);
      renderBarGraphCancerPerCountry(mainData);
  });
});





document.addEventListener('stateChange', (event) => {
  const { key, value } = event.detail;

  updateMap(state.selectedLifestyle, state.selectedCancer, state.selectedGender);
  renderSubPlot(mainData);
  renderMatrix(mainData);
  renderBarGraphCancerPerCountry(mainData);
  
  const idDataAbsent = checkForToast();
  if (idDataAbsent) {
    showToast(`${state.selectedGender} data is not available for ${state.selectedCancer}`);
  }
  
});


document.getElementById("gender").addEventListener("change", (event) => {
  setState("selectedGender", event.target.value);
});

document.getElementById("helpButton").addEventListener("click", () => {
  showHelpOverlay()
});


function checkForToast() {
  const maleCancers = ["prostate", "testis", "penis"]
  const femaleCancers = ["breast", "cervix-uteri", "corpus-uteri", "vagina", "vulva", "ovary"]

  let isDataAbsent;
  if (state.selectedGender === "male") {
    isDataAbsent = femaleCancers.includes(state.selectedCancer)
  }

  if (state.selectedGender === "female") {
    isDataAbsent = maleCancers.includes(state.selectedCancer)
  }

  return isDataAbsent
}