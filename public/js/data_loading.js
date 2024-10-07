let mainData = {
    cancerTypes: {},
    lifeStyleChoices: {},
};

const cancerTypes = ["all", "breast", "lung"];
const lifeStyleChoices = ["tobacco", "alcohol"];

export function loadData() {
    // Load cancer types
    const cancerPromises = Promise.all(
        cancerTypes.map(type => 
            d3.csv(`data/cancerTypes/${type}.csv`).then(cancerTypeData => {

                const filteredData = cancerTypeData.map(row => ({
                    iso: row.Code,
                    both: row["BOTH ASR (World) per 100 000"],
                    male: row["MALE ASR (World) per 100 000"],
                    female: row["FEMALE ASR (World) per 100 000"]
                }));
                
                mainData.cancerTypes[type] = filteredData;
            })
        )
    );

    // Load lifestyle choices
    const lifestylePromises = Promise.all(
        lifeStyleChoices.map(type => 
            d3.csv(`data/lifestyle/${type}.csv`).then(lifeStyleData => {
                const filteredData = lifeStyleData.map(row => ({
                    iso: row.Code,
                    both: row.BOTH,
                    male: row.MALE,
                    female: row.FEMALE
                }));
                
                mainData.lifeStyleChoices[type] = filteredData;
                
            })
        )
    );

    
    return Promise.all([cancerPromises, lifestylePromises]).then(() => {
        return mainData; 
    });
}
