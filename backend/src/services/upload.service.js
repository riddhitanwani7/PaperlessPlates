import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary.js";

export function getResourceType(fileType) {
  return fileType === "pdf" ? "raw" : "image";
}

export function uploadMenuFile(buffer, fileType) {
  const resourceType = getResourceType(fileType);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "paperlessplates/menus",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteMenuFile(publicId, fileType) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: getResourceType(fileType),
  });
}

export function uploadQrImage(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "paperlessplates/qr-codes",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteQrImage(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export function uploadFoodImage(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "paperlessplates/menu-items",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteFoodImage(publicId) {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export function uploadRestaurantImage(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "paperlessplates/restaurants",
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export function uploadRestaurantCoverImage(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "paperlessplates/restaurants/covers",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 400, crop: "fill" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteRestaurantImage(publicId) {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
