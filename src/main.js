import { Client, Databases, Query, ID } from 'node-appwrite';

// This Appwrite function will be executed every time submission's status change to insert record in submission history table
export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const db = new Databases(client);

  try {
    const body = req.body;
    const submissionHistoryCollectionId = 'Submission_History';
    log(`Body: ${JSON.stringify(body)}`);
    log(`Database ID: ${body.$databaseId}`);
    log(`Collection ID: ${body.$collectionId}`);
    log(`Document ID: ${body.$id}`);
    const prevSubmissionHistoryDoc = await db.listDocuments(body.$databaseId, submissionHistoryCollectionId, [
      Query.equal('submission', body.$id),
      Query.orderDesc("$updatedAt")
    ]);
    log(`Previous Submission: ${JSON.stringify(prevSubmissionHistoryDoc)}`);
    const submissionHistoryDoc = await db.createDocument(body.$databaseId, submissionHistoryCollectionId, ID.unique(),
    {
      changed_by_username: 'jsantoso',
      previous_status: prevSubmissionHistoryDoc.documents[0].next_status,
      next_status: submissionDoc.status,
      changed_at: body.$updatedAt,
      submission: body,
    });
    log(submissionHistoryDoc);
  } catch(err) {
    error(`Error occurred: ${err.message}`);
  }

  return res.json(submissionHistoryDoc);
};
