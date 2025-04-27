
import { useEffect, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface UseKeyboardControlsProps {
  onMove?: (direction: Direction) => void;
  onAction?: () => void;
  onEscape?: () => void;
}

export function useKeyboardControls({
  onMove,
  onAction,
  onEscape,
}: UseKeyboardControlsProps) {
  const [keysPressed, setKeysPressed] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setKeysPressed(prev => ({ ...prev, up: true }));
          onMove?.('up');
          break;
        case 's':
        case 'arrowdown':
          setKeysPressed(prev => ({ ...prev, down: true }));
          onMove?.('down');
          break;
        case 'a':
        case 'arrowleft':
          setKeysPressed(prev => ({ ...prev, left: true }));
          onMove?.('left');
          break;
        case 'd':
        case 'arrowright':
          setKeysPressed(prev => ({ ...prev, right: true }));
          onMove?.('right');
          break;
        case ' ':
        case 'enter':
          onAction?.();
          break;
        case 'escape':
          onEscape?.();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setKeysPressed(prev => ({ ...prev, up: false }));
          break;
        case 's':
        case 'arrowdown':
          setKeysPressed(prev => ({ ...prev, down: false }));
          break;
        case 'a':
        case 'arrowleft':
          setKeysPressed(prev => ({ ...prev, left: false }));
          break;
        case 'd':
        case 'arrowright':
          setKeysPressed(prev => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, onAction, onEscape]);

  return keysPressed;
}
