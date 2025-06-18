# Cancer and Lifestyle Data Visualization

An interactive web-based visualization tool for exploring global cancer rates and their correlation with lifestyle factors across different countries and demographics.

**🌐 Live Demo:** [https://datavis-latest.onrender.com/](https://datavis-latest.onrender.com/)

## 📊 Project Overview

This project presents a unified interactive visualization that enables users to explore relationships between cancer incidence rates and lifestyle factors (tobacco consumption, alcohol consumption, UV exposure, and physical inactivity) across global populations. Unlike existing tools that separate data views, our solution integrates multiple dimensions into one cohesive interface.

### Authors
- **René Martensen**
- **Sebastian Kjellerup Godske Jensen** 

*Data Visualization Course, Department of Computer Science, Aarhus University - January 2025*

## 🎯 Key Features

### Multi-Coordinated View System
- **Correlation Matrix**: Interactive heatmap showing Spearman correlations between lifestyle factors and cancer types
- **Choropleth Map**: Geographic visualization with bivariate color scales for simultaneous display of cancer rates and lifestyle factors
- **Dynamic Bar Charts**: Country and cancer type rankings that update based on selections
- **Coordinated Interactions**: Selections in one view automatically update all other views

### Interactive Capabilities
- **Overview First**: Default view shows global averages across all cancer types and genders
- **Zoom & Filter**: Pan and zoom on the map, filter by countries, cancer types, and demographics
- **Details on Demand**: Double-click countries for detailed information
- **Multi-Selection**: Select multiple countries via clicking or dragging
- **Flexible Sorting**: Alphabetical, hierarchical (by continent), or value-based sorting

## 📈 Data Sources

- **Cancer Data**: Global Cancer Observatory (GCO) - 105 datasets covering various cancer types and demographics for 2022
- **Lifestyle Factors**:
  - Alcohol consumption data from Our World in Data
  - Tobacco use statistics from WHO
  - UV radiation exposure data from WHO
  - Physical inactivity data from WHO

## 🛠️ Technical Implementation

### Data Processing
- **Standardization**: Countries identified by ISO codes for consistency across datasets
- **Age-Standardized Rates**: All cancer rates normalized per 100,000 individuals for cross-country comparison
- **Correlation Analysis**: Spearman correlation coefficient used (non-parametric, suitable for non-normally distributed data)
- **Outlier Detection**: Z-score analysis performed to understand data distribution

### Visualization Design
- **Map Projection**: Robinson projection chosen as optimal balance between area, shape, and distance preservation
- **Color Scales**: 
  - Bivariate color scheme for simultaneous display of two variables
  - Colorblind-friendly palettes
  - Equidistant scaling for fair visual representation
- **Binning Strategy**: Three-tier value-based categories (low, medium, high) for clear differentiation

## 🎨 Design Principles

### Shneiderman's Mantra
Following the "Overview first, zoom and filter, details on demand" principle:
1. **Overview**: Global view with averages across all dimensions
2. **Zoom & Filter**: Interactive selection and filtering capabilities
3. **Details**: Specific country information available on demand

### Multi-Coordinated Views
- **Diversity**: Different chart types for different aspects of the data
- **Complementarity**: Views work together to provide comprehensive analysis
- **Parsimony**: Efficient use of screen space without overwhelming the user


## ⚠️ Limitations

- **Temporal Scope**: Data limited to 2022; no temporal trend analysis possible
- **Correlation vs. Causation**: Statistical correlations shown do not imply causational relationships
- **Aggregated Data**: Country-level aggregation may mask regional variations within countries
- **Visual Interpretation**: Bivariate maps may suggest correlations that aren't statistically significant for individual countries

### Navigation Tips
1. **Start with the correlation matrix** to identify interesting lifestyle-cancer relationships
2. **Use the map** to explore geographic patterns
3. **Select countries** by clicking on the map or bar charts
4. **Switch between bivariate and univariate map views** for different perspectives
5. **Hover over elements** for additional details and highlighting

---
## Disclaimer
This project includes visualizations based on publicly available datasets from various sources. All data remains the property of the original providers. This repository does not redistribute raw data and is intended for educational or illustrative purposes only.
If any dataset requires attribution or removal, please contact me.
