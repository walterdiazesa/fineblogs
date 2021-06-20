import { getFirebaseAdmin, verifyIdToken } from "next-firebase-auth"

const handler = async (req, res) => {

    if (!(req.headers && req.headers.authorization)) {
        return res.status(200).json({ error: 'Missing Authorization header value' })//400
    }

    if (!req.body.uuid) {
        return res.status(200).json({ error: 'Missing identifier parameter' })//400
    }

    const token = req.headers.authorization

    if (token === 'unauthenticated') {
        return res.status(200).json({ error: 'unauthenticated' })//401
    }

    try {
        const isAdmin = await verifyIdToken(token.replace("Bearer ", ""))

        // If get here, the user is an valid user, but not necessary an admin user... yet

        if (!isAdmin.claims.admin) {
            return res.status(200).json({ error: "You're not an admin, you have no permissions to do this action" })
        }

        // If get here, the user is an admin type user, congratulations!

        /* If you wanna know in first instance if the blog exist you have to uncomment next lines, but
        firestore calls gets up by twice */

        let blogFields = {}

        if (req.body.fieldUpdated === 1) {
            blogFields = { title: req.body.formValues[0] }
        } else if (req.body.fieldUpdated === 2) {
            blogFields = { body: req.body.formValues[1] }
        } else if (req.body.fieldUpdated === 3) {
            blogFields = { title: req.body.formValues[0], body: req.body.formValues[1] }
        }

        const blog = await getFirebaseAdmin().firestore().collection('blogs').doc(req.body.uuid).update(blogFields) //get
        
        return res.status(200).json({ blogUp: req.body.formValues })
        
        /*const blogRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.body.uuid)

        if ((await blogRef.get()).exists) {
            await blogRef.update(blogFields)
            return res.status(200).json({ blogFound: true, blogUp: req.body.formValues })
        } else {
            return res.status(200).json({ blogFound: false })
        }*/
        
    } catch (e) {
        // eslint-disable-next-line no-console //5 NOT_FOUND
        console.error(e)

        return res.status(200).json({ error: e.code === 5 ? 'Blog not found' : 'Not authorized, please log in again' })//403
    }

}

export default handler