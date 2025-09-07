# reStyle - E-commerce Platform for Sustainable Fashion

**reStyle** is a full-stack e-commerce platform with a focus on sustainability, offering a marketplace for users to buy and sell pre-loved and redesigned apparel.
Our motto, *"Purani Cheezen Nayi Kahaniyan"* (Old things, new stories), emphasizes the value of second-hand clothing and the stories behind them, while supporting the reuse and recycling of fashion.

-----

## Project Overview

ReStyle is designed to facilitate the buying and selling of second-hand and redesigned apparel. Our mission is to promote sustainable fashion by providing a seamless, secure, and efficient marketplace for users to give their clothes a second life. The platform features distinct user roles, including customers, managers, delivery agents, and an admin, each with a tailored dashboard to manage their specific tasks.

-----

## Key Features

### User Flow

1.  **Landing Page**: The website welcomes users with a landing page promoting sustainability in fashion.
2.  **Login/Signup**: Users can either log in or sign up. After a successful login, users are redirected to the homepage.
3.  **Home Page**:
      * **Old Products**: Users can browse a collection of pre-loved apparel.
      * **Redesigned Products**: Items that have been refurbished and redesigned by our design team.
4.  **Buy or Sell**:
      * **Buy Products**: Users can purchase items from either the "Old Products" or "Redesigned Products" sections.
      * **Sell Products**: Users can list their used apparel by filling in the required details and uploading images.
5.  **User Dashboard**:
      * Users can edit their profile information.
      * View the history of bought and sold products.

### Manager Role

1.  **Manage Products**:
      * View a list of pending sell requests from users.
      * Add a verification checklist for the delivery agent.
      * Assign delivery agents for pickups and deliveries.
2.  **Warehouse Management**:
      * View products available in the warehouse.
      * For each product, choose whether to make it live on the site or send it for redesigning.
3.  **Redigned Product**: After redesign, the product's details are updated, and it is made live on the website.

### Delivery Agent Role

1.  **Product Pickup & Delivery**:
      * Pick up products from users and deliver them to the warehouse.
      * Verify the checklist provided by the manager during pickup.
      * Deliver purchased products from the warehouse to buyers.
2.  **Payment to Seller**: After successful verification, the agent pays the seller the agreed-upon price at the time of pickup.
3.  **Delivery History**: View the history of products delivered and picked up.

### Admin Role

1.  **User Management**:
      * View the list of managers and delivery agents.
      * Add, edit, or delete manager or delivery agent records.

-----

## Tech Stack

  * **Frontend**: React, Tailwind CSS
  * **Backend**: Node.js, Express.js
  * **Database**: Supabase
  * **File Storage**: Cloudinary

-----

## Project Structure

```
RESTYLE/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── node_modules/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── .env
│   ├── app.js
│   ├── package.json
│   └── package-lock.json
│
└── frontend/
    ├── node_modules/
    ├── src/
    │   ├── admin/
    │   ├── deliveryAgent/
    │   ├── endUser/
    │   └── Manager/
    │   ├── App.jsx
    │   └── ...
    ├── .gitignore
    ├── index.html
    ├── package.json
    └── ...
```

-----

## Getting Started

### Prerequisites

  * **Node.js** and **npm** installed on your local machine.
  * A **Supabase** project set up with API keys.
  * A **Cloudinary** account for image storage.

### Steps to Set Up Locally

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/anuj-bhakat/reStyle-project.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd reStyle
    ```

3.  **Install dependencies for both frontend and backend:**

    **Backend:**

    ```bash
    cd backend
    npm install
    ```

    **Frontend:**

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Set up environment variables:**

      * Create a `.env` file in the `backend` directory.
      * Add your Supabase and Cloudinary credentials.

5.  **Run the application:**

    **Backend:**

    ```bash
    cd backend
    npm start
    ```

    **Frontend:**

    ```bash
    cd ../frontend
    npm run dev
    ```

6.  Open your browser and navigate to the local server address provided (usually `http://localhost:5173`).

-----

## Contributing

We welcome contributions to reStyle\! If you’d like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature-name`
3.  Make your changes and commit them: `git commit -am 'Add some feature'`
4.  Push to your branch: `git push origin feature-name`
5.  Open a Pull Request to the main repository.

-----

## License

This software and associated files are the intellectual property of PIONEERS.  
Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit written permission from the owner.

This project is **not open-source** and is provided solely for personal or organizational use as agreed upon.  
No rights are granted to use, copy, modify, merge, publish, distribute, sublicense, or sell copies of the software unless a separate license agreement is obtained.

-----

## Team

Team PIONEERS