# StockSales Fix Plan - Align with StockReceipt Logic

## Model Fixes (StockSales.js)
- [x] Add society field for multi-tenant support
- [x] Add financialPeriod reference
- [x] Restructure items schema to match StockReceipt (product, productCode, productName, quantity, unit, unitPrice, extendedAmount, batchNumber, expiryDate, remarks)
- [x] Update status enum to match StockReceipt (draft, pending, approved, rejected)
- [x] Add approval workflow fields (approvedBy, approvedAt, rejectedBy, rejectedAt, rejectionReason)
- [x] Add totalAmount and totalQuantity fields
- [x] Add pre-save middleware for total calculations
- [x] Add indexes for performance
- [x] Add stock balance update methods (updateStockBalances, reverseStockBalances)
- [x] Add SIV number generation static method

## Controller Fixes (stockSalesController_new.js)
- [x] Update getStockSales with filtering, pagination, and proper population
- [x] Add approveStockSale function
- [x] Add rejectStockSale function
- [x] Update postStockSale to use approval logic and stock balance updates
- [x] Add proper validation in create/update functions
- [x] Add getStockSalesSummary function
- [x] Update createStockSale to auto-generate SIV numbers
- [x] Add financial period validation

## Route Updates (stockSales.js)
- [x] Add approval/rejection routes
- [x] Add summary route
- [x] Update to use stockSalesController_new

## Service Updates (StockSalesService.js)
- [ ] Update API calls to match new endpoints
- [ ] Add approval/rejection service methods

## Testing
- [ ] Test all CRUD operations
- [ ] Test approval workflow
- [ ] Test stock balance updates
- [ ] Test SIV number generation
