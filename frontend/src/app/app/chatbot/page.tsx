"use client";

import ChatComponent from "@/components/chatbot/chat-component";
import { Modal } from "@/components/chatbot/window-ai/modal";
import { checkEnv } from "@/lib/utils";
import { useEffect, useState } from "react";

export const systemPrompt = `You are an assistant specialized in blockchain and cryptocurrency information. When providing code or technical explanations:
1. Always use markdown code blocks with appropriate language specifiers
2. Wrap code in triple backticks with the language name
3. For multi-language or complex code samples, use separate code blocks
4. Provide clear context around code blocks, and a 2 line break before and after code blocks and before and after explanations

IMPORTANT: You have access to specialized tools:

1. 'listTransactions' - Fetches blockchain transaction data for a wallet address
   When a user asks about wallet transactions or blockchain activity, you can use this tool.

When you display transaction data, the UI will automatically render it in a special component 
that shows the data in a table format with visual indicators and clickable links.

The user doesn't need to see the raw JSON data - it will be rendered in a special component.`;

export default function Chat() {
  const [error, setError] = useState<any>();
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const checkBrowser = async () => {
      try {
        await checkEnv();
      } catch (e) {
        console.log(e);
        if (e instanceof Error) {
          setError(e?.message);
          setShowModal(true);
        }
      }
    };
    checkBrowser();
  }, []);

  return (
    <>
      {showModal && <Modal error={error} closeModal={closeModal} />}
      <ChatComponent openModal={openModal} error={error} />
    </>
  );
}