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
            const medical_record_data = await response.json();
            const requiredField = ['medical_record', 'vet', 'date'];
            const missingFields = requiredField.filter(field => !medical_record_data[field])

            if(!medical_record_data || !medical_record_data.formType){
                return{
                    status: 400,
                    body:JSON.stringify({error: 'Missing formType in request body.'})
                };
            }

            if(missingFields > 0){
                return{
                    status:400,
                    body:JSON.stringify({error: `Missing required field: ${missingFields.join(',')}`}),
                };
            }

            if(medical_record_data.formType !== "medical_record"){
                return{
                    status:400,
                    body: JSON.stringify({error: "Invalid formType. Only 'medical_record' is allowed."})
                };
            }

            const itemToSave ={
                ...medical_record_data,
                timestamp: new Date().toISOString
            };

            const database = client.database(dbName);
            const container = database.container("MedicalRecord");

            let resource;
            if(itemToSave.id){
                const { resource: updatedResource } = await container.items.upsert(itemToSave);
                resource = updatedResource;
            }
            else{
                const { resource: createdResource } = await container.items.upsert(itemToSave);
                resource = createdResource;
            }
            return{
                status: 200,
                body: JSON.stringify(resource),
            };
        }
        catch(error){
            context.log.error("Error saving medical record to Cosmos DB: ", error);
            return{
                status:500,
                body: JSON.stringify({ error: "Failed to save data." })
            };
        }
    }
});
