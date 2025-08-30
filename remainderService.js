// reminderService.js
export function processReminders(weather, ndvi) {
    if (weather.forecast.includes("rain")) {
      console.log("🌧️ No need to water today");
    } else if (ndvi < 0.3) {
      console.log("🌱 NDVI low → check irrigation/fertilizer");
    } else {
      console.log("✅ Tasks as usual");
    }
  }
  