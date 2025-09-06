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

// Delivery Agent
import AgentLogin from "./deliveryAgent/agentlogin";
import DeliveryAgentDashboard from "./deliveryAgent/deliveryAgentDashboard";

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

         {/* Delivery Agent Routes */}
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/agent-dashboard" element={<DeliveryAgentDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
