import { diskStorage } from "multer";
import { randomUUID } from 'crypto';
import * as fs from 'fs';

const upload = (destinationPath: string) => {
    return {
        storage: diskStorage({
            destination: (req, file, callback) => {
                if (!fs.existsSync(destinationPath)) {
                    fs.mkdirSync(destinationPath, { recursive: true });
                }
                callback(null, destinationPath);
            },

            filename: (req, file, cb) => {
                const filename: string = 'file-' + randomUUID() + "." + file.mimetype.split("/")[1]
                cb(null, filename);
            },

        }),
        any() {

        }
    };
}

export { upload }