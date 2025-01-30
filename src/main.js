import { Client, Databases, Query, ID } from 'node-appwrite';

// This Appwrite function will be executed every time submission's status change to insert record in submission history table
export default async ({ req, res, log, error }) => {

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey('standard_8faff3a756ff55bfa075dbe8a6d7abcf1996642b452215e95fcc8a5f119a4952a51ec5349676b17deb75c142f851ef8cae3b60c1ccd68676dac1ed034b84526c501b8064d672a62c2e4fc59b6c9d00706688a27640b12525a18aa531c87074971f2ea8575462595f91d6b26ed5885ace56b4a9301ca78c05b4d471caa12158df');
    // .setKey(req.headers['x-appwrite-key'] ?? '');
  const db = new Databases(client);

  try {
    log(client);
    log(req);

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

    log(`New Status: ${prevSubmissionHistoryDoc.documents[0].new_status}`);
    const submissionHistoryDoc = await db.createDocument(body.$databaseId, submissionHistoryCollectionId, ID.unique(),
    {
      changed_by_username: 'jsantoso',
      previous_status: prevSubmissionHistoryDoc.documents[0].new_status,
      next_status: body.status,
      changed_at: body.$updatedAt,
      submission: body.$id,
    });
    log(submissionHistoryDoc);
  } catch(err) {
    error(`Error occurred: ${JSON.stringify(err)}`);
  }

  return res.json({success: true});
};
