const readline = require('readline');

// Initialize readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to get user input using promises (async)
const getInput = (query) => new Promise(resolve => rl.question(query, resolve));

// Utility to calculate the number of days in a specific month of a specific year
const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

// Function to check if a day should be excluded (e.g., if it's Friday)
const shouldExcludeDay = (date, excludedDays) => excludedDays.includes(date.getDay());

// Main function to calculate total target distribution
async function calculateTotalTarget(startDate, endDate, totalAnnualTarget, excludedDay = 5) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const daysExcludingFridays = [];
  const daysWorkedExcludingFridays = [];
  const monthlyTargets = [];

  let totalWorkingDays = 0;
  let currentDate = new Date(start); // Make a copy of start date
  const excludedDays = Array.isArray(excludedDay) ? excludedDay : [excludedDay];

  // Loop through the date range month by month
  while (currentDate <= end) {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInCurrentMonth = daysInMonth(currentMonth, currentYear);

    let monthWorkingDays = 0;
    let actualWorkingDays = 0;

    // Check each day of the current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);

      // Count non-excluded days (e.g., non-Fridays)
      if (!shouldExcludeDay(date, excludedDays)) {
        monthWorkingDays++;

        // Only count if the day is within the user-specified range
        if (date >= start && date <= end) {
          actualWorkingDays++;
          totalWorkingDays++;
        }
      }
    }

    daysExcludingFridays.push(monthWorkingDays);
    daysWorkedExcludingFridays.push(actualWorkingDays);

    // Move to the next month
    currentDate.setMonth(currentMonth + 1);
  }

  // Calculate proportional target based on working days
  daysWorkedExcludingFridays.forEach((daysWorked) => {
    const monthlyTarget = (daysWorked / totalWorkingDays) * totalAnnualTarget;
    monthlyTargets.push(monthlyTarget);
  });

  // Return the result
  return {
    daysExcludingFridays,
    daysWorkedExcludingFridays,
    monthlyTargets,
    totalTarget: monthlyTargets.reduce((a, b) => a + b, 0)
  };
}

// Function to run the calculation and get inputs from the user
async function runCalculation() {
  try {
    const startDate = await getInput('Enter the start date (YYYY-MM-DD): ');
    const endDate = await getInput('Enter the end date (YYYY-MM-DD): ');
    const totalAnnualTarget = parseFloat(await getInput('Enter the total annual target: '));
    const excludeDay = parseInt(await getInput('Enter the day to exclude (e.g., 5 for Friday, 0 for Sunday): '), 10);

    const result = await calculateTotalTarget(startDate, endDate, totalAnnualTarget, excludeDay);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();  // Close the input stream
  }
}

// Run the main function to calculate the target
runCalculation();
