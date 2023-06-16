import { Chess } from "chess.js";

const game = new Chess();

// Function to send a message to the ChatGPT API
async function sendMessage(message: string): Promise<string> {
  try {
    const API_KEY: string = await getDataLocal("apiKey");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", content: `you are a chess playing engine,
            you will respond in start-end positions you will get the fen of the game`
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    const data = await response.json();
    const aiMove = data.choices[0].message.content.trim();
    return aiMove;
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to propagate it
  }
}

function updateBoard(boardElement: HTMLElement): void {
  boardElement.textContent = game.ascii();
}

function getMoveFromMessage(message: string): string | boolean {
  const regex = /\b\w\d-\w\d\b/;
  const match = message.match(regex);
  console.log("regex match: ", match);

  if (match !== null && match !== undefined) return match[0];

  return false;
}

function makeMoveAndUpdate(startEndStr: string, boardElement: HTMLElement): void {
  let moveResult;

  try {
    moveResult = game.move(startEndStr);
  } catch (e) {
    console.error(e);
  } finally {
    console.log(moveResult);
    if (moveResult === null || moveResult === undefined) {
      alert("Invalid AI move");
    } else {
      updateBoard(boardElement);
    }
  }
}

async function main(boardElement: HTMLElement, moveInput: HTMLInputElement): Promise<void> {
  console.log("Move button clicked");
  const move = moveInput.value;
  const moveParts = move.split("-");

  if (moveParts.length === 2) {
    makeMoveAndUpdate(move, boardElement);

    moveInput.value = "";

    // Get AI's move after the player's move
    console.log("Asking chatGPT for it's move");
    const aiMove = await sendMessage(`we are playing chess with start-end
                                     notations just give your start-end nothing
                                     else - Player move: ${move}\nGame state:
                                       ${game.fen()}`);
    console.log(`AI Move: ${aiMove}`);

    const aiStartEndMove = getMoveFromMessage(aiMove);

    if (typeof aiStartEndMove === "string") {
      makeMoveAndUpdate(aiStartEndMove, boardElement);
    } else if (!aiStartEndMove) {
      console.log("ai message is not clear.", aiStartEndMove);
    }
  } else {
    alert("Invalid move format");
  }
}

function storeDataLocal(key: string, value: string): void {
  const data: Record<string, string> = {};
  data[key] = value;

  chrome.storage.local.set(data, () => {
    if (chrome.runtime.lastError) {
      console.error("Error storing data: ", chrome.runtime.lastError);
    } else {
      console.log("Data saved successfully!");
    }
  });
}

async function getDataLocal<T>(key: string): Promise<T> {
  return await new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result: Record<string, T>) => {
      const data = result[key];
      if (data !== undefined) {
        resolve(data as T);
      } else {
        reject(new Error(`Data for key '${key}' not found.`));
      }
    });
  });
}

// Add a listener for the DOMContentLoaded event so we can start manipulating the DOM
document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  const boardElement = document.getElementById("board") as HTMLElement;
  const moveButton = document.getElementById("moveButton") as HTMLButtonElement;
  const moveInput = document.getElementById("moveInput") as HTMLInputElement;

  const apiInput = document.getElementById("apiKey") as HTMLInputElement;
  const saveApiButton = document.getElementById("saveApiButton") as HTMLButtonElement;

  // Update the board display
  updateBoard(boardElement);

  // Handle move button clicks
  moveButton.addEventListener("click", () => {
    void (async () => {
      try {
        await main(boardElement, moveInput);
      } catch (error) {
        console.error(error);
      }
    })();
  });

  saveApiButton.addEventListener("click", () => {
    try {
      storeDataLocal("apiKey", apiInput.value);
    } catch (e) {
      console.error(e);
    }
  });
});
