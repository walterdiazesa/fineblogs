import { AuthUser, getFirebaseAdmin } from "next-firebase-auth";
import withUserAuth from "../../../middlewares/withUserAuth";
import initAuth from "../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";

interface customrequest extends NextApiRequest {
  getUserJWT: AuthUser;
}

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (req.method === "PUT") {
    if (!req.body.uuid) {
      return res.status(200).json({ error: "Missed uuid parameter" });
    }

    try {
      const likeOwner = req.getUserJWT.email
        ? req.getUserJWT.email
        : req.getUserJWT.phoneNumber;

      const docRef = getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.body.uuid)
        .collection("likes")
        .doc(likeOwner!);

      let nowLiked;

      // Set like with known of if it already liked by the user
      if (req.body.isLikedByUser === undefined) {
        return res.status(200).json({ error: "Missed (Liked By User) info" });
      } else {
        nowLiked = !req.body.isLikedByUser;

        if (req.body.isLikedByUser) {
          await docRef.delete();
        } else {
          await docRef.set({});
        }
      }

      // Set like without known of if it already liked by the user (double query to Firestore)
      /* if ((await docRef.get()).exists) {
                await docRef.delete()
                nowLiked = false
            } else {
                await docRef.set({})
                nowLiked = true
            } */

      return res.status(200).json({ nowLiked });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(200).json({ error: e.message }); // 403
    }
  }
};

export default withUserAuth(handler);
