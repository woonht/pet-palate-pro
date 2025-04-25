const { CosmosClient } = require("@azure/cosmos")

const endpoint = process.env.COSMOS_URI
const key = process.env.COSMOS_KEY
const dbName = process.env.COSMOS_DB_NAME
const client = new CosmosClient({ endpoint, key }) //used to interact with the database (read/write operations)

module.exports = async function (context, req) {
    const data = req.body

    if (!data || !data.formType) {
        context.res = {
            status: 400,
            body: "Missing formType in request body.",
        }
        return
    }

    const containerName = {
        basic_info: "BasicInfo",
        personality_habit: "PersonalityHabit",
        medical_record: "MedicalRecord",
        prescription: "Prescription"
    }[data.formType]

    if (!containerName) {
        context.res = {
            status: 400,
            body: "Invalid formType value."
        }
        return
    }

    const database = client.database(dbName)
    const container = database.container(containerName)

    const itemToSave = { ...data }
    delete itemToSave.formType

    const { resource } = await container.items.create(itemToSave) //creates a new item in the container

    context.res = {
        status: 200,
        body: resource,
    };
}