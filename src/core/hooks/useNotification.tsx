import { useState } from "react";

export const useNotification = () => {
  const [showNotification, setShowNotification] = useState(false);

  return { showNotification, setShowNotification };
};
