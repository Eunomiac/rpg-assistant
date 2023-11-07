// Importing necessary modules from react and react-router-dom
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// Importing custom components for different tabs
import TabNavigation from "./TabNavigation";
import ConfigurationTab from "./ConfigurationTab";
import Settings from "./Settings";
import Profile from "./Profile";
import OpenAITab from "./OpenAITab";
import Glossary from "./Glossary";

const DEVFUNCS = {
  AssignToGlobalThis: function(appInstance) {
    Object.assign(
      window,
      {
        AppInstance: appInstance,
      }
    );


  }
};


/** === STATE ===
 * State in React is a built-in object that a component can use to store property values
 * that belong to that component. When the state object changes, the component re-renders.
 *
 * In this file, the state is initialized in the constructor of the App component with
 * properties like currentProfile, profiles, and settings.
 **/

/** === REACT COMPONENTS ===
 * A React Component is a reusable piece of the UI. It can have its own logic and controls
 * its own rendering. Components can be defined as classes or functions.
 *
 * In this file, the App component is defined as a class.
 *   It has methods like handleProfileChange and handleSettingsChange, and a render method
 *   to display the component.
 **/

/** === ROUTES ===
 * Routes in React Router are used to define the application's routing structure. A Route
 * maps a URL path to a component, which should be rendered when that path is visited in
 * the browser.
 *
 * In this file, the Route component from react-router-dom is used to define routes for
 * different tabs like the configuration tab.
 **/


// Defining the main App component
class App extends React.Component {
  // Constructor for the App component
  constructor(props) {
    super(props);
    // Initializing state with default values
    this.state = {
      currentProfile: null, // Currently selected profile
      profiles: {}, // List of all profiles
      settings: {} // Current settings
    };
    // localStorage.clear();
  }

  // Method to adjust the height of a textarea
  adjustHeight = (element) => {
    this.observer.disconnect();
    element.style.height = "inherit";
    element.style.height = `${element.scrollHeight}px`;
    this.observer.observe(document, { attributes: true, childList: true, subtree: true });
  };

  // Method to adjust the height of all textareas
  adjustAllTextareas = () => {
    this.observer.disconnect();

    let count = 0;
    function _adjTextAreas() {
      count++;
      if (count >= 4) {
        this.observer.observe(document, { attributes: true, childList: true, subtree: true });
        return;
      }
      // Select all textarea elements
      const textareas = document.querySelectorAll("textarea");

      // Adjust the height of each textarea
      textareas.forEach(this.adjustHeight);
    }

    setTimeout(_adjTextAreas.bind(this), 50);
    setTimeout(_adjTextAreas.bind(this), 100);
    setTimeout(_adjTextAreas.bind(this), 200);
    setTimeout(_adjTextAreas.bind(this), 500);
    // this.observer.observe(document, { attributes: true, childList: true, subtree: true });
  };

  // Lifecycle method that runs after the component output has been rendered to the DOM
  componentDidMount() {
    DEVFUNCS.AssignToGlobalThis(this);
    // Create a MutationObserver to listen for changes to the textarea elements
    this.observer = new MutationObserver((mutationsList) => {
      // If the textarea's value or style.display has changed, adjust its height
      for(let mutation of mutationsList) {
        if (mutation.target.nodeName === "TEXTAREA" && mutation.type === "attributes" && (mutation.attributeName === "value" || mutation.attributeName === "style")) {
          this.adjustHeight(mutation.target);
        }
      }
    });

    // Start observing the document with the configured parameters
    this.observer.observe(document, { attributes: true, childList: true, subtree: true });

    this.setState({profiles: {}});
    // Load profiles from local storage
    const savedProfiles = localStorage.getItem("profiles");
    if (savedProfiles) {
      const parsedProfiles = JSON.parse(savedProfiles);
      Object.keys(parsedProfiles).forEach((key) => {
        if (!("glossary" in parsedProfiles[key])) {
          parsedProfiles[key].glossary = {};
        }
      });
      this.setState({ profiles: parsedProfiles });

    }

    // Load current profile from local storage
    const savedCurrentProfile = localStorage.getItem("currentProfile");
    if (savedCurrentProfile) {
      const parsedProfile = JSON.parse(savedCurrentProfile);
      if (!("glossary" in parsedProfile)) {
        parsedProfile.glossary = {};
      }
      this.setState({ currentProfile: parsedProfile });
    }

    // this.adjustAllTextareas();
  }

