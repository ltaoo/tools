import React, { useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { QRCode } from "@/components/QRCode";
import { debounce } from "@/utils/lodash/debounce";

const escape = (v: string) => {
  const needsEscape = ['"', ";", ",", ":", "\\"];
  let escaped = "";
  for (const c of v) {
    if (needsEscape.includes(c)) {
      escaped += `\\${c}`;
    } else {
      escaped += c;
    }
  }
  return escaped;
};

function buildText(values: { name: string; pwd: string }) {
  const { name, pwd } = values;
  const ssid = name;
  const password = pwd;
  const props = {
    settings: {
      encryptionMode: "WPA",
      eapMethod: "",
      eapIdentity: "",
      ssid,
      password,
      hiddenSSID: false,
    },
  };
  const opts: Partial<{
    T: string;
    E: string;
    I: string;
    S: string;
    P: string;
    H: boolean;
  }> = {};
  opts.T = props.settings.encryptionMode || "nopass";
  if (props.settings.encryptionMode === "WPA2-EAP") {
    opts.E = props.settings.eapMethod;
    opts.I = props.settings.eapIdentity;
  }
  opts.S = escape(props.settings.ssid);
  opts.P = escape(props.settings.password);
  opts.H = props.settings.hiddenSSID;
  let data = "";
  Object.entries(opts).forEach(([k, v]) => (data += `${k}:${v};`));
  return `WIFI:${data};`;
  //   setText(qrval);
}
// const buildText2 = debounce(800, buildText);
interface IQRCodeConfigure {
  name: string;
  pwd: string;
}
function getQRCodeConfigure(): IQRCodeConfigure {
  return JSON.parse(localStorage.getItem("qrcode-configure") || "{}");
}
function updateQRCodeConfigure(config: IQRCodeConfigure) {
  return localStorage.setItem("qrcode-configure", JSON.stringify(config));
}

export default function WifiQRCodePage() {
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");
  const [text, setText] = useState("");

  const refresh = useCallback(
    debounce(800, (values) => {
      updateQRCodeConfigure(values);
      const r = buildText(values);
      setText(r);
    }),
    []
  );
  useEffect(() => {
    const { name = "", pwd = "" } = getQRCodeConfigure();
    setName(name);
    setPwd(pwd);
  }, []);

  useEffect(() => {
    if (!name) {
      return;
    }

    refresh({ name, pwd });
  }, [name, pwd]);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Wifi QRCode</h1>
      <div className="space-y-4">
        <div>
          <div>网络名称</div>
          <input
            className={cx("flex-1 input")}
            placeholder="请输入网络名称"
            value={name}
            onChange={(event) => {
              const content = event.target.value;
              setName(content);
            }}
          />
        </div>
        <div>
          <div>密码</div>
          <input
            className={cx("flex-1 input")}
            placeholder="请输入正则"
            value={pwd}
            onChange={(event) => {
              const content = event.target.value;
              setPwd(content);
            }}
          />
        </div>
        <div>
          <div>二维码</div>
          <QRCode text={text} width={240} height={240} />
        </div>
      </div>
    </div>
  );
}
