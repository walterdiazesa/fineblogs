import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
    const likes = (await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.postuuid).collection("comments").doc(req.query.commentid).collection("likes").get()).docs
    
    const likesList = likes.map(like => like.id)

    return res.status(200).json(likesList)
}

export default handler