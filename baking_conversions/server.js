const express = require('express');
const app = express();
const port = 5000;

// Load JSON data
const bakingConversions = require('./data/conversions.json').bakingConversions;

// Helper function to get the conversion factor
function getConversion(from, to, ingredient = null) {
  for (const conversion of bakingConversions) {
    // Check if the 'from' and 'to' units match
    if (conversion.from === from && conversion.to === to) {
      // If no ingredient is required, return the conversionFactor
      if (conversion.conversionFactor) {
        return conversion.conversionFactor;
      }
      // If an ingredient is specified, check if the conversionFactors for that ingredient exists
      else if (ingredient && conversion.conversionFactors[ingredient]) {
        return conversion.conversionFactors[ingredient];
      }
    }
  }
  return null; // Return null if no valid conversion is found
}

// Endpoint to handle conversion requests
app.get('/convert', (req, res) => {
  const { amount, from_unit, to_unit, ingredient } = req.query;

  // Validate and convert amount to float
  const amountFloat = parseFloat(amount);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    return res.status(400).json({ error: 'Invalid or missing amount.' });
  }

  // Check if from_unit and to_unit are provided
  if (!from_unit || !to_unit) {
    return res.status(400).json({ error: 'Both from_unit and to_unit are required.' });
  }

  // Perform conversion using the helper function
  const conversionFactor = getConversion(from_unit.toLowerCase(), to_unit.toLowerCase(), ingredient ? ingredient.toLowerCase() : null);

  // If a valid conversion factor is found, calculate the converted value
  if (conversionFactor) {
    const convertedValue = amountFloat * conversionFactor;
    return res.json({
      converted_value: convertedValue,
      unit: to_unit
    });
  }

  // Return an error if the conversion parameters are invalid
  return res.status(400).json({ error: 'Invalid conversion parameters or missing conversion factor for the given ingredient.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Baking conversion API is running at http://localhost:${port}`);
});
