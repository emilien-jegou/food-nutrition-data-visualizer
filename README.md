# Food nutrition data visualizer

https://emilien-jegou.github.io/food-nutrition-data-visualizer/

## Overview

A website designed to simplify the browsing and visualization of the USDA's FoodData Central data, specifically focusing on non-processed foods. It provides a user-friendly interface for accessing and understanding the nutritional composition of these foods to have a better understanding of their role in a diet.

## Installation

You will require the following:
- Node.js >=18.17
- npm

Clone the repository and install the necessary dependencies:
```bash
npm install
```

## Data

The data used for this project has been taken from the [USDA website](https://fdc.nal.usda.gov/download-datasets.html) directly, and was parsed using `zx`, you can replicate the same process using the following script:

```typescript
const parseFood = (food) =>  {
  let calorieConversionFactor = food.nutrientConversionFactors?.find(f => f.type === '.CalorieConversionFactor');

  if (calorieConversionFactor) {
    calorieConversionFactor = {...calorieConversionFactor};
    delete calorieConversionFactor['type'];
  }

  return ({
    name: food.description,
    category: food.foodCategory.description,
    nutrients: Object.fromEntries(food.foodNutrients.map(x => [x.nutrient.name, x.amount, ])),
    proteinConversionFactor: food.nutrientConversionFactors?.find(f => f.type === '.ProteinConversionFactor')?.value,
    calorieConversionFactor: calorieConversionFactor,
    metadata: food.nutrientConversionFactors?.filter(f => !['.ProteinConversionFactor', '.CalorieConversionFactor'].includes(f.type)) || null,
  });
}

(async () => {
  const { stdout } = await $`cat foundationDownload.json`;
  const foods = JSON.parse(stdout)['FoundationFoods'];
  const data = foods.map(parseFood);
  console.log(JSON.stringify(data, null ,' '));
})()

```

## License and usage

This project is licensed under the MIT License.

The data provided by the USDA National Nutrient Database for Standard Reference (SR) is in the public domain and is free to use without restrictions. This means you are free to use, share, and modify the data for any purpose, including commercial and non-commercial applications.

For more detailed information, please refer to the USDA's official FoodData Central website and their Data Usage Terms.
