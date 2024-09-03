declare namespace YT {
    export interface Player {
        getCurrentTime(): number;
        loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
        cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    }
    export interface OnStateChangeEvent {
        data: number;
    }
    export enum PlayerState {
        UNSTARTED = -1,
        ENDED = 0,
        PLAYING = 1,
        PAUSED = 2,
        BUFFERING = 3,
        CUED = 5,
    }
    export interface PlayerOptions {
        height: string;
        width: string;
        videoId: string;
        events: {
            onReady?: (event: Event) => void;
            onStateChange?: (event: OnStateChangeEvent) => void;
        };
    }
    export function Player(element: HTMLElement, options: PlayerOptions): Player;
}
