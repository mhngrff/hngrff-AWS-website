import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { OrdersService } from '../services/orders.service';
import { jsPDF } from 'jspdf';

interface Product {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnailUrl: string;
}

interface OrderDetails {
  OrderId: string;
  customerName: string;
  customerEmail: string;
  products: Product[];
  subtotal: number;
  total: number;
  shippingCost: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  orderDate: string;
}

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})

export class SuccessComponent implements OnInit {
//   orderDetails?: OrderDetails;
  isLoading = true;
  errorMessage: string | null = null;
  spinnerText = 'Fetching your order';

  private spinnerInterval: any;


  orderDetails: OrderDetails = {
    OrderId: '',
    customerName: '',
    customerEmail: '',
    products: [],
    subtotal: 0,
    total: 0,
    shippingCost: 0,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    orderDate: '',
  };



  constructor(
    private ordersService: OrdersService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router,
    ) {}

  ngOnInit() {
    this.startSpinner();

    const orderId = sessionStorage.getItem('orderId');
//     this.orderID = orderId;
    console.log("Reached success component with orderId: ", orderId);

      if (!orderId) {
        console.error('No orderId found in sessionStorage. Redirecting to homepage.');
        this.router.navigate(['/']); // Redirect to homepage if orderId is missing
        return;
      }

        // Fetch the order details dynamically
        this.ordersService.getOrder(orderId).subscribe(
          (orderDetails) => {
            this.orderDetails = orderDetails;
            this.isLoading = false;
            this.stopSpinner();
            console.log('Fetched order details:', this.orderDetails);
            console.log('orderId:', this.orderDetails.OrderId);
          },
          (error) => {
            console.error('Error fetching order details:', error);
            this.isLoading = false;
            this.router.navigate(['/']); // Redirect to homepage if fetching fails
          }
        );

      // Prevent back navigation to the payment page
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart && event.navigationTrigger === 'popstate') {
          // Redirect to home if back navigation leads to payment
          if (this.router.url === '/payment') {
            this.router.navigate(['/success']); // Redirect to home or another page
          }
        }
      });
    }

    startSpinner(): void {
      let dotCount = 0;

      this.spinnerInterval = setInterval(() => {
        dotCount = (dotCount + 1 ) % 4;
        const dots = '.'.repeat(dotCount);
        this.spinnerText = `Fetching your order${dots}`;
        }, 150); //150ms
      }

      stopSpinner(): void {
        if (this.spinnerInterval) {
          clearInterval(this.spinnerInterval);
          this.spinnerInterval = null;
        }
      }

generatePdf() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25; // Increased margin
  const fontSizeBase = 14; // Base font size for scaling

  const logoUrl = '/assets/images/hngrffLogoBlack.png';
  const logoWidth = 50;
  const logoHeight = 14;

  const promises = this.orderDetails.products.map((product) =>
    this.convertToBase64(product.thumbnailUrl).then(({ base64, width, height }) => {
      const imageWidth = 40; // Fixed width
      const aspectRatio = height / width;
      const imageHeight = imageWidth * aspectRatio;
      return { base64, imageWidth, imageHeight, product };
    })
  );

  Promise.all(promises)
    .then((products) =>
      this.convertToBase64(logoUrl).then(({ base64 }) => {
        // Add the logo at the top
        doc.addImage(base64, 'PNG', pageWidth / 2 - logoWidth / 2, 10, logoWidth, logoHeight);

        let yPosition = 40; // Start position after the logo

        // Order ID
        doc.setFontSize(fontSizeBase + 2); // Larger font for header
        doc.text(`Order ID: ${this.orderDetails.OrderId}`, margin, yPosition);
        yPosition += 10;

        // Products Section
        products.forEach(({ base64, imageWidth, imageHeight, product }) => {
          // Add product image
          doc.addImage(base64, 'JPEG', margin, yPosition, imageWidth, imageHeight);

          // Add product details
          doc.setFontSize(fontSizeBase);
          doc.text(product.productName, margin + imageWidth + 10, yPosition + 10);
          doc.text(
            `$${product.unitPrice.toFixed(2)}`,
            pageWidth - margin,
            yPosition + 10,
            { align: 'right' }
          );

          yPosition += imageHeight + 10; // Space between products
        });

        // Horizontal Line
        doc.setDrawColor(0);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // Totals Section
        doc.setFontSize(fontSizeBase);
        doc.text(`Subtotal:`, margin, yPosition);
        doc.text(`$${this.orderDetails.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, {
          align: 'right',
        });

        yPosition += 10;
        doc.text(`Shipping:`, margin, yPosition);
        console.log('shippingCost:', this.orderDetails.shippingCost, typeof this.orderDetails.shippingCost);
        doc.text(`$${this.orderDetails.shippingCost}`, pageWidth - margin, yPosition, {
          align: 'right',
        });

        yPosition += 10;
        doc.setFontSize(fontSizeBase + 2); // Highlighted size
        doc.text(`Total:`, margin, yPosition);
        doc.text(`$${this.orderDetails.total.toFixed(2)}`, pageWidth - margin, yPosition, {
          align: 'right',
        });

        yPosition += 20;

        // Shipping Address Section
        doc.setFontSize(fontSizeBase + 2);
        doc.text(`Ship to:`, margin, yPosition);

        yPosition += 10;
        doc.setFontSize(fontSizeBase);
        doc.text(`${this.orderDetails.customerName}`, margin, yPosition);

        yPosition += 8;
        doc.text(`${this.orderDetails.shippingAddress.street}`, margin, yPosition);

        yPosition += 8; // Reduced line height
        doc.text(
          `${this.orderDetails.shippingAddress.city}, ${this.orderDetails.shippingAddress.state} ${this.orderDetails.shippingAddress.zip}`,
          margin,
          yPosition
        );

        yPosition += 8;
        doc.text(`${this.orderDetails.shippingAddress.country}`, margin, yPosition);

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);

      if (isMobile && isChrome) {
        // Chrome on mobile: Force download using a hidden <a> tag
        const anchor = document.createElement('a');
        anchor.href = pdfUrl;
        anchor.download = `${this.orderDetails.OrderId}.pdf`;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } else if (isMobile) {
        // General fallback for other mobile browsers
        const newTab = window.open(pdfUrl, '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
          console.warn('Could not open new tab; navigating directly to URL.');
          window.location.href = pdfUrl; // Fallback
        }
      } else {
        // Default behavior for desktop
        doc.save(`${this.orderDetails.OrderId}.pdf`);
      }
      })
    )
    .catch((error) => {
      console.error('Error generating PDF:', error);
    });
}



convertToBase64(imageUrl: string): Promise<{ base64: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve({
          base64: dataUrl.split(',')[1], // Base64 without the metadata
          width: img.width,
          height: img.height,
        });
      } else {
        reject('Failed to get canvas context');
      }
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}




      ngOnDestroy() {
        this.stopSpinner();
      }

  }
