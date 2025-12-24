
import React from 'react';

export const getEmojiForRating = (value: number): string => {
  if (value < 20) return '😫';
  if (value < 40) return '😕';
  if (value < 60) return '🙂';
  if (value < 80) return '🚀';
  return '🔥';
};

export const getRatingColor = (value: number): string => {
  if (value < 20) return 'text-red-500';
  if (value < 40) return 'text-orange-500';
  if (value < 60) return 'text-yellow-500';
  if (value < 80) return 'text-green-500';
  return 'text-cyan-400';
};
