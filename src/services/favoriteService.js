import api from "./api";

export const favoriteService = {
  getMyFavorites: () => api.get("/favorites"),
  addFavorite: (productId) => api.post(`/favorites/${productId}`),
  removeFavorite: (productId) => api.delete(`/favorites/${productId}`)
};