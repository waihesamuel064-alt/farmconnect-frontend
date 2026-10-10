import api from "./api";

export const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  createReview: (productId, data) => api.post(`/reviews/product/${productId}`, data)
};