import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"
import initAuth from "../../../../utils/initAuth"

initAuth()

const handler = async (req, res) => {
    
    if (req.method === 'GET') {

        if (req.query.param.length === 2) {
            
            try {
                
                const commentsCount = (await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.param[0]).collection('comments').get()).docs.length
                
                return res.status(200).json({ commentsCount })
        
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e)
                return res.status(200).json({ error: e.message }) //403
            }
        }
        
    }
}

export default handler