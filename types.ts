export enum ContentType {
  Trend = 'Trend',
  Script = 'Script',
  Photo = 'Photo',
  Video = 'Video',
  AccountHealth = 'AccountHealth',
}

export interface Account {
  id: string;
  username: string;
  niche: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}