import axios from "axios";

const API_KEY = "aac50f1ed6ecb8e31231a322e1f1f9b9";
const lat = 18.5204;
const lon = 73.8567;

export async function fetchAgroData() {
  try {
    const response = await axios.get("https://api.agroapi.com/field-data", {
      params: { lat, lon, api_key: API_KEY }
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Agro API data:", error.message);
    return null;
  }
}
