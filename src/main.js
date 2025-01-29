import { Client, Databases } from 'node-appwrite';

// This Appwrite function will be executed every time submission's status change to insert record in submission history table
export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const db = new Databases(client);

  try {
    const body = req.body;
    log(`Database ID: ${body.$databaseId}`);
    log(`Collection ID: ${body.$collectionId}`);
    log(`Document ID: ${body.$id}`);
    const submissionDoc = await db.getDocument(body.$databaseId, body.$collectionId, body.$id);
    log(`Submission: ${JSON.stringify(submissionDoc)}`);
    const submissionHistoryDoc = await db.createDocument(body.$databaseId, body.$collectionId, ID.unique(),
    {
      changed_by_username: 'jsantoso',
      previous_status: body.status,
      next_status: submissionDoc.status,
      changed_at: body.$updatedAt,
      submission: body.$id,
    });
    log(submissionHistoryDoc);
  } catch(err) {
    error(`Error occurred: ${err.message}`);
  }

  return res.json(submissionHistoryDoc);
};
