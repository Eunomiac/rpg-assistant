const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai"); // Importing OpenAI API

require("dotenv").config();

/* #region Initialize Open AI */
// const API_KEY = "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";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// Initializing OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
/* #endregion */


/* #region Custom Function Definitions for API usage. */
function getAIFunctions(currentProfile) {
  const functionData = {
    "get_characters": {
      "name": "get_characters",
      "description": "Call this function if you require information about a one or more character(s) named in the user prompt.",
      "parameters": {
        "type": "object",
        "properties": {
          "names": {
            "type": "string",
            "description": "A pipe-delimited list of the names of any character(s) you need information on, e.g. 'Kyle|Brady|Cory'",
          }
        },
        "required": ["names"],
      },
      func: function({names}) {
        if (typeof names !== "string") {
          return "(you did not submit a name to the function)";
        }

        const charNames = names.split(/\|/);

        if (!currentProfile) {
          throw new Error("Attempt to access AI function without a loaded profile.");
        }

        // Destructure characters and the glossary from currentProfile
        const {characters, glossary} = currentProfile;

        // Destructure primary, partyMembers, and minor from characters.
        const { primary, partyMembers, minor } = characters;

        // Create a dictionary containing all character names
        const nameDict = Object.fromEntries([
          [primary.name, primary],
          ...Object.entries(glossary),
          ...Object.values(partyMembers).map((pData) => {
            return [pData.name, pData];
          }),
          ...Object.values(minor).map((mData) => {
            return [mData.name, mData];
          })
        ]);

        console.log("==========================\n[SERVER] getAIFunctions().nameDict");
        console.dir(nameDict);
        console.log("===========================\n\n");

        // Create the data object which will contain the character information requested
        const returnData = {};

        // Iterate through each name submitted to the function, populating the data object with the relevant information.
        for (const charName of charNames) {
          if (nameDict[charName]) {
            returnData[charName] = nameDict[charName];
          } else {
            returnData[charName] = "No information available. Infer what you can from the other information provided and proceed with your response.";
          }
        }

        console.log("==========================\n[SERVER] getAIFunctions().get_characters");
        console.dir(returnData);
        console.log("===========================\n\n");

        return JSON.stringify(returnData);
      }
    },
  };

  if (currentProfile) {
    // A currentProfile was supplied: respond with the functions
    return Object.fromEntries(
      Object.entries(functionData)
        .map(([funcName, {func}]) => [funcName, func])
    );
  }

  // No currentProfile supplied: respond with function definitions for the AI
  return Object.values(functionData)
    .map((fData) => {
      const returnData = {...fData};
      delete returnData.func;
      return returnData;
    });
}
/* #endregion */

/* #region api/generate Route for Client-Side Queries */
app.post("/api/generate", async (req, res) => {
  const { messages, maxTokens, profile} = req.body;

  console.log("==========================\n[SERVER] POST->api/generate; messages:");
  console.dir(messages);
  console.log("===========================\n\n");
  // if (!window.aiFunctions) {
  //   DEVFUNCS.AssignToGlobalThis({
  //     aiFunctions: getAIFunctions(),
  //     getAIFunctions
  //   });
  // }

  try {
    const completionData = {
      model: "gpt-4",
      messages,
      functions: getAIFunctions(),
      function_call: "auto",
      max_tokens: maxTokens,
      temperature: 0.6
    };
    console.log("==========================\n[SERVER] POST->api/generate -> completionData");
    console.dir(completionData);
    console.log("===========================\n\n");

    // Step 1: send the conversation and available functions to GPT
    const response = await openai.chat.completions.create(completionData);

    const responseMessage = response.choices[0].message;

    console.log("==========================\n[SERVER] POST->api/generate -> SERVER RESPONSE:");
    console.dir(response);
    console.log("==========================\n\n");

    // Step 2: check if GPT wanted to call a function
    if (responseMessage.function_call) {

      // Step 3: call the function
      // Note: the JSON response may not always be valid; be sure to handle errors
      const functionName = responseMessage.function_call.name;
      const funcToCall = getAIFunctions(profile)?.[functionName];
      let functionResponse = "No additional data.";
      if (funcToCall) {
        const functionArgs = JSON.parse(responseMessage.function_call.arguments);
        functionResponse = funcToCall(functionArgs);
      }

      const newMessages = [
        responseMessage,
        {
          "role": "function",
          "name": functionName,
          "content": functionResponse
        }
      ];

      console.log("==========================\n[SERVER] POST->api/generate -> FUNCTION CALL:");
      console.dir(newMessages);
      console.log("==========================\n\n");

      // Step 4: send the info on the function call and function response to GPT
      messages.push(...newMessages);  // extend conversation with assistant's reply and function response

      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
      });  // get a new response from GPT where it can see the function response

      console.log("==========================\n[SERVER] POST->api/generate -> SECOND RESPONSE:");
      console.dir(secondResponse);
      console.log("==========================\n\n");

      res.json(secondResponse);
    } else {
      res.json(responseMessage);
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({error: "Error calling OpenAI API"});
  }
});
/* #endregion */

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.SERVER_PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT || 3001}`);
});