import { IRaceControlMessages } from './RaceControlMessages'

export interface ILiveTimingData {
  /** The status of the live timing archive, used for replay live timing */
  ArchiveStatus?: Object
  /** Available audio commentary streams */
  AudioStreams?: Object
  /** Car telemetry data, speed, throttle, brake, gear, RPM, DRS */
  CarData?: Object
  /** Live championship standings, available for sessions where points are being awarded */
  ChampionshipPrediction?: Object
  /** Text-based content streams (via ScribbleLive) and audio commentary */
  ContentStreams?: Object
  /** List of all participating drivers with basic information */
  DriverList?: Object
  /**
   * Extrapolated session clock
   *
   * The extrapolated session clock returns the time in UTC (via the `Utc` field)
   * and the remaining time for this session (via the `Extrapolating` field),
   * and if the clock is still extrapolating (via the `Extrapolating` field). You
   * can use this data, along with the `liveTimingClock` field on the root query,
   * to calculate the time remaining in the session.
   */
  ExtrapolatedClock?: Object
  /** Heartbeats from the live timing server */
  Heartbeat?: Object
  /** Lap count, for sessions with a schedule number of laps */
  LapCount?: Object
  /** Time-series data per lap for each driver's position during the session */
  LapSeries?: Object
  /** Current or recent pit-stop timing data */
  PitLaneTimeCollection?: Object
  /** GPS positioning for cars and safety cars */
  Position?: Object
  /** Messages sent by FIA race control */
  RaceControlMessages?: IRaceControlMessages
  /** Simple session data, containing session status and start times for multi-part sessions (like Qualifying) */
  SessionData?: Object
  /** Session information, including session type, circuit, official names and the scheduled start time */
  SessionInfo?: Object
  /** The current session status (for which a time-series is available in the `SessionData` topic) */
  SessionStatus?: Object
  /** Team radio message captures */
  TeamRadio?: Object
  /** Timing data for tyre stints, grid start positions, including tyre compound, best time set on it and the amount of laps run on it */
  TimingAppData?: Object
  /** Most timing data available, including lap times, sector times, intervals/gaps, pitstop status, speed traps and number of laps run */
  TimingData?: Object
  /** Statistics for the current session, best lap times, best sectors, best speeds */
  TimingStats?: Object
  /** Basic information about the top-three drivers in this session */
  TopThree?: Object
  /** The track status, which changes when yellow or red flags are out */
  TrackStatus?: Object
  /** Current weather data */
  WeatherData?: Object
  /** Historic weather data, for the current session */
  WeatherDataSeries?: Object
}
