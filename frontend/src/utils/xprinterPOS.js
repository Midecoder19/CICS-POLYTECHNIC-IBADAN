/**
 * Xprinter POS Print Utility
 * Supports Xprinter thermal printers via network or USB
 * Uses ESC/POS commands compatible with Xprinter XP-58, XP-80, XP-90, etc.
 */

// ESC/POS command constants using String.fromCharCode for compatibility
const ESC = String.fromCharCode(0x1B);
const GS = String.fromCharCode(0x1D);
const FS = String.fromCharCode(0x1C);
const DLE = String.fromCharCode(0x10);
const DC1 = String.fromCharCode(0x11);
const DC2 = String.fromCharCode(0x12);
const DC3 = String.fromCharCode(0x13);
const DC4 = String.fromCharCode(0x14);

class XprinterPOS {
  constructor() {
    // Default printer settings
    this.printerHost = '';  // For network printers e.g., '192.168.1.100'
    this.printerPort = 9100; // Standard port for network printers
    this.printerType = 'network'; // 'network' or 'usb'
    this.paperWidth = 58; // mm (standard thermal receipt width)
  }

  /**
   * Configure printer connection
   * @param {string} host - Printer IP address (for network) or device path (for USB)
   * @param {number} port - Port number (default 9100 for network)
   * @param {string} type - 'network' or 'usb'
   */
  configure(host, port = 9100, type = 'network') {
    this.printerHost = host;
    this.printerPort = port;
    this.printerType = type;
  }

  /**
   * ESC/POS Commands
   */
  get commands() {
    return {
      // Initialize printer
      INIT: ESC + '@',
      
      // Line spacing
      LINE_SPACING_DEFAULT: ESC + '2',
      LINE_SPACING_1_6: ESC + '3' + String.fromCharCode(0),
      
      // Text alignment
      ALIGN_LEFT: ESC + 'a' + String.fromCharCode(0),
      ALIGN_CENTER: ESC + 'a' + String.fromCharCode(1),
      ALIGN_RIGHT: ESC + 'a' + String.fromCharCode(2),
      
      // Font settings
      FONT_NORMAL: ESC + 'E' + String.fromCharCode(0),
      FONT_BOLD: ESC + 'E' + String.fromCharCode(1),
      FONT_UNDERLINE: ESC + '-' + String.fromCharCode(0),
      FONT_UNDERLINE_1: ESC + '-' + String.fromCharCode(1),
      FONT_UNDERLINE_2: ESC + '-' + String.fromCharCode(2),
      FONT_DOUBLE_HEIGHT: ESC + '!' + String.fromCharCode(0x10),
      FONT_DOUBLE_WIDTH: ESC + '!' + String.fromCharCode(0x20),
      FONT_BOLD_DOUBLE: ESC + '!' + String.fromCharCode(0x30),
      
      // Character size
      CHAR_SIZE_1: GS + '!' + String.fromCharCode(0),
      CHAR_SIZE_2: GS + '!' + String.fromCharCode(0x11),
      CHAR_SIZE_3: GS + '!' + String.fromCharCode(0x22),
      
      // Cut paper
      CUT_FULL: GS + 'V' + String.fromCharCode(0),
      CUT_PARTIAL: GS + 'V' + String.fromCharCode(1),
      
      // Open cash drawer
      OPEN_DRAWER: ESC + 'p' + String.fromCharCode(0) + String.fromCharCode(0x19) + String.fromCharCode(0xFA) + String.fromCharCode(0x05),
      
      // Feed
      FEED_LINES: (n) => ESC + 'd' + String.fromCharCode(n),
      FEED_LINE: ESC + 'd' + String.fromCharCode(3),
      
      // QR Code
      QR_CODE_MODEL: GS + '(k' + String.fromCharCode(4) + String.fromCharCode(0) + '1A' + String.fromCharCode(2) + String.fromCharCode(0),
      QR_CODE_SIZE: GS + '(k' + String.fromCharCode(3) + String.fromCharCode(0) + '1C' + String.fromCharCode(6),
      QR_CODE_ERROR: GS + '(k' + String.fromCharCode(3) + String.fromCharCode(0) + '1E' + String.fromCharCode(0),
      QR_CODE_DATA: (data) => {
        const len = data.length + 3;
        return GS + '(k' + String.fromCharCode(len) + String.fromCharCode(0) + '1P0' + data;
      },
      QR_CODE_PRINT: GS + '(k' + String.fromCharCode(3) + String.fromCharCode(0) + '1Q0',
      
      // Barcode
      BARCODE_TYPE: GS + 'k' + String.fromCharCode(2), // CODE39
      BARCODE_HEIGHT: GS + 'h' + String.fromCharCode(50),
      BARCODE_WIDTH: GS + 'w' + String.fromCharCode(2),
      BARCODE_DATA: (data) => data + String.fromCharCode(0),
      
      // Status
      STATUS_REQUEST: DLE + String.fromCharCode(4) + String.fromCharCode(1),
    };
  }

