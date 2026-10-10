import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import { inquiryService } from "../../services/inquiryService";
import SalesSummary from "../../components/SalesSummary";

function FarmerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const [productsRes, ordersRes, inquiriesRes] = await Promise.all([
        productService.getMyProducts(),
        orderService.getFarmerOrders(),
        inquiryService.getFarmerInquiries()
      ]);

      setStats({
        products: productsRes.data.products.length,
        orders: ordersRes.data.orders.length,
        inquiries: inquiriesRes.data.inquiries.length,
        available: productsRes.data.products.filter((product) => product.availability_status === "available").length
      });
    }

    loadStats();
  }, []);

  if (!stats) return <LoadingSpinner />;

  return (
    <>
      <h1 className="section-title">Farmer Dashboard</h1>
      <div className="row g-3">
        <Stat label="My listings" value={stats.products} />
        <Stat label="Available listings" value={stats.available} />
        <Stat label="Buyer orders" value={stats.orders} />
        <Stat label="Buyer inquiries" value={stats.inquiries} />
      </div>
      <SalesSummary />
    </>
  );
}

function Stat({ label, value }) {
  return <div className="col-md-3"><div className="stat-box"><span>{label}</span><strong>{value}</strong></div></div>;
}

export default FarmerDashboard;
