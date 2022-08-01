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
          <label htmlFor="player-move-time" className="player-move-time-label">
            Match time:
            <select
              name="player-move-time"
              id="player-move-time"
              onChange={(e) => {
                setSearchParams((searchParams) => {
                  const newMatchTime = { ...searchParams.matchTime };
                  newMatchTime.value = Number(e.currentTarget.value);
                  return { ...searchParams, ...{ matchTime: newMatchTime } };
                });
              }}
              value={searchParams.matchTime.value}
            >
              <option value={5}>10 sec</option>
              <option value={10}>20 sec</option>
              <option value={20}>30 sec</option>
              <option value={40}>60 sec</option>
              <option value={0}>Unlimited</option>
            </select>
          </label>
          <label htmlFor="match-time-strict">
            <input
              type="checkbox"
              className="match-time-strict"
              id="match-time-strict"
              onChange={(e) => {
                setSearchParams((searchParams) => {
                  const newMatchTime = { ...searchParams.matchTime };
                  newMatchTime.strict = e.currentTarget.checked;
                  return { ...searchParams, ...{ matchTime: newMatchTime } };
                });
              }}
              checked={searchParams.matchTime.strict}
            />
          </label>

          <label htmlFor="timeout-time" className="timeout-label">
            Break time:
            <select
              name="timeout-time"
              id="timeout-time"
              onChange={(e) => {
                setSearchParams((searchParams) => {
                  const newBreakTime = { ...searchParams.breakTime };
                  newBreakTime.value = Number(e.currentTarget.value);
                  return { ...searchParams, ...{ breakTime: newBreakTime } };
                });
              }}
              value={searchParams.breakTime.value}
            >
              <option value={5}>10 sec</option>
              <option value={10}>20 sec</option>
              <option value={20}>30 sec</option>
              <option value={40}>60 sec</option>
              <option value={0}>Unlimited</option>
            </select>
          </label>
          <label htmlFor="break-time-strict">
            <input
              type="checkbox"
              className="break-time-strict"
              id="break-time-strict"
              onChange={(e) => {
                setSearchParams((searchParams) => {
                  const newBreakTime = { ...searchParams.breakTime };
                  newBreakTime.strict = e.currentTarget.checked;
                  return { ...searchParams, ...{ breakTime: newBreakTime } };
                });
              }}
              checked={searchParams.breakTime.strict}
            />
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
