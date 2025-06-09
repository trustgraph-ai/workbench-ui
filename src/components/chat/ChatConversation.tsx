import React from "react";

import ChatHistory from "./ChatHistory";
import InputArea from "./InputArea";
import EntityList from "../common/EntityList";

import { useChatStateStore } from "../../state/chat";
import { useChat } from "../../state/chat-query";

const ChatConversation = () => {
  const input = useChatStateStore((state) => state.input);
  const { submitMessage } = useChat();

  const submit = () => {
    if (input.trim()) {
      submitMessage({ input });
    }
  };

  return (
    <>
      <ChatHistory />
      <InputArea onSubmit={() => submit()} />
      <EntityList />
    </>
  );
};

export default ChatConversation;
