import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as fs from "fs";
import * as path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export class S3Service {
  /**
   * Upload de arquivo a partir de um buffer
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: "profile" | "trips" | "activities",
    mimeType: string
  ): Promise<string> {
    const key = `${folder}/${Date.now()}-${fileName}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read",
      },
    });

    await upload.done();

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Upload de arquivo do sistema de arquivos local
   * (útil quando usando multer com diskStorage)
   */
  async uploadFromFile(
    filePath: string,
    folder: "profile" | "trips" | "activities"
  ): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const mimeType = this.getMimeType(fileName);

    const url = await this.uploadFile(fileBuffer, fileName, folder, mimeType);

    // Remove o arquivo local após upload
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.warn("Failed to delete local file:", filePath);
    }

    return url;
  }

  /**
   * Upload direto de um arquivo Multer (memoryStorage)
   */
  async uploadFromMulter(
    file: Express.Multer.File,
    folder: "profile" | "trips" | "activities"
  ): Promise<string> {
    if (file.buffer) {
      // memoryStorage
      return await this.uploadFile(
        file.buffer,
        file.originalname,
        folder,
        file.mimetype
      );
    } else if (file.path) {
      // diskStorage
      return await this.uploadFromFile(file.path, folder);
    } else {
      throw new Error("Invalid file object");
    }
  }

  /**
   * Deleta arquivo do S3
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extrai a key da URL
      const urlParts = fileUrl.split(".com/");
      if (urlParts.length < 2) {
        throw new Error("Invalid S3 URL format");
      }
      const key = urlParts[1];

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw error;
    }
  }

  /**
   * Obtém o MIME type baseado na extensão do arquivo
   */
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  /**
   * Verifica se uma URL é do S3
   */
  isS3Url(url: string): boolean {
    return url.includes("s3.") && url.includes(".amazonaws.com");
  }
}

export const s3Service = new S3Service();
