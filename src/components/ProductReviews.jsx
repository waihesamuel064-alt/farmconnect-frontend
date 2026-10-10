import { useEffect, useState } from "react";
import AlertMessage from "./AlertMessage";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { reviewService } from "../services/reviewService";
import { formatDate } from "../utils/formatDate";

function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ count: 0, average: 0 });
  const [form, setForm] = useState({ rating: "5", comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function loadReviews() {
    return reviewService.getProductReviews(productId)
      .then((response) => {
        setReviews(response.data.reviews);
        setSummary(response.data.summary);
      })
      .catch(() => setError("Unable to load reviews."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      await reviewService.createReview(productId, { rating: Number(form.rating), comment: form.comment });
      setNotice("Thank you, your review was submitted.");
      setForm({ rating: "5", comment: "" });
      await loadReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit review.");
    }
  }

  return (
    <div className="action-panel mt-4">
      <h2 className="h4">Reviews</h2>
      {loading ? <LoadingSpinner /> : (
        <>
          <p className="text-muted">
            {summary.count === 0 ? "No reviews yet." : `Average rating: ${summary.average} / 5 (${summary.count} review${summary.count === 1 ? "" : "s"})`}
          </p>
          {reviews.map((review) => (
            <div key={review.id} className="border-bottom py-2">
              <strong>{review.buyer_name}</strong> · {review.rating} / 5 · <span className="text-muted small">{formatDate(review.created_at)}</span>
              {review.comment && <p className="mb-0">{review.comment}</p>}
            </div>
          ))}
        </>
      )}

      {user?.role === "buyer" && (
        <form className="mt-3" onSubmit={handleSubmit}>
          <h3 className="h5">Write a review</h3>
          <AlertMessage type="success" message={notice} />
          <AlertMessage type="danger" message={error} />
          <select className="form-select mb-2" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Fair</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Very poor</option>
          </select>
          <textarea className="form-control mb-2" placeholder="Share your experience (optional)" maxLength={500} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}></textarea>
          <button className="btn btn-success" type="submit">Submit review</button>
        </form>
      )}
    </div>
  );
}

export default ProductReviews;