import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"

const handler = async (req, res) => {

    if (!(req.headers && req.headers.authorization)) {
        return res.status(200).json({ error: 'Missing Authorization header value' })//400
    }

    if (!req.query.uuid) {
        return res.status(200).json({ error: 'Missing identifier parameter' })//400
    }

    const token = req.headers.authorization

    if (token === 'unauthenticated') {
        return res.status(200).json({ error: 'unauthenticated' })//401
    }

    try {
        await verifyIdToken(token.replace("Bearer ", ""))

        /* If you wanna know in first instance if the blog exist you have to uncomment next lines, but
        firestore calls gets up by twice */

        const blog = await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.uuid).delete() //get

        return res.status(200).json({ blogDeleted: true })
        
        /*if (blog.exists) {
            return res.status(200).json({ blogDeleted: true })
        }

        return res.status(200).json({ error: `Blog with identifier "${req.query.uuid}" not found`, blogNotFound: true })//204*/
        
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return res.status(200).json({ error: 'Not authorized' })//403
    }

}

export default handler