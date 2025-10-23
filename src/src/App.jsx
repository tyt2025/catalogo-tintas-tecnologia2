import React, { useState, useEffect } from 'react';
import { Search, Package, Filter, MessageCircle } from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const SUPABASE_URL = 'https://cxxifwpwarbrrodtzyqn.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eGlmd3B3YXJicnJvZHR6eXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc5OTAsImV4cCI6MjA3MzgwMzk5MH0.tMgoakEvw8wsvrWZpRClZo3BpiUIJ4OQrQsiM4BGM54';
  const WHATSAPP = '573102605693';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*&order=product_name.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        
        const uniqueCategories = ['Todas', ...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.product_name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.brand?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
      );
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const sendWhatsApp = (product) => {
    const message = `Hola! Me interesa el producto:\n\n*${product.product_name}*\nPrecio: ${formatPrice(product.price_cop)}\nCódigo: ${product.sku}\n\n¿Está disponible?`;
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-indigo-600 animate-bounce mx-auto mb-4" />
          <p className="text-xl text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">Tintas Y Tecnología SMT</h1>
            <p className="text-indigo-100">Catálogo de Productos</p>
          </div>

          <div className="max-w-2xl mx-auto mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca, descripción o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Filter className="w-5 h-5" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-600">
          Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No se encontraron productos</p>
            <p className="text-gray-500">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image_url_png || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                    alt={product.product_name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                    }}
                  />
                  {product.available_stock < 5 && product.available_stock > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ¡Últimas unidades!
                    </div>
                  )}
                  {product.available_stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Agotado
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-gray-500 ml-2">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
                    {product.product_name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(product.price_cop)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.available_stock}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => sendWhatsApp(product)}
                      disabled={product.available_stock === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        product.available_stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {product.available_stock === 0 ? 'Agotado' : 'Consultar por WhatsApp'}
                    </button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Código: {product.sku}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">Tintas Y Tecnología SMT</p>
          <p className="text-gray-400 text-sm">
            Contáctanos por WhatsApp: +57 310 260 5693
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
