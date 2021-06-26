import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"
import withUserAuth from "../../../../middlewares/withUserAuth"

const handler = async (req, res) => {
    
    if (req.method === 'DELETE') {
        
        if (!req.query.bloguuid || !req.query.commentuuid || !req.query.replyid) {
            return res.status(200).json({ error: 'Missing identifier parameter' })//400
        }
    
        try {
            
            const replyRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.query.bloguuid).collection('comments').doc(req.query.commentuuid).collection("replies").doc(req.query.replyid)
            const replyOwner = (await replyRef.get()).data()
    
            if (req.getUserJWT.email !== replyOwner.created_by) {
                return res.status(200).json({ error: "You're not the reply owner, you have no permissions to do this action" })
            }
    
            await replyRef.delete()
            //const commentExist = (await commentRef.get()).exists
    
            return res.status(200).json({ replyDeleted: true })
            
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            return res.status(200).json({ error: e.message })//403
        }
    }
}

export default withUserAuth(handler)