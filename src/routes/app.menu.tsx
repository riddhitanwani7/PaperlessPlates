import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppLayout";
import { DocumentMenuSection } from "@/components/app/menu/DocumentMenuSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createCategoryApi,
  deleteCategoryApi,
  listCategoriesApi,
  updateCategoryApi,
} from "@/lib/api/category.api";
import {
  createMenuItemApi,
  deleteMenuItemApi,
  listMenuItemsApi,
  updateMenuItemApi,
} from "@/lib/api/menuItem.api";
import { ApiError } from "@/lib/api/client";
import { auth } from "@/lib/auth";
import type { MenuCategory, MenuItemRecord } from "@/lib/types/menu";
import { Plus, Edit2, Trash2, ImageIcon, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/menu")({
  component: MenuPage,
});

function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const token = auth.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const [categoryRes, itemRes] = await Promise.all([
        listCategoriesApi(token),
        listMenuItemsApi(token),
      ]);
      setCategories(categoryRes.categories);
      setItems(itemRes.items);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load menu data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageHeader
        title="Menu Management"
        description="Organize categories, items, pricing, and availability."
        actions={<ItemDialog categories={categories} onSaved={loadData} />}
      />

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-5">
          {loading ? (
            <Card className="rounded-2xl p-10 text-center text-sm text-muted-foreground shadow-card">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Loading items...
            </Card>
          ) : items.length === 0 ? (
            <Card className="rounded-2xl p-10 text-center text-sm text-muted-foreground shadow-card">
              <p className="font-medium text-foreground">No items yet</p>
              <p className="mt-1">Create your first menu item to get started.</p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((it) => (
                <ItemCard key={it.id} item={it} categories={categories} onChanged={loadData} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-5">
          <Card className="rounded-2xl p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Categories</h3>
              <CategoryDialog onSaved={loadData} />
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading categories...</div>
            ) : (
              <ul className="divide-y divide-border">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.items} items</p>
                    </div>
                    <div className="flex gap-1">
                      <CategoryDialog category={c} onSaved={loadData} />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          const token = auth.getToken();
                          if (!token) return;
                          try {
                            await deleteCategoryApi(token, c.id);
                            toast.success("Category deleted");
                            loadData();
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Could not delete category");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="document" className="mt-5">
          <DocumentMenuSection />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ItemCard({
  item,
  categories,
  onChanged,
}: {
  item: MenuItemRecord;
  categories: MenuCategory[];
  onChanged: () => void;
}) {
  const image = item.image ?? item.imageUrl;

  async function toggleAvailable() {
    const token = auth.getToken();
    if (!token) return;
    const formData = new FormData();
    formData.append("available", String(!item.available));
    try {
      await updateMenuItemApi(token, item.id, formData);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update availability");
    }
  }

  async function togglePopular() {
    const token = auth.getToken();
    if (!token) return;
    const formData = new FormData();
    formData.append("popular", String(!item.popular));
    try {
      await updateMenuItemApi(token, item.id, formData);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update popular flag");
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {/* Section 1 - Image */}
      <div className="relative h-56 w-full overflow-hidden bg-muted">
        {image ? (
          <img src={image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
              <p className="mt-2 text-xs text-muted-foreground">No Image Available</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2 - Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{item.name}</h3>
              {item.popular && (
                <Badge className="border-0 bg-gradient-coral text-primary-foreground text-xs">
                  <Star className="mr-1 h-3 w-3" /> Popular
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
          </div>
          <span className="font-display text-lg font-semibold">${item.price}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Section 3 - Actions */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={item.available} onCheckedChange={() => void toggleAvailable()} id={`av-${item.id}`} />
            <Label htmlFor={`av-${item.id}`} className="text-sm text-muted-foreground">
              Available
            </Label>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => void togglePopular()} aria-label="Toggle popular">
              <Star className={`h-4 w-4 ${item.popular ? "text-primary" : ""}`} />
            </Button>
            <ItemDialog item={item} categories={categories} onSaved={onChanged} triggerEdit />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete"
              onClick={async () => {
                const token = auth.getToken();
                if (!token) return;
                try {
                  await deleteMenuItemApi(token, item.id);
                  toast.success("Item deleted");
                  onChanged();
                } catch (err) {
                  toast.error(err instanceof ApiError ? err.message : "Could not delete item");
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CategoryDialog({
  category,
  onSaved,
}: {
  category?: MenuCategory;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
    }
  }, [open, category]);

  async function save() {
    const token = auth.getToken();
    if (!token || !name.trim()) return;

    setSaving(true);
    try {
      if (category) {
        await updateCategoryApi(token, category.id, { name, description });
        toast.success("Category updated");
      } else {
        await createCategoryApi(token, { name, description });
        toast.success("Category created");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button size="icon" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || !name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({
  item,
  categories,
  onSaved,
  triggerEdit,
}: {
  item?: MenuItemRecord;
  categories: MenuCategory[];
  onSaved: () => void;
  triggerEdit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? "");
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [popular, setPopular] = useState(item?.popular ?? false);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(item?.name ?? "");
      setPrice(item ? String(item.price) : "");
      setDescription(item?.description ?? "");
      setCategoryId(item?.categoryId ?? categories[0]?.id ?? "");
      setTags(item?.tags ?? []);
      setPopular(item?.popular ?? false);
    }
  }, [open, item, categories]);

  async function save() {
    const token = auth.getToken();
    if (!token || !name.trim() || !categoryId) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("popular", String(popular));
    formData.append("dietaryTags", JSON.stringify(tags));
    const imageFile = imageRef.current?.files?.[0];
    if (imageFile) formData.append("image", imageFile);

    setSaving(true);
    try {
      if (item) {
        await updateMenuItemApi(token, item.id, formData);
        toast.success("Item updated");
      } else {
        await createMenuItemApi(token, formData);
        toast.success("Item created");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerEdit ? (
        <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setOpen(true)}>
          <Edit2 className="h-4 w-4" />
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit menu item" : "New menu item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Wagyu Burger" />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="22.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown on the menu..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <input ref={imageRef} type="file" accept="image/*" className="block w-full text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Dietary tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {["Vegetarian", "Vegan", "Gluten-free", "Spicy", "Signature"].map((t) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">Mark as popular</Label>
            <Switch checked={popular} onCheckedChange={setPopular} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || !name.trim() || !categoryId}>
            Save item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
