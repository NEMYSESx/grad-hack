"use client";
import { Search, ShoppingCart, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function CollegeMerch() {
  const [cartCount, setCartCount] = useState(0);

  const products = [
    {
      name: "College T-Shirt",
      price: 700,
      image: "/tshirt.jpg",
      hasSize: true,
    },
    { name: "College Cap", price: 50, image: "/hats.jpeg", hasSize: true },
    {
      name: "Water Bottle",
      price: 150,
      image: "/water-bottle.jpg",
      hasSize: false,
    },
    { name: "Notebook", price: 70, image: "/notebook.jpeg", hasSize: false },
    { name: "Hoodie", price: 1100, image: "/hoodie2.jpg", hasSize: true },
    { name: "Pins", price: 20, image: "/pins.jpeg", hasSize: false },
  ];

  const addToCart = () => {
    setCartCount((prevCount) => prevCount + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <main className="container mx-auto p-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <Sun className="h-8 w-8 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              College Merchandise
            </h1>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search merchandise..."
                className="pl-10 pr-4 py-2 w-full md:w-80 bg-white border border-orange-200 rounded-full shadow-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none text-gray-800"
              />
            </div>
            <Button size="icon" variant="ghost" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {product.name}
                </h3>
                <div className="flex flex-col space-y-4">
                  <span className="text-2xl font-bold text-orange-600">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    {product.hasSize && (
                      <Select>
                        <SelectTrigger className="w-full sm:w-24 text-gray-800 border-orange-200 focus:ring-orange-300 focus:border-orange-300">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent className="text-gray-800">
                          {["S", "M", "L", "XL", "XXL"].map((size) => (
                            <SelectItem
                              key={size}
                              value={size.toLowerCase()}
                              className="text-gray-800"
                            >
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-300"
                      onClick={addToCart}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
