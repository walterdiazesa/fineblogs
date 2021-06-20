import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"

const handler = async (req, res) => {
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400).json({ error: 'You have to be logged to like a blog' })
    }

    if (!req.body.uuid) {
        return res.status(200).json({ error : 'Missed uuid parameter' })
    }

    const token = req.headers.authorization
    
    if (token === 'unauthenticated') {
        return res.status(200).json({ error: 'unauthenticated' })
    }
    
    try {
        const userJWT = await verifyIdToken(token.replace("Bearer ", ""))
        
        const docRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.body.uuid).collection('likes').doc(userJWT.email)

        let nowLiked

        if ((await docRef.get()).exists) {
            await docRef.delete()
            nowLiked = false
        } else {
            await docRef.set({})
            nowLiked = true
        }
    
        return res.status(200).json({ nowLiked })

    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return res.status(200).json({ error: 'Not authorized' }) //403
    }
}

export default handler