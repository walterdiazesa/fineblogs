import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"

const handler = async (req, res) => {
    
    if (!(req.headers && req.headers.authorization)) {
        return res.status(200).json({ error: 'Missing Authorization header value' })//400
    }

    if (!req.body.postuuid || !req.body.commentid) {
        return res.status(200).json({ error: 'Missing identifier parameter' })//400
    }

    const token = req.headers.authorization

    if (token === 'unauthenticated') {
        return res.status(200).json({ error: 'unauthenticated' })//401
    }

    try {
        const getUserJWT = await verifyIdToken(token.replace("Bearer ", ""))

        const commentRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.body.postuuid).collection('comments').doc(req.body.commentid)
        const commentOwner = (await commentRef.get()).data()

        if (getUserJWT.email !== commentOwner.created_by) {
            return res.status(200).json({ error: "You're not the comment owner, you have no permissions to do this action" })
        }

        await commentRef.delete()
        //const commentExist = (await commentRef.get()).exists

        return res.status(200).json({ commentDeleted: true })
        
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return res.status(200).json({ error: 'Not authorized' })//403
    }

}

export default handler