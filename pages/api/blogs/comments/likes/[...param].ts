import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // blogid, commentid

  if (req.query.param.length !== 2) {
    return res
      .status(200)
      .json({ error: "You must to especify the blog and comment ids" });
  }
  /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
  const likes = (
    await getFirebaseAdmin()
      .firestore()
      .collection("blogs")
      .doc(req.query.param[0])
      .collection("comments")
      .doc(req.query.param[1])
      .collection("likes")
      .get()
  ).docs;

  const likesList = likes.map((like) => like.id);

  return res.status(200).json(likesList);
};

export default handler;
