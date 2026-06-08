import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const form = formidable({
      multiples: false,
      maxFileSize: 8 * 1024 * 1024,
      filter: ({ mimetype }) => mimetype?.startsWith("image/"),
    });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (error, fields, files) => {
        if (error) reject(error);
        else resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const upload = await cloudinary.uploader.upload(file.filepath, {
      folder: "relayed/chat-images",
      resource_type: "image",
      transformation: [
        {
          width: 1600,
          height: 1600,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      attachment: {
        url: upload.secure_url,
        type: "image",
        name: file.originalFilename || "image",
        size: file.size || 0,
        width: upload.width,
        height: upload.height,
      },
    });
  } catch (error) {
    console.error("UPLOAD_CHAT_IMAGE_ERROR", error);
    return res.status(500).json({ message: "Image upload failed" });
  }
}