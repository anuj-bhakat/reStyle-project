# reStyle

reStyle is a comprehensive digital platform designed to streamline the lifecycle of pre-owned and redesigned products. It bridges the gap between buyers, sellers, and logistics providers, offering a seamless experience for e-commerce transactions, product redesign management, and delivery logistics.

The system caters to multiple user roles including regular customers, managers, administrators, and delivery agents, each with dedicated dashboards and workflows to ensure efficient operations from listing to delivery.

## Features

### 🛍️ End Users (Customers & Sellers)
*   **User Authentication**: Secure signup and login functionality.
*   **Product Marketplace**: Browse, search, and buy products with ease.
*   **Selling Platform**: List pre-owned items for sale using the "Sell Product" feature.
*   **Order Management**:
    *   **Cart**: Manage items before purchase.
    *   **Order Summary**: Review details before checkout.
    *   **History**: Track "Customer Order History" for purchases and "Seller Order History" for sold items.
*   **Profile Management**: Update personal details and preferences.

### 👔 Managers
*   **Dashboard**: Centralized hub for overseeing operations.
*   **Product Management**:
    *   **Review**: Approve or reject new product listings from sellers.
    *   **Edit**: Modify product details as needed.
    *   **Redesign Review**: Evaluate and manage products flagged for redesign.
*   **Warehouse Operations**:
    *   **Requests**: specific view for handling warehouse stocking requests.
    *   **Detailed Reviews**: In-depth inspection of warehouse inventory items.
*   **Customer Order Oversight**: Monitor and manage customer orders handled by the platform.

### 🚚 Delivery Agents
*   **Agent Dashboard**: Quick view of assigned tasks and status.
*   **Delivery Management**: Handle outgoing deliveries to customers.
*   **Pickup Requests**: Manage pickups from sellers or warehouses.

### 🛠️ Administrators
*   **Admin Dashboard**: High-level overview of system health and metrics.
*   **User Management**:
    *   **Manager Management**: Add, remove, or update manager accounts.
    *   **Delivery Agent Management**: Oversee delivery personnel and their assignments.
*   **Security**: Dedicated admin login gate.

## Technology Stack

### Frontend
The user interface is built for performance and responsiveness using modern web standards.
*   **Framework**: [React](https://react.dev/) (v19)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/) (v4)
*   **Routing**: [React Router](https://reactrouter.com/) (v7)
*   **Icons**: Heroicons

### Backend
A robust and scalable server-side architecture.
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [Supabase](https://supabase.com/)
*   **Authentication**: JWT (JSON Web Tokens) & Bcrypt
*   **File Storage**: Cloudinary (via `multer-storage-cloudinary`)
*   **Utilities**: `cors`, `dotenv`, `express-validator`, `uuid`
