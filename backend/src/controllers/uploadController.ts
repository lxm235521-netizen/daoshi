import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: '没有上传文件' });
    return;
  }
  
  // Return the public URL mapping to the uploads folder
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
};
