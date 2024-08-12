import { useRecoilState } from "recoil";
import React, { useEffect } from "react";
import { alertState } from "../atoms/alertState";

const Alert = () => {
  const [alert, setAlert] = useRecoilState<any>(alertState);

  useEffect(() => {
    if (alert.show) {
      const timeoutId = setTimeout(() => {
        setAlert({ show: false, msg: "" });
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [alert, setAlert]);

  return (
    <>
      {alert.show && (
        <div
          className="text-center py-4 lg:px-4 fixed bottom-20 w-full animate-pop-up"
          style={{ animationDuration: "0.5s" }}
        >
          <div
            className={`p-2 items-center leading-none lg:rounded-full flex lg:inline-flex transition-opacity ease-in-out duration-1000 ${
              alert.type === "success"
                ? "bg-green-800 text-green-100"
                : alert.type === "warning" && "bg-red-800 text-red-100"
            }`}
            role="alert"
          >
            <span
              className={`flex rounded-full uppercase px-2 py-1 text-xs font-bold ${
                alert.type === "success"
                  ? "bg-green-500"
                  : alert.type === "warning" && "bg-red-500"
              }`}
            >
              {alert.msg}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;
