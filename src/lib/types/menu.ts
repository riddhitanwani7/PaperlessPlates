export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  items: number;
};

export type MenuItemRecord = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  available: boolean;
  popular: boolean;
  tags: string[];
  dietaryTags: string[];
  description: string;
  image?: string;
  imageUrl?: string;
};
