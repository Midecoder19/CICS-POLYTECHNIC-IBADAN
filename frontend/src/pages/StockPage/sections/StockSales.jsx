import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Plus, Save, RotateCcw, Loader, Trash2, Printer, Search, Key } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import stockSalesService from "../../../services/StockSalesService.js";
import StoreLookupModal from "../../CommonPage/sections/StoreLookupModal";
import ProductLookupModal from "../../CommonPage/sections/ProductLookupModal";
import MemberLookupModal from "../../CommonPage/sections/MemberLookupModal";
import { api } from "../../../config/api.js";
import "../../../styles/StockSales.css";
import "../../../styles/StockSales.css";



const StockSales = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialHeaderState = useMemo(() => ({
    _id: null,
    store: "",
    storeCode: "",
    storeName: "",
    sivNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    memberNumber: "",
    fullName: "",
    discountRate: 0,
    discountAmount: 0,
    vatRate: 0,
    vatAmount: 0,
    stockBalance: 0,
    minimumLevel: 0,
    status: "active",
    society: user?.society?._id || user?.society || '',
    totalAmount: 0,
    totalQuantity: 0,
  }), [user]);

  const [headerData, setHeaderData] = useState(initialHeaderState);
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({ page: true, action: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showStoreLookup, setShowStoreLookup] = useState(false);
  const [showProductLookup, setShowProductLookup] = useState(false);
  const [showMemberLookup, setShowMemberLookup] = useState(false);
  const [members, setMembers] = useState([]);
  const [stockBalances, setStockBalances] = useState({}); // Store stock balance per product
  const [currentItem, setCurrentItem] = useState({
    product: '',
    productCode: '',
    description: '',
    measure: '',
    bulk: 0,
    bulkPrice: 0,
    quantity: 1,
    unitPrice: 0,
    extendedAmount: 0,
    availableStock: 0
  });

  const { totalQuantity, totalAmount, discountAmount, vatAmount, netAmount } = useMemo(() => {
    const totals = items.reduce((totals, item) => {
      totals.totalQuantity += item.quantity || 0;
      totals.totalAmount += item.extendedAmount || 0;
      return totals;
    }, { totalQuantity: 0, totalAmount: 0 });

    // Manual discount and VAT from header inputs
    const discount = parseFloat(headerData.discountAmount) || 0;
    const vat = parseFloat(headerData.vatAmount) || 0;
    const net = totals.totalAmount - discount + vat;

    return {
      totalQuantity: totals.totalQuantity,
      totalAmount: totals.totalAmount,
      discountAmount: discount,
      vatAmount: vat,
      netAmount: net
    };
  }, [items, headerData.discountAmount, headerData.vatAmount]);

  useEffect(() => {
    // Wait for user to be loaded
    if (!user) {
      return;
    }
    
    if (user.society) {
      loadInitialData();
    } else {
      setError("User society not found. Please log in again.");
      setLoading({ page: false, action: false });
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading({ page: true, action: false });
    try {
      console.log('User object:', user);
      let societyId = user?.society?._id || user?.society;
      console.log('Loading stock sales data for society:', societyId);
      
      if (!societyId) {
        console.warn('User society not found, trying to get from localStorage');
        // Try to get society from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          societyId = parsedUser?.society?._id || parsedUser?.society;
          console.log('Society from localStorage:', societyId);
        }
      }
      
      if (!societyId) {
        throw new Error("User society not found. Please contact administrator to assign a society.");
      }

      console.log('Calling APIs...');
      
      // Call all APIs
      const [storesRes, productsRes, membersRes, stockBalancesRes] = await Promise.all([
        stockSalesService.getStores(societyId),
        stockSalesService.getProducts(societyId),
        stockSalesService.getMembers(societyId).catch(err => ({ success: false, data: [], message: err.message })),
        stockSalesService.getStockBalances(societyId)
      ]);
      
      if (storesRes.success) setStores(storesRes.data || []);
      else throw new Error("Failed to load stores: " + storesRes.message);

      if (productsRes.success) setProducts(productsRes.data || []);
      else throw new Error("Failed to load products: " + productsRes.message);

      if (membersRes.success) setMembers(membersRes.data || []);
      else if (membersRes.data && membersRes.data.length > 0) {
        // Members loaded even if success is false
        setMembers(membersRes.data || []);
      }
      // Don't throw error if members are loaded - some APIs have different response formats

      // Build stock balance lookup by product ID
      if (stockBalancesRes.success && stockBalancesRes.data) {
        console.log('Stock balances data:', stockBalancesRes.data);
        const balances = {};
        stockBalancesRes.data.forEach(balance => {
          const productId = balance.product?._id?.toString() || balance.product?.toString();
          balances[productId] = balance.quantityOnHand || 0;
          console.log('Product', productId, 'balance:', balance.quantityOnHand);
        });
        setStockBalances(balances);
      } else {
        console.error('Failed to load stock balances:', stockBalancesRes);
      }

    } catch (err) {
      setError(err.message || "Failed to load initial data.");
    } finally {
      setLoading({ page: false, action: false });
    }
  };

  // Reload stock balances from server
  const loadStockBalances = async () => {
    try {
      let societyId = user?.society?._id || user?.society;
      if (!societyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          societyId = parsedUser?.society?._id || parsedUser?.society;
        }
      }
      
      if (!societyId) return;
      
      const stockBalancesRes = await stockSalesService.getStockBalances(societyId);
      if (stockBalancesRes.success && stockBalancesRes.data) {
        const balances = {};
        stockBalancesRes.data.forEach(balance => {
          const productId = balance.product?._id?.toString() || balance.product?.toString();
          balances[productId] = balance.quantityOnHand || 0;
        });
        setStockBalances(balances);
      }
    } catch (err) {
      console.error('Failed to reload stock balances:', err);
    }
  };

  const handleSearchSiv = async () => {
    if (!headerData.sivNo) {
      setError("Please enter a SIV number to search.");
      return;
    }
    setLoading({ ...loading, action: true });
    try {
      const result = await stockSalesService.getStockSaleBySivNo(headerData.sivNo, user.society._id);
      if (result.success && result.data) {
        const sale = result.data;
        setHeaderData({
          ...sale,
          issueDate: new Date(sale.issueDate).toISOString().split("T")[0],
        });
        setItems(sale.items || []);
        setSuccess("Sale loaded successfully.");
      } else {
        setError(result.message || "Sale not found.");
        resetForm();
      }
    } catch (err) {
      setError("An error occurred while searching for the sale.");
      resetForm();
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  const resetForm = useCallback(() => {
    setHeaderData(initialHeaderState);
    setItems([]);
    setError(null);
    setSuccess(null);
  }, [initialHeaderState]);

  const generateSivNo = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SIV${year}${month}${day}${random}`;
  };

  const handleSave = async () => {
    if (!headerData.store || items.length === 0) {
      setError("Please select a store and add at least one item.");
      return;
    }
    setLoading({ ...loading, action: true });

    const saleData = {
      ...headerData,
      sivNo: headerData.sivNo || generateSivNo(),
      items: items,
      totalAmount: totalAmount,
      discountAmount: discountAmount,
      vatAmount: vatAmount,
    };

    try {
      let result;
      if (headerData._id) {
        result = await stockSalesService.updateStockSale(headerData._id, saleData);
      } else {
        result = await stockSalesService.createStockSale(saleData);
      }

      if (result.success) {
        setSuccess(`Sale ${headerData._id ? 'updated' : 'created'} successfully!`);
        if (result.data) {
          setHeaderData({
            ...result.data,
            issueDate: new Date(result.data.issueDate).toISOString().split("T")[0],
          });
          setItems(result.data.items || []);
        }
        // Reload stock balances from server to reflect the updated stock
        await loadStockBalances();
      } else {
        throw new Error(result.message || `Failed to ${headerData._id ? 'update' : 'create'} sale.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  const handleDelete = async () => {
    if (!headerData._id) {
      setError("No sale loaded to delete.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this sale?")) {
      setLoading({ ...loading, action: true });
      try {
        const result = await stockSalesService.deleteStockSale(headerData._id);
        if (result.success) {
          setSuccess("Sale deleted successfully.");
          resetForm();
        } else {
          throw new Error(result.message || "Failed to delete sale.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading({ ...loading, action: false });
      }
    }
  };

  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `SIV-${headerData.sivNo || 'Draft'}`,
  });

  const handlePOS = async () => {
    // POS printing - thermal receipt
    if (!headerData.sivNo || items.length === 0) {
      setError("No sale data available for POS printing. Please add items and ensure SIV number is generated.");
      return;
    }
    try {
      // Print thermal POS receipt
      const printWindow = window.open('', '_blank');
      const itemsHtml = items.map(item =>
        '<tr>' +
          '<td>' + (item.productCode || '') + '</td>' +
          '<td>' + (item.description || item.productName || '-') + '</td>' +
          '<td>' + item.quantity + '</td>' +
          '<td style="text-align: right;">' + (item.unitPrice?.toFixed(2) || '0.00') + '</td>' +
          '<td style="text-align: right;">' + (item.extendedAmount?.toFixed(2) || '0.00') + '</td>' +
        '</tr>'
      ).join('');
      const htmlContent =
        '<html>' +
          '<head>' +
            '<title>POS Receipt</title>' +
            '<style>' +
              'body { font-family: monospace; font-size: 12px; width: 300px; margin: 0; }' +
              '.center { text-align: center; }' +
              '.bold { font-weight: bold; }' +
              'table { width: 100%; border-collapse: collapse; }' +
              'td { padding: 2px 0; }' +
              '.total { border-top: 1px solid #000; margin-top: 5px; }' +
            '</style>' +
          '</head>' +
          '<body>' +
            '<div class="center bold">' + (user?.society?.name || 'Society') + '</div>' +
            '<div class="center">POINT OF SALE RECEIPT</div>' +
            '<div class="center">SIV: ' + headerData.sivNo + '</div>' +
            '<div class="center">Date: ' + new Date(headerData.issueDate).toLocaleDateString() + '</div>' +
            '<hr>' +
            '<table>' +
              '<tr><th>Code</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>' +
              itemsHtml +
            '</table>' +
            '<div class="total">' +
              '<div>Total: ' + totalAmount.toFixed(2) + '</div>' +
              '<div>Discount: ' + discountAmount.toFixed(2) + '</div>' +
              '<div>VAT: ' + vatAmount.toFixed(2) + '</div>' +
              '<div class="bold">Net: ' + netAmount.toFixed(2) + '</div>' +
            '</div>' +
            '<div class="center">Thank you for your business!</div>' +
          '</body>' +
        '</html>';
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      setError("Failed to print POS receipt.");
    }
  };


  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberNumberBlur = async () => {
    const memberNumber = headerData.memberNumber?.trim();
    if (!memberNumber) {
      setHeaderData(prev => ({ ...prev, fullName: '' }));
      return;
    }

    // Find member in loaded members list
    const member = members.find(m => m.memberNumber === memberNumber);
    if (member) {
      setHeaderData(prev => ({
        ...prev,
        fullName: `${member.firstName} ${member.lastName}`
      }));
    } else {
      // If not found in loaded list, try to fetch from API
      try {
        const response = await api.get(`/common/members?society=${user.society._id || user.society}&search=${memberNumber}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            const foundMember = data.data[0];
            setHeaderData(prev => ({
              ...prev,
              fullName: `${foundMember.firstName} ${foundMember.lastName}`
            }));
          } else {
            setHeaderData(prev => ({ ...prev, fullName: '' }));
            setError('Member not found');
          }
        } else {
          setHeaderData(prev => ({ ...prev, fullName: '' }));
          setError('Failed to fetch member details');
        }
      } catch (err) {
        setHeaderData(prev => ({ ...prev, fullName: '' }));
        setError('Error fetching member details');
      }
    }
  };

  const handleStoreSelect = (store) => {
    setHeaderData(prev => ({
      ...prev,
      store: store._id,
      storeName: store.name,
      storeCode: store.storeCode,
      stockBalance: store.currentBalance || 0,
      minimumLevel: store.minimumLevel || 0
    }));
    setShowStoreLookup(false);
  };

  const handleMemberSelect = (member) => {
    setHeaderData(prev => ({
      ...prev,
      memberNumber: member.memberNumber,
      fullName: `${member.firstName} ${member.lastName}`
    }));
    setShowMemberLookup(false);
    setError(null); // Clear any previous errors
  };

  const handleInlineEdit = (item, field, value) => {
    const updatedItem = { ...item };
    updatedItem[field] = parseFloat(value) || 0;

    if (field === 'bulk' || field === 'unitPrice') {
      // Recalculate quantity and extended amount
      // If measure is Piece or Pack, only use pieces (bulk should be 0)
      if (item.measure === 'Piece' || item.measure === 'Pack') {
        updatedItem.bulk = 0;
        updatedItem.quantity = updatedItem.pieces || 0;
      } else {
        updatedItem.quantity = (updatedItem.bulk || 0) + (updatedItem.pieces || 0);
      }
      updatedItem.extendedAmount = updatedItem.quantity * (updatedItem.unitPrice || 0);
    }

    setItems(items.map(it => it.product === item.product ? updatedItem : it));
  };

  const handleSelectItem = (item) => {
    // For now, just log or handle selection if needed
    console.log('Selected item:', item);
  };

  const handleItemDelete = (itemToDelete) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setItems(items.filter(it => it.product !== itemToDelete.product));
    }
  };

  const handleAddItem = () => {
    setShowProductLookup(true);
  };

  const handleProductSelectForEntry = async (product) => {
    // Get product ID as string for consistent matching
    const productId = product._id?.toString();
    
    // Get stock balance from availableStock (passed from ProductLookupModal) or from local state
    let stockBalance = product.availableStock || stockBalances[productId] || 0;
    
    let unitPrice = product.sellingPrice || product.price || 0;
    let measure = product.unit || 'Piece';
    
    setCurrentItem({
      product: productId,
      productCode: product.code,
      description: product.description || product.name,
      measure: measure,
      bulk: 0,
      bulkPrice: product.bulkPrice || 0,
      pieces: 0,
      quantity: 0,
      unitPrice: unitPrice,
      extendedAmount: 0,
      availableStock: stockBalance
    });
    
    setShowProductLookup(false);
  };

  const handleItemEntryChange = (field, value) => {
    const updatedItem = { ...currentItem };

    if (field === 'measure') {
      updatedItem[field] = value;
      // When measure is Piece or Pack, set bulk to 0 (only Pieces apply)
      if (value === 'Piece' || value === 'Pack') {
        updatedItem.bulk = 0;
        updatedItem.quantity = updatedItem.pieces || 0;
        updatedItem.extendedAmount = updatedItem.quantity * (updatedItem.unitPrice || 0);
      }
    } else if (field === 'bulk' || field === 'pieces' || field === 'unitPrice') {
      updatedItem[field] = parseFloat(value) || 0;
      // Calculate total quantity from bulk and pieces
      updatedItem.quantity = (updatedItem.bulk || 0) + (updatedItem.pieces || 0);
      updatedItem.extendedAmount = updatedItem.quantity * (updatedItem.unitPrice || 0);
    } else {
      updatedItem[field] = value;
    }

    setCurrentItem(updatedItem);
  };

  const handleAddItemToSpreadsheet = () => {
    if (!currentItem.product) {
      setError('Please select a product first.');
      return;
    }
    
    if (!currentItem.quantity || currentItem.quantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }
    
    // Check stock availability
    const productKey = currentItem.product?.toString();
    const availableStock = currentItem.availableStock || stockBalances[productKey] || 0;
    if (currentItem.quantity > availableStock) {
      setError(`Insufficient stock. Available: ${availableStock}, Requested: ${currentItem.quantity}`);
      return;
    }
    
    // Calculate extended amount
    const extendedAmount = currentItem.quantity * (currentItem.unitPrice || 0);
    
    // Add to items array with calculated extended amount
    setItems([...items, { ...currentItem, extendedAmount }]);
    
    // Update stock balances - subtract the sold quantity
    const updatedBalances = { ...stockBalances };
    if (updatedBalances[productKey] !== undefined) {
      updatedBalances[productKey] = Math.max(0, updatedBalances[productKey] - currentItem.quantity);
    }
    setStockBalances(updatedBalances);
    
    // Reset current item
    setCurrentItem({
      product: '',
      productCode: '',
      description: '',
      measure: '',
      bulk: 0,
      bulkPrice: 0,
      pieces: 0,
      quantity: 1,
      unitPrice: 0,
      extendedAmount: 0,
      availableStock: updatedBalances[productKey] || 0
    });
    
    setSuccess('Item added to spreadsheet. Stock updated.');
  };

  if (loading.page) return <div className="loading-indicator"><Loader className="animate-spin" /> Loading Page...</div>;

  const canEdit = headerData.status === 'draft' || user.role === 'admin';

  return (
    <div className="srv-page">
      <div className="srv-header">
        <h2>🛒 Stock Sales</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>

      {loading.action && <div className="loading-indicator"><Loader className="animate-spin" /> Processing...</div>}
      {error && <div className="error-message"><span>❌ {error}</span><button onClick={() => setError(null)}>✖</button></div>}
      {success && <div className="success-message"><span>✅ {success}</span><button onClick={() => setSuccess(null)}>✖</button></div>}

      {/* TOP BUTTONS */}
      <div className="toolbar">
        <button onClick={resetForm}><Plus size={16} /> Add</button>
        <button onClick={handleSave} disabled={!canEdit || loading.action}><Save size={16} /> Update</button>
        <button onClick={handleDelete} disabled={!headerData._id || !canEdit || loading.action}><Trash2 size={16} /> Delete</button>
        <button onClick={handlePrint}><Printer size={16} /> Print</button>
      </div>

      {/* HEADER PANEL */}
      <div className="srv-card">
        <h3>Header Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Store</label>
            <div className="input-with-icon">
              <input type="text" value={headerData.storeCode && headerData.storeName ? `${headerData.storeCode} - ${headerData.storeName}` : ''} readOnly placeholder="Select Store" style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }} />
              <button type="button" className="key-btn" onClick={() => setShowStoreLookup(true)} disabled={!canEdit}><Key size={16} /></button>
            </div>
          </div>
          <div className="form-group">
            <label>SIV No</label>
            <input type="text" value={headerData.sivNo} readOnly placeholder="Auto-generated" style={{ backgroundColor: '#f3e5f5', fontWeight: 'bold', color: '#6a1b9a' }} />
          </div>
          <div className="form-group">
            <label>Issue Date</label>
            <input type="date" value={headerData.issueDate} onChange={handleHeaderChange} name="issueDate" disabled={!canEdit} />
          </div>
          <div className="form-group">
            <label>Member No</label>
            <div className="input-with-icon">
              <input type="text" value={headerData.memberNumber} onChange={handleHeaderChange} onBlur={handleMemberNumberBlur} name="memberNumber" placeholder="Member Number" disabled={!canEdit} style={{ backgroundColor: '#fff8e1', fontWeight: 'bold' }} />
              <button type="button" className="key-btn" onClick={() => setShowMemberLookup(true)} disabled={!canEdit}><Key size={16} /></button>
            </div>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={headerData.fullName} onChange={handleHeaderChange} name="fullName" placeholder="Full Name" disabled={!canEdit} />
          </div>
          <div className="form-group">
            <label>Discount Rate</label>
            <input type="number" value={headerData.discountRate || 0} onChange={handleHeaderChange} name="discountRate" min="0" max="100" disabled={!canEdit} />
          </div>
          <div className="form-group">
            <label>Discount Amount</label>
            <input type="number" value={headerData.discountAmount || 0} onChange={handleHeaderChange} name="discountAmount" min="0" disabled={!canEdit} />
          </div>
          <div className="form-group">
            <label>VAT Rate</label>
            <input type="number" value={headerData.vatRate || 0} onChange={handleHeaderChange} name="vatRate" min="0" max="100" disabled={!canEdit} />
          </div>
          <div className="form-group">
            <label>VAT Amount</label>
            <input type="number" value={headerData.vatAmount || 0} onChange={handleHeaderChange} name="vatAmount" min="0" disabled={!canEdit} />
          </div>
          <div className="form-group">
            <label>Stock Balance</label>
            <input type="text" value={headerData.stockBalance || 0} readOnly />
          </div>
          <div className="form-group">
            <label>Minimum Level</label>
            <input type="text" value={headerData.minimumLevel || 0} readOnly />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={headerData.status} onChange={handleHeaderChange} name="status" disabled={!canEdit}>
              <option value="active">Active</option>
              <option value="not">Not Active</option>
            </select>
          </div>
        </div>
      </div>



      {/* ITEM ENTRY SECTION */}
      <div className="srv-card">
        <h3>Item Entry</h3>
        <div className="item-entry-panel">
          <div className="form-grid">
            <div className="form-group">
              <label>Item Code</label>
              <div className="input-with-icon">
                <input type="text" value={currentItem.productCode} readOnly placeholder="Select Product" />
                <button type="button" className="key-btn" onClick={() => setShowProductLookup(true)} disabled={!canEdit}><Key size={16} /></button>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={currentItem.description} readOnly placeholder="Auto-filled" />
            </div>
            <div className="form-group">
              <label>Available Stock</label>
              <input type="text" value={currentItem.availableStock || stockBalances[currentItem.product?.toString()] || 0} readOnly style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', color: (currentItem.availableStock || stockBalances[currentItem.product?.toString()] || 0) > 0 ? '#28a745' : '#dc3545' }} />
            </div>
            <div className="form-group">
              <label>Measure</label>
              <select value={currentItem.measure} onChange={(e) => handleItemEntryChange('measure', e.target.value)} disabled={!canEdit}>
                <option value="">Select Measure</option>
                <option value="Piece">Piece</option>
                <option value="Pack">Pack</option>
              </select>
            </div>
            <div className="form-group">
              <label>Unit Price</label>
              <input type="number" value={currentItem.unitPrice || ''} onChange={(e) => handleItemEntryChange('unitPrice', e.target.value)} disabled={!canEdit} step="0.01" min="0" placeholder="0.00" style={{ backgroundColor: '#e8f5e8', fontWeight: 'bold' }} />
            </div>
            <div className="form-group">
              <label>Bulk</label>
              <input type="number" value={currentItem.bulk} onChange={(e) => handleItemEntryChange('bulk', e.target.value)} disabled={!canEdit} step="0.01" min="0" style={{ backgroundColor: '#fff3cd' }} />
            </div>
            <div className="form-group">
              <label>Pieces</label>
              <input type="number" value={currentItem.pieces || 0} onChange={(e) => handleItemEntryChange('pieces', e.target.value)} disabled={!canEdit} step="0.01" min="0" style={{ backgroundColor: '#fff3cd' }} />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="text" value={currentItem.extendedAmount ? currentItem.extendedAmount.toFixed(2) : '0.00'} readOnly />
            </div>
          </div>
          <div className="item-entry-actions">
            <button onClick={() => {
              handleAddItemToSpreadsheet();
              // Generate SIV No when OK is pressed if not already set
              if (!headerData.sivNo) {
                setHeaderData(prev => ({ ...prev, sivNo: generateSivNo() }));
              }
            }} disabled={!canEdit || !currentItem.product} className="btn btn-primary">
              OK
            </button>
            <button onClick={() => {
              setCurrentItem({
                product: '',
                productCode: '',
                description: '',
                measure: '',
                bulk: 0,
                bulkPrice: 0,
                pieces: 0,
                quantity: 1,
                unitPrice: 0,
                extendedAmount: 0,
                availableStock: 0
              });
            }} className="btn btn-secondary">
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* SPREADSHEET GRID */}
      <div className="srv-card">
        <h3>Items Spreadsheet</h3>
        <div className="spreadsheet-grid">
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>Item Code</th>
                <th>Description</th>
                <th>Measure</th>
                <th>Available</th>
                <th>Bulk</th>
                <th>Bulk Price</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Extended</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td><input type="text" value={index + 1} readOnly /></td>
                  <td><input type="text" value={item.productCode} readOnly /></td>
                  <td><input type="text" value={item.description} readOnly /></td>
                  <td><input type="text" value={item.measure} readOnly /></td>
                  <td><input type="text" value={item.availableStock || stockBalances[item.product?.toString()] || 0} readOnly style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }} /></td>
                  <td><input type="number" value={(item.measure === 'Piece' || item.measure === 'Pack') ? '' : (item.bulk || 0)} onChange={(e) => handleInlineEdit(item, 'bulk', e.target.value)} disabled={!canEdit || item.measure === 'Piece' || item.measure === 'Pack'} step="0.01" placeholder={item.measure === 'Piece' || item.measure === 'Pack' ? '-' : ''} /></td>
                  <td><input type="text" value={item.bulkPrice ? item.bulkPrice.toFixed(2) : '-'} readOnly /></td>
                  <td><input type="number" value={item.quantity || 0} readOnly /></td>
                  <td><input type="number" value={item.unitPrice || 0} onChange={(e) => handleInlineEdit(item, 'unitPrice', e.target.value)} disabled={!canEdit} step="0.01" /></td>
                  <td><input type="text" value={item.extendedAmount ? item.extendedAmount.toFixed(2) : '0.00'} readOnly /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOTALS SECTION */}
      <div className="totals-section">
        <div className="totals-grid">
          <div className="form-group">
            <label>Total Amount</label>
            <input type="text" value={totalAmount.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>Discount Amount</label>
            <input type="text" value={discountAmount.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>VAT Amount</label>
            <input type="text" value={vatAmount.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>Net Amount</label>
            <input type="text" value={netAmount.toFixed(2)} readOnly />
          </div>
        </div>
        <div className="pos-section">
          <button onClick={handlePOS} className="pos-btn btn btn-success btn-lg" style={{ padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#28a745', borderColor: '#28a745', color: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>🖨 POS</button>
        </div>
      </div>

      {/* HIDDEN RECEIPT FOR PRINTING */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef} style={{ fontFamily: 'monospace', fontSize: '12px', width: '300px', margin: '0 auto', padding: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            {user?.society?.name || 'Society'}
          </div>
          <div style={{ textAlign: 'center' }}>POINT OF SALE RECEIPT</div>
          <div style={{ textAlign: 'center' }}>SIV: {headerData.sivNo || 'Draft'}</div>
          <div style={{ textAlign: 'center' }}>Date: {new Date(headerData.issueDate).toLocaleDateString()}</div>
          <hr />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {items.map(item => (
                <tr key={item.product}>
                  <td>{item.productCode}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{(item.unitPrice || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{(item.extendedAmount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid #000', marginTop: '5px', paddingTop: '5px' }}>
            <div>Total: {totalAmount.toFixed(2)}</div>
            <div>Discount: {discountAmount.toFixed(2)}</div>
            <div>VAT: {vatAmount.toFixed(2)}</div>
            <div style={{ fontWeight: 'bold' }}>Net: {netAmount.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>Thank you for your business!</div>
        </div>
      </div>

      {/* MODALS */}
      {showStoreLookup && (
        <StoreLookupModal
          societyId={user?.society?._id || user?.society}
          onSelect={handleStoreSelect}
          onClose={() => setShowStoreLookup(false)}
        />
      )}
      {showProductLookup && (
        <ProductLookupModal
          societyId={user?.society?._id || user?.society}
          onSelect={handleProductSelectForEntry}
          onClose={() => setShowProductLookup(false)}
        />
      )}
      {showMemberLookup && (
        <MemberLookupModal
          societyId={user?.society?._id || user?.society}
          onSelect={handleMemberSelect}
          onClose={() => setShowMemberLookup(false)}
        />
      )}
    </div>
  );
};



// RoughSheet component removed as it's now integrated into the spreadsheet grid above

// Stock Sales implementation completed - matches old system exactly

export default StockSales;
