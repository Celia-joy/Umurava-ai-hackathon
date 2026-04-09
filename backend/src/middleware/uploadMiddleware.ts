import fs from "fs";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/errors";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${suffix}-${file.originalname.replace(/\s+/g, "-")}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel"
    ];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) && extension !== ".csv" && extension !== ".pdf") {
      cb(new AppError("Only PDF and CSV CV uploads are supported", 400));
      return;
    }

    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
