export type View = 'Home' | 'Multiselect' | 'Gather' | 'Playback'

export type To<V extends View> = (view: V) => void