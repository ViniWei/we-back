import { Router } from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/auth.middleware";
import {
  createTrip,
  getAllTrips,
  getUpcomingTrips,
  getPastTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addPhotosToTrip,
} from "../controllers/trips.controller";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, "uploads/");
  },
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Apply authentication middleware to all routes
router.use(authMiddleware.verifySession);

router.get("/", getAllTrips);
router.get("/upcoming", getUpcomingTrips);
router.get("/past", getPastTrips);
router.get("/:id", getTripById);

router.post("/", createTrip);
router.post("/:id/photos", upload.array("photos", 5), addPhotosToTrip);

router.put("/:id", updateTrip);

router.delete("/:id", deleteTrip);

export default router;
