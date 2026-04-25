import axios from "axios";

const API_URL = "http://localhost:8000";

export const getParkingLots = async () => {
  const res = await axios.get(`${API_URL}/lots`);
  return res.data;
};

export const searchParking = async (query: string) => {
  const res = await axios.get(`${API_URL}/search`, {
    params: { query },
  });
  return res.data;
};

export const sendReport = async (report: any) => {
  await axios.post(`${API_URL}/report`, report);
};