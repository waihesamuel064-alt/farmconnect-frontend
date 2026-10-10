import api from "./api";

export const salesService = {
  getFarmerSummary: () => api.get("/sales/summary")
};