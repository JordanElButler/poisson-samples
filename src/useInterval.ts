import React from 'react';

export default function useInterval(callback: () => any, time: number, dep: any) {
  
  React.useEffect(() => {
    let timeoutId: number | null = null
    function loop() {
      callback();
      timeoutId = setTimeout(loop, time);
    }
    loop();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [...dep])
}