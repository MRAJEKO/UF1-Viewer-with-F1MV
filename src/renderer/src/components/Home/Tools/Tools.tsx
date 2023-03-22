import status from '../../../utils/status'

const Tools = () => {
  return (
    <section id="tools" className="tools">
      <div className="tools-wrapper">
        <div className="dynamic-button">
          <div title="Layouts" id="layout-button" className="buttons" onclick="openLayouts()">
            <img id="layout-icon" src="../icons/layout.png" alt="" />
          </div>
          <button
            title="Restore Default Settings"
            id="reset-defaults"
            className="buttons hidden"
            onclick="restoreAll()"
          >
            <img id="reset-icon" src="../icons/restore.png" alt="" />
          </button>
        </div>
        <div className="connection-status">
          <p>
            MultiViewer Status:{' '}
            <span id="connection" className="disconnected">
              DISCONNECTED
            </span>
          </p>
        </div>
        <button title="Settings" id="options" className="buttons" onclick="settings()">
          <img id="settings-icon" src="../icons/settings.png" alt="" />
        </button>
      </div>
    </section>
  )
}

export default Tools
