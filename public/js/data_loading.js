let mainData = {
    cancerTypes: {},
    lifeStyleChoices: {},
};

const cancerTypes = ["all"];
const lifeStyleChoices = ["tobacco"];

export function loadData() {
    // Load cancer types
    const cancerPromises = Promise.all(
        cancerTypes.map(type => 
            d3.csv(`data/cancerTypes/${type}.csv`).then(cancerTypeData => {

                const filteredData = cancerTypeData.map(row => ({
                    iso: row["Population code (ISO/UN)"],
                    both: row["ASR (World) per 100 000"],
                    male: 0,
                    female: 0
                }));
                
                mainData.cancerTypes[type] = filteredData;
            })
        )
    );

    // Load lifestyle choices
    const lifestylePromises = Promise.all(
        lifeStyleChoices.map(type => 
            d3.csv(`data/lifestyle/${type}.csv`).then(lifeStyleData => {
                
                
            })
        )
    );

    
    return Promise.all([cancerPromises, lifestylePromises]).then(() => {
        return mainData; 
    });
}
