
export const state = {
    selectedLifestyle: "alcohol_2019",
    selectedCancer: "all-cancers",
    selectedGender: "both",
    selectedCountriesISO: [],
    data: null
};
  
export const setState = (key, value, triggerEvent = true) => {
    //console.log("State changed for key: ", key, " with value: ", value);
    state[key] = value;
    if (triggerEvent) document.dispatchEvent(new CustomEvent('stateChange', { detail: { key, value } }));
};





  