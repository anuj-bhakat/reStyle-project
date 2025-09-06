import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [liveResponse, redesignedResponse] = await Promise.all([
          axios.get('http://localhost:3000/products/get/live'),
          axios.get('http://localhost:3000/products/get/redesigned'),
        ]);

        let combined = [];
        if (liveResponse.data && Array.isArray(liveResponse.data)) {
          combined = combined.concat(liveResponse.data);
        }
        if (redesignedResponse.data && Array.isArray(redesignedResponse.data)) {
          combined = combined.concat(redesignedResponse.data);
        }

        // pick up to 6 random products from combined array
        const shuffled = combined.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6).map(p => {
          const primaryImage = p.product_images.find(img => img.is_primary);
          return {
            listingId: p.listing_id,
            name: `${p.brand} ${p.product_type.charAt(0).toUpperCase() + p.product_type.slice(1)}`,
            price: `₹${p.final_price}`,
            description: p.description,
            imgUrl: primaryImage ? primaryImage.url : '',
          };
        });
        setProducts(selected);
      } catch (err) {
        console.error('Error fetching products', err);
      }
    };
    fetchProducts();
  }, []);

  const handleViewDetails = (listingId) => {
    navigate('/product', { state: { listingId } });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">reStyle</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-[32rem]">
          <div className="w-full max-w-3xl text-left mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
              Reimagine Your Wardrobe: <br />
              Sustainable Style,<br />
              Uniquely Yours
            </h1>
            <p className="text-xl mb-10 text-purple-100">
              Discover curated second-hand fashion or create your custom masterpiece
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition duration-300"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>


      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Latest Finds
            </h2>
            <p className="text-lg text-gray-600">Handpicked pieces that blend style with sustainability</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map(({ listingId, name, price, description, imgUrl }) => (
                <div
                  key={listingId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                >
                  <img src={imgUrl} alt={name} className="w-full h-64 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
                    <p className="text-gray-600 mb-4">{description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-indigo-600">{price}</span>
                      <button
                        onClick={() => handleViewDetails(listingId)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">Loading products...</p>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Unique Approach</h2>
            <p className="text-lg text-gray-600">
              Sustainable fashion made simple through two distinct methods
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Direct Selling */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Direct Selling</h3>
              <p className="text-gray-600 mb-6">
                We carefully source and curate high-quality second-hand apparel from trusted suppliers. Each piece is
                inspected, cleaned, and photographed to ensure you receive items that meet our quality standards. Shop
                with confidence knowing every item has been vetted for style and durability.
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>✓ Quality Inspected</span>
                <span>✓ Professionally Cleaned</span>
                <span>✓ Authenticity Guaranteed</span>
              </div>
            </div>
            {/* Customization */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v12a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customization & Redesign</h3>
              <p className="text-gray-600 mb-6">
                Transform ordinary pieces into extraordinary fashion statements. Our skilled designers work with you to
                reimagine existing garments through alterations, embellishments, and creative redesigns. Turn your vision
                into reality with our custom services.
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>✓ Personal Consultation</span>
                <span>✓ Expert Craftsmanship</span>
                <span>✓ Unique Designs</span>
              </div>
            </div>
          </div>
          {/* Values */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Why Choose reStyle?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Sustainability</h4>
                <p className="text-gray-600">Reduce fashion waste by giving pre-loved items a new life</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Uniqueness</h4>
                <p className="text-gray-600">Stand out with pieces you won't find anywhere else</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Affordability</h4>
                <p className="text-gray-600">High-quality fashion at accessible prices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action for Login/Signup */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join Our Community!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Create an account to save your favorites, track orders, and get exclusive offers!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition duration-300"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">reStyle</h3>
              <p className="text-gray-400">
                Sustainable fashion through curated second-hand apparel and custom designs.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Size Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Returns</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Other Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/agent-login" className="hover:text-white transition duration-300">
                    Delivery Agent Login
                  </Link>
                </li>
                <li>
                  <Link to="/manager-login" className="hover:text-white transition duration-300">
                    Manager Login
                  </Link>
                </li>
                <li>
                  <Link to="/admin-login" className="hover:text-white transition duration-300">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 reStyle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
