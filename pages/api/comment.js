import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"
import { v4 as uuidv4 } from 'uuid'

const handler = async (req, res) => {
    if (!(req.headers && req.headers.authorization)) {
        return res.status(200).json({ error: 'Missing Authorization header value' }) //400
    }

    if (!req.body.body) {
        return res.status(200).json({ error: 'Missed comment body' }) //400
    }

    if (req.body.body.trim().length === 0) {
        return res.status(200).json({ error: 'Comment body have to be something' }) //400
    }

    const token = req.headers.authorization
    
    if (token === 'unauthenticated') {
        return res.status(200).json({ error: 'unauthenticated' }) //401
    }

    try {
        const userOwner = await verifyIdToken(token.replace("Bearer ", ""))

        // If get here, the user is an valid user, but not necessary an admin user... yet
        // If get here, the user is an admin type user, congratulations!

        const uuid = uuidv4()
        let createTime = Date.now()

        await getFirebaseAdmin().firestore().collection("blogs").doc(req.body.uuid).collection('comments').doc(uuid).set({
            created_by: userOwner.email,
            body: req.body.body,
            created_at: Date.now()
        }).then(({writeTime}) => createTime = writeTime)

        const newComment = { _id: uuid, comment: { body: req.body.body, created_by: userOwner.email }, _date: createTime }

        return res.status(200).json(newComment)
        
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return res.status(200).json({ error: 'Not authorized' }) //403
    }

}

export default handler