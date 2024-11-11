import { setState, state } from "./state.js";
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

                // if (type == "vagina") {

                //     const isoToNameMap = cancerTypeData.reduce((acc, item) => {
                //         acc[item.code] = item.country
                //         return acc
                //     }, {})
                //     console.log(isoToNameMap)
                //     const countryNames = cancerTypeData.map(item => item.country)
                //     setState("countryNames", countryNames, false)
                //     console.log(countryNames)
                // }
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
        setState("countryNames", countryNames, false);
        return mainData; 
    });
}








const countryNames = {
    "004": { fullname: "Afghanistan", alpha2: "AF", alpha3: "AFG", continent: "Asia" },
    "008": { fullname: "Albania", alpha2: "AL", alpha3: "ALB", continent: "Europe" },
    "012": { fullname: "Algeria", alpha2: "DZ", alpha3: "DZA", continent: "Africa" },
    "024": { fullname: "Angola", alpha2: "AO", alpha3: "AGO", continent: "Africa" },
    "031": { fullname: "Azerbaijan", alpha2: "AZ", alpha3: "AZE", continent: "Asia" },
    "032": { fullname: "Argentina", alpha2: "AR", alpha3: "ARG", continent: "South America" },
    "036": { fullname: "Australia", alpha2: "AU", alpha3: "AUS", continent: "Oceania" },
    "040": { fullname: "Austria", alpha2: "AT", alpha3: "AUT", continent: "Europe" },
    "044": { fullname: "Bahamas", alpha2: "BS", alpha3: "BHS", continent: "North America" },
    "048": { fullname: "Bahrain", alpha2: "BH", alpha3: "BHR", continent: "Asia" },
    "050": { fullname: "Bangladesh", alpha2: "BD", alpha3: "BGD", continent: "Asia" },
    "051": { fullname: "Armenia", alpha2: "AM", alpha3: "ARM", continent: "Asia" },
    "052": { fullname: "Barbados", alpha2: "BB", alpha3: "BRB", continent: "North America" },
    "056": { fullname: "Belgium", alpha2: "BE", alpha3: "BEL", continent: "Europe" },
    "064": { fullname: "Bhutan", alpha2: "BT", alpha3: "BTN", continent: "Asia" },
    "068": { fullname: "Bolivia", alpha2: "BO", alpha3: "BOL", continent: "South America" },
    "070": { fullname: "Bosnia and Herzegovina", alpha2: "BA", alpha3: "BIH", continent: "Europe" },
    "072": { fullname: "Botswana", alpha2: "BW", alpha3: "BWA", continent: "Africa" },
    "076": { fullname: "Brazil", alpha2: "BR", alpha3: "BRA", continent: "South America" },
    "084": { fullname: "Belize", alpha2: "BZ", alpha3: "BLZ", continent: "North America" },
    "090": { fullname: "Solomon Islands", alpha2: "SB", alpha3: "SLB", continent: "Oceania" },
    "096": { fullname: "Brunei Darussalam", alpha2: "BN", alpha3: "BRN", continent: "Asia" },
    "100": { fullname: "Bulgaria", alpha2: "BG", alpha3: "BGR", continent: "Europe" },
    "104": { fullname: "Myanmar", alpha2: "MM", alpha3: "MMR", continent: "Asia" },
    "108": { fullname: "Burundi", alpha2: "BI", alpha3: "BDI", continent: "Africa" },
    "112": { fullname: "Belarus", alpha2: "BY", alpha3: "BLR", continent: "Europe" },
    "116": { fullname: "Cambodia", alpha2: "KH", alpha3: "KHM", continent: "Asia" },
    "120": { fullname: "Cameroon", alpha2: "CM", alpha3: "CMR", continent: "Africa" },
    "124": { fullname: "Canada", alpha2: "CA", alpha3: "CAN", continent: "North America" },
    "132": { fullname: "Cape Verde", alpha2: "CV", alpha3: "CPV", continent: "Africa" },
    "140": { fullname: "Central African Republic", alpha2: "CF", alpha3: "CAF", continent: "Africa" },
    "144": { fullname: "Sri Lanka", alpha2: "LK", alpha3: "LKA", continent: "Asia" },
    "148": { fullname: "Chad", alpha2: "TD", alpha3: "TCD", continent: "Africa" },
    "152": { fullname: "Chile", alpha2: "CL", alpha3: "CHL", continent: "South America" },
    "156": { fullname: "China", alpha2: "CN", alpha3: "CHN", continent: "Asia" },
    "170": { fullname: "Colombia", alpha2: "CO", alpha3: "COL", continent: "South America" },
    "174": { fullname: "Comoros", alpha2: "KM", alpha3: "COM", continent: "Africa" },
    "178": { fullname: "Congo, Republic of the", alpha2: "CG", alpha3: "COG", continent: "Africa" },
    "180": { fullname: "Congo, Democratic Republic of the", alpha2: "CD", alpha3: "COD", continent: "Africa" },
    "188": { fullname: "Costa Rica", alpha2: "CR", alpha3: "CRI", continent: "North America" },
    "191": { fullname: "Croatia", alpha2: "HR", alpha3: "HRV", continent: "Europe" },
    "192": { fullname: "Cuba", alpha2: "CU", alpha3: "CUB", continent: "North America" },
    "196": { fullname: "Cyprus", alpha2: "CY", alpha3: "CYP", continent: "Asia" },
    "203": { fullname: "Czechia", alpha2: "CZ", alpha3: "CZE", continent: "Europe" },
    "204": { fullname: "Benin", alpha2: "BJ", alpha3: "BEN", continent: "Africa" },
    "208": { fullname: "Denmark", alpha2: "DK", alpha3: "DNK", continent: "Europe" },
    "214": { fullname: "Dominican Republic", alpha2: "DO", alpha3: "DOM", continent: "North America" },
    "218": { fullname: "Ecuador", alpha2: "EC", alpha3: "ECU", continent: "South America" },
    "222": { fullname: "El Salvador", alpha2: "SV", alpha3: "SLV", continent: "North America" },
    "226": { fullname: "Equatorial Guinea", alpha2: "GQ", alpha3: "GNQ", continent: "Africa" },
    "231": { fullname: "Ethiopia", alpha2: "ET", alpha3: "ETH", continent: "Africa" },
    "232": { fullname: "Eritrea", alpha2: "ER", alpha3: "ERI", continent: "Africa" },
    "233": { fullname: "Estonia", alpha2: "EE", alpha3: "EST", continent: "Europe" },
    "242": { fullname: "Fiji", alpha2: "FJ", alpha3: "FJI", continent: "Oceania" },
    "246": { fullname: "Finland", alpha2: "FI", alpha3: "FIN", continent: "Europe" },
    "250": { fullname: "France", alpha2: "FR", alpha3: "FRA", continent: "Europe" },
    "254": { fullname: "French Guiana", alpha2: "GF", alpha3: "GUF", continent: "South America" },
    "258": { fullname: "French Polynesia", alpha2: "PF", alpha3: "PYF", continent: "Oceania" },
    "262": { fullname: "Djibouti", alpha2: "DJ", alpha3: "DJI", continent: "Africa" },
    "266": { fullname: "Gabon", alpha2: "GA", alpha3: "GAB", continent: "Africa" },
    "268": { fullname: "Georgia", alpha2: "GE", alpha3: "GEO", continent: "Asia" },
    "270": { fullname: "Gambia", alpha2: "GM", alpha3: "GMB", continent: "Africa" },
    "275": { fullname: "Palestine", alpha2: "PS", alpha3: "PSE", continent: "Asia" },
    "276": { fullname: "Germany", alpha2: "DE", alpha3: "DEU", continent: "Europe" },
    "288": { fullname: "Ghana", alpha2: "GH", alpha3: "GHA", continent: "Africa" },
    "300": { fullname: "Greece", alpha2: "GR", alpha3: "GRC", continent: "Europe" },
    "312": { fullname: "Guadeloupe", alpha2: "GP", alpha3: "GLP", continent: "North America" },
    "316": { fullname: "Guam", alpha2: "GU", alpha3: "GUM", continent: "Oceania" },
    "320": { fullname: "Guatemala", alpha2: "GT", alpha3: "GTM", continent: "North America" },
    "324": { fullname: "Guinea", alpha2: "GN", alpha3: "GIN", continent: "Africa" },
    "328": { fullname: "Guyana", alpha2: "GY", alpha3: "GUY", continent: "South America" },
    "332": { fullname: "Haiti", alpha2: "HT", alpha3: "HTI", continent: "North America" },
    "340": { fullname: "Honduras", alpha2: "HN", alpha3: "HND", continent: "North America" },
    "348": { fullname: "Hungary", alpha2: "HU", alpha3: "HUN", continent: "Europe" },
    "352": { fullname: "Iceland", alpha2: "IS", alpha3: "ISL", continent: "Europe" },
    "356": { fullname: "India", alpha2: "IN", alpha3: "IND", continent: "Asia" },
    "360": { fullname: "Indonesia", alpha2: "ID", alpha3: "IDN", continent: "Asia" },
    "364": { fullname: "Iran", alpha2: "IR", alpha3: "IRN", continent: "Asia" },
    "368": { fullname: "Iraq", alpha2: "IQ", alpha3: "IRQ", continent: "Asia" },
    "372": { fullname: "Ireland", alpha2: "IE", alpha3: "IRL", continent: "Europe" },
    "376": { fullname: "Israel", alpha2: "IL", alpha3: "ISR", continent: "Asia" },
    "380": { fullname: "Italy", alpha2: "IT", alpha3: "ITA", continent: "Europe" },
    "384": { fullname: "Côte d'Ivoire", alpha2: "CI", alpha3: "CIV", continent: "Africa" },
    "388": { fullname: "Jamaica", alpha2: "JM", alpha3: "JAM", continent: "North America" },
    "392": { fullname: "Japan", alpha2: "JP", alpha3: "JPN", continent: "Asia" },
    "398": { fullname: "Kazakhstan", alpha2: "KZ", alpha3: "KAZ", continent: "Asia" },
    "400": { fullname: "Jordan", alpha2: "JO", alpha3: "JOR", continent: "Asia" },
    "404": { fullname: "Kenya", alpha2: "KE", alpha3: "KEN", continent: "Africa" },
    "408": { fullname: "Korea, Democratic People's Republic of", alpha2: "KP", alpha3: "PRK", continent: "Asia" },
    "410": { fullname: "Korea, Republic of", alpha2: "KR", alpha3: "KOR", continent: "Asia" },
    "414": { fullname: "Kuwait", alpha2: "KW", alpha3: "KWT", continent: "Asia" },
    "417": { fullname: "Kyrgyzstan", alpha2: "KG", alpha3: "KGZ", continent: "Asia" },
    "418": { fullname: "Lao People's Democratic Republic", alpha2: "LA", alpha3: "LAO", continent: "Asia" },
    "422": { fullname: "Lebanon", alpha2: "LB", alpha3: "LBN", continent: "Asia" },
    "426": { fullname: "Lesotho", alpha2: "LS", alpha3: "LSO", continent: "Africa" },
    "428": { fullname: "Latvia", alpha2: "LV", alpha3: "LVA", continent: "Europe" },
    "430": { fullname: "Liberia", alpha2: "LR", alpha3: "LBR", continent: "Africa" },
    "434": { fullname: "Libya", alpha2: "LY", alpha3: "LBY", continent: "Africa" },
    "440": { fullname: "Lithuania", alpha2: "LT", alpha3: "LTU", continent: "Europe" },
    "442": { fullname: "Luxembourg", alpha2: "LU", alpha3: "LUX", continent: "Europe" },
    "450": { fullname: "Madagascar", alpha2: "MG", alpha3: "MDG", continent: "Africa" },
    "454": { fullname: "Malawi", alpha2: "MW", alpha3: "MWI", continent: "Africa" },
    "458": { fullname: "Malaysia", alpha2: "MY", alpha3: "MYS", continent: "Asia" },
    "462": { fullname: "Maldives", alpha2: "MV", alpha3: "MDV", continent: "Asia" },
    "466": { fullname: "Mali", alpha2: "ML", alpha3: "MLI", continent: "Africa" },
    "470": { fullname: "Malta", alpha2: "MT", alpha3: "MLT", continent: "Europe" },
    "474": { fullname: "Martinique", alpha2: "MQ", alpha3: "MTQ", continent: "North America" },
    "478": { fullname: "Mauritania", alpha2: "MR", alpha3: "MRT", continent: "Africa" },
    "480": { fullname: "Mauritius", alpha2: "MU", alpha3: "MUS", continent: "Africa" },
    "484": { fullname: "Mexico", alpha2: "MX", alpha3: "MEX", continent: "North America" },
    "496": { fullname: "Mongolia", alpha2: "MN", alpha3: "MNG", continent: "Asia" },
    "498": { fullname: "Moldova", alpha2: "MD", alpha3: "MDA", continent: "Europe" },
    "499": { fullname: "Montenegro", alpha2: "ME", alpha3: "MNE", continent: "Europe" },
    "504": { fullname: "Morocco", alpha2: "MA", alpha3: "MAR", continent: "Africa" },
    "508": { fullname: "Mozambique", alpha2: "MZ", alpha3: "MOZ", continent: "Africa" },
    "512": { fullname: "Oman", alpha2: "OM", alpha3: "OMN", continent: "Asia" },
    "516": { fullname: "Namibia", alpha2: "NA", alpha3: "NAM", continent: "Africa" },
    "524": { fullname: "Nepal", alpha2: "NP", alpha3: "NPL", continent: "Asia" },
    "528": { fullname: "Netherlands", alpha2: "NL", alpha3: "NLD", continent: "Europe" },
    "540": { fullname: "New Caledonia", alpha2: "NC", alpha3: "NCL", continent: "Oceania" },
    "548": { fullname: "Vanuatu", alpha2: "VU", alpha3: "VUT", continent: "Oceania" },
    "554": { fullname: "New Zealand", alpha2: "NZ", alpha3: "NZL", continent: "Oceania" },
    "558": { fullname: "Nicaragua", alpha2: "NI", alpha3: "NIC", continent: "North America" },
    "562": { fullname: "Niger", alpha2: "NE", alpha3: "NER", continent: "Africa" },
    "566": { fullname: "Nigeria", alpha2: "NG", alpha3: "NGA", continent: "Africa" },
    "578": { fullname: "Norway", alpha2: "NO", alpha3: "NOR", continent: "Europe" },
    "586": { fullname: "Pakistan", alpha2: "PK", alpha3: "PAK", continent: "Asia" },
    "591": { fullname: "Panama", alpha2: "PA", alpha3: "PAN", continent: "North America" },
    "598": { fullname: "Papua New Guinea", alpha2: "PG", alpha3: "PNG", continent: "Oceania" },
    "600": { fullname: "Paraguay", alpha2: "PY", alpha3: "PRY", continent: "South America" },
    "604": { fullname: "Peru", alpha2: "PE", alpha3: "PER", continent: "South America" },
    "608": { fullname: "Philippines", alpha2: "PH", alpha3: "PHL", continent: "Asia" },
    "616": { fullname: "Poland", alpha2: "PL", alpha3: "POL", continent: "Europe" },
    "620": { fullname: "Portugal", alpha2: "PT", alpha3: "PRT", continent: "Europe" },
    "624": { fullname: "Guinea-Bissau", alpha2: "GW", alpha3: "GNB", continent: "Africa" },
    "626": { fullname: "Timor-Leste", alpha2: "TL", alpha3: "TLS", continent: "Asia" },
    "630": { fullname: "Puerto Rico", alpha2: "PR", alpha3: "PRI", continent: "North America" },
    "634": { fullname: "Qatar", alpha2: "QA", alpha3: "QAT", continent: "Asia" },
    "638": { fullname: "Reunion", alpha2: "RE", alpha3: "REU", continent: "Africa" },
    "642": { fullname: "Romania", alpha2: "RO", alpha3: "ROU", continent: "Europe" },
    "643": { fullname: "Russian Federation", alpha2: "RU", alpha3: "RUS", continent: "Europe" },
    "646": { fullname: "Rwanda", alpha2: "RW", alpha3: "RWA", continent: "Africa" },
    "662": { fullname: "Saint Lucia", alpha2: "LC", alpha3: "LCA", continent: "North America" },
    "678": { fullname: "Sao Tome and Principe", alpha2: "ST", alpha3: "STP", continent: "Africa" },
    "682": { fullname: "Saudi Arabia", alpha2: "SA", alpha3: "SAU", continent: "Asia" },
    "686": { fullname: "Senegal", alpha2: "SN", alpha3: "SEN", continent: "Africa" },
    "688": { fullname: "Serbia", alpha2: "RS", alpha3: "SRB", continent: "Europe" },
    "694": { fullname: "Sierra Leone", alpha2: "SL", alpha3: "SLE", continent: "Africa" },
    "702": { fullname: "Singapore", alpha2: "SG", alpha3: "SGP", continent: "Asia" },
    "703": { fullname: "Slovakia", alpha2: "SK", alpha3: "SVK", continent: "Europe" },
    "704": { fullname: "Vietnam", alpha2: "VN", alpha3: "VNM", continent: "Asia" },
    "705": { fullname: "Slovenia", alpha2: "SI", alpha3: "SVN", continent: "Europe" },
    "706": { fullname: "Somalia", alpha2: "SO", alpha3: "SOM", continent: "Africa" },
    "710": { fullname: "South Africa", alpha2: "ZA", alpha3: "ZAF", continent: "Africa" },
    "716": { fullname: "Zimbabwe", alpha2: "ZW", alpha3: "ZWE", continent: "Africa" },
    "724": { fullname: "Spain", alpha2: "ES", alpha3: "ESP", continent: "Europe" },
    "728": { fullname: "South Sudan", alpha2: "SS", alpha3: "SSD", continent: "Africa" },
    "729": { fullname: "Sudan", alpha2: "SD", alpha3: "SDN", continent: "Africa" },
    "740": { fullname: "Suriname", alpha2: "SR", alpha3: "SUR", continent: "South America" },
    "748": { fullname: "Eswatini", alpha2: "SZ", alpha3: "SWZ", continent: "Africa" },
    "752": { fullname: "Sweden", alpha2: "SE", alpha3: "SWE", continent: "Europe" },
    "756": { fullname: "Switzerland", alpha2: "CH", alpha3: "CHE", continent: "Europe" },
    "760": { fullname: "Syrian Arab Republic", alpha2: "SY", alpha3: "SYR", continent: "Asia" },
    "762": { fullname: "Tajikistan", alpha2: "TJ", alpha3: "TJK", continent: "Asia" },
    "764": { fullname: "Thailand", alpha2: "TH", alpha3: "THA", continent: "Asia" },
    "768": { fullname: "Togo", alpha2: "TG", alpha3: "TGO", continent: "Africa" },
    "780": { fullname: "Trinidad and Tobago", alpha2: "TT", alpha3: "TTO", continent: "North America" },
    "784": { fullname: "United Arab Emirates", alpha2: "AE", alpha3: "ARE", continent: "Asia" },
    "788": { fullname: "Tunisia", alpha2: "TN", alpha3: "TUN", continent: "Africa" },
    "792": { fullname: "Turkey", alpha2: "TR", alpha3: "TUR", continent: "Asia" },
    "795": { fullname: "Turkmenistan", alpha2: "TM", alpha3: "TKM", continent: "Asia" },
    "800": { fullname: "Uganda", alpha2: "UG", alpha3: "UGA", continent: "Africa" },
    "804": { fullname: "Ukraine", alpha2: "UA", alpha3: "UKR", continent: "Europe" },
    "807": { fullname: "North Macedonia", alpha2: "MK", alpha3: "MKD", continent: "Europe" },
    "818": { fullname: "Egypt", alpha2: "EG", alpha3: "EGY", continent: "Africa" },
    "826": { fullname: "United Kingdom", alpha2: "GB", alpha3: "GBR", continent: "Europe" },
    "834": { fullname: "Tanzania, United Republic of", alpha2: "TZ", alpha3: "TZA", continent: "Africa" },
    "840": { fullname: "United States of America", alpha2: "US", alpha3: "USA", continent: "North America" },
    "854": { fullname: "Burkina Faso", alpha2: "BF", alpha3: "BFA", continent: "Africa" },
    "858": { fullname: "Uruguay", alpha2: "UY", alpha3: "URY", continent: "South America" },
    "860": { fullname: "Uzbekistan", alpha2: "UZ", alpha3: "UZB", continent: "Asia" },
    "862": { fullname: "Venezuela", alpha2: "VE", alpha3: "VEN", continent: "South America" },
    "882": { fullname: "Samoa", alpha2: "WS", alpha3: "WSM", continent: "Oceania" },
    "887": { fullname: "Yemen", alpha2: "YE", alpha3: "YEM", continent: "Asia" },
    "894": { fullname: "Zambia", alpha2: "ZM", alpha3: "ZMB", continent: "Africa" }
};






  


