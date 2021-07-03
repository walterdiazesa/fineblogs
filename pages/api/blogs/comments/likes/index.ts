import { AuthUser, getFirebaseAdmin } from "next-firebase-auth";
import withUserAuth from "../../../../middlewares/withUserAuth";
import initAuth from "../../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../../../../utils/redis";

interface customrequest extends NextApiRequest {
  getUserJWT: AuthUser;
  query: {
    postuuid: string;
    commentid: string;
  };
}

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    let likeData;

    const redisLikes = await redis.hkeys(
      `likes:${req.query.postuuid}:${req.query.commentid}`
    );

    if (redisLikes.length > 0) {
      likeData = JSON.parse(JSON.stringify(redisLikes));
    } else {
      /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
      const likes = (
        await getFirebaseAdmin()
          .firestore()
          .collection("blogs")
          .doc(req.query.postuuid)
          .collection("comments")
          .doc(req.query.commentid)
          .collection("likes")
          .get()
      ).docs;

      const likesList = likes.map((like) => like.id);
      likeData = likesList;

      likesList.map(async (like) => {
        await redis.hset(
          `likes:${req.query.postuuid}:${req.query.commentid}`,
          like,
          ""
        );
      });
    }

    return res.status(200).json(likeData);
  }

  if (req.method === "PUT") {
    if (!req.body.bloguuid || !req.body.commentuuid) {
      return res.status(200).json({ error: "Missed identifier parameter" });
    }

    try {
      const likeOwner = req.getUserJWT.email
        ? req.getUserJWT.email
        : req.getUserJWT.phoneNumber;

      const docRef = getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.body.bloguuid)
        .collection("comments")
        .doc(req.body.commentuuid)
        .collection("likes")
        .doc(likeOwner!);

      let nowLiked;

      // Set like with known of if it already liked by the user
      if (req.body.isLikedByUser === undefined) {
        return res.status(200).json({ error: "Missed (Liked By User) info" });
      } else {
        nowLiked = !req.body.isLikedByUser;

        /* const redisLikes = await redis.hkeys(
          `likes:${req.body.bloguuid}:${req.body.commentuuid}`
        ); */

        if (req.body.isLikedByUser) {
          await redis.hdel(
            `likes:${req.body.bloguuid}:${req.body.commentuuid}`,
            likeOwner!
          );

          await docRef.delete();
        } else {
          await redis.hset(
            `likes:${req.body.bloguuid}:${req.body.commentuuid}`,
            likeOwner!,
            ""
          );

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
