export const isDev = process.env.BUILD_ENV !== 'production';

export const isOnServerSide = typeof window === 'undefined';