import angular from 'angular';
import angularMeteor from 'angular-meteor';

const name = 'categoriesService';

function CategoriesService() {
  'ngInject';

  Drink = [
    {text:'', value:''},
    {text:'Alternative Drinks', value:'Alternative Drinks'},
    {text:'Beer', value:'Beer'},
    {text:'Bottled Water', value:'Bottled Water'},
    {text:'Energy Drinks & Shots', value:'Energy Drinks & Shots'},
    {text:'Juice & Juice Drinks', value:'Juice & Juice Drinks'},
    {text:'Sports Drinks', value:'Sports Drinks'},
    {text:'Soft Drinks', value:'Soft Drinks'},
    {text:'Tea and Coffee', value:'Tea and Coffee'},
    {text:'Wine', value:'Wine'}
  ];
  Food = [
    {text:'', value:''},
    {text:'Beans', value:'Beans'},
    {text:'Dairy', value:'Dairy'},
    {text:'Eggs', value:'Eggs'},
    {text:'Fish', value:'Fish'},
    {text:'Fruit', value:'Fruit'},
    {text:'Game', value:'Game'},
    {text:'Grains', value:'Grains'},
    {text:'Meat', value:'Meat'},
    {text:'Nuts', value:'Nuts'},
    {text:'Oils & Sugars', value:'Oils & Sugars'},
    {text:'Poultry', value:'Poultry'},
    {text:'Seeds', value:'Seeds'},
    {text:'Shellfish', value:'Shellfish'},
    {text:'Vegetables', value:'Vegetables'}
  ];
  // https://www.drugs.com/drug-classes.html?tree=1
  Medication = [
    {text:'', value:''},
    {text:'Allergenics', value:'Allergenics'},
    {text:'Alternative medicines', value:'Alternative medicines'},
    {text:'Anti-infectives', value:'Anti-infectives'},
    {text:'Antineoplastics', value:'Antineoplastics'},
    {text:'Biologicals', value:'Biologicals'},
    {text:'Cardiovascular Agents', value:'Cardiovascular Agents'},
    {text:'Central Nervous System Agents', value:'Central Nervous System Agents'},
    {text:'Coagulation Modifiers', value:'Coagulation Modifiers'},
    {text:'Gastrointestinal Agents', value:'Gastrointestinal Agents'},
    {text:'Genitourinary Tract Agents', value:'Genitourinary Tract Agents'},
    {text:'Hormones', value:'Hormones'},
    {text:'Immunologic Agents', value:'Immunologic Agents'},
    {text:'Medical Gas', value:'Medical Gas'},
    {text:'Metabolic Agents', value:'Metabolic Agents'},
    {text:'Miscellaneous Agents', value:'Miscellaneous Agents'},
    {text:'Nutritional Products', value:'Nutritional Products'},
    {text:'Plasma Expanders', value:'Plasma Expanders'},
    {text:'Psychotherapeutic Agents', value:'Psychotherapeutic Agents'},
    {text:'Radiologic Agents', value:'Radiologic Agents'},
    {text:'Respiratory Agents', value:'Respiratory Agents'},
    {text:'Medical Gas', value:'Medical Gas'},
    {text:'Metabolic Agents', value:'Metabolic Agents'},
    {text:'Miscellaneous Agents', value:'Miscellaneous Agents'},
    {text:'Nutritional Products', value:'Nutritional Products'},
    {text:'Plasma Expanders', value:'Plasma Expanders'},
    {text:'Psychotherapeutic Agents', value:'Psychotherapeutic Agents'},
    {text:'Radiologic Agents', value:'Radiologic Agents'},
    {text:'Respiratory Agents', value:'Respiratory Agents'},
    {text:'Topical Agents', value:'Topical Agents'}
  ];
  Exercise = [
    {text:'', value:''},
    {text:'Balance', value:'Balance'},
    {text:'Endurance', value:'Endurance'},
    {text:'Flexibility', value:'Flexibility'},
    {text:'Strength', value:'Strength'},
    {text:'Stretching', value:'Stretching'}
  ];
  Event = [
    {text:'', value:''},
    {text:'Arts & Theater', value:'Arts & Theater'},
    {text:'Collect Sample', value:'Collect Sample'},
    {text:'Family', value:'Family'},
    {text:'Miscellaneous', value:'Miscellaneous'},
    {text:'Music', value:'Music'},
    {text:'Sports', value:'Sports'}
  ];
  Meal = [
    {text:'Breakfast', value:'Breakfast'},
    {text:'Lunch', value:'Lunch'},
    {text:'Dinner', value:'Dinner'},
    {text:'Snack', value:'Snack'}
  ];
  Intensity = [
    {text:'', value:''},
    {text:'Minimum', value:'Minimum'},
    {text:'Low', value:'Low'},
    {text:'Moderate', value:'Moderate'},
    {text:'High', value:'High'},
    {text:'Maximum', value:'Maximum'}
  ];
  return {
    Drink: Drink,
    Food: Food,
    Medication: Medication,
    Exercise: Exercise,
    Event: Event,
    Meal: Meal,
    Intensity: Intensity
  };
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, CategoriesService);
