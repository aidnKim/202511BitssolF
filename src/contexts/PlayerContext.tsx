import { createContext } from 'react';

export interface Sound {
  soundId: number;
  title: string;
  uploader: string;
  fileUrl: string;
  thumbnailUrl: string;
}

export interface PlayerContextType {
  currentSound: Sound | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  repeatMode: 'none' | 'all' | 'one';
  isShuffled: boolean;
  toggleShuffle: () => void;
  playlist: Sound[];
  currentIndex: number;
  playSound: (soundId: number) => void;
  playSoundWithPlaylist: (soundId: number, playlist: Sound[]) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  stopSound: () => void;
  toggleRepeatMode: () => void;
  playNext: () => void;
  playPrev: () => void;
}


// Context 생성
export const PlayerContext = createContext<PlayerContextType | null>(null);