  /**
   * Generate ESC/POS commands for receipt
   * @param {Object} receiptData - Receipt information
   * @returns {string} ESC/POS commands
   */
  generateReceiptCommands(receiptData) {
    const { 
      companyName = 'Store Name',
      companyAddress = '',
      companyPhone = '',
      receiptTitle = 'RECEIPT',
      receiptNumber = '',
      date = '',
      cashier = '',
      items = [],
      subtotal = 0,
      discount = 0,
      tax = 0,
      total = 0,
      paymentMethod = '',
      amountPaid = 0,
      change = 0,
      footerMessage = 'Thank you!',
    } = receiptData;

    const cmd = this.commands;
    let output = '';

    // Initialize printer
    output += cmd.INIT;
    
    // Center alignment for header
    output += cmd.ALIGN_CENTER;
    output += cmd.FONT_BOLD_DOUBLE;
    output += companyName + '\n';
    
    output += cmd.FONT_NORMAL;
    if (companyAddress) {
      output += companyAddress + '\n';
    }
    if (companyPhone) {
      output += companyPhone + '\n';
    }
    
    output += cmd.FONT_BOLD;
    output += receiptTitle + '\n';
    output += cmd.FONT_NORMAL;
    output += '-'.repeat(32) + '\n';
    
    // Receipt details
    output += cmd.ALIGN_LEFT;
    output += `No: ${receiptNumber}\n`;
    output += `Date: ${date}\n`;
    if (cashier) {
      output += `Cashier: ${cashier}\n`;
    }
    output += '-'.repeat(32) + '\n';
    
    // Items header
    output += cmd.FONT_BOLD;
    output += 'Item               Qty    Amount\n';
    output += cmd.FONT_NORMAL;
    output += '-'.repeat(32) + '\n';
    
    // Items
    items.forEach(item => {
      const name = (item.productName || item.description || 'Item').substring(0, 16);
      const qty = String(item.quantity).padStart(3);
      const amount = (item.extendedAmount || item.amount || 0).toFixed(2).padStart(8);
      output += `${name} ${qty} ${amount}\n`;
    });
    
    output += '-'.repeat(32) + '\n';
    
    // Totals
    output += cmd.ALIGN_RIGHT;
    output += `Subtotal: ${subtotal.toFixed(2)}\n`;
    if (discount > 0) {
      output += `Discount: -${discount.toFixed(2)}\n`;
    }
    if (tax > 0) {
      output += `Tax: ${tax.toFixed(2)}\n`;
    }
    
    output += cmd.FONT_BOLD_DOUBLE;
    output += `TOTAL: ${total.toFixed(2)}\n`;
    output += cmd.FONT_NORMAL;
    
    // Payment info
    if (paymentMethod) {
      output += '-'.repeat(32) + '\n';
      output += `Payment: ${paymentMethod}\n`;
      output += `Paid: ${amountPaid.toFixed(2)}\n`;
      output += `Change: ${change.toFixed(2)}\n`;
    }
    
    // Footer
    output += cmd.ALIGN_CENTER;
    output += '-'.repeat(32) + '\n';
    output += footerMessage + '\n';
    output += '\n\n';
    
    // Cut paper
    output += cmd.FEED_LINE;
    output += cmd.CUT_PARTIAL;

    return output;
  }

