import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"

const handler = async (req, res) => {
    
    if (!(req.headers && req.headers.authorization)) {
        return res.status(200).json({ error: 'Missing Authorization header value' })//400
    }

    if (!req.body.bloguuid || !req.body.commentuuid || !req.body.replyid) {
        return res.status(200).json({ error: 'Missing identifier parameter' })//400
    }

    const token = req.headers.authorization

    if (token === 'unauthenticated') {
        return res.status(200).json({ error: 'unauthenticated' })//401
    }

    try {
        const getUserJWT = await verifyIdToken(token.replace("Bearer ", ""))

        const replyRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.body.bloguuid).collection('comments').doc(req.body.commentuuid).collection("replies").doc(req.body.replyid)
        const replyOwner = (await replyRef.get()).data()

        if (getUserJWT.email !== replyOwner.created_by) {
            return res.status(200).json({ error: "You're not the reply owner, you have no permissions to do this action" })
        }

        await replyRef.delete()
        //const commentExist = (await commentRef.get()).exists

        return res.status(200).json({ replyDeleted: true })
        
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return res.status(200).json({ error: 'Not authorized' })//403
    }

}

export default handler