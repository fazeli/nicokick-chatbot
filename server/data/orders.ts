import { type InsertOrder } from "@shared/schema";

export const orderData: InsertOrder[] = [
  {
    orderNumber: "NK123456",
    status: "Shipped",
    shippingMethod: "USPS Priority",
    estimatedDelivery: "June 15, 2023",
    trackingNumber: "9405511202555647XXXXX",
    userId: 1,
    items: [
      {
        productId: 1,
        name: "ZYN Mint 6mg",
        quantity: 3,
        price: 4.99
      },
      {
        productId: 3,
        name: "VELO Citrus 4mg",
        quantity: 2,
        price: 4.49
      }
    ]
  },
  {
    orderNumber: "NK234567",
    status: "Processing",
    shippingMethod: "Standard Shipping",
    estimatedDelivery: "June 20, 2023",
    trackingNumber: null,
    userId: 2,
    items: [
      {
        productId: 2,
        name: "On! Wintergreen 4mg",
        quantity: 5,
        price: 3.99
      }
    ]
  },
  {
    orderNumber: "NK345678",
    status: "Delivered",
    shippingMethod: "Expedited Shipping",
    estimatedDelivery: "June 10, 2023",
    trackingNumber: "9405511202555647YYYYY",
    userId: 1,
    items: [
      {
        productId: 4,
        name: "Rogue Mint 2mg",
        quantity: 2,
        price: 6.99
      },
      {
        productId: 5,
        name: "Lucy Cinnamon 4mg",
        quantity: 1,
        price: 7.49
      }
    ]
  },
  {
    orderNumber: "NK456789",
    status: "Cancelled",
    shippingMethod: null,
    estimatedDelivery: null,
    trackingNumber: null,
    userId: 3,
    items: [
      {
        productId: 6,
        name: "Lyft Berry 8mg",
        quantity: 4,
        price: 5.49
      }
    ]
  },
  {
    orderNumber: "NK567890",
    status: "Processing",
    shippingMethod: "Priority Shipping",
    estimatedDelivery: "June 18, 2023",
    trackingNumber: null,
    userId: 4,
    items: [
      {
        productId: 7,
        name: "Zyn Cool Mint 6mg",
        quantity: 10,
        price: 4.99
      }
    ]
  }
];
