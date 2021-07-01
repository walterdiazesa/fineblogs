export type Comment = {
  _id: string;
  comment: FirebaseFirestore.DocumentData;
  _date: FirebaseFirestore.Timestamp;
};

export type Reply = {
  _id: string;
  reply: FirebaseFirestore.DocumentData;
  _date: FirebaseFirestore.Timestamp;
};
