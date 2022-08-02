import { useRef, useState } from 'react';

type Timer = {
  setTime: (newTime: number) => void;
  resume: () => void;
  pause: () => void;
};

export default function useTimer(initialTime: number): [Timer, number] {
  const [time, setTime] = useState(initialTime);
  const [startTime, setStartTime] = useState<number | null>(Date.now());
  const [maxTime, setMaxTime] = useState(initialTime);

  const timer = useRef(
    (() => {
      const updateTime = (() => {
        let intervalID: undefined | NodeJS.Timer;

        return (newTime: number) => {
          if (intervalID) clearInterval(intervalID);

          // Handle pause()
          if (newTime < 0) {
            if (startTime === null) return;
            setTime((time) => maxTime - (Date.now() - startTime!) / 1000);
            setStartTime(null);
            return;
          }

          // Handle time reset
          if (newTime === 0) {
            setMaxTime(0);
            setTime(0);
            setStartTime(null);
            return;
          }

          // Handle resume()
          if (newTime === Infinity) newTime = time;
          setMaxTime(newTime);
          setTime(newTime);
          setStartTime(Date.now());

          // Handle time update
          intervalID = setInterval(() => {
            setTime((time) => {
              if (time - 1 <= 0) {
                clearInterval(intervalID);
                setMaxTime(0);
                setStartTime(null);
                return 0;
              }
              return maxTime - (Date.now() - startTime!) / 1000;
            });
          }, 1000);
        };
      })();

      return {
        setTime: updateTime,
        resume: () => updateTime(Infinity),
        pause: () => updateTime(-1)
      };
    })()
  );

  return [timer.current, time];
}
