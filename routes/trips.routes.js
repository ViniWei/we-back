import { Router } from "express";
import multer from "multer";
import path from "path";
import {
    createTrip,
    getAllTrips,
    getUpcomingTrips,
    getPastTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    addPhotosToTrip
} from "../controllers/trips.controller.js";

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/", getAllTrips);
router.get("/upcoming", getUpcomingTrips);
router.get("/past", getPastTrips);
router.get("/:id", getTripById);

router.post("/", createTrip);
router.post("/:id/photos", upload.array('photos', 5), addPhotosToTrip);

router.put("/:id", updateTrip);

router.delete("/:id", deleteTrip);

export default router;
