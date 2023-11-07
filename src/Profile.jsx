import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import {v4 as uuidv4} from "uuid"; // Import the uuid library
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faSquareMinus, faDownload, faTriangleExclamation, faBan, faSquareCaretDown, faSquareCaretRight } from "@fortawesome/free-solid-svg-icons";
import U from "./Utilities";



class Profile extends React.Component {

  static currentProfile = {}; // Static property to hold the current profile

  constructor(props) {
    super(props);
    this.state = {
      currentProfile: null, // Initialize currentProfile as null

      // Modal Visibility Control
      isLoadProfilePopupOpen: false, // Initialize isLoadProfilePopupOpen as false
      isMinorCharacterTypesVisible: false, // Initialize isMinorCharacterTypesVisible as false
      isDeleteProfilePopupOpen: false, // Initialize isDeleteProfilePopupOpen as false
      isPartyMemberPopupOpen: false, // Initialize isPartyMemberDetailsPopupOpen as false


      profileToDelete: null, // Initialize profileToDelete as null
      currentPartyMember: null // Initialize currentPartyMember as null
    };
  }

  componentDidUpdate(prevProps) {
    // If the currentProfile prop has changed, adjust all textareas
    if (this.props.currentProfile !== prevProps.currentProfile) {
      this.props.onProfileRender();
    }
  }

  // Method to initialize a new profile
  newProfile = () => {
    const newProfile = {
      id: uuidv4(), // Assign a unique id
      setting: {
        gameName: "",
        genre: "",
        tone: "",
        details: "",
        minorCharacterTypes: {}
      },
      characters: {
        primary: {
          name: "", // Initialize all fields
          concept: "",
          motifs: "",
          personality: "",
          partyRole: "",
          strengths: "",
          flaws: ""
        },
        partyMembers: {},
        minor: {}
      },
      glossary: {}
    };
    this.props.onProfileChange(newProfile);
    Profile.currentProfile = newProfile; // Update the static property with the new profile
  };

  // Method to open the load profile popup
  openLoadProfilePopup = () => {
    this.setState({isLoadProfilePopupOpen: true});
  };

  // Method to close the load profile popup
  closeLoadProfilePopup = () => {
    this.setState({isLoadProfilePopupOpen: false});
  };

  // Method to open the delete profile popup
  openDeleteProfilePopup = (profile) => {
    this.setState({
      isDeleteProfilePopupOpen: true,
      profileToDelete: profile
    });
  };

  // Method to close the delete profile popup
  closeDeleteProfilePopup = () => {
    this.setState({
      isDeleteProfilePopupOpen: false,
      profileToDelete: null
    });
  };

  // Method to delete a profile
  deleteProfile = () => {
    const newProfiles = {...this.props.profiles};
    delete newProfiles[this.state.profileToDelete.id];
    this.props.onProfilesChange(newProfiles);
    this.closeDeleteProfilePopup();
  };

  // Method to handle when a profile is selected
  handleProfileSelect = (profile) => {
    this.props.onProfileChange(profile);
    if (!("glossary" in profile))  {
      profile.glossary = {};
    }
    Profile.currentProfile = profile;
    this.setState({isLoadProfilePopupOpen: false});
  };

  addMinorType = () => {
    const newTypeKey = uuidv4();
    this.props.onInputChange({
      target: {
        name: `setting.minorCharacterTypes.${newTypeKey}`,
        value: {
          name: "",
          description: ""
        }
      }
    });
  };

  // Method to add a new party member
  addPartyMember = () => {
    this.props.onInputChange({
      target: {
        name: `characters.partyMembers.${uuidv4()}`,
        value: {
          name: "",
          concept: "",
          partyRole: "",
          strengths: "",
          flaws: "",
          relationship: "",
          opinionOf: ""
        }
      }
    });
  };

  // Method to add a new minor character
  addMinorCharacter = () => {
    this.props.onInputChange({
      target: {
        name: `characters.minor.${uuidv4()}`,
        value: {
          name: "",
          concept: "",
          type: ""
        }
      }
    });
  };

  // Method to toggle the visibility of minor character types
  toggleMinorCharacterTypes = (event) => {
    event.preventDefault();
    const isMinorCharacterTypesVisible = !this.state.isMinorCharacterTypesVisible;
    this.setState({ isMinorCharacterTypesVisible });

    if (isMinorCharacterTypesVisible) {
      this.props.onProfileRender();
    }
  };

  // Method to delete a minor character type
  deleteMinorType = (key) => {
    const newProfile = {...this.props.currentProfile};
    delete newProfile.setting.minorCharacterTypes[key];
    this.props.onProfileChange(newProfile);
  };

  get inputOptions() {
    return {
      dataSource: this.props.currentProfile,
      onChangeHandler: this.props.onInputChange
    };
  }


