import { useRef, useState } from 'react';

export default function useTimer(initialTime: number) {
  const [time, setTime] = useState(initialTime);

  const timer = useRef(
    (() => {
      const updateTime = (() => {
        let intervalID: undefined | NodeJS.Timer;

        return (newTime: number) => {
          if (intervalID) clearInterval(intervalID);
          if (newTime < 0) return;

          intervalID = setInterval(() => {
            setTime((time) => {
              if (newTime === Infinity) newTime = time;
              if (time <= 0) {
                clearInterval(intervalID);
                return time;
              }
              return time - 0.1;
            });
          }, 100);
          setTime(newTime);
        };
      })();

      return {
        setTime: updateTime,
        resume: () => updateTime(Infinity),
        pause: () => updateTime(-1),
        getTime: () => time
      };
    })()
  );

  return timer.current;
}
