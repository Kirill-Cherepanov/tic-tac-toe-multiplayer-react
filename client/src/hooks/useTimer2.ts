import { useCallback, useEffect, useMemo, useState } from 'react';

type Timer = {
  setTime: (newTime: number) => void;
  resume: () => void;
  pause: () => void;
  reset: () => void;
};

const UPDATE_TIME = 1000;

let intervalID: undefined | NodeJS.Timer;

export default function useTimer(initialTime: number): [Timer, number] {
  const [time, setTime] = useState(initialTime);
  const [startTime, setStartTime] = useState<number | null>(Date.now());
  const [maxTime, setMaxTime] = useState(initialTime);
  const [isOn, setIsOn] = useState(true);

  useEffect(() => {
    if (intervalID) clearInterval(intervalID);

    if (!isOn) return;

    intervalID = setInterval(() => {
      setTime((time) => {
        if (time - (UPDATE_TIME + 100) / 1000 <= 0) {
          clearInterval(intervalID!);
          setMaxTime(0);
          setStartTime(null);
          return 0;
        }
        return maxTime - (Date.now() - startTime!) / 1000;
      });
    }, 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, [isOn, maxTime, startTime]);

  const setTimerTime = useCallback((newTime: number) => {
    setIsOn(true);
    setMaxTime(newTime);
    setTime(newTime);
    setStartTime(Date.now());
  }, []);

  const pause = useCallback(() => {
    setIsOn(false);
    setTime((time) => {
      setMaxTime(time);
      return time;
    });
  }, []);

  const resume = useCallback(() => {
    setIsOn(true);
    setStartTime(Date.now());
  }, []);

  const reset = useCallback(() => {
    setIsOn(false);
    setMaxTime(0);
    setTime(0);
  }, []);

  const timer = useMemo(() => {
    return {
      setTime: setTimerTime,
      pause: pause,
      resume: resume,
      reset: reset
    };
  }, [pause, reset, resume, setTimerTime]);

  return [timer, time];
}
