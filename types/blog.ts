/* eslint-disable camelcase */
export type BlogData = {
  title: string;
  img?: string;
  created_at?: number;
  body: string;
};

export type Blog = {
  _id: string;
  _date: FirebaseFirestore.Timestamp;
  blog: BlogData;
};
