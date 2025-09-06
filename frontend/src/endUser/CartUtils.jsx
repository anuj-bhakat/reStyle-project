// CartUtils.jsx
// Utility functions to manage cart data in sessionStorage

const CART_KEY = "cart";

// Get cart from sessionStorage (returns object with listing_id keys and prices)
export const getCart = () => {
  try {
    const cartStr = sessionStorage.getItem(CART_KEY);
    return cartStr ? JSON.parse(cartStr) : {};
  } catch (error) {
    console.error("Failed to parse cart from sessionStorage:", error);
    return {};
  }
};

// Save cart object to sessionStorage
export const setCart = (cartObj) => {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cartObj));
  } catch (error) {
    console.error("Failed to save cart to sessionStorage:", error);
  }
};

// Add or update a product in the cart
// productId: string, price: number
export const addProductToCart = (productId, price) => {
  const cart = getCart();
  cart[productId] = price;
  setCart(cart);
};

// Remove a product from the cart by productId
export const removeProductFromCart = (productId) => {
  const cart = getCart();
  if (productId in cart) {
    delete cart[productId];
    setCart(cart);
  }
};

// Clear entire cart from sessionStorage
export const clearCart = () => {
  sessionStorage.removeItem(CART_KEY);
};

// Get total price from cart (sum of all product prices)
export const getCartTotal = () => {
  const cart = getCart();
  return Object.values(cart).reduce((acc, price) => acc + price, 0);
};

// Check if cart is empty
export const isCartEmpty = () => {
  const cart = getCart();
  return Object.keys(cart).length === 0;
};
