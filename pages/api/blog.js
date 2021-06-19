import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"
import { v4 as uuidv4 } from 'uuid'

const handler = async (req, res) => {
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400).json({ error: 'Missing Authorization header value' })
    }

    if (!req.body.formValues) {
        return res.status(400).json({ error: 'Missed blog parameters' })
    }

    if (req.body.formValues.length !== 2) {
        return res.status(400).json({ error: 'Title and body have to be especified' })
    }

    const token = req.headers.authorization
    
    if (token === 'unauthenticated') {
        return res.status(401).json({ error: 'unauthenticated' })
    }

    try {
        await verifyIdToken(token.replace("Bearer ", ""))

        const uuid = uuidv4()
        let createTime = Date.now()

        await getFirebaseAdmin().firestore().collection("blogs").doc(uuid).set({
            title: req.body.formValues[0],
            body: req.body.formValues[1],
            created_at: Date.now()
        }).then(({writeTime}) => createTime = writeTime)

        const newBlog = { _id: uuid, blog: { title: req.body.formValues[0], body : req.body.formValues[1] }, _date: createTime }

        return res.status(200).json(newBlog)
        
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return res.status(403).json({ error: 'Not authorized' })
    }

}

export default handler