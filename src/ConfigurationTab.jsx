import React from "react";
import PropTypes from "prop-types";
import Settings from "./Settings";

class ConfigurationTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: this.props.settings || {} // Default to an empty object if settings is null
    };
  }

  handleSettingsChange = (settings) => {
    this.setState({ settings: settings });
    this.props.onSettingsChange(settings);
  };

  render() {
    return (
      <div className="configuration compact-layout">
        <h2>Configuration</h2>
        <Settings
          onSettingsChange={this.handleSettingsChange}
          settings={this.state.settings}
        />
      </div>
    );
  }
}

ConfigurationTab.propTypes = {
  settings: PropTypes.object.isRequired,
  onSettingsChange: PropTypes.func.isRequired
};

export default ConfigurationTab;