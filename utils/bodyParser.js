export default function bodyParser(body) {

    body = body.replace( /(<([^>]+)>)/ig, '')

    body = body.length > 125 ? `${body.substring(0, 125)}...` : body

    return body
}