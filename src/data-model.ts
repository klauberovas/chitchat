export interface Channel {
  id: number;
  name: string;
  members: number;
  description: string;
}

export interface User {
  name: string;
  role: string;
  avatarFilename: string;
}

export interface Message extends User {
  id: number;
  channelId: number;
  user: User;
  time: string;
  content: string;
  threadMessages: number;
}

export interface Thread extends User {
  id: number;
  parentId: number;
  user: User;
  time: string;
  content: string;
}

export interface BaseResult {
  status: string;
  result: (Channel | Message | Thread)[];
}

// interface MessageOrThread extends User {
//   id: number;
//   channelId: number;
//   parentId?: number;
//   time: string;
//   content: string;
//   threadMessages?: number;
// }
