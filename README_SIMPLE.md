# Routers App - Code Structure Guide

## Two Main Parts

### 1. Frontend (React)
**What users see and interact with**

```
frontend/src/
├── pages/           # Screen components
│   ├── StockPage/  # Stock-related screens
│   │   └── sections/
│   │       ├── StockReceiptVoucher.jsx   # SRV Entry
│   │       ├── StockSales.jsx            # Sales Entry
│   │       └── ProductInformation.jsx    # Products
│   ├── CommonPage/ # Settings screens
│   └── Login.jsx  # Login page
│
├── services/        # API calls
│   ├── StockReceiptService.js
│   └── StockSalesService.js
│
├── contexts/       # Global state
│   └── AuthContext.jsx   # User login state
│
└── styles/         # CSS files
```

### 2. Backend (Node.js)
**Server that processes data**

```
backend/
├── controllers/    # Business logic
│   ├── stockReceiptController.js
│   └── stockSalesController.js
│
├── models/        # Database structure
│   ├── StockReceipt.js
│   └── Product.js
│
└── routes/        # API endpoints
    └── common_new.js
```

---

## How It Works

### Example: Saving a Stock Receipt

1. **User** fills form in `StockReceiptVoucher.jsx`
2. **Service** calls API via `StockReceiptService.js`
3. **Route** receives request → `/api/common/stock-receipts`
4. **Controller** processes data → `stockReceiptController.js`
5. **Model** saves to MongoDB → `StockReceipt.js`

---

## Key Files

| File | Purpose |
|------|---------|
| `StockReceiptVoucher.jsx` | SRV entry form |
| `StockSales.jsx` | Sales entry form |
| `stockReceiptController.js` | SRV business logic |
| `StockReceipt.js` | SRV database schema |

---

## Running the App

### Backend
```bash
cd backend
npm start
# Runs on port 8000
```

### Frontend
```bash
cd frontend
npm run dev
# Runs on port 3000
```

---

## Quick Tips

- **Components** in `pages/` = UI screens
- **Services** in `services/` = API calls
- **Controllers** in `controllers/` = Business logic
- **Models** in `models/` = Database schemas
- **Routes** in `routes/` = API URLs
