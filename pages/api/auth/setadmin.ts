import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../utils/initAuth";
import { NextApiRequest, NextApiResponse } from "next";

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
  const USER_UID = "gqVFiBCqI1afC49cglci9sBOJS33";

  getFirebaseAdmin().auth().setCustomUserClaims(USER_UID, { admin: true });

  return res.status(200).json({ result: `${USER_UID} is now an admin` });
};

export default handler;
