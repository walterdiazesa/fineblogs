export default function getUserImage(AuthUser) {
    
    let userEmail = AuthUser
    if (AuthUser.email) {

        userEmail = AuthUser.email

        if (AuthUser.photoURL) {
            return AuthUser.photoURL
        }
    }

    return `${process.env.NEXT_PUBLIC_HOST}/imgs/profiles/${userEmail ? userEmail.charAt(0).match(/[a-z]/i) ? userEmail.charAt(0).toLowerCase() : '@' : '@'}.png`
}