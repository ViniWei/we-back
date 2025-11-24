import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware";
import {
  createTrip,
  getAllTrips,
  getUpcomingTrips,
  getPastTrips,
  getCanceledTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addPhotosToTrip,
  deletePhotoFromTrip,
} from "../controllers/trips.controller";

const router = Router();

// Configuração do multer para upload em memória (mais eficiente para S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por foto
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.use(authMiddleware.verifyToken);

router.get("/", getAllTrips);
router.get("/upcoming", getUpcomingTrips);
router.get("/past", getPastTrips);
router.get("/canceled", getCanceledTrips);
router.get("/:id", getTripById);

router.post("/", createTrip);
router.post("/:id/photos", upload.array("photos", 10), addPhotosToTrip);

router.put("/:id", updateTrip);

router.delete("/:id", deleteTrip);
router.delete("/:id/photos", deletePhotoFromTrip);

export default router;
