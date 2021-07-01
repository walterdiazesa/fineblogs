import { AuthUser, getFirebaseAdmin } from "next-firebase-auth";
import withUserAuth from "../../../middlewares/withUserAuth";
import initAuth from "../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";

interface customrequest extends NextApiRequest {
  getUserJWT: AuthUser;
  query: {
    postuuid: string;
    commentid: string;
  };
}

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (req.method === "DELETE") {
    if (!req.query.postuuid || !req.query.commentid) {
      return res.status(200).json({ error: "Missing identifier parameter" }); // 400
    }

    try {
      const commentRef = getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.query.postuuid)
        .collection("comments")
        .doc(req.query.commentid);
      const commentOwner = (await commentRef.get()).data();

      if (
        (req.getUserJWT.email
          ? req.getUserJWT.email
          : req.getUserJWT.phoneNumber) !== commentOwner!.created_by
      ) {
        return res.status(200).json({
          error:
            "You're not the comment owner, you have no permissions to do this action",
        });
      }

      await commentRef.delete();
      // const commentExist = (await commentRef.get()).exists

      return res.status(200).json({ commentDeleted: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(200).json({ error: e.message }); // 403
    }
  }
};

export default withUserAuth(handler);
