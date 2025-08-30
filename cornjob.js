import { fetchAgroData } from "./agroService.js";
const { sendEmail } = require("./utils/email.js");

cron.schedule("0 8 * * *", async () => {
  const agroData = await fetchAgroData();
  if (agroData.ndvi < 0.3) {
    await sendEmail("user_email@example.com", "Agri Diary Reminder", "🌱 NDVI low → check irrigation/fertilizer today!");
  }
});