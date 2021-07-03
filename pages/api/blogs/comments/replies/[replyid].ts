import { AuthUser, getFirebaseAdmin } from "next-firebase-auth";
import withUserAuth from "../../../../middlewares/withUserAuth";
import initAuth from "../../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../../../../utils/redis";

interface customrequest extends NextApiRequest {
  getUserJWT: AuthUser;
  query: {
    bloguuid: string;
    commentuuid: string;
    replyid: string;
  };
}

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (req.method === "DELETE") {
    if (!req.query.bloguuid || !req.query.commentuuid || !req.query.replyid) {
      return res.status(200).json({ error: "Missing identifier parameter" }); // 400
    }

    try {
      const replyRef = getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.query.bloguuid)
        .collection("comments")
        .doc(req.query.commentuuid)
        .collection("replies")
        .doc(req.query.replyid);
      const replyOwner = (await replyRef.get()).data();

      if (
        (req.getUserJWT.email
          ? req.getUserJWT.email
          : req.getUserJWT.phoneNumber) !== replyOwner!.created_by
      ) {
        return res.status(200).json({
          error:
            "You're not the reply owner, you have no permissions to do this action",
        });
      }

      await redis.hdel(
        `replies:${req.query.bloguuid}:${req.query.commentuuid}`,
        req.query.replyid
      );
      await replyRef.delete();
      // const commentExist = (await commentRef.get()).exists

      return res.status(200).json({ replyDeleted: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(200).json({ error: e.message }); // 403
    }
  }
};

export default withUserAuth(handler);
