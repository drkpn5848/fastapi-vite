import React, { useState, useEffect } from "react";
import "./Toast.css";

const Toast = ({ toastData }) => {
  const IMGURL = import.meta.env.BASE_URL;
  const [toasts, setToasts] = useState([]);

  const toastDetails = {
    success: { icon: "success.png", text: "Success:" },
    error: { icon: "error.png", text: "Error:" },
    warning: { icon: "warning.png", text: "Warning:" },
  };

  useEffect(() => {
    if (!toastData.message) return;
    setToasts((prev) => [...prev, toastData]);

    setTimeout(() => {
      removeToast(toastData.id);
    }, 5000);
  }, [toastData]);


  const removeToast = (id) => {
    setToasts((toast) => toast.filter((ele) => ele.id !== id));
  };

  return (
    <ul className="notifications">
      {toasts.map((toast) => (
        <li key={toast.id} className={`toast ${toast.type}`}>
          <div className="column">
            <img src={IMGURL + toastDetails[toast.type].icon} alt="" />
            <span>{toastDetails[toast.type].text} {toast.message}</span>
          </div>
          <label onClick={() => removeToast(toast.id)}>&times;</label>
        </li>
      ))}
    </ul>
  );
};

export default Toast;