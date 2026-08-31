/**
 * Homely Hub Luxury PDF Booking Ticket & Official GST Tax Receipt Generator
 */
export const downloadBookingPDF = (booking) => {
  if (!booking) return;

  const property = booking.property || {};
  const address = property.address || {};
  const printWindow = window.open('', '_blank');

  const receiptId = booking._id ? `HH-${booking._id.slice(-8).toUpperCase()}` : `HH-${Date.now().toString().slice(-8)}`;
  const bookingDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const checkInStr = booking.fromDate ? new Date(booking.fromDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  const checkOutStr = booking.toDate ? new Date(booking.toDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  
  // Itemized GST Tax Financial Calculations
  const totalPrice = booking.price || 0;
  const gstRate = totalPrice >= 7500 ? 18 : 12;
  const baseTariff = Math.round(totalPrice / (1 + gstRate / 100));
  const totalGst = Math.round(totalPrice - baseTariff);
  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = Math.round(totalGst / 2);
  const sgstAmount = totalGst - cgstAmount;

  const propertyImg = property.images && property.images.length > 0 ? property.images[0].url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

  const ticketHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>GST Tax Invoice & Voucher - ${property.propertyName || 'Homely Hub Stay'}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            color: #0f172a;
            background: #f8fafc;
            padding: 30px 15px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .voucher-container {
            max-width: 760px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          .voucher-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 28px 32px;
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 4px solid #ff385c;
          }
          .brand-logo {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
          }
          .voucher-tag {
            background: rgba(255, 56, 92, 0.2);
            color: #ff385c;
            border: 1px solid rgba(255, 56, 92, 0.4);
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 6px;
            display: inline-block;
          }
          .receipt-number {
            text-align: right;
            font-size: 12px;
            color: #94a3b8;
          }
          .receipt-number strong {
            font-size: 16px;
            display: block;
            margin-top: 2px;
            font-weight: 800;
            color: #10b981;
          }
          .voucher-body {
            padding: 32px;
          }
          .property-card {
            display: flex;
            gap: 20px;
            align-items: center;
            background: #f8fafc;
            border-radius: 16px;
            padding: 16px;
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
          }
          .property-img {
            width: 110px;
            height: 90px;
            border-radius: 12px;
            object-fit: cover;
          }
          .property-title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .property-address {
            font-size: 13px;
            color: #64748b;
            line-height: 1.4;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .info-card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 16px;
            background: #ffffff;
          }
          .info-card.green-accent {
            border-left: 4px solid #10b981;
          }
          .info-card.rose-accent {
            border-left: 4px solid #ff385c;
          }
          .info-label {
            font-size: 11px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .info-val {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
          }
          .info-sub {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .payment-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .pricing-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
          }
          .pricing-table th {
            text-align: left;
            font-size: 11px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            padding: 10px 14px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .pricing-table td {
            padding: 12px 14px;
            font-size: 13.5px;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
          }
          .total-row td {
            font-size: 16px;
            font-weight: 900;
            color: #10b981;
            background: #f0fdf4;
            border-bottom: none;
          }
          .verification-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            padding: 20px 24px;
            border-radius: 16px;
            border: 1px dashed #cbd5e1;
            margin-bottom: 24px;
          }
          .status-stamp {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            border: 1px solid #86efac;
            padding: 6px 14px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .qr-box {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .qr-img {
            width: 65px;
            height: 65px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
          }
          .voucher-footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
          .print-btn-bar {
            text-align: center;
            margin-bottom: 24px;
          }
          .print-btn {
            background: linear-gradient(135deg, #ff385c 0%, #e00b41 100%);
            color: #ffffff;
            border: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(255, 56, 92, 0.4);
          }
          @media print {
            body { background: #ffffff; padding: 0; }
            .print-btn-bar { display: none; }
            .voucher-container { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-bar">
          <button onclick="window.print()" class="print-btn">
            🖨️ Print / Save Official GST Tax Invoice & Voucher
          </button>
        </div>

        <div class="voucher-container">
          <div class="voucher-header">
            <div>
              <div class="brand-logo">🏠 Homely Hub Stays</div>
              <span class="voucher-tag">Official GST Tax Receipt & Voucher</span>
            </div>
            <div class="receipt-number">
              Invoice / Receipt No.
              <strong>#${receiptId}</strong>
            </div>
          </div>

          <div class="voucher-body">
            <!-- Property Preview -->
            <div class="property-card">
              <img src="${propertyImg}" alt="Property" class="property-img" />
              <div>
                <h2 class="property-title">${property.propertyName || 'Homely Hub Villa'}</h2>
                <div class="property-address">
                  📍 ${address.area || ''}, ${address.city || ''}, ${address.state || ''} ${address.pincode || ''}
                </div>
              </div>
            </div>

            <!-- Dates & Duration Grid -->
            <div class="grid-2">
              <div class="info-card green-accent">
                <div class="info-label">Check-In Date</div>
                <div class="info-val">${checkInStr}</div>
                <div class="info-sub">Standard Check-in</div>
              </div>
              <div class="info-card rose-accent">
                <div class="info-label">Check-Out Date</div>
                <div class="info-val">${checkOutStr}</div>
                <div class="info-sub">Standard Check-out</div>
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 24px;">
              <div class="info-card">
                <div class="info-label">Stay Duration</div>
                <div class="info-val">${booking.numberOfnights || 1} Night(s) / ${(booking.numberOfnights || 1) + 1} Day(s)</div>
              </div>
              <div class="info-card">
                <div class="info-label">Reserved Guests</div>
                <div class="info-val">${booking.guests || 2} Guest(s)</div>
              </div>
            </div>

            <!-- Itemized GST Pricing Breakdown -->
            <div class="payment-title">
              <span>Official GST Tax Invoice Breakdown</span>
              <span style="font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 3px 10px; border-radius: 6px; font-weight: 800;">GSTIN: 33AAAAH1234F1Z5</span>
            </div>
            <table class="pricing-table">
              <thead>
                <tr>
                  <th>Particulars / Item Description</th>
                  <th style="text-align: center;">GST Rate (%)</th>
                  <th style="text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Base Accommodation Tariff</strong><br/>
                    <span style="font-size: 12px; color: #64748b;">${property.propertyName || 'Stay Room Charges'} (${booking.numberOfnights || 1} Night(s))</span>
                  </td>
                  <td style="text-align: center; font-weight: 600;">0.00%</td>
                  <td style="text-align: right; font-weight: 700;">₹${baseTariff.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Central GST (CGST)</strong><br/>
                    <span style="font-size: 12px; color: #64748b;">Central Goods & Services Tax</span>
                  </td>
                  <td style="text-align: center; font-weight: 700; color: #0284c7;">${cgstRate}%</td>
                  <td style="text-align: right; font-weight: 700;">₹${cgstAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>
                    <strong>State GST (SGST / UTGST)</strong><br/>
                    <span style="font-size: 12px; color: #64748b;">State Goods & Services Tax</span>
                  </td>
                  <td style="text-align: center; font-weight: 700; color: #0284c7;">${sgstRate}%</td>
                  <td style="text-align: right; font-weight: 700;">₹${sgstAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Cleaning & Convenience Fee</strong><br/>
                    <span style="font-size: 12px; color: #10b981;">100% Waived Off</span>
                  </td>
                  <td style="text-align: center; font-weight: 600; color: #10b981;">0.00%</td>
                  <td style="text-align: right; font-weight: 700; color: #10b981;">₹0 (FREE)</td>
                </tr>
                <tr class="total-row">
                  <td>
                    <strong>Grand Total Amount (Incl. ${gstRate}% GST)</strong>
                  </td>
                  <td style="text-align: center; font-size: 13px; font-weight: 800;">${gstRate}% GST</td>
                  <td style="text-align: right;">₹${totalPrice.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <!-- QR Code & Status Stamp -->
            <div class="verification-section">
              <div>
                <span class="status-stamp">✓ CONFIRMED & VERIFIED</span>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Issued Date: ${bookingDate}</div>
              </div>
              <div class="qr-box">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HomelyHub-${receiptId}" alt="QR Code" class="qr-img" />
                <div style="font-size: 11px; color: #64748b; line-height: 1.3;">
                  <strong>Scan for Check-in</strong><br/>
                  Verified Host Code
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="voucher-footer">
              Thank you for choosing <strong>Homely Hub Stays</strong>! Present this official PDF GST tax voucher at check-in.<br/>
              Need assistance? Contact support@homelyhub.com | 24/7 Guest Support
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(ticketHtml);
  printWindow.document.close();
};
