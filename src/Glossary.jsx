import React from "react";
import PropTypes from "prop-types";
import U from "./Utilities";

class Glossary extends React.Component {
  componentDidMount() {
    this.updateGlossary();
  }

  constructor(props) {
    super(props);
    this.state = {
      displayedTerms: []
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    // Update the glossary term
    this.props.currentProfile.glossary[name] = value;

    // Update the profile
    this.props.onProfileChange(this.props.currentProfile);
  };

  getActiveTerms = () => {
    // Convert the currentProfile data to a string
    const profileString = JSON.stringify(this.props.currentProfile)
      .replace(/\\/g, "");

    // Check for hashtags in the profileString
    const hashtagRegex = /#([^"\W:]+)|#"([^":]*)"/g;
    let match;
    let activeTerms = [];
    let newTerms = [];
    while ((match = hashtagRegex.exec(profileString)) !== null) {
      const term = match[1] || match[2];
      // If the term is already in the glossary, add it to activeTerms
      if (this.props.currentProfile.glossary[term]) {
        activeTerms.push(term);
      } else {
        // If the term is not in the glossary, add it to newTerms
        newTerms.push(term);
      }
    }

    console.log("Glossary.getActiveTerms()", activeTerms, newTerms);

    return [activeTerms, newTerms];
  };

  updateGlossary = () => {
    // Get the active and new terms
    const [activeTerms, newTerms] = this.getActiveTerms();

    // Initialize new terms with blank definitions in the glossary
    newTerms.forEach(term => {
      if (!this.props.currentProfile.glossary[term]) {
        this.props.currentProfile.glossary[term] = "";
      }
    });

    // Filter out any terms in the glossary that are not currently active
    this.setState({
      displayedTerms: Object.keys(this.props.currentProfile.glossary).filter(term => [...activeTerms, ...newTerms].includes(term))
    });

    // Update the profile
    this.props.onProfileChange(this.props.currentProfile);
  };

  renderGlossaryTerm = (key, index) => {
    return (
      <div className="glossary-term compact-item" key={index}>
        {U.renderLabeledTextarea(
          key,
          key,
          {
            dataSource: this.props.currentProfile.glossary,
            onChangeHandler: this.handleInputChange
          }
        )}
      </div>
    );
  };

  render() {
    return (
      <div className="glossary compact-layout">
        {Object.keys(this.props.currentProfile.glossary)
          .filter(key => this.state.displayedTerms.includes(key)) // Only include terms that are in displayedTerms
          .map(this.renderGlossaryTerm)
        }
      </div>
    );
  }
}

Glossary.propTypes = {
  currentProfile: PropTypes.object,
  onProfileChange: PropTypes.func.isRequired
};

export default Glossary;