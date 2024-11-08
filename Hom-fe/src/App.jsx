import React, { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import './App.css';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import _ from 'lodash';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state
  const [currentSlide, setCurrentSlide] = useState(0); // Track current slide index
  const [allProducts, setAllProducts] = useState([]); // Store all products

  // Fetch all products when component is mounted
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setAllProducts(data); 
        setSearchResults(data); 
      } catch (error) {
        console.error('Error fetching products:', error);
        setSearchResults([]);  // Optionally show an error message or empty list
      }
    };    

    fetchAllProducts();
  }, []);

  const fetchSearchResults = async (term) => {
    setLoading(true); // Set loading to true when starting the search
    try {
      const response = await fetch(`http://localhost:5000/api/products/search?query=${term}`);
      const data = await response.json();
      setSearchResults(data); // Update search results
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Set loading to false after search is complete
    }
  };

  // Debounce the search function to prevent multiple API calls
  const debouncedSearch = useCallback(debounce(fetchSearchResults, 500), []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults(allProducts); // If search term is empty, show all products
    } else {
      debouncedSearch(term); // Trigger the debounced search
    }
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % searchResults.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? searchResults.length - 1 : prevSlide - 1
    );
  };

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div>
      <Navbar
        onSearch={handleSearch}
        searchResults={searchResults}
        searchTerm={searchTerm}
      />
      <Banner />

      {/* Product Carousel */}
      <div className="carousel-container">
        <h2>Our Featured Products</h2>
        <div className="carousel">
          {/* Carousel Item */}
          {searchResults.length > 0 && (
            <div className="carousel-item">
              <img
                src={searchResults[currentSlide].image}
                alt={searchResults[currentSlide].name}
                className="carousel-image"
              />
              <h3>{searchResults[currentSlide].name}</h3>
              <p>{searchResults[currentSlide].description}</p>
              <p className='price'>Rs.{searchResults[currentSlide].price}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="carousel-nav">
            <button className="carousel-nav-btn prev" onClick={handlePrevSlide}>
              &#10094;
            </button>
            <button className="carousel-nav-btn next" onClick={handleNextSlide}>
              &#10095;
            </button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          {searchResults.map((_, index) => (
            <input
              key={index}
              type="radio"
              checked={currentSlide === index}
              onChange={() => handleSlideChange(index)}
              className="carousel-indicator"
            />
          ))}
        </div>
      </div>

      
      {/* Display All Products Below Banner */}
      <div className="main-products">
        <h2>All Products</h2>
        <div className="product-list">
          {loading ? (
            <p>Loading...</p>
          ) : allProducts.length > 0 ? (
            allProducts.map((product) => (
              <div key={product.id} className="product-item">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className='price'>Rs.{product.price}</p>
              </div>
            ))
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default App;
