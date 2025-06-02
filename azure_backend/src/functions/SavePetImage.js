const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require("@azure/cosmos");
const multipart = require('parse-multipart');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const blobConnectionString = process.env.BLOB_CONN_STR;
const blobContainerName = process.env.BLOB_CONTAINER;

const client = new CosmosClient({ endpoint, key });
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);

app.http('UploadPetImage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('UploadPetImage function triggered.');

        try {
            const contentType = request.headers.get("content-type") || "";
            if (!contentType.includes("multipart/form-data")) {
                return {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Expected multipart/form-data" })
                };
            }

            const bodyBuffer = Buffer.from(await request.arrayBuffer());
            const boundary = multipart.getBoundary(contentType);
            const parts = multipart.Parse(bodyBuffer, boundary);

            const file = parts.find(p => p.filename);
            const userID = parts.find(p => p.name === "userID")?.data.toString();
            const deviceID = parts.find(p => p.name === "device_id")?.data.toString();

            if (!file || !userID || !deviceID) {
                return {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Missing file or identifiers." })
                };
            }

            // Upload to Blob
            const fileName = `${userID}_${deviceID}_${Date.now()}.jpg`;
            const containerClient = blobServiceClient.getContainerClient(blobContainerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);

            await blockBlobClient.uploadData(file.data, {
                blobHTTPHeaders: { blobContentType: file.type }
            });

            const imageUrl = blockBlobClient.url;

            // Update Cosmos DB
            const database = client.database(dbName);
            const container = database.container('BasicInfo');
            const id = `${userID}_${deviceID}`;

            const query = {
                query: 'SELECT * FROM c WHERE c.userID = @userID AND c.device_id = @device_id',
                parameters: [
                    { name: '@userID', value: userID },
                    { name: '@device_id', value: deviceID }
                ]
            };

            const { resources: items } = await container.items.query(query).fetchAll();

            if (items.length === 0) {
                return {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "No document found with the given userID and device_id." })
                };
            }

            const doc = items[0];
            doc.petImageUrl = imageUrl;

            await container.item(doc.id, doc.id).replace(doc);

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl })
            };
        } 
        catch (err) {
            context.log.error("Upload error:", err);
            return {
                status: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Failed to upload image", detail: err.message })
            };
        }
    }
});
