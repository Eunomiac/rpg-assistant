import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

class TabNavigation extends React.Component {

  handleTabClick = () => {
    // Call the onTabSwitch function passed as a prop from the parent component
    setTimeout(() => this.props.onTabSwitch(), 50);
    setTimeout(() => this.props.onTabSwitch(), 100);
    setTimeout(() => this.props.onTabSwitch(), 200);
    setTimeout(() => this.props.onTabSwitch(), 300);
    setTimeout(() => this.props.onTabSwitch(), 500);
    // this.props.onTabSwitch();
  };

  renderProfileTabs = () => {
    if (this.props.currentProfile) {
      return (
        <nav className="tab-navigation">
          <ul>
            <li className="tab-item">
              <Link to="/configuration" onClick={this.handleTabClick}>Configuration</Link>
            </li>
            <li className="tab-item">
              <Link to="/profile" onClick={this.handleTabClick}>Profile</Link>
            </li>
            <li className="tab-item">
              <Link to="/glossary" onClick={this.handleTabClick}>Glossary</Link>
            </li>
            <li className="tab-item">
              <Link to="/openai" onClick={this.handleTabClick}>OpenAI</Link>
            </li>
          </ul>
        </nav>
      );
    } else {
      return (
        <nav className="tab-navigation">
          <ul>
            <li className="tab-item">
              <Link to="/configuration" onClick={this.handleTabClick}>Configuration</Link>
            </li>
            <li className="tab-item">
              <Link to="/profile" onClick={this.handleTabClick}>Profile</Link>
            </li>
          </ul>
        </nav>

      );
    }
  };

  render() {
    return this.renderProfileTabs();
  }
}

TabNavigation.propTypes = {
  currentProfile: PropTypes.object,
  onTabSwitch: PropTypes.func.isRequired
};

export default TabNavigation;