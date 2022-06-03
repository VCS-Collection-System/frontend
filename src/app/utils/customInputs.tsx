import { useEffect, useState } from "react";
import { KONAMI_CODE } from './constants'

const useInputEvent = () => {
  const [key, setKey] = useState(null);
  useEffect(() => {
    const keyDownHandler = ({ code }) => setKey(code);
    const keyUpHandler = () => setKey(null);
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler)
    }
  }, []);
  return key;
}

const useSecretCode = (secretCode) => {
  const [count, setCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const key = useInputEvent();
  
  useEffect(() => {
    if (key == null) return;
    if (key !== secretCode[count]) {
      setCount(0);
      return;
    }
    
    setCount((state) => state + 1);
    if (count + 1 === secretCode.length) {
      setSuccess(!success);
      setCount(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); 
  
  return success;
};

export const useDarkMode = () => {
  return useSecretCode(KONAMI_CODE);
};
