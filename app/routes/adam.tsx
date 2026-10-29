import { useEffect, useState } from "react";
import { portfolioContent } from "~/portfolio/content";
import type { PortfolioWork } from "~/portfolio/types";
import styles from "~/styles/adam.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];
const api = "/.netlify/functions/works";
type Mode = "loading" | "demo" | "database" | "error";
const clone = (works: readonly PortfolioWork[]): PortfolioWork[] => JSON.parse(JSON.stringify(works));

export default function Adam() {
  const [mode, setMode] = useState<Mode>("loading");
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [works, setWorks] = useState<PortfolioWork[]>(clone(portfolioContent.works.items));
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch(`${api}?action=status`).then(async response => {
      if (import.meta.env.DEV && response.headers.get("content-type")?.includes("text/html")) { setMode("demo"); return; }
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.mode !== "demo" && data.mode !== "database") throw new Error();
      if (data.mode === "database") {
        if (!data.authConfigured) setMessage("数据库已连接，请在 Netlify 配置 ADMIN_PASSWORD 和 SESSION_SECRET。 ");
        const r = await fetch(api);
        if (!r.ok) throw new Error();
        const result = await r.json();
        if (result.mode !== "database" || !Array.isArray(result.works)) throw new Error();
        setWorks(result.works);
      }
      setMode(data.mode);
    }).catch(() => {
      // Vite alone does not run Netlify Functions. Production never falls back
      // to demo when the API or a configured database is unavailable.
      setMode("error"); setMessage("无法连接服务。请检查 Netlify Functions 和数据库配置。");
    });
  }, []);
  async function login(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    if (mode === "demo") {
      if (password === "preview123") setLoggedIn(true); else setMessage("预览密码不正确。");
    } else {
      try {
        const response = await fetch(`${api}?action=login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
        if (!response.ok) throw new Error();
        setLoggedIn(true);
      } catch { setMessage("登录失败，请检查密码及服务配置。"); }
    }
    setPassword("");
  }
  function update(index: number, field: string, value: string) {
    setWorks(current => current.map((work, i) => {
      if (i !== index) return work;
      if (field === "titleZh" || field === "titleEn") return { ...work, title: { ...work.title, [field === "titleZh" ? "zh" : "en"]: value } };
      if (field === "creditZh" || field === "creditEn") return { ...work, credit: { ...work.credit, [field === "creditZh" ? "zh" : "en"]: value } };
      if (field === "image") return { ...work, image: { ...work.image, src: value } };
      return { ...work, [field]: value };
    }));
  }
  async function save() {
    if (mode === "demo") { setMessage("预览模式：修改仅保留在当前页面，刷新后消失。"); return; }
    try {
      const response = await fetch(api, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ works }) });
      if (!response.ok) throw new Error(response.status === 401 ? "登录已过期，请刷新后重新登录。" : "保存失败，请检查内容、图片链接和服务日志。");
      setMessage("保存成功，首页将显示数据库中的作品。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "保存失败。"); }
  }
  return <main className="adam">
    <header className="adam-header"><a href="/">BrainEno</a><span>WORKS / ADMIN</span></header>
    <div className="adam-body">
      <p className="adam-kicker">PORTFOLIO MANAGEMENT / 01</p>
      <h1>Works<span>.</span></h1>
      <p className="adam-lede">编辑作品名称、日期、技术栈与图片链接。<br />Design your own story.</p>
      <p className="adam-mode">{mode === "demo" ? "● 预览模式 · 数据不会保存" : mode === "database" ? "● PostgreSQL 已连接" : mode === "loading" ? "正在连接…" : "● 服务不可用"}</p>
      {message && <p className="adam-message" role="status">{message}</p>}
      {!loggedIn && (mode === "demo" || mode === "database") && <form className="adam-login" onSubmit={login}>
        <label htmlFor="password">{mode === "demo" ? "预览密码：preview123" : "管理员密码"}</label>
        <div><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /><button>进入 / ENTER ↗</button></div>
      </form>}
      {loggedIn && <div className="adam-editor">
        {works.map((work, i) => <article className="adam-work" key={work.id}>
          <div className="adam-work-head"><span>PROJECT / {String(i + 1).padStart(2, "0")}</span><button type="button" onClick={() => setWorks(works.filter((_, j) => i !== j))}>删除 ×</button></div>
          <div className="adam-grid">{([['titleZh','项目名称（中文）',work.title.zh],['titleEn','项目名称（英文）',work.title.en],['year','开始日期',work.year],['creditZh','技术栈（中文）',work.credit.zh],['creditEn','技术栈（英文）',work.credit.en],['image','图片链接（https:// 或 /路径）',work.image.src]] as const).map(([field,label,value]) => <label key={field}>{label}<input value={value} onChange={e => update(i,field,e.target.value)} /></label>)}</div>
        </article>)}
        <div className="adam-actions"><button type="button" onClick={() => setWorks([...works, { id: crypto.randomUUID(), title: { zh: "新项目", en: "New project" }, year: "2026", credit: { zh: "Web", en: "Web" }, image: { src: "/images/tree1.jpg", alt: { zh: "项目图片", en: "Project image" } } }])}>添加作品 +</button><button type="button" onClick={save}>保存更改 ↗</button></div>
      </div>}
      <footer>© BrainEno / BUILD WITH INTENTION</footer>
    </div>
  </main>;
}
