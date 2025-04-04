"use client";

import ChatComponent from "@/components/chatbot/chat-component";
import { Modal } from "@/components/chatbot/window-ai/modal";
import { checkEnv } from "@/lib/utils";
import { useEffect, useState } from "react";

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