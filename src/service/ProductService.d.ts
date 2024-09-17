interface Product {
    id: string;
    code: string;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    quantity: number;
    inventoryStatus: 'INSTOCK' | 'OUTOFSTOCK' | 'LOWSTOCK';
    rating: number;
}

interface Order {
    id: string;
    productCode: string;
    date: string;
    amount: number;
    quantity: number;
    customer: string;
    status: 'PENDING' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
}


interface ProductWithOrders extends Product {
    orders: Order[];
}

export declare const ProductService: {
    getProductsData(): Product[];
    getProductsWithOrdersData(): ProductWithOrders[];
    getProductsMini(): Promise<Product[]>;
    getProductsSmall(): Promise<Product[]>;
    getProducts(): Promise<Product[]>;
    getProductsWithOrdersSmall(): Promise<ProductWithOrders[]>;
    getProductsWithOrders(): Promise<ProductWithOrders[]>;
};