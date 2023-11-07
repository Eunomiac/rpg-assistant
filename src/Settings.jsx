import React from "react";
import PropTypes from "prop-types";

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    onSettingsChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      settings: this.props.settings
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      settings: {
        ...this.state.settings,
        [name]: value
      }
    }, () => {
      this.props.onSettingsChange(this.state.settings);
    });
  };

  render() {
    return (
      <div className="settings compact-layout">
        <h2>Settings</h2>
        <form>
          <label>
            Setting 1:
            <input
              className="form-control"
              name="setting1"
              type="text"
              value={this.state.settings.setting1 || ""}
              onChange={this.handleInputChange}
            />
          </label>
        </form>
      </div>
    );
  }
}

export default Settings;