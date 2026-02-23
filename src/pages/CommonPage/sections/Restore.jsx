import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Database, Upload, ArrowLeft } from "phosphor-react";
import "../../../styles/BackupData.css";

class Restore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restoreFile: null,
      status: "",
      backups: JSON.parse(localStorage.getItem("backups")) || [], // Load backups from localStorage
    };
  }

  handleRestoreFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ restoreFile: file });
  };

  handleRestore = () => {
    if (!this.state.restoreFile) {
      this.setState({ status: "⚠️ Please select a backup file to restore." });
      return;
    }

    // Demo: Simulate restore process
    this.setState({ status: `⏳ Restoring from '${this.state.restoreFile.name}'...` });
    setTimeout(() => {
      this.setState({
        status: `✅ Restore completed successfully from '${this.state.restoreFile.name}'`,
        restoreFile: null,
      });
    }, 2000);

    // TODO: Uncomment for real API
    // this.performRestore(this.state.restoreFile);
  };

  // TODO: Uncomment for real API
  // async performRestore(file) {
  //   try {
  //     this.setState({ status: `⏳ Restoring from '${file.name}'...` });
  //     const formData = new FormData();
  //     formData.append('backupFile', file);
  //     const response = await fetch('/api/restore', {
  //       method: 'POST',
  //       body: formData
  //     });
  //     const result = await response.json();
  //     this.setState({
  //       status: `✅ Restore completed successfully from '${file.name}'`,
  //       restoreFile: null
  //     });
  //   } catch (error) {
  //     this.setState({ status: "❌ Restore failed. Please try again." });
  //     console.error('Restore error:', error);
  //   }
  // }

  render() {
    return (
      <div className="backup-container">
        <div className="backup-header">
          <div className="header-left">
            <Database size={28} />
            <h2>Restore Data</h2>
          </div>
          <button className="back-btn" onClick={() => this.props.navigate("/common")}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="backup-card">
          <div className="form-group">
            <label>Select Backup File to Restore:</label>
            <input
              type="file"
              accept=".zip,.bak"
              onChange={this.handleRestoreFileChange}
            />
          </div>

          <div className="button-group">
            <button className="primary-btn" onClick={this.handleRestore}>
              <Upload size={18} /> Restore Now
            </button>
          </div>

          {this.state.status && (
            <div className={`status-area ${this.state.status.includes("✅") ? "success" : "info"}`}>
              {this.state.status}
            </div>
          )}

          {this.state.backups.length > 0 && (
            <div className="backup-list">
              <h3>📦 Available Backups for Restore:</h3>
              <ul>
                {this.state.backups.map((backup, index) => (
                  <li key={index}>
                    <strong>{backup.name}.zip</strong> ({backup.type} backup) - {backup.date}
                    <button
                      className="restore-btn"
                      onClick={() => this.handleRestore({ name: backup.name + ".zip" })}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(Restore);
