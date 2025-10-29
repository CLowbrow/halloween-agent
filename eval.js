import { Eval, initDataset, initFunction } from "braintrust";
import { runMonsterizer } from "./monsterAgent.js";

const dataset = initDataset("Monsterizer", { dataset: "monster-pics" });

function _arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ""
  );
  return btoa(binary);
}

async function processAttachment(attachment) {
  const imageData = await attachment.data();
  const arrayBuffer = await imageData.arrayBuffer();
  const base64Image = _arrayBufferToBase64(arrayBuffer);
  return `data:image/jpeg;base64,${base64Image}`;
}

Eval(
  "Monsterizer", // Project
  {
    data: dataset,
    task: async (input) => {
      const imageDataUrl = await processAttachment(input["attachment"]);
      const result = await runMonsterizer(imageDataUrl);
      console.log("result:", result.slice(0, 30) + "...");
      return `data:image/jpeg;base64,${result}`;
    },
    scores: [
      initFunction({
        projectName: "Monsterizer",
        slug: "image-judge-beb6",
      }),
    ],
  }
);
