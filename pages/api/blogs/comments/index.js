import { v4 as uuidv4 } from 'uuid'
import withUserAuth from "../../../middlewares/withUserAuth"
import { getFirebaseAdmin } from "next-firebase-auth"
import initAuth from "../../../../utils/initAuth"

initAuth()

const handler = async (req, res) => {

    if (req.method === 'POST') {

        if (!req.body.body) {
            return res.status(200).json({ error: 'Missed comment body' }) //400
        }
    
        if (req.body.body.trim().length === 0) {
            return res.status(200).json({ error: 'Comment body have to be something' }) //400
        }
    
        if (!req.body.uuid) {
            return res.status(200).json({ error: 'Missed identifier parameter' })
        }
    
        try {
            
            const uuid = uuidv4()
            let createTime = Date.now()
    
            const commentOwner = req.getUserJWT.email ? req.getUserJWT.email : req.getUserJWT.phoneNumber

            await getFirebaseAdmin().firestore().collection("blogs").doc(req.body.uuid).collection('comments').doc(uuid).set({
                created_by: commentOwner,
                body: req.body.body,
                created_at: Date.now()
            }).then(({writeTime}) => createTime = writeTime)
    
            const newComment = { _id: uuid, comment: { body: req.body.body, created_by: commentOwner }, _date: createTime }
    
            return res.status(200).json(newComment)
            
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            return res.status(200).json({ error: e.message }) //403
        }
    }
}

export default withUserAuth(handler)