const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Attachment = require('../models/attachment');
const logger = require('../utils/logger');

// Setup storage
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.mp4', '.mov', '.avi',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar',
    '.mp3', '.ogg', '.wav', '.m4a'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file extension'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max size
});

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    let filePath = req.file.path;
    let fileName = req.file.filename;
    let fileSize = req.file.size;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Determine file type category
    let fileType = 'document';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
      fileType = 'photo';
      
      // Image compression using Sharp
      const compressedFileName = 'compressed-' + fileName;
      const compressedPath = path.join(uploadDir, compressedFileName);
      
      try {
        await sharp(filePath)
          .resize({ width: 1200, withoutEnlargement: true }) // Downscale if very large
          .jpeg({ quality: 80 })
          .toFile(compressedPath);
          
        // Delete original uncompressed image to save disk space
        fs.unlinkSync(filePath);
        
        filePath = compressedPath;
        fileName = compressedFileName;
        fileSize = fs.statSync(compressedPath).size;
      } catch (err) {
        logger.error(`Sharp compression failed, keeping original: ${err.message}`);
      }
    } else if (['.mp4', '.mov', '.avi'].includes(fileExt)) {
      fileType = 'video';
    } else if (['.mp3', '.ogg', '.wav', '.m4a'].includes(fileExt)) {
      fileType = 'audio';
    }
    
    // Generate access URL
    const fileUrl = `/uploads/${fileName}`;
    
    const attachment = await Attachment.create({
      fileId: req.body.fileId || '', // Telegram file_id if provided by bot
      fileType,
      fileUrl,
      fileName: req.file.originalname,
      fileSize
    });
    
    logger.info(`File uploaded and registered: ${attachment._id} (${req.file.originalname})`);
    
    res.status(200).json({
      success: true,
      data: attachment
    });
  } catch (error) {
    logger.error(`uploadFile error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Server error uploading file' });
  }
};
