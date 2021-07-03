import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../../../utils/redis";
import { Comment } from "../../../../types/interactions";

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    if (req.query.param.length === 2) {
      try {
        const redisComments = await redis.get(
          `blogs:${req.query.param[0]}:comments`
        );

        let dataComments;

        if (redisComments) {
          dataComments = (JSON.parse(redisComments) as Comment[]).length;
        } else {
          const commentsCount = (
            await getFirebaseAdmin()
              .firestore()
              .collection("blogs")
              .doc(req.query.param[0])
              .collection("comments")
              .orderBy("created_at", "desc")
              .get()
          ).docs;

          dataComments = commentsCount.length;

          const comments = commentsCount.map((comment) => {
            return {
              _id: comment.id,
              comment: comment.data(),
              _date: comment.createTime,
            };
          });

          await redis.set(
            `blogs:${req.query.param[0]}:comments`,
            JSON.stringify(comments)
          );
        }

        return res.status(200).json({ commentsCount: dataComments });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return res.status(200).json({ error: e.message }); // 403
      }
    }
  }
};

export default handler;
