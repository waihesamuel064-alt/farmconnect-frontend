import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { favoriteService } from "../../services/favoriteService";
import { formatCurrency } from "../../utils/formatCurrency";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    favoriteService.getMyFavorites()
      .then((response) => setFavorites(response.data.favorites))
      .catch((err) => setError(err.response?.data?.message || "Unable to load favorites."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(productId) {
    setError("");
    setNotice("");

    try {
      await favoriteService.removeFavorite(productId);
      setFavorites((current) => current.filter((item) => item.id !== productId));
      setNotice("Product removed from favorites.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove favorite.");
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="section-title">Favorites</h1>
      <AlertMessage type="success" message={notice} />
      <AlertMessage type="danger" message={error} />
      <div className="action-panel">
        {favorites.length === 0 ? (
          <p className="text-muted mb-0">No favorites saved yet. Open a product detail page and save products you want to revisit.</p>
        ) : (
          <ul className="list-group">
            {favorites.map((item) => (
              <li key={item.favorite_id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <Link to={`/products/${item.id}`} className="fw-bold">{item.product_name}</Link>
                  <div className="text-muted small">
                    {formatCurrency(item.price_per_unit)} / {item.unit} · {item.district} · {item.farmer_name}
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default Favorites;