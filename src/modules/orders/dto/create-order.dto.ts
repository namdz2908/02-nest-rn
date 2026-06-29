export class CreateOrderDto {
    restaurantId: string;

    items: Array<{
        menuItemId: string;
        quantity: number;
        price: number;
    }>;

    orderType: 'delivery' | 'dine-in';

    paymentMethod: 'cash' | 'card' | 'online';

    totalPrice: number;

    deliveryAddress?: string;

    tableNumber?: string;

    phone: string;

    notes?: string;
}

