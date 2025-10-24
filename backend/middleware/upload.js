import fileUpload from 'express-fileupload';

export const upload = fileUpload({
  useTempFiles: true,       
  tempFileDir: '/tmp/',     
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB for video uploads
  abortOnLimit: true,
  createParentPath: true,
});
