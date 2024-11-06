let mainData = {
    cancerTypes: {},
    lifeStyleChoices: {},
    lifeStyleNames: {"tobacco_2005": "Tobacco", "alcohol_2019": "Alcohol", "uv_radiation": "UV Radiation", "physical_activity": "Physical Activity"}
};


const cancerTypes = ["all-cancers", "anus", "bladder", "brain-central-nervous-system", "breast", "cervix-uteri", "colon", "colorectum", "corpus-uteri", "gallbladder",
                    "hodgkin-lymphoma", "hypopharynx", "kaposi-sarcoma", "kidney", "larynx", "leukaemia", "lip-oral-cavity", "liver-and-intrahepatic-bile-ducts",
                    "melanoma-of-skin", "mesothelioma", "multiple-myeloma", "nasopharynx", "non-hodgkin-lymphoma", "non-melanoma-skin-cancer", "oesophagus", "oropharynx", 
                    "ovary", "pancreas", "penis", "prostate", "rectum", "salivary-glands", "testis", "thyroid", "trachea-bronchus-and-lung", "vagina", "vulva"];

const lifeStyleChoices = ["tobacco_2005", "alcohol_2019", "uv_radiation", "physical_activity"];

function getWhaIWant(string) {

    return string.split(" ")[0];
}


export async function loadData() {
    // Load cancer types
    const cancerPromises = Promise.all(
        cancerTypes.map(type => 
            d3.csv(`data/cancerTypes/${type}.csv`).then(cancerTypeData => {

                const filteredData = cancerTypeData.map(row => ({
                    iso: row.code,
                    both: row["both"],
                    male: row["male"],
                    female: row["female"]
                }));
                
                mainData.cancerTypes[type] = filteredData.sort();
            })
        )
    );

    // Load lifestyle choices
    const lifestylePromises = Promise.all(
        lifeStyleChoices.map(type => 
            d3.csv(`data/lifestyle/${type}.csv`).then(lifeStyleData => {
                
                const filteredData = lifeStyleData.map(row => ({
                    iso: row.code,
                    both: type === "tobacco_2005" 
                    ? row.both.split(" ")[0]
                    : type === "sun_data"  // Else-if condition
                        ? row.annual
                        : row.both,
                    male: type==="tobacco_2005" ? row.male.split(" ")[0] : row.male,
                    female: type==="tobacco_2005" ? row.female.split(" ")[0] : row.female
                }));
                mainData.lifeStyleChoices[type] = filteredData.sort();
            })
        )
    );
    

    
    return Promise.all([cancerPromises, lifestylePromises]).then(() => {
        return mainData; 
    });
}