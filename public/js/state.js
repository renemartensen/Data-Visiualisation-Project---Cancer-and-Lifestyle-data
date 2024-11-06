
export const state = {
    selectedLifestyle: "alcohol_2019",
    selectedCancer: "all-cancers",
    selectedGender: "both",
    selectedCountriesISO: [],
    data: null
};
  
export const setState = (key, value) => {
    //console.log("State changed for key: ", key, " with value: ", value);
    state[key] = value;
    document.dispatchEvent(new CustomEvent('stateChange', { detail: { key, value } }));
};





  