
import { pool } from "../db.js";
import BaseRepository from "./BaseRepository.js";

const tableName = "trips";
const baseRepository = new BaseRepository(tableName);

const getTripsWithPhotos = async (whereClause = "") => {
    const query = `
        SELECT 
            t.*,
            GROUP_CONCAT(tp.photo_url) AS photos
        FROM 
            trips t
        LEFT JOIN 
            trip_photos tp ON t.id = tp.trip_id
        ${whereClause}
        GROUP BY 
            t.id
        ORDER BY
            t.start_date DESC;
    `;
    const [rows] = await pool.query(query);

    return rows.map(row => ({
        ...row,
        photos: row.photos ? row.photos.split(',') : []
    }));
};

const getByIdWithPhotos = async (id) => {
    const trips = await getTripsWithPhotos(`WHERE t.id = ${id}`);
    return trips.length > 0 ? trips[0] : null;
};

const getAll = async () => {
    return await getTripsWithPhotos();
};

const getUpcoming = async () => {
    return await getTripsWithPhotos("WHERE t.end_date >= CURDATE()");
};

const getPast = async () => {
    return await getTripsWithPhotos("WHERE t.end_date < CURDATE()");
};

const create = async (trip) => {
    return await baseRepository.create(trip);
};

const update = async (id, trip) => {
    return await baseRepository.update(id, trip);
};

const remove = async (id) => {
    return await baseRepository.remove(id);
};

const addPhotos = async (tripId, photoUrls) => {
    if (!photoUrls || photoUrls.length === 0) return;
    
    const values = photoUrls.map(url => [tripId, url]);
    const [result] = await pool.query(
        "INSERT INTO trip_photos (trip_id, photo_url) VALUES ?",
        [values]
    );
    return result;
};


export default {
    getAll,
    getById: getByIdWithPhotos,
    getUpcoming,
    getPast,
    create,
    update,
    remove,
    addPhotos
};
