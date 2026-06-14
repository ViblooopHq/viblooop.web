import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";
import fs from "fs";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });

const BUCKET_NAME = process.env.BUCKET_NAME;


/**
 * Uploads both images to a user-specific S3 folder and compares them.
 * @param {string} userId - Unique identifier for the user (e.g., database ID)
 * @param {string} selfiePath - Path of the live selfie photo
 * @param {string} idPath - Path of the ID card/Reference photo
 */
export async function verifyFace(userId, selfiePath, idPath) {
    // Define clean, organized keys inside a user-specific folder
    const userFolder = `users/${userId}`;
    const selfieKey = `${userFolder}/selfie.jpg`;
    const idKey = `${userFolder}/id-card.jpg`;

    try {
        // 1. Upload both images to S3 simultaneously
        console.log(`Uploading photos to S3 folder: ${userFolder}...`);
        await Promise.all([
            s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: selfieKey,
                Body: fs.createReadStream(selfiePath),
                ContentType: "image/jpeg"
            })),
            s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: idKey,
                Body: fs.createReadStream(idPath),
                ContentType: "image/jpeg"
            }))
        ]);
        console.log("✅ Both images uploaded successfully to S3.");

        // 2. Compare the two freshly uploaded images in S3
        const compareParams = {
            SourceImage: {
                S3Object: {
                    Bucket: BUCKET_NAME,
                    Name: idKey, // The trusted ID card photo
                }
            },
            TargetImage: {
                S3Object: {
                    Bucket: BUCKET_NAME,
                    Name: selfieKey, // The live selfie photo
                }
            },
            SimilarityThreshold: 85 // Standard matching accuracy threshold
        };

        console.log("Analyzing faces with Amazon Rekognition...");
        const response = await rekognitionClient.send(new CompareFacesCommand(compareParams));

        // 3. Evaluate results
        if (response.FaceMatches && response.FaceMatches.length > 0) {
            const matchAccuracy = response.FaceMatches[0].Similarity;
            console.log(`✅ Verification Passed! Match accuracy: ${matchAccuracy.toFixed(2)}%`);

            return {
                verified: true,
                similarity: matchAccuracy,
                selfieUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${selfieKey}`,
                idUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${idKey}`
            };
        } else {
            console.log("❌ Verification Failed: The faces do not match.");
            return { verified: false, similarity: 0 };
        }

    } catch (error) {
        console.error("Error during upload and verification process:", error);
        throw error;
    }
}