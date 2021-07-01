/**
 * Converts a number in two digit (case 3 returns 03, case 06 returns 06).
 * @param {int} digit number to convert
 * @return {string | number} formatted number.
 */
function toTwoDigits(digit: number): string | number {
  return digit.toString().length === 1 ? `0${digit}` : digit;
}

interface Moment extends FirebaseFirestore.Timestamp {
  _seconds?: number;
}

export const formatDate = (date: Moment) => {
  const dateRaw = new Date(date._seconds! * 1000);

  const day = toTwoDigits(dateRaw.getDate());
  const month = toTwoDigits(dateRaw.getMonth() + 1);
  const year = dateRaw.getFullYear();

  const hour12 = toTwoDigits(dateRaw.getHours() - 12);
  const minutes = toTwoDigits(dateRaw.getMinutes());
  const seconds = toTwoDigits(dateRaw.getSeconds());

  return `${month}/${day}/${year} at ${hour12}:${minutes}:${seconds} ${
    dateRaw.getHours() > 12 ? "pm" : "am"
  }`;

  // new Date(date._seconds * 1000).toDateString() + " at " + (24 - new Date(date._seconds * 1000).getHours()) + ":" + (new Date(date._seconds * 1000).getMinutes().toString().length === 1 ? "0" + new Date(date._seconds * 1000).getMinutes() : new Date(date._seconds * 1000).getMinutes())
};
