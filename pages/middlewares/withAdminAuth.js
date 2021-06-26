import { verifyIdToken } from "next-firebase-auth"

const withAdminAuth = (handler) => async (req, res) => {
    
    if (req.method !== 'GET') {
        
        if (!(req.headers && req.headers.authorization)) {
            return res.status(200).json({ error: 'Missing Authorization header value' }) //400
        }

        const token = req.headers.authorization

        req.token = token
    
        if (token === 'unauthenticated') {
            return res.status(200).json({ error: 'unauthenticated' })//401
        }

        try {

            const isAdmin = await verifyIdToken(req.token.replace("Bearer ", ""))
    
            // If get here, the user is an valid user, but not necessary an admin user... yet
            if (!isAdmin.claims.admin) {
                return res.status(200).json({ error: "You're not an admin, you have no permissions to do this action" }) //403
            }
            // If get here, the user is an admin type user, congratulations!
            req.isAdmin = isAdmin

        } catch (error) {
            console.log(error)
            return res.status(200).json({ error: 'Not authorized, please try log in again' }) //403
        }
    }

    return handler(req, res)
}

export default withAdminAuth