  renderLoadProfileModal = () => {
    return (
      <Modal
        isOpen={this.state.isLoadProfilePopupOpen}
        onRequestClose={this.closeLoadProfilePopup}
        contentLabel="Select a Profile"
        className="load-profile-content"
        overlayClassName="load-profile-overlay"
      >
        <h1>Select a Profile</h1>
        <div className="profile-container flex-horizontal">
          {Object.values(this.props.profiles).map(profile => (
            <div key={profile.id} className="clickable-panel">
              <h3>{profile.setting.gameName}</h3>
              <h2>{profile.characters.primary.name}</h2>
              <button className="button-load" onClick={() => this.handleProfileSelect(profile)}>
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button className="button-delete" onClick={() => this.openDeleteProfilePopup(profile)}>
                <FontAwesomeIcon icon={faSquareMinus} />
              </button>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  renderDeleteProfileModal = () => {
    return (
      <Modal
        isOpen={this.state.isDeleteProfilePopupOpen}
        onRequestClose={this.closeDeleteProfilePopup}
        contentLabel="Delete Profile"
      >
        <h1>Delete Profile</h1>
        <p>Are you sure you want to delete this profile?</p>
        <button onClick={this.deleteProfile} className="button-confirm-delete"><FontAwesomeIcon icon={faTriangleExclamation} />Yes</button>
        <button onClick={this.closeDeleteProfilePopup} className="button-cancel-delete"><FontAwesomeIcon icon={faBan} />No</button>
      </Modal>
    );
  };

  renderGameSection = () => {
    return (
      <div className="setting compact-section flex-vertical">
        <div className="flex-horizontal double-flex-container">
          {U.renderLabeledInput(
            "Game:",
            "setting.gameName",
            {
              ...this.inputOptions,
              className: "text-emphasis"
            }
          )}
          {U.renderLabeledInput(
            "Genre:",
            "setting.genre",
            {
              ...this.inputOptions,
              className: "text-emphasis"
            }
          )}
        </div>
        {U.renderLabeledTextarea(
          "Tone:",
          "setting.tone",
          this.inputOptions
        )}
      </div>
    );
  };

  renderSettingSection = () => {
    return (
      <div className="setting compact-section flex-vertical">
        <h4 className="section-title">Setting Details</h4>
        {U.renderLabeledTextarea(
          "",
          "setting.details",
          this.inputOptions
        )}
      </div>
    );
  };

  renderPrimaryCharacterSection = () => {
    return (
      <div>
        <h3 className="section-title section-title-header">Primary Character</h3>
        <div className="primaryCharacter compact-item">
          {U.renderLabeledInput(
            "",
            "characters.primary.name",
            {
              ...this.inputOptions,
              className: "text-emphasis",
              placeholder: "Name"
            }
          )}
          <div className="flex-horizontal double-flex-container">
            {U.renderLabeledInput(
              "Party Role:",
              "characters.primary.partyRole",
              this.inputOptions
            )}
            {U.renderLabeledInput(
              "Pronouns:",
              "characters.primary.pronouns",
              {
                ...this.inputOptions,
                placeholder: "Subject/Object, e.g. 'he/him'"
              }
            )}
          </div>
          {U.renderLabeledTextarea(
            "Concept:",
            "characters.primary.concept",
            this.inputOptions
          )}
          {U.renderLabeledTextarea(
            "Motifs:",
            "characters.primary.motifs",
            this.inputOptions
          )}
          {U.renderLabeledTextarea(
            "Personality:",
            "characters.primary.personality",
            this.inputOptions
          )}
          {U.renderLabeledTextarea(
            "Strengths:",
            "characters.primary.strengths",
            this.inputOptions
          )}
          {U.renderLabeledTextarea(
            "Flaws:",
            "characters.primary.flaws",
            this.inputOptions
          )}
        </div>
      </div>
    );
  };


  // Method to open the party member details modal
  openPartyMemberDetails = (partyMemberKey) => {
    this.setState({
      isPartyMemberPopupOpen: true,
      currentPartyMember: partyMemberKey
    });
  };

  // Method to close the party member details modal
  closePartyMemberDetails = () => {
    this.setState({
      isPartyMemberPopupOpen: false,
      currentPartyMember: null
    });
  };

  renderPartyMembersSection = () => {
    return (
      <div className="partyMembers compact-section flex-vertical">
        <h4 className="section-title">
          <button onClick={this.addPartyMember} className="button-add">
            <FontAwesomeIcon icon={faSquarePlus} />
          </button>
        Party Members
        </h4>
        <div className="compact-section flex-horizontal flex-wrap">
          {Object.entries(this.props.currentProfile.characters.partyMembers).map(([key, {name, partyRole}], index) => (
            <div className="partyMember compact-item flex-vertical clickable-panel" key={index} onClick={() => this.openPartyMemberDetails(key)}>
              <h3>{name}</h3>
              <h4>{partyRole}</h4>
            </div>
          ))}
        </div>
        <Modal
          isOpen={this.state.isPartyMemberPopupOpen}
          onRequestClose={this.closePartyMemberDetails}
          contentLabel="Party Member Details"
          className="load-profile-content"
          overlayClassName="load-profile-overlay"
        >
          {this.state.currentPartyMember && (
            <div>
              {U.renderLabeledInput(
                "",
                `characters.partyMembers.${this.state.currentPartyMember}.name`,
                {
                  ...this.inputOptions,
                  className: "text-emphasis",
                  placeholder: "Name"
                }
              )}
              {U.renderLabeledInput(
                "Party Role:",
                `characters.partyMembers.${this.state.currentPartyMember}.partyRole`,
                this.inputOptions
              )}
              {U.renderLabeledTextarea(
                "Concept:",
                `characters.partyMembers.${this.state.currentPartyMember}.concept`,
                this.inputOptions
              )}
              {U.renderLabeledTextarea(
                "Strengths:",
                `characters.partyMembers.${this.state.currentPartyMember}.strengths`,
                this.inputOptions
              )}
              {U.renderLabeledTextarea(
                "Flaws:",
                `characters.partyMembers.${this.state.currentPartyMember}.flaws`,
                this.inputOptions
              )}
              {U.renderLabeledTextarea(
                "Relationship:",
                `characters.partyMembers.${this.state.currentPartyMember}.relationship`,
                this.inputOptions
              )}
              {U.renderLabeledTextarea(
                "My Opinion Of:",
                `characters.partyMembers.${this.state.currentPartyMember}.opinionOf`,
                this.inputOptions
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  };

  renderMinorCharacterTypesSection = () => {
    return (
      <div className="minorCharacterTypes compact-section flex-vertical">
        <div className="section-header">
          <h5 className="section-title">
            <button onClick={(event) => this.toggleMinorCharacterTypes(event)} className="button-toggle">
              <FontAwesomeIcon icon={this.state.isMinorCharacterTypesVisible
                ? faSquareCaretDown
                : faSquareCaretRight}
              />
            </button>
            <button onClick={this.addMinorType} className="button-add">
              <FontAwesomeIcon icon={faSquarePlus} />
            </button>
          Minor Character Types
          </h5>
        </div>
        <div className={`section-content ${this.state.isMinorCharacterTypesVisible ? "" : "hidden"}`}>
          {Object.keys(this.props.currentProfile.setting.minorCharacterTypes).map((key, index) => (
            <div className="minorCharacterType compact-item" key={index}>
              <div className="flex-horizontal double-flex-container flex-top">
                <button onClick={() => this.deleteMinorType(key)} className="button-delete">
                  <FontAwesomeIcon icon={faSquareMinus} />
                </button>
                {U.renderLabeledInput(
                  "Type:",
                  `setting.minorCharacterTypes.${key}.name`,
                  this.inputOptions
                )}
                {U.renderLabeledInput(
                  "Description:",
                  `setting.minorCharacterTypes.${key}.description`,
                  this.inputOptions
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  renderMinorCharactersSection = () => {
    return (
      <div className="minorCharacters compact-section flex-vertical">
        <h4 className="section-title">
          <button onClick={this.addMinorCharacter} className="button-add">
            <FontAwesomeIcon icon={faSquarePlus} />
          </button>
        Minor Characters
        </h4>
        {this.renderMinorCharacterTypesSection()}
        {Object.keys(this.props.currentProfile.characters.minor).map((key, index) => (
          <div className="minorCharacter compact-item" key={index}>
            <div className="flex-horizontal double-flex-container">
              {U.renderLabeledInput(
                "Name:",
                `minor.${key}.name`,
                {
                  ...this.inputOptions,
                  className: "text-emphasis"
                }
              )}
              {U.renderLabeledInput(
                "Type:",
                `minor.${key}.type`,
                this.inputOptions
              )}
            </div>
            {U.renderLabeledTextarea(
              "Concept:",
              `minor.${key}.concept`,
              this.inputOptions
            )}
          </div>
        ))}
      </div>
    );
  };

  renderCurrentProfile = () => {
    if (this.props.currentProfile) {
      return (
        <form className="profile-form">
          {this.renderGameSection()}
          {this.renderSettingSection()}
          {this.renderPrimaryCharacterSection()}
          {this.renderPartyMembersSection()}
          {this.renderMinorCharactersSection()}
        </form>
      );
    }
  };

  render() {
    console.log("=== Profile.render() ===\nSTATE", this.state);
    console.log("PROPS\n", this.props);
    console.log("PROFILE\n", this.props.currentProfile);
    console.log("========================");

    return (
      <div className="profile compact-layout">
        {/* Render the "New Profile" and "Load Profile" buttons */}
        <button onClick={this.newProfile} className="new-profile-button"><FontAwesomeIcon icon={faSquarePlus} />New</button>
        <button onClick={this.openLoadProfilePopup} className="load-profile-button"><FontAwesomeIcon icon={faDownload} />Load</button>
        {this.renderLoadProfileModal()}
        {this.renderDeleteProfileModal()}

        {/* Render currently-loaded profile, if there is one */}
        {this.renderCurrentProfile()}
      </div>
    );
  }
}

Profile.propTypes = {
  currentProfile: PropTypes.object,
  onProfileChange: PropTypes.func.isRequired,
  onProfilesChange: PropTypes.func.isRequired, // Add a new prop for updating the list of saved profiles
  onInputChange: PropTypes.func.isRequired,
  onProfileRender: PropTypes.func.isRequired,
  profiles: PropTypes.object // Add a new prop for the list of saved profiles
};

export default Profile;
