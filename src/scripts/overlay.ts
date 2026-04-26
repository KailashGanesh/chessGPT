const nav = document.querySelector("nav") as HTMLElement;
const newChatBtn: HTMLAnchorElement | null =
  nav.querySelector("a")?.innerText == "New chat" ? nav.querySelector("a") :
    null;

if(newChatBtn){
  // create a new chat
  newChatBtn.click();

  // select GPT-3 or GPT-4
  // select input box
  // get send button
  // insert text into input box
  // check loading
  // check messages
  // check latest message
} else {
  alert(`unable to access chat gpt user interface. they must have changed the
          ui. pleae contact the devloper of the extention.`);
}
