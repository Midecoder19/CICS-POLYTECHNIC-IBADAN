import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw, Loader } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { api } from "../../../config/api.js";
import stockReceiptService from "../../../services/StockReceiptService.js";
import "../../../styles/StockReceiptVoucher.css";

const StockReceiptVoucher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize with today's date
  const getToday = () => new Date().toISOString().split('T')[0];

  const [headerData, setHeaderData] = useState(() => ({
    store: "",
    srvNo: "",
    srvDate: getToday(),
    purchaseBy: "cash",
    supplierName: "",
    invoiceNo: "",
    invoiceDate: "",
    discountRate: "",
    discountAmount: "",
    vatRate: "",
    vatAmount: "",
    status: "draft",
  }));

  const [detailsData, setDetailsData] = useState({
    itemCode: "",
    measure: "Pieces", // Pieces or Bulk
    unitCost: "",
    quantity: "",
    bulk: "", // Bulk quantity
    bulkPrice: "",
    amount: "",
  });

  const [roughSheet, setRoughSheet] = useState([]);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    discountAmount: 0,
    vatAmount: 0,
    netPay: 0,
  });
  const [stockBalance, setStockBalance] = useState(0);

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: [],
    loading: false,
  });

  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Real data from API
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load stock balance when component mounts
  useEffect(() => {
    const loadStockBalance = async () => {
      try {
        const societyId = user?.society?._id || user?.society;
        if (societyId) {
          const result = await stockReceiptService.getTotalStockBalance(societyId);
          if (result.success) {
            setStockBalance(result.data.totalQuantity || 0);
          }
        }
      } catch (error) {
        console.error('Error loading stock balance:', error);
      }
    };

    loadStockBalance();
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const societyId = user?.society?._id || user?.society;

      const [storesRes, suppliersRes, productsRes, receiptsRes] = await Promise.all([
        stockReceiptService.getStores(societyId),
        stockReceiptService.getSuppliers(societyId),
        stockReceiptService.getProducts(societyId),
        stockReceiptService.getStockReceipts({ society: societyId, limit: 1000 }) // Load receipts for SRV number generation
      ]);

      if (storesRes.success) setStores(storesRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);
      if (productsRes.success) {
        setProducts(productsRes.data);
        console.log('Products loaded:', productsRes.data.length);
      }
      if (receiptsRes.success) {
        setReceipts(receiptsRes.data);
        console.log('Receipts loaded:', receiptsRes.data.length);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = useCallback((e) => {
    const { name, value } = e.target;
    const updatedHeader = { ...headerData, [name]: value };

    // Auto-calculate discount amount when discount rate or total amount changes
    if (name === 'discountRate' || name === 'totalAmount') {
      updatedHeader.discountAmount = stockReceiptService.calculateDiscountAmount(
        totals.totalAmount,
        updatedHeader.discountRate
      );
    }

    // Auto-calculate VAT amount when VAT rate or (total - discount) changes
    if (name === 'vatRate' || name === 'discountAmount' || name === 'totalAmount') {
      const taxableAmount = totals.totalAmount - (parseFloat(updatedHeader.discountAmount) || 0);
      updatedHeader.vatAmount = stockReceiptService.calculateVatAmount(
        taxableAmount,
        0, // discount already subtracted
        updatedHeader.vatRate
      );
    }

    // Update net pay when any amount changes
    if (['discountAmount', 'vatAmount', 'totalAmount'].includes(name)) {
      updatedHeader.netPay = stockReceiptService.calculateNetPay(
        totals.totalAmount,
        parseFloat(updatedHeader.discountAmount) || 0,
        parseFloat(updatedHeader.vatAmount) || 0
      );
    }

    setHeaderData(updatedHeader);

    // Update totals state for calculations
    if (['discountRate', 'vatRate', 'discountAmount', 'vatAmount'].includes(name)) {
      setTotals(prev => ({
        ...prev,
        discountAmount: parseFloat(updatedHeader.discountAmount) || 0,
        vatAmount: parseFloat(updatedHeader.vatAmount) || 0,
        netPay: parseFloat(updatedHeader.netPay) || prev.totalAmount
      }));
    }
  }, [headerData, totals.totalAmount]);

  const handleTotalsChange = useCallback((e) => {
    const { name, value } = e.target;
    const updatedTotals = { ...totals, [name]: parseFloat(value) || 0 };

    // Update net pay when discount or VAT changes
    if (name === 'discountAmount' || name === 'vatAmount') {
      updatedTotals.netPay = stockReceiptService.calculateNetPay(
        totals.totalAmount,
        updatedTotals.discountAmount,
        updatedTotals.vatAmount
      );
    }

    setTotals(updatedTotals);
  }, [totals]);

  const handleRoughSheetClick = useCallback((item, index) => {
    // Fill the details form with the clicked item's data
    // Determine measure based on whether it's pieces or bulk
    const measure = item.bulk > 0 ? 'Bulk' : 'Pieces';
    
    setDetailsData({
      itemCode: item.itemCode,
      measure: measure,
      unitCost: item.unitPrice.toString(),
      quantity: measure === 'Pieces' ? item.pieces.toString() : '',
      bulk: measure === 'Bulk' ? item.bulk.toString() : '',
      bulkPrice: item.bulkPrice.toString(),
      amount: item.extended.toString()
    });

    // Remove the item from rough sheet
    setRoughSheet(prev => prev.filter((_, i) => i !== index));

    // Update totals by subtracting the removed item
    setTotals(prev => ({
      ...prev,
      totalAmount: prev.totalAmount - item.extended,
      netPay: prev.totalAmount - item.extended - prev.discountAmount + prev.vatAmount,
    }));
  }, []);

  const handleDetailsChange = useCallback((e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...detailsData, [name]: value };

    // Handle measure change (Pieces/Bulk)
    if (name === 'measure') {
      if (value === 'Pieces') {
        // When switching to Pieces, clear bulk fields
        updatedDetails.bulk = '';
        updatedDetails.bulkPrice = '';
      } else if (value === 'Bulk') {
        // When switching to Bulk, clear pieces quantity but keep bulkPrice
        updatedDetails.quantity = '';
      }
    }

    // Auto-calculate amount based on measure
    if (name === 'quantity' || name === 'unitCost' || name === 'bulk' || name === 'bulkPrice') {
      let quantity = 0;
      let unitCost = parseFloat(updatedDetails.unitCost) || 0;
      let bulkPrice = parseFloat(updatedDetails.bulkPrice) || 0;
      
      if (updatedDetails.measure === 'Pieces') {
        // For pieces: quantity is the input, amount = quantity * unitCost
        quantity = parseFloat(updatedDetails.quantity) || 0;
        updatedDetails.amount = (quantity * unitCost).toString();
        updatedDetails.bulk = '';
        updatedDetails.bulkPrice = '';
      } else if (updatedDetails.measure === 'Bulk') {
        // For bulk: bulk is quantity, amount = bulk * bulkPrice
        const bulkQty = parseFloat(updatedDetails.bulk) || 0;
        updatedDetails.amount = (bulkQty * bulkPrice).toString();
        updatedDetails.quantity = '';
      }
    }

    // Auto-calculate bulkPrice when unitCost changes in Bulk mode
    if (name === 'unitCost' && updatedDetails.measure === 'Bulk') {
      updatedDetails.bulkPrice = updatedDetails.unitCost;
    }

    setDetailsData(updatedDetails);
  }, [detailsData]);

  const openModal = useCallback(async (type) => {
    setModal(prev => ({ ...prev, loading: true, isOpen: true, type }));

    try {
      let data = [];
      switch (type) {
        case 'stores':
          data = stores.map(store => ({ id: store._id, code: store.storeCode, name: store.name }));
          break;
        case 'suppliers':
          data = suppliers.map(supplier => ({ id: supplier._id, code: supplier.code, name: supplier.name }));
          break;
        case 'itemCodes':
          data = products.map(product => ({ id: product._id, code: product.code, name: product.name }));
          break;
        case 'srvNos':
          // For SRV numbers, we could show existing receipts or generate new ones
          data = receipts.map(receipt => ({ id: receipt._id, code: receipt.receiptNumber, name: receipt.receiptNumber }));
          break;
        default:
          data = [];
      }

      setModal(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      console.error('Error loading modal data:', error);
      setModal(prev => ({ ...prev, loading: false }));
    }
  }, [stores, suppliers, products, receipts]);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      data: [],
    });
  }, []);

  const selectFromModal = useCallback(async (field, value) => {
    if (field in headerData) {
      // For supplierName and srvNo, set to the name/code, not the object
      if (field === 'supplierName') {
        setHeaderData(prev => ({ ...prev, [field]: value.name }));
      } else if (field === 'srvNo') {
        // Load existing SRV record
        try {
          const result = await stockReceiptService.getStockReceipt(value.id || value._id);
          if (result.success && result.data) {
            const receipt = result.data;
            
            // Map the receipt data to form fields
            setHeaderData({
              store: receipt.society?._id || receipt.society || "",
              srvNo: receipt.receiptNumber,
              srvDate: receipt.receiptDate ? receipt.receiptDate.split('T')[0] : "",
              purchaseBy: "cash", // Default
              supplierName: receipt.supplierName || "",
              invoiceNo: receipt.invoiceNumber || "",
              invoiceDate: receipt.invoiceDate ? receipt.invoiceDate.split('T')[0] : "",
              discountRate: "",
              discountAmount: "",
              vatRate: "",
              vatAmount: "",
              status: receipt.status || "Active",
              _id: receipt._id, // Store the receipt ID for update/delete
            });
            
            // Map items to rough sheet
            if (receipt.items && receipt.items.length > 0) {
              const items = receipt.items.map(item => {
                // Determine measure based on unit
                const measure = item.unit === 'Bulk' ? 'Bulk' : 'Pieces';
                return {
                  itemCode: item.productCode,
                  description: item.productName,
                  measure: measure,
                  bulk: measure === 'Bulk' ? item.quantity : 0,
                  bulkPrice: item.unitPrice,
                  pieces: measure === 'Pieces' ? item.quantity : 0,
                  unitPrice: item.unitPrice,
                  extended: item.extendedAmount || (item.quantity * item.unitPrice)
                };
              });
              setRoughSheet(items);
              
              // Calculate totals
              const total = items.reduce((sum, item) => sum + item.extended, 0);
              setTotals({
                totalAmount: total,
                discountAmount: 0,
                vatAmount: 0,
                netPay: total,
              });
            } else {
              setRoughSheet([]);
              setTotals({
                totalAmount: 0,
                discountAmount: 0,
                vatAmount: 0,
                netPay: 0,
              });
            }
            
            // Stock balance is now auto-calculated from rough sheet items
            // No need to load manual stock balance anymore
          }
        } catch (error) {
          console.error('Error loading SRV record:', error);
          setError('Failed to load SRV record');
        }
      } else {
        setHeaderData(prev => ({ ...prev, [field]: value }));
      }
    } else if (field === 'itemCode') {
      // When item code is selected, fetch full product details
      try {
        const selectedProduct = products.find(p => p._id === value.id || p.code === value.code);
        if (selectedProduct) {
          // Default to Pieces mode when selecting a product
          const unitCost = parseFloat(selectedProduct.purchasePrice) || 0;
          const quantity = 1; // Default to 1 piece
          const amount = quantity * unitCost;

          setDetailsData(prev => ({
            ...prev,
            itemCode: selectedProduct.code,
            measure: 'Pieces', // Default to Pieces
            unitCost: unitCost.toString(),
            quantity: quantity.toString(),
            bulk: '', // Empty for Pieces mode
            bulkPrice: '', // Empty for Pieces mode
            amount: amount.toString()
          }));
        } else {
          // If product not found, just set the itemCode
          setDetailsData(prev => ({ ...prev, itemCode: value.code || value }));
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details');
      }
    } else if (field === 'measure') {
      // Handle measure change (Pieces/Bulk)
      if (value === 'Pieces') {
        // Switching to Pieces mode
        const unitCost = parseFloat(detailsData.unitCost) || 0;
        setDetailsData(prev => ({
          ...prev,
          measure: value,
          quantity: '1',
          bulk: '',
          bulkPrice: '',
          amount: (1 * unitCost).toString()
        }));
      } else if (value === 'Bulk') {
        // Switching to Bulk mode
        const unitCost = parseFloat(detailsData.unitCost) || 0;
        setDetailsData(prev => ({
          ...prev,
          measure: value,
          quantity: '',
          bulk: '1',
          bulkPrice: unitCost.toString(),
          amount: (1 * unitCost).toString()
        }));
      }
    }
    closeModal();
  }, [closeModal, headerData, detailsData, products, stockReceiptService]);

  const handleAddItem = useCallback(() => {
    // Validate required fields based on measure
    if (!detailsData.itemCode || !detailsData.unitCost) {
      setError('Please fill in Item Code and Unit Cost before adding.');
      return;
    }

    if (detailsData.measure === 'Pieces' && !detailsData.quantity) {
      setError('Please enter quantity for pieces.');
      return;
    }

    if (detailsData.measure === 'Bulk' && !detailsData.bulk) {
      setError('Please enter bulk quantity.');
      return;
    }

    // Find the selected product to get accurate description
    const selectedProduct = products.find(p => p.code === detailsData.itemCode);

    if (!selectedProduct) {
      setError('Product not found. Please select a valid item code.');
      return;
    }

    const extendedAmount = parseFloat(detailsData.amount) || 0;

    // Determine quantity based on measure
    let quantity = 0;
    let bulkQty = 0;
    if (detailsData.measure === 'Pieces') {
      quantity = parseFloat(detailsData.quantity) || 0;
      bulkQty = 0; // Empty for pieces
    } else {
      quantity = 0; // Empty for bulk
      bulkQty = parseFloat(detailsData.bulk) || 0;
    }

    const newItem = {
      itemCode: detailsData.itemCode,
      description: selectedProduct.name || selectedProduct.description || detailsData.itemCode,
      measure: detailsData.measure || 'Pieces',
      bulk: bulkQty,
      bulkPrice: parseFloat(detailsData.bulkPrice) || 0,
      pieces: quantity,
      unitPrice: parseFloat(detailsData.unitCost) || 0,
      extended: extendedAmount,
      // Store original product ID for updating price later
      productId: selectedProduct._id,
      originalPurchasePrice: selectedProduct.purchasePrice,
      newPurchasePrice: parseFloat(detailsData.unitCost) || 0,
    };

    setRoughSheet(prev => [...prev, newItem]);

    // Reset details
    setDetailsData({
      itemCode: "",
      measure: "Pieces",
      unitCost: "",
      quantity: "",
      bulk: "",
      bulkPrice: "",
      amount: "",
    });

    // Update totals
    setTotals(prev => ({
      ...prev,
      totalAmount: prev.totalAmount + extendedAmount,
      netPay: prev.totalAmount + extendedAmount - prev.discountAmount + prev.vatAmount,
    }));

    // Clear any previous error
    setError(null);
  }, [detailsData, products]);

  const generateSrvNo = useCallback(async () => {
    try {
      const result = await stockReceiptService.getNextSrvNo();
      if (result.success) {
        return result.data.srvNo;
      }
    } catch (error) {
      console.error('Error generating SRV number:', error);
    }
    
    // Fallback to local generation
    const year = new Date().getFullYear();
    const baseNumber = `${year}00001`;
    return baseNumber;
  }, []);

  const handleAdd = useCallback(async () => {
    const srvNo = await generateSrvNo();
    const today = new Date().toISOString().split('T')[0];
    
    setHeaderData({
      store: "",
      srvNo: srvNo,
      srvDate: today,
      purchaseBy: "cash",
      supplierName: "",
      invoiceNo: "",
      invoiceDate: "",
      discountRate: "",
      discountAmount: "",
      vatRate: "",
      vatAmount: "",
      status: "draft",
      _id: null, // Clear any existing ID for new record
    });
    setDetailsData({
      itemCode: "",
      measure: "Pieces",
      unitCost: "",
      quantity: "",
      bulk: "",
      bulkPrice: "",
      amount: "",
    });
    setRoughSheet([]);
    setTotals({
      totalAmount: 0,
      discountAmount: 0,
      vatAmount: 0,
      netPay: 0,
    });
    setError(null);
    setSuccess(null);
  }, [generateSrvNo]);

  const handleUpdate = useCallback(async () => {
    if (!headerData._id) {
      setError('Please select an existing SRV record to update');
      return;
    }

    try {
      setLoading(true);

      // Validate required fields
      if (!headerData.store || !headerData.srvNo || !headerData.srvDate) {
        setError('Please fill in Store, SRV No, and SRV Date');
        return;
      }

      if (roughSheet.length === 0) {
        setError('Please add at least one item to the receipt');
        return;
      }

      // Prepare items data for API
      const items = roughSheet.map(item => ({
        product: products.find(p => p.code === item.itemCode)?._id,
        productCode: item.itemCode,
        productName: item.description,
        quantity: item.measure === 'Pieces' ? item.pieces : item.bulk,
        unit: item.measure,
        unitPrice: item.unitPrice,
        extendedAmount: item.extended
      }));

      // Prepare receipt data
      const receiptData = {
        society: user?.society?._id || user?.society,
        supplier: suppliers.find(s => s.name === headerData.supplierName)?._id,
        supplierCode: suppliers.find(s => s.name === headerData.supplierName)?.code,
        supplierName: headerData.supplierName,
        receiptNumber: headerData.srvNo,
        receiptDate: headerData.srvDate,
        invoiceNumber: headerData.invoiceNo,
        invoiceDate: headerData.invoiceDate,
        items: items,
        totalAmount: totals.totalAmount,
        totalQuantity: roughSheet.reduce((sum, item) => sum + (item.measure === 'Pieces' ? item.pieces : item.bulk), 0),
        status: headerData.status || 'draft',
        remarks: `Updated via Stock Receipt Voucher - ${new Date().toISOString()}`,
        stockBalance: roughSheet.reduce((sum, item) => sum + (item.measure === 'Pieces' ? item.pieces : item.bulk), 0)
      };

      // Call API to update stock receipt
      const result = await stockReceiptService.updateStockReceipt(headerData._id, receiptData);

      if (result.success) {
        setSuccess('Stock Receipt Voucher updated successfully!');
        setError(null);
        
        // Update product prices if they have changed
        for (const item of roughSheet) {
          if (item.productId && item.originalPurchasePrice !== item.newPurchasePrice) {
            try {
              await stockReceiptService.updateProductPrice(item.productId, item.newPurchasePrice);
              console.log(`Updated product ${item.itemCode} price: ${item.originalPurchasePrice} -> ${item.newPurchasePrice}`);
            } catch (priceError) {
              console.error(`Failed to update product ${item.itemCode} price:`, priceError);
            }
          }
        }
        
        // Reload stock balance from server
        const updateSocietyId = user?.society?._id || user?.society;
        if (updateSocietyId) {
          const balanceResult = await stockReceiptService.getTotalStockBalance(updateSocietyId);
          if (balanceResult.success) {
            setStockBalance(balanceResult.data.totalQuantity || 0);
          }
        }
        
        // Refresh receipts list
        const receiptsRes = await stockReceiptService.getStockReceipts({ society: updateSocietyId, limit: 1000 });
        if (receiptsRes.success) {
          setReceipts(receiptsRes.data);
        }
      } else {
        setError(result.message || 'Failed to update Stock Receipt Voucher');
      }
    } catch (error) {
      console.error('Error updating stock receipt:', error);
      setError(error.response?.data?.message || 'Failed to update Stock Receipt Voucher');
    } finally {
      setLoading(false);
    }
  }, [headerData, roughSheet, totals, products, suppliers, user]);

  const handleDelete = useCallback(async () => {
    if (!headerData._id) {
      setError('Please select an existing SRV record to delete');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this Stock Receipt Voucher?');
    if (!confirmDelete) return;

    try {
      setLoading(true);

      // Call API to delete stock receipt
      const result = await stockReceiptService.deleteStockReceipt(headerData._id);

      if (result.success) {
        setSuccess('Stock Receipt Voucher deleted successfully!');
        setError(null);
        
        // Reload stock balance from server
        const deleteSocietyId = user?.society?._id || user?.society;
        if (deleteSocietyId) {
          const balanceResult = await stockReceiptService.getTotalStockBalance(deleteSocietyId);
          if (balanceResult.success) {
            setStockBalance(balanceResult.data.totalQuantity || 0);
          }
        }
        
        // Reset form
        setHeaderData({
          store: "",
          srvNo: "",
          srvDate: "",
          purchaseBy: "cash",
          supplierName: "",
          invoiceNo: "",
          invoiceDate: "",
          discountRate: "",
          discountAmount: "",
          vatRate: "",
          vatAmount: "",
          status: "Active",
          _id: null,
        });
        setRoughSheet([]);
        setTotals({
          totalAmount: 0,
          discountAmount: 0,
          vatAmount: 0,
          netPay: 0,
        });
        
        // Refresh receipts list
        const receiptsRes = await stockReceiptService.getStockReceipts({ society: deleteSocietyId, limit: 1000 });
        if (receiptsRes.success) {
          setReceipts(receiptsRes.data);
        }
      } else {
        setError(result.message || 'Failed to delete Stock Receipt Voucher');
      }
    } catch (error) {
      console.error('Error deleting stock receipt:', error);
      setError(error.response?.data?.message || 'Failed to delete Stock Receipt Voucher');
    } finally {
      setLoading(false);
    }
  }, [headerData, user]);

  const handlePrint = useCallback(() => {
    setShowReport(true);
  }, []);

  const handleClose = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate required fields
      if (!headerData.store || !headerData.srvNo || !headerData.srvDate) {
        setError('Please fill in Store, SRV No, and SRV Date');
        return;
      }

      if (roughSheet.length === 0) {
        setError('Please add at least one item to the receipt');
        return;
      }

      // Prepare items data for API
      const items = roughSheet.map(item => ({
        product: products.find(p => p.code === item.itemCode)?._id,
        productCode: item.itemCode,
        productName: item.description,
        quantity: item.measure === 'Pieces' ? item.pieces : item.bulk,
        unit: item.measure,
        unitPrice: item.unitPrice,
        extendedAmount: item.extended
      }));

      // Prepare receipt data
      const selectedSupplier = suppliers.find(s => s.name === headerData.supplierName);
      const receiptData = {
        society: user?.society?._id || user?.society,
        supplier: selectedSupplier?._id || null,
        supplierCode: selectedSupplier?.code || '',
        supplierName: headerData.supplierName || '',
        receiptNumber: headerData.srvNo,
        receiptDate: headerData.srvDate,
        invoiceNumber: headerData.invoiceNo,
        invoiceDate: headerData.invoiceDate,
        items: items,
        totalAmount: totals.totalAmount,
        totalQuantity: roughSheet.reduce((sum, item) => sum + (item.measure === 'Pieces' ? item.pieces : item.bulk), 0),
        status: headerData.status || 'draft',
        remarks: `Created via Stock Receipt Voucher - ${new Date().toISOString()}`,
        stockBalance: roughSheet.reduce((sum, item) => sum + (item.measure === 'Pieces' ? item.pieces : item.bulk), 0)
      };

      // Call API to create stock receipt
      const result = await stockReceiptService.createStockReceipt(receiptData);

      if (result.success) {
        setSuccess('Stock Receipt Voucher saved successfully!');
        setError(null);

        // Update product prices if they have changed
        for (const item of roughSheet) {
          if (item.productId && item.originalPurchasePrice !== item.newPurchasePrice) {
            try {
              await stockReceiptService.updateProductPrice(item.productId, item.newPurchasePrice);
              console.log(`Updated product ${item.itemCode} price: ${item.originalPurchasePrice} -> ${item.newPurchasePrice}`);
            } catch (priceError) {
              console.error(`Failed to update product ${item.itemCode} price:`, priceError);
            }
          }
        }

        // Reload stock balance from server
        const receiptSocietyId = user?.society?._id || user?.society;
        if (receiptSocietyId) {
          const balanceResult = await stockReceiptService.getTotalStockBalance(receiptSocietyId);
          if (balanceResult.success) {
            setStockBalance(balanceResult.data.totalQuantity || 0);
          }
        }

        // Reset form after successful save
        setHeaderData({
          store: "",
          srvNo: "",
          srvDate: "",
          purchaseBy: "cash",
          supplierName: "",
          invoiceNo: "",
          invoiceDate: "",
          discountRate: "",
          discountAmount: "",
          vatRate: "",
          vatAmount: "",
          status: "draft",
        });
        setDetailsData({
          itemCode: "",
          measure: "Pieces",
          unitCost: "",
          quantity: "",
          bulk: "",
          bulkPrice: "",
          amount: "",
        });
        setRoughSheet([]);
        setTotals({
          totalAmount: 0,
          discountAmount: 0,
          vatAmount: 0,
          netPay: 0,
        });
        
        // Refresh receipts list to show new SRV in lookup
        const receiptsRes = await stockReceiptService.getStockReceipts({ society: receiptSocietyId, limit: 1000 });
        if (receiptsRes.success) {
          setReceipts(receiptsRes.data);
        }
      } else {
        setError(result.message || 'Failed to save Stock Receipt Voucher');
      }
    } catch (error) {
      console.error('Error saving stock receipt:', error);
      setError(error.response?.data?.message || 'Failed to save Stock Receipt Voucher');
    } finally {
      setLoading(false);
    }
  }, [headerData, roughSheet, totals, products, suppliers, user]);

  const handleCancel = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const LookupInput = ({ name, value, onChange, dropdownType, placeholder, required = false }) => (
    <div className="input-with-icon">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={() => openModal(dropdownType)}
        className="key-btn"
        title={`Lookup ${placeholder}`}
      >
        <Key size={16} />
      </button>
    </div>
  );

  return (
    <>
      <div className="srv-page">
        <div className="srv-header">
          <h2>📦 Stock Receipt Voucher</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Back
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="loading-indicator">
            <Loader className="animate-spin" size={24} />
            <span>Loading...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)}>✖</button>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="success-message">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)}>✖</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={handleAdd}>➕ Add</button>
          <button className="primary" onClick={handleUpdate}>
            💾 Update
          </button>
          <button onClick={handleDelete}>🗑 Delete</button>
          <button onClick={handlePrint}>🖨 Print</button>
        </div>

        {/* HEADER PLANE */}
        <div className="srv-card">
          <h3>HEADER PLANE</h3>
          <div className="form-grid">
            {/* Store */}
            <div className="form-group">
              <label>Store:</label>
              <select
                name="store"
                value={headerData.store}
                onChange={handleHeaderChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Store</option>
                {stores.map(store => (
                  <option key={store._id} value={store._id}>{store.name} ({store.storeCode})</option>
                ))}
              </select>
            </div>

            {/* SRV No */}
            <div className="form-group">
              <label>SRV No:</label>
              <LookupInput
                name="srvNo"
                value={headerData.srvNo}
                onChange={handleHeaderChange}
                dropdownType="srvNos"
                placeholder="Enter SRV No"
                required
              />
            </div>

            {/* SRV Date */}
            <div className="form-group">
              <label>SRV Date:</label>
              <input
                type="date"
                name="srvDate"
                value={headerData.srvDate}
                onChange={handleHeaderChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Purchase By */}
            <div className="form-group">
              <label>Purchase By:</label>
              <select
                name="purchaseBy"
                value={headerData.purchaseBy}
                onChange={handleHeaderChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>

            {/* Supplier Name */}
            <div className="form-group">
              <label>Supplier Name:</label>
              <LookupInput
                name="supplierName"
                value={headerData.supplierName}
                onChange={handleHeaderChange}
                dropdownType="suppliers"
                placeholder="Enter supplier name"
              />
            </div>

            {/* Invoice No */}
            <div className="form-group">
              <label>Invoice No:</label>
              <input
                type="text"
                name="invoiceNo"
                value={headerData.invoiceNo}
                onChange={handleHeaderChange}
                placeholder="Enter invoice no"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Invoice Date */}
            <div className="form-group">
              <label>Invoice Date:</label>
              <input
                type="date"
                name="invoiceDate"
                value={headerData.invoiceDate}
                onChange={handleHeaderChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount Rate */}
            <div className="form-group">
              <label>Discount Rate (%):</label>
              <input
                type="number"
                name="discountRate"
                value={headerData.discountRate}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount Amount */}
            <div className="form-group">
              <label>Discount Amount:</label>
              <input
                type="number"
                name="discountAmount"
                value={headerData.discountAmount}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* VAT Rate */}
            <div className="form-group">
              <label>VAT Rate (%):</label>
              <input
                type="number"
                name="vatRate"
                value={headerData.vatRate}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* VAT Amount */}
            <div className="form-group">
              <label>VAT Amount:</label>
              <input
                type="number"
                name="vatAmount"
                value={headerData.vatAmount}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={headerData.status}
                onChange={handleHeaderChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* DETAILS PLANE */}
        <div className="srv-card">
          <h3>DETAILS PLANE</h3>
          <div className="details-grid">
            {/* Item Code */}
            <div className="form-group">
              <label>Item Code:</label>
              <LookupInput
                name="itemCode"
                value={detailsData.itemCode}
                onChange={handleDetailsChange}
                dropdownType="itemCodes"
                placeholder="Enter item code"
              />
            </div>

            {/* Measure */}
            <div className="form-group">
              <label>Measure:</label>
              <select
                name="measure"
                value={detailsData.measure}
                onChange={handleDetailsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pieces">Pieces</option>
                <option value="Bulk">Bulk</option>
              </select>
            </div>

            {/* Unit Cost */}
            <div className="form-group">
              <label>Unit Cost:</label>
              <input
                type="number"
                name="unitCost"
                value={detailsData.unitCost}
                onChange={handleDetailsChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quantity (for Pieces) or Bulk (for Bulk) */}
            {detailsData.measure === 'Pieces' ? (
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  value={detailsData.quantity}
                  onChange={handleDetailsChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Bulk Qty:</label>
                <input
                  type="number"
                  name="bulk"
                  value={detailsData.bulk}
                  onChange={handleDetailsChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Bulk Price (only show in Bulk mode) */}
            {detailsData.measure === 'Bulk' && (
              <div className="form-group">
                <label>Bulk Price:</label>
                <input
                  type="number"
                  name="bulkPrice"
                  value={detailsData.bulkPrice}
                  onChange={handleDetailsChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Amount */}
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={detailsData.amount}
                onChange={handleDetailsChange}
                placeholder="0.00"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              />
            </div>
          </div>

          <div className="details-buttons">
            <button type="button" onClick={handleAddItem} className="primary">
              OK
            </button>
            <button type="button" className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>

        {/* ROUGH SHEET */}
        <div className="rough-sheet">
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Measure</th>
                <th>Bulk</th>
                <th>Bulk Price</th>
                <th>Pieces</th>
                <th>Unit Price</th>
                <th>Extended</th>
              </tr>
            </thead>
            <tbody>
              {roughSheet.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => handleRoughSheetClick(item, index)}
                  style={{ cursor: "pointer" }}
                  className="hover:bg-gray-50"
                >
                  <td>{item.itemCode}</td>
                  <td>{item.description}</td>
                  <td>{item.measure}</td>
                  <td>{item.bulk}</td>
                  <td>{item.bulkPrice}</td>
                  <td>{item.pieces}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.extended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS AND STOCK BALANCE */}
        <div className="totals-section">
          <div className="totals-left">
            <div className="totals-grid">
              <div className="form-group">
                <label>Total Amount:</label>
                <input
                  type="number"
                  value={totals.totalAmount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="form-group">
                <label>Discount Amount:</label>
                <input
                  type="number"
                  name="discountAmount"
                  value={totals.discountAmount}
                  onChange={handleTotalsChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="form-group">
                <label>VAT Amount:</label>
                <input
                  type="number"
                  name="vatAmount"
                  value={totals.vatAmount}
                  onChange={handleTotalsChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="form-group">
                <label>Net Pay:</label>
                <input
                  type="number"
                  value={totals.netPay}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="totals-right">
            <div className="form-group">
              <label>Stock Balance :</label>
              <input
                type="number"
                value={roughSheet.reduce((sum, item) => sum + (item.measure === 'Pieces' ? item.pieces : item.bulk), 0)}
                readOnly
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="footer-buttons">
          <button type="button" className="primary" onClick={handleSubmit}>
            <Save size={16} className="inline mr-2" />
            Save
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            <RotateCcw size={16} className="inline mr-2" />
            Cancel
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 1060,
          }}
        >
          <div
            className="card shadow-lg border-0"
            style={{
              width: "90%",
              maxWidth: 600,
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-4">
              <h5 className="mb-0 fw-semibold">
                🔑 Select {modal.type === 'stores' ? 'Store' : modal.type === 'srvNos' ? 'SRV No' : modal.type === 'suppliers' ? 'Supplier' : 'Item Code'}
              </h5>
              <button
                className="btn btn-sm btn-light fw-semibold"
                onClick={closeModal}
              >
                ✖ Close
              </button>
            </div>

            {/* Body */}
            <div className="card-body p-4">
              {/* Search bar */}
              <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm flex-grow-1"
                  placeholder="Search..."
                  value=""
                  onChange={() => {}}
                />
                <span className="text-muted small">{modal.data.length} result(s)</span>
              </div>

              {/* Table */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light position-sticky top-0">
                    <tr>
                      <th>Code/Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.data.length ? (
                      modal.data.map((item, i) => (
                        <tr
                          key={i}
                          onClick={() => selectFromModal(
                            modal.type === 'stores' ? 'store' :
                            modal.type === 'srvNos' ? 'srvNo' :
                            modal.type === 'suppliers' ? 'supplierName' : 'itemCode',
                            item
                          )}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{item.code ? `${item.code} - ${item.name}` : item.name || item}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-center text-muted py-4">
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer bg-light text-center text-muted small py-2">
              💡 Tip: Click a row to autofill the form.
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="report-overlay">
          <div className="report-modal">
            <div className="report-header">
              <h3>📋 SRV Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Stock Receipt Voucher Details</strong><br />
                  <br />
                  <strong>Store:</strong> {headerData.store || "Not set"}<br />
                  <strong>SRV No:</strong> {headerData.srvNo || "Not set"}<br />
                  <strong>SRV Date:</strong> {headerData.srvDate || "Not set"}<br />
                  <strong>Purchase By:</strong> {headerData.purchaseBy || "Not set"}<br />
                  <strong>Supplier Name:</strong> {headerData.supplierName || "Not set"}<br />
                  <strong>Invoice No:</strong> {headerData.invoiceNo || "Not set"}<br />
                  <strong>Invoice Date:</strong> {headerData.invoiceDate || "Not set"}<br />
                  <strong>Discount Rate:</strong> {headerData.discountRate || "0"}%<br />
                  <strong>Discount Amount:</strong> {headerData.discountAmount || "0"}<br />
                  <strong>VAT Rate:</strong> {headerData.vatRate || "0"}%<br />
                  <strong>VAT Amount:</strong> {headerData.vatAmount || "0"}<br />
                  <strong>Status:</strong> {headerData.status || "Not set"}<br />
                  <strong>Total Amount:</strong> {totals.totalAmount}<br />
                  <strong>Net Pay:</strong> {totals.netPay}<br />
                </div>
              </div>
            </div>
            <div className="report-footer">
              <button onClick={() => window.print()}>🖨 Print Report</button>
              <button onClick={() => setShowReport(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StockReceiptVoucher;
