import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { HardDrive, Upload, Download, ArrowLeft } from "phosphor-react";
import "../../../styles/BackupData.css";

class BackupData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backupType: "full",
      fileName: "",
      status: "",
      backups: JSON.parse(localStorage.getItem("backups")) || [], // Store all backups
      restoreFile: null,
      showDropdown: false,
    };
  }

  handleBackup = () => {
    if (!this.state.fileName.trim()) {
      this.setState({ status: "⚠️ Please enter a valid file name before backup." });
      return;
    }

    // Demo: Simulate backup process
    this.setState({ status: "⏳ Backing up data, please wait..." });
    setTimeout(() => {
      const newBackup = {
        name: this.state.fileName,
        type: this.state.backupType,
        date: new Date().toLocaleString(),
        content: `Backup of type: ${this.state.backupType}, created on ${new Date().toLocaleString()}`, // fake content
      };
      const updatedBackups = [newBackup, ...this.state.backups];
      localStorage.setItem("backups", JSON.stringify(updatedBackups)); // Save to localStorage
      this.setState({
        backups: updatedBackups, // Add backup to list
        status: `✅ Backup completed successfully as '${this.state.fileName}.zip'`,
        fileName: "",
      });
    }, 2000);

    // TODO: Uncomment for real API
    // this.performBackup();
  };

  handleRestore = (file) => {
    if (!file) {
      this.setState({ status: "⚠️ Please select a file to restore." });
      return;
    }

    // Demo: Simulate restore process
    this.setState({ status: `⏳ Restoring from '${file.name}'...` });
    setTimeout(() => {
      this.setState({
        status: `✅ Restore completed successfully from '${file.name}'`,
        restoreFile: null,
      });
    }, 2000);

    // TODO: Uncomment for real API
    // this.performRestore(file);
  };

  // TODO: Uncomment for real API
  // async performBackup() {
  //   try {
  //     this.setState({ status: "⏳ Backing up data, please wait..." });
  //     const response = await fetch('/api/backup', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ fileName: this.state.fileName, type: this.state.backupType })
  //     });
  //     const result = await response.json();
  //     this.setState({
  //       status: `✅ Backup completed successfully as '${result.fileName}'`,
  //       backups: [result.backup, ...this.state.backups],
  //       fileName: ""
  //     });
  //   } catch (error) {
  //     this.setState({ status: "❌ Backup failed. Please try again." });
  //     console.error('Backup error:', error);
  //   }
  // }

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

  handleDownload = (backup) => {
    const blob = new Blob([backup.content], { type: "application/zip" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${backup.name}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  toggleDropdown = () => {
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  setBackupType = (type) => {
    this.setState({ backupType: type, showDropdown: false });
  };

  handleFileNameChange = (e) => {
    this.setState({ fileName: e.target.value });
  };

  handleRestoreFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ restoreFile: file });
    this.handleRestore(file);
  };

  render() {
    return (
      <div className="backup-container">
        <div className="backup-header">
          <div className="header-left">
            <HardDrive size={28} />
            <h2>Backup Data Files</h2>
          </div>
          <button className="back-btn" onClick={() => this.props.navigate("/common")}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="backup-card">
          <div className="form-group">
            <label>Backup Type:</label>
            <div className="dropdown-wrapper">
              <button
                className="dropdown-btn"
                onClick={this.toggleDropdown}
              >
                {this.state.backupType === "full" ? "Full Backup" : "Partial Backup"} ▼
              </button>
              {this.state.showDropdown && (
                <div className="dropdown-menu">
                  <div onClick={() => this.setBackupType("full")}>Full Backup</div>
                  <div onClick={() => this.setBackupType("partial")}>Partial Backup</div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>File Name:</label>
            <input
              type="text"
              placeholder="Enter backup file name (e.g., data_backup)"
              value={this.state.fileName}
              onChange={this.handleFileNameChange}
            />
          </div>

          <div className="form-group restore-group">
            <label>Restore File:</label>
            <input
              type="file"
              accept=".zip,.bak"
              onChange={this.handleRestoreFileChange}
            />
          </div>

          <div className="button-group">
            <button className="primary-btn" onClick={this.handleBackup}>
              <Upload size={18} /> Backup Now
            </button>
          </div>

          {this.state.status && (
            <div className={`status-area ${this.state.status.includes("✅") ? "success" : "info"}`}>
              {this.state.status}
            </div>
          )}

          {this.state.backups.length > 0 && (
            <div className="backup-list">
              <h3>📦 Existing Backups:</h3>
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
                    <button
                      className="download-btn"
                      onClick={() => this.handleDownload(backup)}
                    >
                      Download
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

export default withRouter(BackupData);
