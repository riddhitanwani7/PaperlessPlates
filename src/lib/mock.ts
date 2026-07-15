// Mock data for PaperlessPlates SaaS demo
export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

export interface Order {
  id: string;
  customer: string;
  table: string;
  items: { name: string; qty: number; price: number }[];
  amount: number;
  status: OrderStatus;
  time: string;
  date?: string;
  notes?: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-10421",
    customer: "Aisha Khan",
    table: "T-04",
    items: [
      { name: "Margherita Pizza", qty: 1, price: 14 },
      { name: "Iced Latte", qty: 2, price: 5 },
    ],
    amount: 24,
    status: "Preparing",
    time: "12:42",
    date: "2026-06-07",
    notes: "No onions",
  },
  {
    id: "ORD-10420",
    customer: "Marco Silva",
    table: "Room 312",
    items: [{ name: "Club Sandwich", qty: 1, price: 12 }],
    amount: 12,
    status: "Pending",
    time: "12:39",
    date: "2026-06-07",
  },
  {
    id: "ORD-10419",
    customer: "Lina Park",
    table: "T-09",
    items: [
      { name: "Caesar Salad", qty: 1, price: 11 },
      { name: "Sparkling Water", qty: 1, price: 3 },
    ],
    amount: 14,
    status: "Ready",
    time: "12:31",
    date: "2026-06-07",
  },
  {
    id: "ORD-10418",
    customer: "Diego Ruiz",
    table: "T-02",
    items: [{ name: "Wagyu Burger", qty: 2, price: 22 }],
    amount: 44,
    status: "Completed",
    time: "12:18",
    date: "2026-06-07",
  },
  {
    id: "ORD-10417",
    customer: "Noor Ali",
    table: "T-11",
    items: [{ name: "Spaghetti Carbonara", qty: 1, price: 16 }],
    amount: 16,
    status: "Accepted",
    time: "12:10",
    date: "2026-06-07",
  },
  {
    id: "ORD-10416",
    customer: "Walk-in",
    table: "Bar-1",
    items: [{ name: "Espresso", qty: 1, price: 3 }],
    amount: 3,
    status: "Cancelled",
    time: "12:02",
    date: "2026-06-07",
  },
];

export const ordersTrend = [
  { day: "Mon", orders: 124, revenue: 2410 },
  { day: "Tue", orders: 132, revenue: 2680 },
  { day: "Wed", orders: 148, revenue: 2980 },
  { day: "Thu", orders: 165, revenue: 3120 },
  { day: "Fri", orders: 219, revenue: 4380 },
  { day: "Sat", orders: 264, revenue: 5210 },
  { day: "Sun", orders: 198, revenue: 3960 },
];

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  popular: boolean;
  tags: string[];
  description: string;
  image?: string;
  ingredients?: string[];
  prepTime?: number;
}

export const mockCategories = [
  { id: "c1", name: "Starters", items: 8 },
  { id: "c2", name: "Mains", items: 14 },
  { id: "c3", name: "Pizza", items: 9 },
  { id: "c4", name: "Desserts", items: 6 },
  { id: "c5", name: "Beverages", items: 18 },
];

const IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70`;

export const mockMenuItems: MenuItem[] = [
  {
    id: "m1",
    name: "Margherita Pizza",
    category: "Pizza",
    price: 14,
    available: true,
    popular: true,
    tags: ["Vegetarian"],
    description: "Tomato, fresh mozzarella, basil, extra virgin olive oil.",
    image: IMG("photo-1604382354936-07c5d9983bd3"),
    ingredients: ["San Marzano tomato", "Mozzarella di bufala", "Basil", "Olive oil"],
    prepTime: 12,
  },
  {
    id: "m2",
    name: "Wagyu Burger",
    category: "Mains",
    price: 22,
    available: true,
    popular: true,
    tags: ["Signature"],
    description: "Wagyu patty, aged cheddar, brioche bun, truffle aioli.",
    image: IMG("photo-1568901346375-23c9450c58cd"),
    ingredients: ["Wagyu beef", "Aged cheddar", "Brioche", "Truffle aioli"],
    prepTime: 15,
  },
  {
    id: "m3",
    name: "Caesar Salad",
    category: "Starters",
    price: 11,
    available: true,
    popular: false,
    tags: ["Vegetarian"],
    description: "Romaine, parmesan, croutons, classic Caesar dressing.",
    image: IMG("photo-1546793665-c74683f339c1"),
    prepTime: 6,
  },
  {
    id: "m4",
    name: "Spaghetti Carbonara",
    category: "Mains",
    price: 16,
    available: true,
    popular: true,
    tags: [],
    description: "Guanciale, pecorino, egg yolk, cracked black pepper.",
    image: IMG("photo-1612874742237-6526221588e3"),
    prepTime: 14,
  },
  {
    id: "m5",
    name: "Tiramisu",
    category: "Desserts",
    price: 9,
    available: false,
    popular: false,
    tags: ["Contains alcohol"],
    description: "Classic mascarpone, espresso-soaked savoiardi, cocoa.",
    image: IMG("photo-1571877227200-a0d98ea607e9"),
    prepTime: 5,
  },
  {
    id: "m6",
    name: "Iced Latte",
    category: "Beverages",
    price: 5,
    available: true,
    popular: true,
    tags: [],
    description: "Double-shot espresso, cold milk, served over ice.",
    image: IMG("photo-1517701604599-bb29b565090c"),
    prepTime: 3,
  },
  {
    id: "m7",
    name: "Truffle Fries",
    category: "Starters",
    price: 9,
    available: true,
    popular: true,
    tags: ["Vegetarian"],
    description: "Hand-cut fries, truffle oil, parmesan, parsley.",
    image: IMG("photo-1573080496219-bb080dd4f877"),
    prepTime: 8,
  },
  {
    id: "m8",
    name: "Pepperoni Pizza",
    category: "Pizza",
    price: 16,
    available: true,
    popular: false,
    tags: [],
    description: "Spicy pepperoni, mozzarella, oregano.",
    image: IMG("photo-1628840042765-356cda07504e"),
    prepTime: 12,
  },
  {
    id: "m9",
    name: "Chocolate Lava Cake",
    category: "Desserts",
    price: 8,
    available: true,
    popular: true,
    tags: ["Vegetarian"],
    description: "Warm molten chocolate, vanilla bean ice cream.",
    image: IMG("photo-1606313564200-e75d5e30476c"),
    prepTime: 10,
  },
  {
    id: "m10",
    name: "Fresh Lemonade",
    category: "Beverages",
    price: 4,
    available: true,
    popular: false,
    tags: ["Vegan"],
    description: "Hand-pressed lemons, cane sugar, sparkling water.",
    image: IMG("photo-1556679343-c7306c1976bc"),
    prepTime: 2,
  },
];

export const popularItems = [
  { name: "Margherita Pizza", orders: 412, revenue: 5768 },
  { name: "Wagyu Burger", orders: 318, revenue: 6996 },
  { name: "Spaghetti Carbonara", orders: 274, revenue: 4384 },
  { name: "Iced Latte", orders: 261, revenue: 1305 },
  { name: "Caesar Salad", orders: 198, revenue: 2178 },
];

export const engagement = [
  { metric: "Menu Views", value: "12,840", change: "+18%" },
  { metric: "QR Scans", value: "9,210", change: "+22%" },
  { metric: "Avg Cart Size", value: "$24.10", change: "+4%" },
  { metric: "Repeat Customers", value: "38%", change: "+6%" },
];

// ====== Tables, Rooms, QR codes ======
export interface TableEntity {
  id: string;
  number: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  qrId?: string;
}

export interface RoomEntity {
  id: string;
  number: string;
  floor: number;
  status: "Available" | "Occupied" | "Maintenance";
  qrId?: string;
}

export interface QREntity {
  id: string;
  label: string;
  type: "Restaurant" | "Table" | "Room" | "Takeaway";
  url: string;
  active: boolean;
  scans: number;
  createdAt: string;
}

export const mockTables: TableEntity[] = [
  { id: "t1", number: "T-01", capacity: 2, status: "Available", qrId: "qr-t1" },
  { id: "t2", number: "T-02", capacity: 4, status: "Occupied", qrId: "qr-t2" },
  { id: "t3", number: "T-03", capacity: 4, status: "Available", qrId: "qr-t3" },
  { id: "t4", number: "T-04", capacity: 6, status: "Occupied", qrId: "qr-t4" },
  { id: "t5", number: "T-05", capacity: 2, status: "Reserved", qrId: "qr-t5" },
  { id: "t6", number: "T-06", capacity: 8, status: "Available", qrId: "qr-t6" },
];

export const mockRooms: RoomEntity[] = [
  { id: "r1", number: "201", floor: 2, status: "Occupied", qrId: "qr-r1" },
  { id: "r2", number: "202", floor: 2, status: "Available", qrId: "qr-r2" },
  { id: "r3", number: "303", floor: 3, status: "Maintenance" },
  { id: "r4", number: "312", floor: 3, status: "Occupied", qrId: "qr-r4" },
  { id: "r5", number: "401", floor: 4, status: "Available", qrId: "qr-r5" },
];

export const mockQRs: QREntity[] = [
  { id: "qr-main", label: "Main Menu", type: "Restaurant", url: "https://pp.app/r/bistro", active: true, scans: 2410, createdAt: "2026-01-12" },
  { id: "qr-t1", label: "Table 01", type: "Table", url: "https://pp.app/r/bistro/t/1", active: true, scans: 84, createdAt: "2026-01-12" },
  { id: "qr-t2", label: "Table 02", type: "Table", url: "https://pp.app/r/bistro/t/2", active: true, scans: 132, createdAt: "2026-01-12" },
  { id: "qr-t3", label: "Table 03", type: "Table", url: "https://pp.app/r/bistro/t/3", active: true, scans: 91, createdAt: "2026-01-12" },
  { id: "qr-t4", label: "Table 04", type: "Table", url: "https://pp.app/r/bistro/t/4", active: true, scans: 178, createdAt: "2026-01-12" },
  { id: "qr-t5", label: "Table 05", type: "Table", url: "https://pp.app/r/bistro/t/5", active: false, scans: 62, createdAt: "2026-01-12" },
  { id: "qr-t6", label: "Table 06", type: "Table", url: "https://pp.app/r/bistro/t/6", active: true, scans: 49, createdAt: "2026-01-12" },
  { id: "qr-r1", label: "Room 201", type: "Room", url: "https://pp.app/r/bistro/room/201", active: true, scans: 41, createdAt: "2026-02-04" },
  { id: "qr-r2", label: "Room 202", type: "Room", url: "https://pp.app/r/bistro/room/202", active: true, scans: 38, createdAt: "2026-02-04" },
  { id: "qr-r4", label: "Room 312", type: "Room", url: "https://pp.app/r/bistro/room/312", active: true, scans: 67, createdAt: "2026-02-04" },
  { id: "qr-r5", label: "Room 401", type: "Room", url: "https://pp.app/r/bistro/room/401", active: true, scans: 29, createdAt: "2026-02-04" },
  { id: "qr-takeaway", label: "Takeaway", type: "Takeaway", url: "https://pp.app/r/bistro/takeaway", active: true, scans: 540, createdAt: "2026-01-20" },
];

// ====== Kitchen mock orders ======
export type KitchenStatus = "New" | "Accepted" | "Preparing" | "Ready" | "Completed";

export interface KitchenOrder {
  id: string;
  source: string; // table or room label
  items: { name: string; qty: number }[];
  notes?: string;
  priority: "Normal" | "Rush";
  estPrepMin: number;
  receivedAt: number; // epoch
  status: KitchenStatus;
}

const now = Date.now();
export const mockKitchenOrders: KitchenOrder[] = [
  { id: "K-10421", source: "T-04", items: [{ name: "Margherita Pizza", qty: 1 }, { name: "Iced Latte", qty: 2 }], priority: "Normal", estPrepMin: 12, receivedAt: now - 4 * 60000, status: "Preparing", notes: "No onions" },
  { id: "K-10420", source: "Room 312", items: [{ name: "Club Sandwich", qty: 1 }], priority: "Rush", estPrepMin: 8, receivedAt: now - 2 * 60000, status: "New" },
  { id: "K-10419", source: "T-09", items: [{ name: "Caesar Salad", qty: 1 }, { name: "Sparkling Water", qty: 1 }], priority: "Normal", estPrepMin: 6, receivedAt: now - 11 * 60000, status: "Ready" },
  { id: "K-10417", source: "T-11", items: [{ name: "Spaghetti Carbonara", qty: 1 }], priority: "Normal", estPrepMin: 14, receivedAt: now - 7 * 60000, status: "Accepted" },
  { id: "K-10415", source: "T-02", items: [{ name: "Wagyu Burger", qty: 2 }, { name: "Truffle Fries", qty: 1 }], priority: "Rush", estPrepMin: 18, receivedAt: now - 9 * 60000, status: "Preparing" },
  { id: "K-10410", source: "Room 201", items: [{ name: "Tiramisu", qty: 2 }], priority: "Normal", estPrepMin: 5, receivedAt: now - 22 * 60000, status: "Completed" },
];

// ====== Transactions ======
export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  method: "Card" | "UPI" | "Wallet" | "Netbanking";
  status: "Success" | "Failed" | "Refunded";
  date: string;
}

export const mockTransactions: Transaction[] = [
  { id: "TXN-9821", orderId: "ORD-10421", amount: 24, method: "Card", status: "Success", date: "2026-06-07 12:42" },
  { id: "TXN-9820", orderId: "ORD-10418", amount: 44, method: "UPI", status: "Success", date: "2026-06-07 12:18" },
  { id: "TXN-9819", orderId: "ORD-10416", amount: 3, method: "Card", status: "Failed", date: "2026-06-07 12:02" },
  { id: "TXN-9818", orderId: "ORD-10401", amount: 32, method: "Wallet", status: "Refunded", date: "2026-06-06 19:21" },
];

export const RESTAURANT = {
  name: "Bistro Lumière",
  logo: "B",
  tagline: "Modern European Bistro",
};
