import { useRef, useState } from 'react';

type Timer = {
  setTime: (newTime: number) => void;
  resume: () => void;
  pause: () => void;
  reset: () => void;
};

export default function useTimer(
  initialTime: number
): [React.MutableRefObject<Timer>, number] {
  const [time, setTime] = useState(initialTime);
  const [startTime, setStartTime] = useState<number | null>(Date.now());
  const [maxTime, setMaxTime] = useState(initialTime);
  const [intervalID, setIntervalID] = useState<
    undefined | void | NodeJS.Timer
  >();

  const pause = () => {
    setIntervalID((id) => id && clearInterval(id));
    if (startTime === null) return;
    setTime((time) => maxTime - (Date.now() - startTime!) / 1000);
    setStartTime(null);
  };

  const setTimerTime = (newTime: number) => {
    setIntervalID((id) => id && clearInterval(id));
    setMaxTime(newTime);
    setTime(newTime);
    setStartTime(Date.now());

    setIntervalID(
      setInterval(() => {
        setTime((time) => {
          if (time - 1 <= 0) {
            clearInterval(intervalID!);
            setMaxTime(0);
            setStartTime(null);
            return 0;
          }
          return maxTime - (Date.now() - startTime!) / 1000;
        });
      }, 1000)
    );
  };

  const reset = () => {
    setIntervalID((id) => id && clearInterval(id));
    setMaxTime(0);
    setTime(0);
    setStartTime(null);
  };

  const resume = () => setTimerTime(time);

  const timer = useRef<Timer>({
    setTime: setTimerTime,
    resume,
    pause,
    reset
  });
  timer.current = {
    setTime: setTimerTime,
    resume,
    pause,
    reset
  };

  return [timer, time];
}
