import sessionPartStyles from './Settings.module.scss'
import styles from './Credits.module.scss'

import openExternal from '@renderer/assets/icons/open-external.png'
import greenHeart from '@renderer/assets/icons/green-heart.png'
import peanut from '@renderer/assets/icons/peanut.png'

const Credits = () => {
  return (
    <div className={`${sessionPartStyles['session-part']} ${styles.container}`}>
      <h2>{'Credits'}</h2>
      <h3>
        <a href="https://multiviewer.app/" target="_blank">
          MultiViewer
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </h3>
      <p>
        <a href="discord.gg/multiviewer" target="_blank">
          Discord
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <p>
        <a href="https://www.buymeacoffee.com/multiviewer" target="_blank">
          Support him
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <p>
        <a href="https://github.com/f1multiviewer/issue-tracker/discussions">Requests and ideas</a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h3>Ultimate Formula 1 Viewer</h3>
      <p>
        <a href="https://github.com/MRAJEKO" target="_blank">
          MRAJEKO
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h3>Main Window Design</h3>
      <p>
        <a href="https://github.com/avmavs" target="_blank">
          Sherlock
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h3>Live Timing</h3>
      <p>
        <a href="https://github.com/JustJoostNL" target="_blank">
          JustJoostNL
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h3>Lights Integrations</h3>
      <p>
        <a href="https://govee.com/" target="_blank">
          Govee
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h2>Powered by</h2>
      <h3>NPM F1MV API</h3>
      <p>
        <a href="https://github.com/LapsTimeOFF" target="_blank">
          LapsTimeOff
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h3>Packaging</h3>
      <p>
        <a href="https://github.com/JustJoostNL" target="_blank">
          JustJoostNL
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <br />
      <h3>Testing</h3>
      <p>
        <a href="https://github.com/JJWatMyself" target="_blank">
          JJWatMyself
        </a>
        <img width="12" height="12" src={openExternal} alt="" />
      </p>
      <p style={{ padding: '15px' }}>
        A big thank you to all the members of the MultiViewer discord server for helping and
        creating amazing addition to the already amazing MultiViewer application.
      </p>
      <div>
        <img width="60" height="60" alt="Peanut" src={greenHeart} />
        <img width="60" height="60" alt="Peanut" src={peanut} />
      </div>
    </div>
  )
}
export default Credits
