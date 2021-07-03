import { AuthUser, getFirebaseAdmin } from "next-firebase-auth";
import { v4 as uuidv4 } from "uuid";
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
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/

    const redisReplies = await redis.hvals(
      `replies:${req.query.postuuid}:${req.query.commentid}`
    );

    let redisData;

    if (redisReplies.length > 0) {
      redisData = redisReplies
        .map((reply) => JSON.parse(reply))
        .sort((a, b) => {
          return a.reply.created_at - b.reply.created_at;
        });
    } else {
      const replies = (
        await getFirebaseAdmin()
          .firestore()
          .collection("blogs")
          .doc(req.query.postuuid)
          .collection("comments")
          .doc(req.query.commentid)
          .collection("replies")
          .orderBy("created_at", "asc")
          .get()
      ).docs;

      const data = replies.map((reply) => {
        return { _id: reply.id, reply: reply.data(), _date: reply.createTime };
      });

      data.map(async (reply) => {
        await redis.hset(
          `replies:${req.query.postuuid}:${req.query.commentid}`,
          reply._id,
          JSON.stringify(reply)
        );
      });

      redisData = data;
    }

    /* console.log(`=== replies:${req.query.postuuid}:${req.query.commentid} ===`);
    console.log(data); */

    return res.status(200).json(redisData);
  }

  if (req.method === "POST") {
    if (!req.body.body) {
      return res.status(200).json({ error: "Missed reply body" }); // 400
    }

    if (req.body.body.trim().length === 0) {
      return res.status(200).json({ error: "Reply body have to be something" }); // 400
    }

    if (!req.body.postuuid || !req.body.postuuid) {
      return res
        .status(200)
        .json({ error: "Missed at least one identifier parameter" });
    }

    try {
      const uuid = uuidv4();
      let createTime: number | FirebaseFirestore.Timestamp = Date.now();

      const commentOwner = req.getUserJWT.email
        ? req.getUserJWT.email
        : req.getUserJWT.phoneNumber;

      await getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.body.postuuid)
        .collection("comments")
        .doc(req.body.commentid)
        .collection("replies")
        .doc(uuid)
        .set({
          created_by: commentOwner,
          body: req.body.body,
          created_at: Date.now(),
        })
        .then(({ writeTime }) => (createTime = writeTime));

      const newReply = {
        _id: uuid,
        reply: { body: req.body.body, created_by: commentOwner },
        _date: createTime,
      };

      /* console.log(
        await redis.hgetall(
          `replies:${req.body.postuuid}:${req.body.commentid}`
        )
      ); */

      await redis.hset(
        `replies:${req.body.postuuid}:${req.body.commentid}`,
        newReply._id,
        JSON.stringify(newReply)
      );

      /* console.log(
        await redis.hgetall(
          `replies:${req.body.postuuid}:${req.body.commentid}`
        )
      ); */

      return res.status(200).json(newReply);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(200).json({ error: e.message }); // 403
    }
  }
};

export default withUserAuth(handler);
