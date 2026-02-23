# Common & Stock Module Fix Plan

## Common Module Fixes

### 1. Default Parameters Backend
- [ ] Create DefaultParameter model
- [ ] Create defaultParameterController
- [ ] Add routes for default parameters in common.js
- [ ] Fix DefaultParameter.jsx to use correct API endpoints

### 2. Financial Period Backend Integration
- [ ] Update FinancialPeriod.jsx to fetch from backend
- [ ] Ensure financial periods are saved to database
- [ ] Add proper backend validation

### 3. Store Information API Consistency
- [ ] Fix StoreInformation controller response format
- [ ] Ensure consistent data structure across all services

### 4. Product Controller Stock Balance Fixes
- [ ] Fix stock balance creation logic
- [ ] Ensure data consistency between products and stock balances

## Stock Module Fixes

### 1. Stock Sales Model & Controller
- [ ] Fix StockSales model store field (string vs ObjectId)
- [ ] Update stockSalesController_new.js to handle store correctly
- [ ] Implement proper stock balance updates on approval
- [ ] Add stock availability validation before approval

### 2. Stock Sales Service Fixes
- [ ] Fix StockSalesService response handling
- [ ] Ensure consistent API calls and error handling
- [ ] Update frontend to match backend expectations

### 3. Stock Balance Model
- [ ] Fix deprecated mongoose.Types.ObjectId usage
- [ ] Update aggregation methods

### 4. Product Information Frontend
- [ ] Fix ProductService methods (getStores, getSuppliers, getUnits)
- [ ] Ensure proper data loading and error handling

### 5. Stock Sales Approval Workflow
- [ ] Implement stock reduction only on approval
- [ ] Add proper validation for stock availability
- [ ] Ensure rejected sales don't affect stock

### 6. Printable Receipt
- [ ] Add basic printable receipt layout for Stock Sales
- [ ] Implement browser-based printing
- [ ] Ensure receipt is only printable after approval

## Testing & Validation
- [ ] Test all Common module pages
- [ ] Test full Stock module flow
- [ ] Verify offline functionality
- [ ] Confirm data integrity preservation