  componentWillUnmount() {
    // Disconnect the MutationObserver when the component is unmounted
    this.observer.disconnect();
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name.split(".");

    this.setState(prevState => {
      const currentProfile = { ...prevState.currentProfile };
      let propertyToUpdate = currentProfile;

      // Iterate through the substring keys of target
      for (let i = 0; i < name.length - 1; i++) {
        // Initialize each nested object that doesn't exist
        if (!(name[i] in propertyToUpdate)) {
          propertyToUpdate[name[i]] = {};
        }
        propertyToUpdate = propertyToUpdate[name[i]];
      }

      propertyToUpdate[name[name.length - 1]] = value;

      // Update the corresponding profile in the profiles object
      const updatedProfiles = { ...prevState.profiles };
      updatedProfiles[currentProfile.id] = currentProfile;

      return { currentProfile, profiles: updatedProfiles };
    }, () => {
      // Save the updated profiles to local storage
      localStorage.setItem("profiles", JSON.stringify(this.state.profiles));
      // Update the currentProfile prop in Profile.jsx
      this.handleProfileChange(this.state.currentProfile);
    });
  };

  // Method to handle profile changes
  handleProfileChange(profile) {
    console.log("App.handleProfileChange() profile: ", profile);
    // Updating the state with the new profile
    this.setState({ currentProfile: profile }, () => {
      // Save current profile to local storage after state update
      localStorage.setItem("currentProfile", JSON.stringify(profile));

      // Update the profile in the profiles array and save to local storage
      const updatedProfiles = Object.fromEntries(
        Object.entries(this.state.profiles ?? {})
          .map(([pID, pData]) => pID === profile.id ? [pID, profile] : [pID, pData])
      );
      this.setState({ profiles: updatedProfiles });
      localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
    });
    this.adjustAllTextareas();
  }

  // Method to handle changes to the profiles collection
  handleProfilesChange = (profiles) => {
    this.setState({ profiles: profiles });
    // Save profiles to local storage
    localStorage.setItem("profiles", JSON.stringify(profiles));
  };

  // Method to handle settings changes
  handleSettingsChange(settings) {
    // Updating the state with the new settings
    this.setState({ settings: settings });
  }

  // Render method to display the component
  render() {
    // Using Router to handle different routes
    return (
      <Router>
        <div className="App app-theme">
          {/* TabNavigation component for the navigation bar */}
          <TabNavigation onTabSwitch={this.adjustAllTextareas} currentProfile={this.state.currentProfile} />
          {/* Switch component to render only the first Route or Redirect that matches the location */}
          <Switch>

            {/* Route for the configuration tab */}
            <Route path="/configuration">
              {/* Passing methods and state as props to the ConfigurationTab component */}
              <ConfigurationTab
                onSettingsChange={(settings) => this.handleSettingsChange(settings)}
                settings={this.state.settings}
              />
            </Route>

            {/* Route for the settings tab */}
            <Route path="/settings">
              {/* Passing methods and state as props to the Settings component */}
              <Settings
                onSettingsChange={(settings) => this.handleSettingsChange(settings)}
                settings={this.state.settings}
              />
            </Route>

            {/* Route for the profile tab */}
            <Route path="/profile">
              {/* Passing methods and state as props to the Profile component */}
              <Profile
                onProfileChange={(profile) => this.handleProfileChange(profile)}
                onProfilesChange={(profiles) => this.handleProfilesChange(profiles)} // Pass onProfilesChange prop to Profile
                onProfileRender={this.adjustAllTextareas}
                onInputChange={this.handleInputChange} // Pass handleInputChange as a prop
                currentProfile={this.state.currentProfile}
                profiles={this.state.profiles} // Pass the profiles state as a prop
              />
            </Route>

            {/* Route for the glossary tab */}
            <Route path="/glossary">
              <Glossary
                onProfileChange={(profile) => this.handleProfileChange(profile)}
                currentProfile={this.state.currentProfile}
              />
            </Route>

            {/* Route for the OpenAI tab */}
            <Route path="/openai">
              {/* Passing state as props to the OpenAI component */}
              <OpenAITab
                currentProfile={this.state.currentProfile}
                settings={this.state.settings}
                onInputChange={this.handleInputChange}
              />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

// Exporting the App component to be used in other files
export default App;
