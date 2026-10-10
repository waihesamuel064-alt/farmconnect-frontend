import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import { inquiryService } from "../../services/inquiryService";
import { favoriteService } from "../../services/favoriteService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({ quantity_requested: "", delivery_option: "pickup", buyer_message: "" });
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    productService.getProduct(id)
      .then((response) => setProduct(response.data.product))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

    // Check whether this product is already in the buyer's saved favorites.
  useEffect(() => {
    if (user?.role !== "buyer") return;

    favoriteService.getMyFavorites()
      .then((response) => {
        setIsFavorite(response.data.favorites.some((item) => String(item.id) === String(id)));
      })
      .catch(() => {});
  }, [id, user]);

  async function handleOrderSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    try {
      await orderService.createOrder({ product_id: id, ...orderForm });
      setNotice("Order request sent to the farmer.");
      setOrderForm({ quantity_requested: "", delivery_option: "pickup", buyer_message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send order request.");
    }
  }

  async function handleInquirySubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    try {
      await inquiryService.createInquiry({ product_id: id, message: inquiryMessage });
      setNotice("Inquiry sent to the farmer.");
      setInquiryMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send inquiry.");
    }
  }

   async function toggleFavorite() {
    setNotice("");
    setError("");

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
        setNotice("Product removed from favorites.");
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
        setNotice("Product saved to favorites.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update favorites.");
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="container py-5"><AlertMessage type="danger" message={error} /></div>;

  const imageUrl = product.image ? `${uploadsUrl}${product.image}` : "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="container py-4">
      <AlertMessage type="success" message={notice} />
      <AlertMessage type="danger" message={error} />
      <div className="row g-4">
        <div className="col-lg-6">
          <img className="product-detail-image" src={imageUrl} alt={product.product_name} />
        </div>
        <div className="col-lg-6">
          <span className="badge bg-success-subtle text-success mb-2">{product.availability_status}</span>
          <h1 className="section-title">{product.product_name}</h1>
          <p className="lead">{product.description}</p>
          <dl className="row details-list">
            <dt className="col-5">Price</dt><dd className="col-7">{formatCurrency(product.price_per_unit)} / {product.unit}</dd>
            <dt className="col-5">Quantity</dt><dd className="col-7">{product.quantity} {product.unit}</dd>
            <dt className="col-5">District</dt><dd className="col-7">{product.district}</dd>
            <dt className="col-5">Harvest date</dt><dd className="col-7">{formatDate(product.harvest_date)}</dd>
            <dt className="col-5">Farmer</dt><dd className="col-7">{product.farmer_name}</dd>
          </dl>
          {user?.role === "buyer" && (
  <button className={isFavorite ? "btn btn-success" : "btn btn-outline-success"} onClick={toggleFavorite}>
    {isFavorite ? "Remove from favorites" : "Save favorite"}
  </button>
)}
        </div>
      </div>
      {user?.role === "buyer" && (
        <div className="row g-4 mt-2">
          <div className="col-lg-6">
            <div className="action-panel">
              <h2 className="h4">Place order request</h2>
              <form onSubmit={handleOrderSubmit}>
                <input className="form-control mb-2" type="number" name="quantity_requested" placeholder="Quantity requested" value={orderForm.quantity_requested} onChange={(e) => setOrderForm({ ...orderForm, quantity_requested: e.target.value })} required />
                <select className="form-select mb-2" value={orderForm.delivery_option} onChange={(e) => setOrderForm({ ...orderForm, delivery_option: e.target.value })}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
                <textarea className="form-control mb-2" placeholder="Message to farmer" value={orderForm.buyer_message} onChange={(e) => setOrderForm({ ...orderForm, buyer_message: e.target.value })}></textarea>
                <button className="btn btn-success" type="submit">Send order request</button>
              </form>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="action-panel">
              <h2 className="h4">Ask a question</h2>
              <form onSubmit={handleInquirySubmit}>
                <textarea className="form-control mb-2" placeholder="Write your inquiry" value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} required></textarea>
                <button className="btn btn-outline-success" type="submit">Send inquiry</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
