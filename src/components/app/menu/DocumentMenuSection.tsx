import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api/client";
import {
  deleteMenuApi,
  getMyMenuApi,
  uploadMenuApi,
  type RestaurantMenu,
} from "@/lib/api/restaurant.api";
import { auth } from "@/lib/auth";
import { FileText, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

function getMenuFileName(menu: RestaurantMenu) {
  try {
    const part = new URL(menu.menuFileUrl).pathname.split("/").pop();
    if (part) return decodeURIComponent(part);
  } catch {
    // ignore
  }

  const ext = menu.menuFileType === "jpeg" ? "jpg" : menu.menuFileType;
  return `restaurant-menu.${ext}`;
}

export function DocumentMenuSection() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState<RestaurantMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadMenu() {
    const token = auth.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const { menu: currentMenu } = await getMyMenuApi(token);
      setMenu(currentMenu);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("documentMenu.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function handleUpload(file: File) {
    const token = auth.getToken();
    if (!token) return;

    setUploading(true);
    try {
      const { menu: uploadedMenu } = await uploadMenuApi(token, file);
      setMenu(uploadedMenu);
      toast.success(menu ? t("documentMenu.replaced") : t("documentMenu.uploaded"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("documentMenu.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void handleUpload(file);
  }

  async function handleDelete() {
    const token = auth.getToken();
    if (!token) return;

    setDeleting(true);
    try {
      await deleteMenuApi(token);
      setMenu(null);
      toast.success(t("documentMenu.deleted"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("documentMenu.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  const isImage =
    menu?.menuFileType === "jpg" ||
    menu?.menuFileType === "jpeg" ||
    menu?.menuFileType === "png";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading || loading}>
          {uploading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1 h-4 w-4" />
          )}
          {menu ? t("documentMenu.replace") : t("documentMenu.upload")}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={onFileChange}
      />

      {loading ? (
        <Card className="rounded-2xl p-10 shadow-card">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("documentMenu.loading")}
          </div>
        </Card>
      ) : menu ? (
        <>
          <Card className="rounded-2xl p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("documentMenu.currentMenu")}
                  </p>
                  <h3 className="mt-1 font-semibold">{getMenuFileName(menu)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("documentMenu.uploadedOn")} {new Date(menu.menuUploadedAt).toLocaleDateString(i18n.language.startsWith("hi") ? "hi-IN" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <a href={menu.menuFileUrl} target="_blank" rel="noreferrer">
                    {t("documentMenu.preview")}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {t("documentMenu.replace")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={deleting}>
                      <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                      {t("common.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("documentMenu.deleteTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("documentMenu.deleteDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void handleDelete()} disabled={deleting}>
                        {t("documentMenu.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-2xl shadow-card">
            {isImage ? (
              <img
                src={menu.menuFileUrl}
                alt={t("documentMenu.menuAlt")}
                className="max-h-[70vh] w-full object-contain bg-muted"
              />
            ) : (
              <iframe
                src={menu.menuFileUrl}
                title={t("documentMenu.previewTitle")}
                className="h-[70vh] w-full border-0 bg-muted"
              />
            )}
          </Card>
        </>
      ) : (
        <Card className="rounded-2xl border-dashed p-10 text-center shadow-card">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Upload className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-semibold">{t("documentMenu.emptyTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("documentMenu.emptyDescription")}
          </p>
          <Button className="mt-6" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1 h-4 w-4" />
            )}
            {t("documentMenu.upload")}
          </Button>
        </Card>
      )}
    </div>
  );
}
