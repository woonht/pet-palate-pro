const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('SaveMedicalRecord', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('SaveMedicalRecord triggered.');

        try{
            const medical_record_data = await request.json();
            const requiredField = ['medical_record', 'vet', 'date'];
            const missingFields = requiredField.filter(field => !medical_record_data[field])

            if(!medical_record_data || !medical_record_data.formType){
                return{
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    body:JSON.stringify({error: 'Missing formType in request body.'})
                };
            }

            if(missingFields > 0){
                return{
                    status:400,
                    headers: { "Content-Type": "application/json" },
                    body:JSON.stringify({error: `Missing required field: ${missingFields.join(',')}`}),
                };
            }

            if(medical_record_data.formType !== "medical_record"){
                return{
                    status:400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({error: "Invalid formType. Only 'medical_record' is allowed."})
                };
            }

            const itemToSave ={
                ...medical_record_data,
                timestamp: new Date().toISOString
            };

            const database = client.database(dbName);
            const container = database.container("MedicalRecords");

            itemToSave.id = `${medical_record_data.userID}_${medical_record_data.timeID}_${medical_record_data.device_id}`;
            itemToSave.recID = itemToSave.id;

            const { resource } = await container.items.upsert(itemToSave);

            return{
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resource),
            };
        }
        catch(error){
            context.log.error("Error saving medical record to Cosmos DB: ", error);
            return{
                status:500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Failed to save data." })
            };
        }
    }
});
