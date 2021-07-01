import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    if (req.query.param.length === 2) {
      try {
        const likesCount = (
          await getFirebaseAdmin()
            .firestore()
            .collection("blogs")
            .doc(req.query.param[0])
            .collection("likes")
            .get()
        ).docs.length;

        return res.status(200).json({ likesCount });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return res.status(200).json({ error: e.message }); // 403
      }
    }
  }
};

export default handler;
