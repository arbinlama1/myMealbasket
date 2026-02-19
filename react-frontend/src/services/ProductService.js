// Shared Product Service - Manages products across vendor and user dashboards

class ProductService {
  constructor() {
    // Initial products data
    this.products = [
      {
        id: 1,
        name: 'Classic Burger',
        vendor: 'Burger Palace',
        vendorId: 1,
        price: 12.99,
        description: 'Juicy beef patty with fresh vegetables and special sauce',
        rating: 4.5,
        inStock: true,
        image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Classic+Burger',
        ingredients: 'Beef patty, lettuce, tomato, onion, pickles, special sauce, sesame bun',
        calories: 550,
        prepTime: '15 mins',
        category: 'Main Course',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Pepperoni Pizza',
        vendor: 'Pizza Express',
        vendorId: 2,
        price: 15.99,
        description: 'Fresh mozzarella, pepperoni, and tomato sauce on thin crust',
        rating: 4.7,
        inStock: true,
        image: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Pepperoni+Pizza',
        ingredients: 'Fresh mozzarella, pepperoni, tomato sauce, olive oil, thin crust',
        calories: 280,
        prepTime: '20 mins',
        category: 'Main Course',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Caesar Salad',
        vendor: 'Green Garden',
        vendorId: 3,
        price: 8.99,
        description: 'Fresh romaine lettuce, parmesan, croutons, and Caesar dressing',
        rating: 4.2,
        inStock: true,
        image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Caesar+Salad',
        ingredients: 'Romaine lettuce, parmesan cheese, croutons, Caesar dressing',
        calories: 180,
        prepTime: '10 mins',
        category: 'Salad',
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Grilled Chicken',
        vendor: 'Chicken House',
        vendorId: 4,
        price: 14.99,
        description: 'Tender grilled chicken breast with herbs and spices',
        rating: 4.3,
        inStock: true,
        image: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Grilled+Chicken',
        ingredients: 'Chicken breast, herbs, spices, olive oil, grilled vegetables',
        calories: 320,
        prepTime: '25 mins',
        category: 'Main Course',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Subscribers for real-time updates
    this.subscribers = [];
  }

  // Subscribe to product changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers of changes
  notify(type, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Get all products
  getAllProducts() {
    return [...this.products];
  }

  // Get products by vendor
  getProductsByVendor(vendorId) {
    return this.products.filter(p => p.vendorId === vendorId);
  }

  // Add new product (vendor action)
  addProduct(product) {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    this.products.push(newProduct);
    this.notify('PRODUCT_ADDED', newProduct);
    
    console.log('✅ Product added:', newProduct);
    return newProduct;
  }

  // Update product (vendor action)
  updateProduct(productId, updates) {
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) return null;
    
    const oldProduct = this.products[index];
    const updatedProduct = { ...oldProduct, ...updates };
    this.products[index] = updatedProduct;
    
    this.notify('PRODUCT_UPDATED', updatedProduct);
    
    console.log('✅ Product updated:', updatedProduct);
    return updatedProduct;
  }

  // Delete product (vendor action)
  deleteProduct(productId) {
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) return null;
    
    const deletedProduct = this.products.splice(index, 1)[0];
    this.notify('PRODUCT_DELETED', deletedProduct);
    
    console.log('✅ Product deleted:', deletedProduct);
    return deletedProduct;
  }

  // Toggle stock status
  toggleStock(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return null;
    
    const updatedProduct = this.updateProduct(productId, {
      inStock: !product.inStock
    });
    
    return updatedProduct;
  }

  // Get product statistics
  getStats() {
    const totalProducts = this.products.length;
    const inStock = this.products.filter(p => p.inStock).length;
    const outOfStock = totalProducts - inStock;
    const avgPrice = totalProducts > 0 
      ? (this.products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2)
      : 0;
    const avgRating = totalProducts > 0
      ? (this.products.reduce((sum, p) => sum + p.rating, 0) / totalProducts).toFixed(1)
      : 0;

    return {
      totalProducts,
      inStock,
      outOfStock,
      avgPrice,
      avgRating
    };
  }
}

// Create singleton instance
const productService = new ProductService();

// Export the service
export default productService;
