import { THEMES, DEFAULT_THEME, PREFS_KEY, OVERRIDE_KEY } from "./themes";

const variantIds = (pack) => THEMES[pack].variants.map((v) => v.id);

const MAP = Object.fromEntries(Object.keys(THEMES).map((k) => [k, variantIds(k)]));

export const NO_FLASH_SCRIPT = `(function(){var d=document.documentElement;try{var T=${JSON.stringify(MAP)},p={},q=null;try{p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)}))||{}}catch(e){}var n=p.navMode==="pill"?"pill":"rail";try{var u=new URLSearchParams(location.search).get("theme");if(u&&T[u.split("-")[0]]){sessionStorage.setItem(${JSON.stringify(OVERRIDE_KEY)},u);q=u}else{q=sessionStorage.getItem(${JSON.stringify(OVERRIDE_KEY)})}}catch(e){}if(q){var i=q.indexOf("-"),k=i<0?q:q.slice(0,i);if(T[k])p={pack:k,variant:i<0?"":q.slice(i+1)}}var pk=T[p.pack]?p.pack:${JSON.stringify(DEFAULT_THEME.pack)},vs=T[pk],vr=vs.indexOf(p.variant)<0?vs[0]:p.variant;d.setAttribute("data-pack",pk);d.setAttribute("data-theme",vr);d.setAttribute("data-nav",n)}catch(e){}try{var s=sessionStorage;if(!s.getItem("omj-visited")){s.setItem("omj-visited","1");if(location.pathname==="/"&&!new URLSearchParams(location.search).has("theme")&&!navigator.webdriver&&!matchMedia("(prefers-reduced-motion: reduce)").matches){window.__omjBootAt=performance.now();d.setAttribute("data-boot","")}}}catch(e){}})();`;
