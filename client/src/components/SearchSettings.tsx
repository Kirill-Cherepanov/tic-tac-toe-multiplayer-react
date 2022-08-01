import React from 'react';

type Props = {
  searchParamsState: [
    SearchParams,
    React.Dispatch<React.SetStateAction<SearchParams>>
  ];
  goBack: () => void;
};

export default function SearchSettings({ searchParamsState, goBack }: Props) {
  const [searchParams, setSearchParams] = searchParamsState;
  return (
    <>
      <div className="multiplayer-game-settings">
        <h2 className="title-game-settings">Settings</h2>
        <form className="settings" data-settings>
          <label htmlFor="player-move-time" className="time-setting">
            Match time:
            <select
              name="player-move-time"
              id="player-move-time"
              className="time-select"
              onChange={(e) => {
                const target = e.currentTarget;
                setSearchParams((searchParams) => {
                  const newMatchTime = { ...searchParams.matchTime };
                  newMatchTime.value = Number(target.value);
                  return { ...searchParams, ...{ matchTime: newMatchTime } };
                });
              }}
              value={searchParams.matchTime.value}
            >
              <option value={5}>10</option>
              <option value={10}>20</option>
              <option value={20}>30</option>
              <option value={40}>60</option>
              <option value={0}>∞</option>
            </select>
            seconds
          </label>
          <label htmlFor="match-time-strict" className="strict-setting">
            <input
              type="checkbox"
              className="strict-input"
              id="match-time-strict"
              onChange={(e) => {
                const target = e.currentTarget;
                setSearchParams((searchParams) => {
                  const newMatchTime = { ...searchParams.matchTime };
                  newMatchTime.strict = target.checked;
                  return { ...searchParams, ...{ matchTime: newMatchTime } };
                });
              }}
              checked={searchParams.matchTime.strict}
            />
            strict search
          </label>

          <label htmlFor="timeout-time" className="time-setting">
            Break time:
            <select
              name="timeout-time"
              id="timeout-time"
              className="time-select"
              onChange={(e) => {
                const target = e.currentTarget;
                setSearchParams((searchParams) => {
                  const newBreakTime = { ...searchParams.breakTime };
                  newBreakTime.value = Number(target.value);
                  return { ...searchParams, ...{ breakTime: newBreakTime } };
                });
              }}
              value={searchParams.breakTime.value}
            >
              <option value={5}>10</option>
              <option value={10}>20</option>
              <option value={20}>30</option>
              <option value={40}>60</option>
              <option value={0}>∞</option>
            </select>
            seconds
          </label>
          <label htmlFor="break-time-strict" className="strict-setting">
            <input
              type="checkbox"
              className="strict-input"
              id="break-time-strict"
              onChange={(e) => {
                const target = e.currentTarget;
                setSearchParams((searchParams) => {
                  const newBreakTime = { ...searchParams.breakTime };
                  newBreakTime.strict = target.checked;
                  return { ...searchParams, ...{ breakTime: newBreakTime } };
                });
              }}
              checked={searchParams.breakTime.strict}
            />
            strict search
          </label>
        </form>
      </div>

      <div className="multiplayer-options">
        <button className="options-btn" id="leave-btn" onClick={goBack}>
          <i className="options-icon"></i>
          <label className="options-label">Return</label>
        </button>
      </div>
    </>
  );
}
