const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key }); //used to interact with the database (read/write operations), endpoint specific where is the db, key means i am allowed to access

const BLOB_CONN_STR = process.env.BLOB_CONN_STR;
const BLOB_CONTAINER = process.env.BLOB_CONTAINER;

app.http("UploadPetImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("UploadPetImage function triggered.");

    try {
      const data = await request.json();
      const userID = data.userID;
      const device_id = data.device_id;

      if (!data || !userID || !device_id) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing base64 image, userID or device_id in request body." }),
        };
      }

      const database = client.database(dbName);
      const container = database.container("BasicInfo");
      const infoID = `${userID}_${device_id}`

      const { resource:existingRecord } = await container.item(infoID, infoID).read();

      if(!existingRecord){
        return{
          status: 404,
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({error: 'Pet record not found.'})
        };
      }

      let blobUrl = null;

      if(!data.image){
        existingRecord.petImageUrl = '';
      }
      else{
        // Strip base64 prefix if included (like "data:image/jpeg;base64,")
        const base64Image = data.image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Image, "base64");
        const blobName = `${uuidv4()}.jpg`;

        const blobServiceClient = BlobServiceClient.fromConnectionString(BLOB_CONN_STR);
        const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER);

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(buffer, {
          blobHTTPHeaders: { blobContentType: "image/jpeg" },
        });

        blobUrl = `${containerClient.url}/${blobName}`;
        existingRecord.petImageUrl = blobUrl; 
      }

      const { resource:updatedResource } = await container.items.upsert(existingRecord);

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Image uploaded and saved to database successfully", url: blobUrl, updatedResource }),
      };
    } 
    catch (error) {
      context.log.error("Upload failed:", error);
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Server error: " + error.message }),
      };
    }
  },
});
