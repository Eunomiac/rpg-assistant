// Importing necessary libraries
// import React from "react";
// import PropTypes from "prop-types";
import axios from "axios";


// Creating a class component named OpenAI
class AIController {

  static GetGeneralSystemPrompt() {
    return "";
  }
  static GetSettingsSystemPrompt(settings) {
    return [
      "General Behavior:",
      ...Object.entries(settings)
        .map(([sKey, sVal]) => `- ${sKey}: ${sVal}`)
    ]
      .join(/\n/);
  }
  static GetGameSystemPrompt(currentProfile) {
    return [
      `The game is "${currentProfile.setting.gameName}" and the genre is "${currentProfile.setting.genre}".`,
      `In general, when responding, your tone should match the following: ${currentProfile.setting.tone}`
    ].join(/\n/);
  }
  static GetSettingSystemPrompt(currentProfile) {
    return [
      `Expanded details about the setting: ${currentProfile.setting.details}`
    ].join(/\n/);
  }
  static GetPrimaryCharacterSystemPrompt(currentProfile) {
    const {primary} = currentProfile.characters;
    const primaryCharStrings = [
      `The user is playing a character named '${primary.name}' (using ${primary.pronouns} pronouns), and is described as follows:`
    ];
    if (primary.partyRole) {
      primaryCharStrings.push(`- Role in the Party: '${primary.partyRole}'`);
    }
    if (primary.personality) {
      primaryCharStrings.push(`- Personality: ${primary.personality}`);
    }
    if (primary.strengths) {
      primaryCharStrings.push(`- Strengths & Advantages: ${primary.strengths}`);
    }
    if (primary.flaws) {
      primaryCharStrings.push(`- Flaws & Weaknesses: ${primary.flaws}`);
    }
    if (primary.motifs) {
      primaryCharStrings.push(`- Important Themes and Motifs: ${primary.motifs}` );
    }
    return primaryCharStrings.join(/\n/);
  }
  static GetGlossarySystemPrompt(currentProfile, systemPromptStrings) {
    const systemPromptString = systemPromptStrings.join(" ").trim();
    const definitionStrings = [];

    // Check for hashtags in the profileString
    const hashtagRegex = /#([^"\W:]+)|#"([^":]*)"/g;
    let match;
    while ((match = hashtagRegex.exec(systemPromptString)) !== null) {
      const term = match[1] || match[2];
      // If the term is in the glossary, add it to the definitions:
      if (currentProfile.glossary[term]) {
        definitionStrings.push(`${term}: ${currentProfile.glossary[term]}`);
      }
    }

    if (definitionStrings.length > 0) {
      return [
        " ",
        "GLOSSARY:",
        ...definitionStrings
      ].join(/\n/);
    } else {
      return "";
    }
  }

  submitPrompt = async (
    messages,
    profile,
    callback,
    maxTokens = 500
  ) => {

    try {
      const response = await axios.post("http://localhost:3001/api/generate", {
        messages,
        profile,
        maxTokens
      });
      if ("choices" in response.data) {
        callback(response.data.choices?.[0]?.message?.content ?? "No Response");
      } else if ("content" in response.data) {
        callback(response.data.content ?? "No Response");
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Add more error handling here if needed
    }
  };
}

export default AIController;