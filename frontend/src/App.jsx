import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// End User
import Home from "./Home";
import Signup from "./endUser/Signup";
import Login from "./endUser/Login";
import Profile from "./endUser/Profile";
import BuyProduct from "./endUser/BuyProduct";
import ProductDetail from "./endUser/ProductDetail";
import SellProduct from "./endUser/SellProduct";
import UserHome from "./endUser/userHome";
import SellerOrderHistory from "./endUser/SellerOrderHistory";
import CustomerOrders from "./endUser/CustomerOrders";
import CustomerOrderHistory from "./endUser/CustomerOrderHistory";
import OrderSummary from "./endUser/OrderSummary";
import Cart from "./endUser/Cart"; // ✅ NEW import

// Admin
import ManagerManagement from "./admin/ManagerManagement";
import AdminLogin from "./admin/adminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import DeliveryAgent from "./admin/DeliveryAgentManagement";

// Delivery Agent
import AgentLogin from "./deliveryAgent/agentlogin";
import DeliveryAgentDashboard from "./deliveryAgent/deliveryAgentDashboard";

// Manager
import ManagerDashboard from "./Manager/ManagerDashboard";
import ManagerProductReview from "./Manager/ManagerProductReview";
import ManagerLogin from "./Manager/ManagerLogin";
import PendingReviews from "./Manager/PendingReviews";
import PendingReviewsDetailed from "./Manager/PendingReviewsDetailed";
import ManagerRedesignReview from "./Manager/ManagerRedesignReview";
import ManagerProductEdit from "./Manager/ManagerProductEdit";
import ManageCustomerOrders from "./deliveryAgent/ManageCustomerOrders";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public / General Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        {/* End User Routes */}
        <Route path="/buy" element={<BuyProduct />} />
        <Route path="/product" element={<ProductDetail />} />
        <Route path="/sell" element={<SellProduct />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/seller-history" element={<SellerOrderHistory />} />
        <Route path="/customer-orders" element={<CustomerOrders />} />
        <Route path="/customer-history" element={<CustomerOrderHistory />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/cart" element={<Cart />} /> {/* ✅ NEW route */}

        {/* Admin Routes */}
        <Route path="/managers" element={<ManagerManagement />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/delivery" element={<DeliveryAgent />} />

        {/* Delivery Agent Routes */}
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/agent-dashboard" element={<DeliveryAgentDashboard />} />

        <Route path="/delivery" element={<DeliveryAgent />} />

        {/* Manager Routes */}
        <Route path="/manager-login" element={<ManagerLogin />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/manager-review" element={<ManagerProductReview />} />
        <Route path="/pending-reviews" element={<PendingReviews />} />
        <Route path="/pending-reviews-detailed" element={<PendingReviewsDetailed />} />
        <Route path="/manager-redesign-review" element={<ManagerRedesignReview />} />
        <Route path="/manager-edit-product" element={<ManagerProductEdit />} />

        <Route path="/manage-customer-orders" element={<ManageCustomerOrders />} />

      </Routes>
    </Router>
  );
}

export default App;
