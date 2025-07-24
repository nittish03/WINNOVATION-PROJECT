"use client";
import React, { useState } from "react";
import { Bell, AlertTriangleIcon,MessageCircleIcon, BellIcon } from "lucide-react";
import { BorderBeam } from "./ui/border-beam";

const SOS = ({ sendSOS }) => {
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [SOSMessage, setSOSMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentSOS, setCurrentSOS] = useState("");

  const handleSendSOS = () => {
    if (SOSMessage.trim() !== "") {
      setCurrentSOS(SOSMessage);
      setShowAlert(true);
      setShowSOSModal(false);
    //   sendSOS(SOSMessage); // Function to send SOS globally
      setSOSMessage("");
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <div>

      {showAlert && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center animate-pulse">
          <AlertTriangleIcon className="mr-2 h-8 w-8" />
          <div>
            <strong>SOS:</strong> {currentSOS}
          </div>
          <button
            onClick={closeAlert}
            className="ml-4 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-40">
      <div className="relative group">
      <button onClick={()=>{setShowSOSModal(true)}} className="w-12 h-12 rounded-full border-none bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:animate-[jello_0.7s]">
<BorderBeam size={250} duration={2} />
<BellIcon size={24} />
      </button>
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs px-2 py-1 rounded-md transition-all duration-300">
        SOS
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-pink-500 rotate-45"></span>
      </span>
    </div>
      </div>

      {showSOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-white">
            <h2 className="text-2xl mb-4">Send SOS Message</h2>
            <textarea
              placeholder="Enter SOS message..."
              onChange={(e) => setSOSMessage(e.target.value)}
              className="w-full p-3 bg-gray-900 text-white rounded mb-4 focus:ring-2 focus:ring-blue-600"
              rows="3"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowSOSModal(false)}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSOS}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOS;
