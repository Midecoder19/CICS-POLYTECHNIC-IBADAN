// src/pages/StockPage/Inventory.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Trash, Plus, Package, Search } from "phosphor-react";
import stockSalesService from "../../services/StockSalesService";
import { useAuth } from "../../contexts/AuthContext.jsx";

function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load stock balances on mount
  useEffect(() => {
    loadStockBalances();
  }, [user?.society]);

  const loadStockBalances = async () => {
    try {
      setLoading(true);
      setError(null);

      const societyId = user?.society?._id || user?.society;
      if (!societyId) {
        setError("Society not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Fetch stock balances from the API
      const result = await stockSalesService.getStockBalances(societyId);

      if (result.success && result.data) {
        // Transform the data for display
        const formattedItems = result.data.map((balance) => ({
          id: balance.product?._id || balance.product,
          productCode: balance.productCode || "N/A",
          name: balance.productName || "Unknown Product",
          category: balance.category || "General",
          quantity: balance.quantityOnHand || 0,
          unit: balance.unit || "pcs",
          price: balance.unitPrice || 0,
          status: getStockStatus(balance.quantityOnHand || 0),
        }));
        setItems(formattedItems);
      } else {
        setError(result.message || "Failed to load inventory data");
      }
    } catch (err) {
      console.error("Error loading stock balances:", err);
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return "Out of Stock";
    if (quantity < 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    loadStockBalances();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Inventory Items</h2>
          <button
            onClick={handleRefresh}
            className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all duration-200"
          >
            <Plus size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by product name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={handleRefresh} className="ml-2 underline font-semibold">
            Retry
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Product Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Code: {item.productCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.quantity.toLocaleString()} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₦{item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No items found</p>
                      <p className="text-sm">
                        {searchQuery
                          ? "Try adjusting your search criteria"
                          : "No stock balances found. Add stock receipts to update inventory."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400">In Stock</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {items.filter((i) => i.status === "In Stock").length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {items.filter((i) => i.status === "Low Stock").length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400">Out of Stock</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {items.filter((i) => i.status === "Out of Stock").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
