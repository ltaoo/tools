/**
 * @file 工具首页
 */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-5xl font-bold">My Tools</h1>
      <div>
        <h2 className="text-xl font-bold">按钮</h2>
        <div className="mt-2 space-x-4">
          <div className="btn">默认按钮</div>
          <div className="btn btn--primary">主要按钮</div>
          <div className="btn btn--ghost">幽灵按钮</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
