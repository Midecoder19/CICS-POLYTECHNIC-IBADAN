# Xprinter POS Setup Guide

This document explains how to configure and use the Xprinter thermal printer with the POS system.

## Supported Printers

The Xprinter utility supports most ESC/POS compatible thermal printers including:
- Xprinter XP-58
- Xprinter XP-80
- Xprinter XP-90
- Xprinter XP-200
- And other ESC/POS compatible printers

## Setup Options

### Option 1: Browser Print (Default - No Setup Required)

The default method uses the browser's print dialog. This works with any printer installed on the computer.

**How it works:**
1. Click "POS" button in Stock Sales
2. A print preview window opens
3. Select your thermal printer from the print dialog
4. Print

**Tips for thermal printers:**
- Set paper size to 58mm or 2.25 inches
- Enable "Print background graphics" if available
- Save as default printer

### Option 2: Network Printer (Advanced)

For network-connected Xprinter thermal printers:

1. **Find Printer IP Address:**
   - Print a self-test page from the printer
   - Or check your router's connected devices

2. **Configure Printer in Code:**

Open `frontend/src/utils/xprinterPOS.js` and modify the print function:

```javascript
// For network printer
xprinterPOS.print(receiptData, {
  useNetwork: true,
  host: '192.168.1.100',  // Your printer's IP address
  port: 9100
});
```

### Option 3: USB Printer with Print Server

If using a USB printer on another computer:

1. Install a print server software (like Print Server Pro)
2. Connect printer to the print server
3. Use the network printer option above

## Printer Settings

### Recommended Browser Print Settings

When printing from the browser:

| Setting | Recommended Value |
|---------|------------------|
| Paper Size | 58mm x Auto |
| Margins | None/Minimum |
| Scale | 100% |
| Print Background | Enabled |
| Graphics | Enabled |

### ESC/POS Commands (For Network Print)

The utility generates standard ESC/POS commands:

| Command | Hex Code | Description |
|---------|----------|-------------|
| Initialize | 1B 40 | Reset printer |
| Bold | 1B 45 01 | Bold text ON |
| Bold Off | 1B 45 00 | Bold text OFF |
| Center | 1B 61 01 | Center align |
| Left | 1B 61 00 | Left align |
| Right | 1B 61 02 | Right align |
| Cut | 1D 56 01 | Partial cut |
| Open Drawer | 1B 70 00 19 FA 05 | Open cash drawer |

## Troubleshooting

### Printer Not Printing

1. **Check printer is online**
2. **Verify printer is set as default**
3. **Check paper is loaded**
4. **Try browser print first** to verify printer works

### Receipt Too Wide

- Set paper width to 58mm in printer settings
- Or adjust CSS in xprinterPOS.js

### Text Cut Off

- Reduce font size in xprinterPOS.js
- Or use smaller text in receipt data

### Network Printer Not Connecting

1. Verify printer IP is correct
2. Check firewall allows port 9100
3. Ensure printer and computer are on same network
4. Ping printer IP to verify connection

## Customization

### Adding Company Info

Modify the receipt data in StockSales.jsx:

```javascript
const receiptData = {
  companyName: 'Your Company Name',
  companyAddress: '123 Main Street',
  companyPhone: '+234 800 123 4567',
  // ... other fields
};
```

### Adding Logo

To add a logo to receipts, convert your logo to BMP format and add to the ESC/POS commands. This requires advanced configuration.

## Testing

### Print Test Page

1. Go to Stock Sales
2. Add items to cart
3. Click POS button
4. Print preview will open
5. Select your printer and print

### Network Test

To test network connectivity:

```bash
# Ping printer
ping 192.168.1.100

# Test port
telnet 192.168.1.100 9100
```
