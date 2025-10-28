import { Agent, run, imageGenerationTool, withTrace } from "@openai/agents";

export async function runMonsterMakeover(imageDataUrl) {
  const agent = new Agent({
    name: "Image generator",
    instructions: "You are a helpful agent.",
    tools: [
      imageGenerationTool({
        quality: "medium",
        inputFidelity: "high",
        outputFormat: "jpeg",
      }),
    ],
  });

  return withTrace("Monster makeover", async () => {
    console.log("Asking the agent to identify the monster in the photo...");
    const guessResult = await run(agent, [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Look at the photo and guess which classic monster the person is pretending to be. Respond with just the monster's name, nothing else.",
          },
          {
            type: "input_image",
            image: imageDataUrl,
          },
        ],
      },
    ]);

    const guessedMonster = extractFinalText(guessResult.finalOutput).trim();
    if (!guessedMonster) {
      throw new Error("The agent did not return a monster guess.");
    }

    console.log(`Monster guess: ${guessedMonster}`);
    console.log("Transforming the image to match the guessed monster...");

    const transformResult = await run(agent, [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Transform the person in this photo so they fully look like ${guessedMonster}. Keep the background and pose consistent. Return only the transformed image.`,
          },
          {
            type: "input_image",
            image: imageDataUrl,
          },
        ],
      },
    ]);

    for (const item of transformResult.newItems) {
      if (
        item.type === "tool_call_item" &&
        item.rawItem.type === "hosted_tool_call" &&
        item.rawItem.output
      ) {
        return item.rawItem.output;
      }
    }

    throw new Error("No transformed image was returned by the agent.");
  });
}

function extractFinalText(finalOutput) {
  if (!finalOutput) {
    return "";
  }
  if (typeof finalOutput === "string") {
    return finalOutput;
  }
  if (Array.isArray(finalOutput)) {
    return finalOutput.map(extractFinalText).join(" ");
  }
  if (typeof finalOutput === "object") {
    if ("text" in finalOutput && typeof finalOutput.text === "string") {
      return finalOutput.text;
    }
    if ("content" in finalOutput) {
      return extractFinalText(finalOutput.content);
    }
  }
  return String(finalOutput);
}
