import { getFirebaseAdmin } from "next-firebase-auth"
import { v4 as uuidv4 } from 'uuid'
import withUserAuth from "../../../../middlewares/withUserAuth"
import initAuth from "../../../../../utils/initAuth"

initAuth()

const handler = async (req, res) => {
    
    if (req.method === 'GET') {
    
        /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
        const replies = (await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.postuuid).collection("comments").doc(req.query.commentid).collection("replies").orderBy('created_at', 'asc').get()).docs
        
        const data = replies.map((reply) => {
            return { _id: reply.id, reply: reply.data(), _date: reply.createTime }
        })

        return res.status(200).json(data)
    }

    if (req.method === 'POST') {
        if (!req.body.body) {
            return res.status(200).json({ error: 'Missed reply body' }) //400
        }
    
        if (req.body.body.trim().length === 0) {
            return res.status(200).json({ error: 'Reply body have to be something' }) //400
        }
    
        if (!req.body.postuuid || !req.body.postuuid) {
            return res.status(200).json({ error: 'Missed at least one identifier parameter' })
        }
    
        try {
            
            const uuid = uuidv4()
            let createTime = Date.now()
    
            const commentOwner = req.getUserJWT.email ? req.getUserJWT.email : req.getUserJWT.phoneNumber

            await getFirebaseAdmin().firestore().collection("blogs").doc(req.body.postuuid).collection('comments').doc(req.body.commentid).collection('replies').doc(uuid).set({
                created_by: commentOwner,
                body: req.body.body,
                created_at: Date.now()
            }).then(({writeTime}) => createTime = writeTime)
    
            const newReply = { _id: uuid, reply: { body: req.body.body, created_by: commentOwner }, _date: createTime }
    
            return res.status(200).json(newReply)
            
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            return res.status(200).json({ error: e.message }) //403
        }
    }
}

export default withUserAuth(handler)