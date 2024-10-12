let mainData = {
    cancerTypes: {},
    lifeStyleChoices: {},
};

const cancerTypes = ["all-cancers", "breast", "trachea-bronchus-and-lung"];
const lifeStyleChoices = ["tobacco_2005", "alcohol_2019"];

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
                
                mainData.cancerTypes[type] = filteredData;
            })
        )
    );

    // Load lifestyle choices
    const lifestylePromises = Promise.all(
        lifeStyleChoices.map(type => 
            d3.csv(`data/lifestyle/${type}.csv`).then(lifeStyleData => {
                const filteredData = lifeStyleData.map(row => ({
                    iso: row.code,
                    both: row.both,
                    male: row.male,
                    female: row.female
                }));
                mainData.lifeStyleChoices[type] = filteredData;
            })
        )
    );

    
    return Promise.all([cancerPromises, lifestylePromises]).then(() => {
        return mainData; 
    });
}
