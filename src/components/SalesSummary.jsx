import { useEffect, useState } from "react";
import AlertMessage from "./AlertMessage";
import LoadingSpinner from "./LoadingSpinner";
import { salesService } from "../services/salesService";
import { formatCurrency } from "../utils/formatCurrency";

const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled"
};

function SalesSummary() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    salesService.getFarmerSummary()
      .then((response) => setSummary(response.data.summary))
      .catch((err) => setError(err.response?.data?.message || "Unable to load sales summary."));
  }, []);

  if (error) return <AlertMessage type="danger" message={error} />;
  if (!summary) return <LoadingSpinner />;

  return (
    <div className="action-panel mt-4">
      <h2 className="h4">Sales summary</h2>
      <p className="mb-3">
        Estimated revenue (accepted and completed orders): <strong>{formatCurrency(summary.revenue)}</strong>
      </p>

      <h3 className="h6">Orders by status ({summary.totalOrders} total)</h3>
      <ul className="list-group mb-3">
        {Object.keys(statusLabels).map((status) => (
          <li key={status} className="list-group-item d-flex justify-content-between">
            <span>{statusLabels[status]}</span>
            <strong>{summary.byStatus[status]}</strong>
          </li>
        ))}
      </ul>

      <h3 className="h6">Top products by revenue</h3>
      {summary.topProducts.length === 0 ? (
        <p className="text-muted mb-0">No accepted or completed orders yet.</p>
      ) : (
        <ul className="list-group">
          {summary.topProducts.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between">
              <span>{item.product_name} ({item.orders} order{item.orders === 1 ? "" : "s"})</span>
              <strong>{formatCurrency(item.revenue)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SalesSummary;