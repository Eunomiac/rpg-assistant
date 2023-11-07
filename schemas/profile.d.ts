/* NOTE FOR AI: This is not a TypeScript project. I'm including this definitions file only as a reference for you,
  so you know how I want to structure various data objects in the app. */

/* Definitions for the objects defining Primary, PartyMember, and Minor characters. */
namespace Character {

  export type Name = string // A type alias for a character's name
  export type MinorType = string // A type alias for the type of a Character.Minor

  // Character.Base -- Properties that all character definitions will have.
  interface Base {
    name: Name, // The character's name
    concept: string, // A brief overview of the character
    pronouns: string // A comma-delimited list of pronouns in the following order: subject, object, possessive, reflexive.  Only the first is required; the others will be inferred by the AI unless expressly stated.
      // E.g. "he,him,his,himself"
  }

  // Character.PC -- Extra properties defining a character played by a player (i.e. not an NPC)
  interface PlayerCharacter {
    partyRole: string, // A brief description of the character's primary role in the party.
    strengths?: string, // A brief description of the things the character is especially good at and known for.
    flaws?: string, // A brief description of the character's flaws or negative quirks.
  }


  // Character.Primary -- The character being played by the user of this app.
  export interface Primary extends Base, Required<PlayerCharacter> {
    personality: string, // A brief description of the character's personality.
    motifs: string // A pipe-delimited list of words or short phrases describing motifs and imagery associated with the character.
  }

  // Character.PartyMember -- Definition for the other characters in the user's party
  export interface PartyMember extends Base, PlayerCharacter {
    relationship: string, // A string describing the current relationship between this character and the Primary character.
    opinionOf: string // A string describing the Primary character's opinion of and feelings towards this character
  }

  // Character.Minor -- Definition for non-player characters or minor characters the Primary character may encounter or interact with.
  export interface Minor extends Base {
    type: MinorType // A broad description of the 'type' of this character, e.g. "person", "group", "animal", "pack of minions", etc.
                    //  Each type must be described in ProfileSchema.setting.minorCharacterTypes (below)
   }

}

/* Schema Describing Structure of the 'profile' object, which defines a Profile.
   The system message sent to the API will be constructed from this data. */
interface ProfileSchema {
  id: string, // Unique ID generated when the profile is created.
  setting: {
    gameName: string, // Name of the game being played, e.g. "Blades in the Dark"
    genre: string, // The genre of the game, e.g. "Fantasy", "Space Opera"
    tone: string, // A description of the tone the game is aiming for, e.g. "Grimdark", "Serious", "Comically Evil"
    details: string // A catch-all string describing any other useful information about the setting for the AI to use
    minorCharacterTypes: Record<
      Character.MinorType,
      string
    > // A simple object defining the meanings of the various types that can be assigned to Character.Minor characters.
  },
  characters: {
    primary: Character.Primary, // The character being played by the user.
    partyMembers: Record< // The other characters in the user's party.
      Character.Name,
      Character.PartyMember
    >,
    minor: Record< // Any other characters the Primary meets along the way, and may want to interact with.
      Character.Name,
      Character.Minor
    >
  },
  glossary: Record<
    string, // The 'key' (i.e. word or phrase called out by '#' to be defined)
    string  // The 'definition' (entered by user to define or explain 'key')
  >
}

type PromptDataKey = string // Type alias for the names of <input> elements containing data filled in by the user in the app UI

/* Schema Describing Structure of the 'prompt' object, which defines all the elements of the prompt to be submitted to the API */
interface PromptSchema {

  /* PromptSchema.tab -- Each tab of the app will be for a different type of prompt. This object contains data set by the tab itself,
                         specific to that tab's purpose and behavior. */
  tab: {
    overview: string, // A general description of the purpose or nature of prompts sent from that tab, to be included in the system message.
    responseCount: number // The number of responses the API should reply with, in a pipe-delimited string.
    promptText: string // The final question appended to the end of the user message sent with this prompt.
  },


  /* PromptSchema.data -- Each tab will contain a variety of input elements (buttons, toggles, text input, etc). Each will be given
                          a name attribute of type PromptDataKey. This object describes the purpose of each piece of input, as well
                          as the actual input the user has supplied.  This data will be extracted and parsed into the user prompt sent
                          to the API */
  data: {
    definitions: Record<
      PromptDataKey,
      string
    >, // A description of the meaning or purpose of each named source of input in the tab.
    input: Record<
      PromptDataKey,
      string
    > // The current input, if any, that the user has supplied to the named input.
  },

  /* PromptSchema.characters -- An array of character names defined in ProfileSchema.characters that should be included in the prompt.
                                The way the API should consider or include this data will be defined in PromptSchema.tab.
                                The prompt will only include the character data for these, as well as the Character.Primary. */
  characters: Array<Character.Name>
}