  /**
   * Print receipt via network printer
   * @param {Object} receiptData - Receipt information
   */
  async print(receiptData) {
    // If printer is configured, use network printing
    if (this.printerHost) {
      const commands = this.generateReceiptCommands(receiptData);
      
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(commands);

      try {
        const response = await fetch(`http://${this.printerHost}:${this.printerPort}`, {
          method: 'POST',
          body: data,
          mode: 'no-cors',
        });
        
        // Note: With no-cors, we can't read the response
        // But if no error is thrown, the print job was sent
        console.log('Print job sent to printer');
        return true;
      } catch (error) {
        console.error('Print error:', error);
        throw new Error(`Failed to print: ${error.message}`);
      }
    }
    
    // Fallback to browser print dialog
    return this.printViaBrowserDialog(receiptData);
  }

  /**
   * Print via browser print dialog (fallback)
   * @param {Object} receiptData - Receipt data
   */
  printViaBrowserDialog(receiptData) {
    const { 
      companyName = 'Store Name',
      companyAddress = '',
      companyPhone = '',
      receiptTitle = 'POINT OF SALE',
      receiptNumber = '',
      date = '',
      cashier = '',
      items = [],
      subtotal = 0,
      discount = 0,
      tax = 0,
      total = 0,
      paymentMethod = 'CASH',
      amountPaid = 0,
      change = 0,
      footerMessage = 'Thank you for your business!',
      footerMessage2 = 'Please come again'
    } = receiptData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 58mm; 
            margin: 0 auto; 
            padding: 5px;
            font-size: 12px;
            line-height: 1.2;
          }
          .header { text-align: center; margin-bottom: 10px; }
          .company-name { font-weight: bold; font-size: 14px; }
          .receipt-title { font-weight: bold; font-size: 13px; margin: 5px 0; }
          .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; }
          .item-row { margin-bottom: 3px; }
          .item-name { font-weight: bold; }
          .item-details { font-size: 11px; color: #666; }
          .total-row { font-weight: bold; font-size: 14px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 15px; font-size: 11px; }
          @media print {
            body { width: 58mm !important; }
            @page { size: 58mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          ${companyAddress ? `<div>${companyAddress}</div>` : ''}
          ${companyPhone ? `<div>${companyPhone}</div>` : ''}
          <div class="receipt-title">${receiptTitle}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span>No: ${receiptNumber}</span>
          <span>${date}</span>
        </div>
        ${cashier ? `<div>Cashier: ${cashier}</div>` : ''}
        
        <div class="divider"></div>
        
        <div class="items">
          ${items.map(item => `
            <div class="item-row">
              <div class="item-name">${item.productName || item.name || 'Item'}</div>
              <div class="item-details">
                ${item.quantity} x ${(item.unitPrice || 0).toFixed(2)} = ${(item.extendedAmount || item.amount || 0).toFixed(2)}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="divider"></div>
        
        <div class="row"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
        ${discount > 0 ? `<div class="row"><span>Discount:</span><span>-${discount.toFixed(2)}</span></div>` : ''}
        ${tax > 0 ? `<div class="row"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>` : ''}
        <div class="row total-row"><span>TOTAL:</span><span>${total.toFixed(2)}</span></div>
        
        <div class="divider"></div>
        
        <div class="row"><span>Payment:</span><span>${paymentMethod}</span></div>
        <div class="row"><span>Paid:</span><span>${amountPaid.toFixed(2)}</span></div>
        <div class="row"><span>Change:</span><span>${change.toFixed(2)}</span></div>
        
        <div class="footer">
          <div class="divider"></div>
          <div>${footerMessage}</div>
          ${footerMessage2 ? `<div>${footerMessage2}</div>` : ''}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Please allow popups to print receipts');
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    return true;
  }
}

// Export singleton instance
const xprinterPOS = new XprinterPOS();

export default xprinterPOS;
