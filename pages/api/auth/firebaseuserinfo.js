import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {
    
    if (!req.query.userEmail) {
        return res.status(200).json("user?")
    }

    const firebaseUser = await getFirebaseAdmin().auth().getUserByEmail(req.query.userEmail)
    let displayName = false, img = false

    if (firebaseUser.displayName) {
        displayName = firebaseUser.displayName
    }

    if (firebaseUser.photoURL) {
        img = firebaseUser.photoURL
    }

    return res.status(200).json({displayName, img})
}

export default handler