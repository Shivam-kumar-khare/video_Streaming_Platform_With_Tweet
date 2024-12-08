import multer from "multer";

const storage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"../public/temp")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
});
export const upload =multer({storage})


/*
import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempPath = path.join(__dirname, "../public/temp");
        cb(null, tempPath); // Dynamic path resolution
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save with original file name
    },
});

// File filter for validation (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }
};

// Middleware export
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

*/