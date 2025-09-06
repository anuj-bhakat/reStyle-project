import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import deliveryAgentRoutes from './routes/deliveryAgentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerOrderRoutes from './routes/customerOrderRoutes.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Use auth routes at /user
app.use('/user', authRoutes);
app.use('/user', userRoutes);
app.use('/delivery-agent', deliveryAgentRoutes);
app.use('/products', productRoutes);

app.use('/customer_orders', customerOrderRoutes);



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
