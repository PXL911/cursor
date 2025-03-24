import React from 'react';
import { shallow } from 'zustand/vanilla/shallow';

function useShallow(selector) {
  const prev = React.useRef(undefined);
  return (state) => {
    const next = selector(state);
    return shallow(prev.current, next) ? prev.current : prev.current = next;
  };
}

export { useShallow };
