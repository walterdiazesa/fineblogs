import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
    const replies = (await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.postuuid).collection("comments").doc(req.query.commentid).collection("replies").orderBy('created_at', 'asc').get()).docs
    
    const data = replies.map((reply) => {
        return { _id: reply.id, reply: reply.data(), _date: reply.createTime }
    })

    return res.status(200).json(data)
}

export default handler