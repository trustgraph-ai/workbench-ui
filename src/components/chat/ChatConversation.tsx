import React from "react";

import ChatHistory from "./ChatHistory";
import InputArea from "./InputArea";
import EntityList from "../common/EntityList";

import { useSocket } from "../../api/trustgraph/socket";
import { useWorkbenchStateStore } from "../../state/workbench";
import { useProgressStateStore } from "../../state/progress";
import { useChatStateStore } from "../../state/chat";
import { submitChat } from "./submit";
import { useSessionStore } from "../../state/session";

const ChatConversation = () => {
  const socket = useSocket();

  const addMessage = useChatStateStore((state) => state.addMessage);

  const input = useChatStateStore((state) => state.input);
  const setInput = useChatStateStore((state) => state.setInput);

  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );
  const flowId = useSessionStore((state) => state.flowId);

  const setEntities = useWorkbenchStateStore((state) => state.setEntities);

  const submit = () => {
    console.log("Input:", input);
    submitChat(
      socket,
      flowId,
      input,
      addMessage,
      addActivity,
      removeActivity,
      setInput,
      setEntities,
    );
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
