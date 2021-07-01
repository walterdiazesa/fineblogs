/**
 * Parse html or raw text to raw text only and cut to 125 characters
 * @param {string} body html or raw text to convert.
 * @return {string} raw text
 */
export default function bodyParser(body: string): string {
  body = body.replace(/(<([^>]+)>)/gi, "");

  body = body.length > 125 ? `${body.substring(0, 125)}...` : body;

  return body;
}
