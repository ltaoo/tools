import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const BasicLayout = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // console.log(location);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        data-tauri-drag-region
        className="titlebar relative flex justify-between py-4 px-6"
      >
        <div>
          {location.pathname !== "/" && (
            <div
              className="absolute left-4 bottom-2 text-white cursor-pointer"
              onClick={() => {
                navigate(-1);
              }}
            >
              Back
            </div>
          )}
        </div>
        <div className="py-1 px-4 overflow-hidden rounded-2xl bg-white">
          <input
            className="outline-0"
            placeholder="输入关键字搜索"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
            }}
          />
          <button
            className="ml-2"
            onClick={() => {
              // console.log("[]search", keyword);
            }}
          >
            搜索
          </button>
        </div>
      </div>
      <div className="flex-1 w-full overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default BasicLayout;
