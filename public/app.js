import { loadData } from './js/data_loading.js';
import { renderMap, renderBaseMap, renderBivariateMap } from './js/map.js';
import { renderMatrix } from './js/correlationMatrix.js';
import { renderSubPlot } from './js/subPlot.js';




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

const updateSubPlots = (selectedCountries) => {
  selectedCountries = selectedCountries;
  renderSubPlot(mainData, selectedCountries, selectedGender)
}

renderBaseMap(updateSubPlots);

let mainData;

loadData()
  .then(data => {
    mainData = data;
    console.log("load_data:", mainData);
    updateMap("alcohol_2019", "all-cancers", "both");
    renderMatrix(mainData)
    renderSubPlot(mainData, selectedCountries)
});




// evetn handlers
const svgMatrix = d3.select("#correlationMatrix")


svgMatrix.on("click", function(event) {
  const id = event.target.getAttribute("value");
  console.log(id)
  selectedCancer = id.split(",")[0]
  selectedLifestyle = id.split(",")[1]
  updateMap(selectedLifestyle, selectedCancer, selectedGender);
})






























