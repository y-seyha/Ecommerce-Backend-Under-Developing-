import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "Configuration/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ecommerce-products",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

export const upload = multer({ storage });
