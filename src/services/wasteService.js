import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    doc,
    setDoc,
    deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "waste_records";

export const wasteService = {
    // Add a new waste record
    addRecord: async (data, userId) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...data,
                recordedBy: userId,
                date: Timestamp.now(), // Use server timestamp for consistency
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1 // 1-12
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding waste record: ", error);
            throw error;
        }
    },

    // Get all records (for dashboard)
    getAllRecords: async () => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting waste records: ", error);
            throw error;
        }
    },

    // Get records by year (for yearly stats)
    getRecordsByYear: async (year) => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("year", "==", year),
                orderBy("date", "desc")
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting yearly records: ", error);
            throw error;
        }
    },

    // Update a waste record
    updateRecord: async (recordId, data) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, recordId);
            await setDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating waste record: ", error);
            throw error;
        }
    },

    // Delete a waste record
    deleteRecord: async (recordId) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, recordId));
        } catch (error) {
            console.error("Error deleting waste record: ", error);
            throw error;
        }
    }
};

// Hierarchy Definitions based on the image
export const WASTE_CATEGORIES = {
    "Organic": {
        label: "ขยะอินทรีย์",
        subCategories: {
            "Food Waste": { label: "เศษอาหาร", items: ["ชั่งน้ำหนัก", "ขายเป็นอาหารสัตว์"] }
        }
    },
    "Recycle": {
        label: "ขยะรีไซเคิล",
        subCategories: {
            "Plastic": {
                label: "พลาสติก",
                items: ["ขวดรวมฝา", "ขวดแยกฝา", "ฝาขวด"]
            },
            "Metal": {
                label: "โลหะ",
                items: ["อลูมิเนียม (กระป๋อง/ฝา)", "อื่นๆ"]
            },
            "Other": {
                label: "อื่นๆ",
                items: ["ชั่งน้ำหนัก", "ขาย"]
            },
            "Glass": { // Added based on common recycling, though image is a bit blurry on 'Other'
                label: "แก้ว/กระดาษ",
                items: ["ชั่งน้ำหนัก"]
            }
        }
    },
    "General": {
        label: "ขยะทั่วไป",
        subCategories: {
            "Combustible": { label: "เผาได้", items: ["ชั่งน้ำหนัก", "ขายเป็น RDF"] },
            "NonCombustible": { label: "เผาไม่ได้", items: ["ชั่งน้ำหนัก", "ส่งต่อ กทม."] }
        }
    }
};
