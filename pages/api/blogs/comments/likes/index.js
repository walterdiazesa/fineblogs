import { getFirebaseAdmin } from "next-firebase-auth"
import withUserAuth from '../../../../middlewares/withUserAuth'
import initAuth from "../../../../../utils/initAuth"

initAuth()

const handler = async (req, res) => {

    if (req.method === 'GET') {
        /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
        const likes = (await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.postuuid).collection("comments").doc(req.query.commentid).collection("likes").get()).docs
            
        const likesList = likes.map(like => like.id)

        return res.status(200).json(likesList)
    }
    
    if (req.method === 'PUT') {
        
        if (!req.body.bloguuid || !req.body.commentuuid) {
            return res.status(200).json({ error : 'Missed identifier parameter' })
        }
        
        try {

            const likeOwner = req.getUserJWT.email ? req.getUserJWT.email : req.getUserJWT.phoneNumber

            const docRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.body.bloguuid).collection('comments').doc(req.body.commentuuid).collection('likes').doc(likeOwner)
    
            let nowLiked
    
            // Set like with known of if it already liked by the user
            if (req.body.isLikedByUser === undefined) {
                return res.status(200).json({ error: 'Missed (Liked By User) info' })
            } else {
                nowLiked = !req.body.isLikedByUser
    
                if (req.body.isLikedByUser) {
                    await docRef.delete()
                } else {
                    await docRef.set({})
                }
            }
            
            // Set like without known of if it already liked by the user (double query to Firestore)
            /*if ((await docRef.get()).exists) {
                await docRef.delete()
                nowLiked = false
            } else {
                await docRef.set({})
                nowLiked = true
            }*/
        
            return res.status(200).json({ nowLiked })
    
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            return res.status(200).json({ error: e.message }) //403
        }
    }
}

export default withUserAuth(handler)