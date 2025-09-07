# reStyle - E-commerce Platform for Sustainable Fashion

**reStyle** is an e-commerce platform with a focus on sustainability, offering a marketplace for users to buy and sell pre-loved and redesigned apparel.  
Our motto, *"Purani cheen nahi kahani"*, emphasizes the value of second-hand clothing and the stories behind them, while supporting the reuse and recycling of fashion.

---

## Features

### User Flow
1. **Landing Page**  
   The website welcomes users with a landing page promoting sustainability in fashion.

2. **Login/Signup**  
   Users can either log in or sign up to access the platform. After successful login, users are redirected to the homepage.

3. **Home Page**  
   - **Old Products**: Users can browse a collection of pre-loved apparel.  
   - **Redesigned Products**: Items that have been refurbished and redesigned by our team of designers.  

4. **Buy or Sell**  
   - **Buy Products**: Users can purchase items from either the "Old Products" or "Redesigned Products" sections.  
   - **Sell Products**: Users can list their used apparel by filling in the required details and uploading images. After submitting, the product is added to the sell queue.  

5. **User Dashboard**  
   - Users can edit their profile information.  
   - View the history of bought and sold products.  

---

### Manager Role
1. **Manage Products**  
   - View a list of pending sell requests from users.  
   - Add a checklist to be verified by the delivery agent during product pickup.  
   - Assign delivery agents for pickups and deliveries.  

2. **Warehouse Management**  
   - View products available in the warehouse.  
   - For each product, choose whether to:  
     - Make it live on the homepage.  
     - Send it for redesigning (if the product needs to be refined and reworked by designers).  

3. **Product Lifecycle**  
   - After redesign, the product's details are updated, and it is made live on the website.  

---

### Delivery Agent Role
1. **Product Pickup & Delivery**  
   - Pick up products from users and deliver them to the warehouse.  
   - Verify the checklist provided by the manager during product pickup.  
   - Deliver products from the warehouse to users.  

2. **Payment to User**  
   - After product verification, the delivery agent sees the price to be paid to the user.  
   - The agent delivers the payment to the user at the time of pickup.  

3. **Delivery History**  
   - View the history of products delivered and picked up.  

---

### Admin Role
1. **User Management**  
   - View the list of managers and delivery agents.  
   - Add, edit, or delete manager or delivery agent records.  

---

## Tech Stack
- **Frontend**: React, Tailwind CSS  
- **Backend**: Node.js, Express.js  
- **Database & Authentication**: Supabase  
- **File Storage**: Cloudinary  
- **Admin Panel**: Custom admin dashboard for managing roles  

---

## Installation

### Prerequisites
1. **Node.js** and **npm** installed on your local machine.  
2. Supabase project set up and API keys generated.  
3. Cloudinary account for file storage.  

### Steps to Set Up Locally
1. Clone the repository:
``` git clone https://github.com/anuj-bhakat/reStyle-project.git
```

2. Navigate to the project directory:
``` 
cd reStyle
```

3. Install dependencies for both frontend and backend:

**Frontend:**
```
cd frontend
npm install
```


**Backend:**
```
cd backend
npm install
```

4. Set up environment variables in `.env` file:  
   - Create a `.env` file in both frontend and backend folders.  
   - Add the necessary environment variables such as Supabase credentials, Cloudinary API keys.  

5. Start the application:  

**Backend:**
```
cd backend
npm start
```


**Frontend:**
```
cd frontend
npm start
```


6. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the website.  

---

## Directory Structure
reStyle/
│
├── frontend/ # Frontend application (React + Tailwind)
│ ├── public/ # Public assets (images, favicon, etc.)
│ ├── src/ # React components, services, utilities
│ ├── package.json # Frontend dependencies and scripts
│ └── .env # Frontend environment variables
│
├── backend/ # Backend API (Node.js, Express)
│ ├── controllers/ # API route controllers
│ ├── models/ # Database models (Supabase integration)
│ ├── routes/ # API route files
│ ├── config/ # Configuration files (e.g., Supabase connection)
│ ├── package.json # Backend dependencies and scripts
│ └── .env # Backend environment variables
│
└── README.md # Project documentation (this file)


---

## Contributing
We welcome contributions to reStyle! If you’d like to contribute, please follow these steps:

1. Fork the repository.  
2. Create a new branch:  

git checkout -b feature-name

text
3. Make your changes and commit them:  
git commit -am 'Add feature'

text
4. Push to your branch:  
git push origin feature-name

text
5. Open a Pull Request to the main repository.  

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.  

---

## Acknowledgments
- Thanks to all the contributors to the open-source libraries and frameworks used in this project, including React, Tailwind CSS, and Node.js.  
- Special thanks to the sustainability community for inspiring the idea behind **reSt