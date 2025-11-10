import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={48} className="text-gray-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-black mb-2 uppercase tracking-wider">
        Tu Carrito Está Vacío
      </h2>
      
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Aún no has agregado productos a tu carrito. 
        Explora nuestra colección y encuentra lo que buscas.
      </p>
      
      <button
        onClick={() => navigate('/shop')}
        className="
          px-8 py-3 bg-black text-white text-sm font-semibold
          uppercase tracking-wider rounded-lg
          hover:bg-gray-900 transition-colors
        "
      >
        Explorar Productos
      </button>
    </div>
  );
};

export default EmptyCart;
