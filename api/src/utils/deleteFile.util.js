import fs from "fs/promises";

/**
 * 
 * @param {*} Array of file paths
 */
export async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (err) {
      console.error(`Error deleting file: ${file}`, err.message);
    }
  }
}