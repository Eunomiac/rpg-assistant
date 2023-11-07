// Importing necessary libraries
import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import U from "./Utilities";
import AIController from "./AIController";


// Creating a class component named OpenAI
class OpenAITab extends React.Component {

  state = {
    prompt: "",
    tabData: {},
    response: ""
  };

  handlePromptChange = (event) => {
    this.setState({ prompt: event.target.value });
  };

  // eslint-disable-next-line no-unused-vars
  getTabSystemPrompt(_profile, _tabData) {
    return [
      " ",
      "The user prompt should be interpreted as describing a specific scene or set of circumstances in which the primary character is featured. You must respond with ten potential lines of dialogue that the primary character could immediately say in the circumstances described.  Your suggestions should meet the following requirements:",
      "- be creative, evocative, stylish and impressive",
      "- align with the primary character as described to you above",
      "- align with the game, setting and tone as described above",
      "",
      "Use any functions provided to you to seek any further information you need to provide high-quality responses.",
      "Format your response as a pipe-delimited list, e.g. '<suggestion #1>|<suggestion #2>|<suggestion #3>|...etc.'"
    ].join("/\n/");
  }

  // eslint-disable-next-line no-unused-vars
  getAssistantPrompts(currentProfile, tabData) {
    return [
      {
        role: "user",
        content: "My party members are bothering me."
      },
      {
        role: "assistant",
        content: "Please, could you give me a moment? I'm trying to concentrate on something important.|I understand that you have questions, but right now, I need some peace and quiet.|I appreciate your enthusiasm, but I'm in the midst of a delicate magical task. If you'll excuse me.|Ah, the wonders of solitude. Just what I need to focus on my arcane studies.|My dear friends, I'm afraid now is not the time for idle chatter. I have pressing matters at hand.|Gentle companions, I implore you, let me find my center. Your interruptions are hindering my progress.|I sense your curious minds, but I'm bound by the call of ancient knowledge. I must heed it above all else.|My apologies, but my mind is currently awash in a labyrinth of magic. I fear I cannot attend to your queries just now.|In this sea of arcane mysteries, I must find my way. Your intrusions only add to the storm. Pray, be still.|I beseech thee, fellow adventurers, grant me a respite. I need to commune with the ancient secrets that bind us all."
      }
    ];
  }

  parseAIResponse(respString) {
    if (respString && respString.trim()) {
      return (
        <ul>
          {respString.split(/\|/).map((subStr, index) => {
            return <li key={index}>{subStr}</li>;
          })}
        </ul>
      );
    }
    return "";
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { prompt, tabData } = this.state;
    const { settings, currentProfile } = this.props;

    const systemPromptStrings = [
      AIController.GetGeneralSystemPrompt(),
      AIController.GetSettingsSystemPrompt(settings),
      AIController.GetGameSystemPrompt(currentProfile),
      AIController.GetSettingSystemPrompt(currentProfile),
      AIController.GetPrimaryCharacterSystemPrompt(currentProfile),
      this.getTabSystemPrompt(currentProfile, tabData)
    ];

    systemPromptStrings.push(
      AIController.GetGlossarySystemPrompt(currentProfile, [
        ...systemPromptStrings,
        prompt
      ])
    );

    const data = {
      messages: [
        {
          role: "system",
          content: systemPromptStrings.join(/\n/)
        },
        ...this.getAssistantPrompts(currentProfile, tabData),
        {
          role: "user",
          content: prompt
        }
      ],
      maxTokens: settings.maxTokens || 500,
      profile: currentProfile,
      tabData
    };

    try {
      const response = await axios.post("http://localhost:3001/api/generate", data);
      if ("choices" in response.data) {
        this.setState({ response: response.data.choices?.[0]?.message?.content ?? "No Response"});
      } else if ("content" in response.data) {
        this.setState({ response: response.data.content ?? "No Response"});
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Add more error handling here if needed
    }
  };

  render() {

    return (
      <div className="openai compact-layout">
        <h2>OpenAI</h2>
        <form className="openai-form" onSubmit={this.handleSubmit}>
          {U.renderLabeledTextarea(
            "Prompt:",
            "prompt",
            {
              dataSource: this.props.currentProfile,
              onChangeHandler: this.handlePromptChange,
              className: "input-prompt"
            }
          )}
          <button className="submit-button" type="submit">Get Inspiration</button>
        </form>
        <div>
          <h3>Response:</h3>
          {this.parseAIResponse(this.state.response)}
        </div>
      </div>
    );
  }
}

OpenAITab.propTypes = {
  currentProfile: PropTypes.object,
  settings: PropTypes.object,
  onInputChange: PropTypes.func.isRequired,
};

export default OpenAITab;