import{a as m,t as d,l as i,f as v,m as c}from"../chunks/disclose-version.BvK3jvqC.js";import{a4 as a,V as h,u as $,h as x,U as b,f,m as I,p as y,a5 as E,a as N}from"../chunks/runtime.BrGAlQLE.js";import{s as l}from"../chunks/render.D5wEQ807.js";import{s as U}from"../chunks/entry.DWOIv9A9.js";function k(s,t,n){if(s==null)return t(void 0),a;const e=s.subscribe(t,n);return e.unsubscribe?()=>e.unsubscribe():e}function w(s,t,n){let e=n[t];const r=e===void 0;r&&(e={store:null,last_value:null,value:I(b),unsubscribe:a},n[t]=e),(r||e.store!==s)&&(e.unsubscribe(),e.store=s??null,e.unsubscribe=A(s,e.value));const u=x(e.value);return u===b?e.last_value:u}function A(s,t){return s==null?(f(t,void 0),a):k(s,n=>f(t,n))}function D(s){L(()=>{let t;for(t in s)s[t].unsubscribe()})}function L(s){h(()=>()=>$(s))}const S=()=>{const s=U;return{page:{subscribe:s.page.subscribe},navigating:{subscribe:s.navigating.subscribe},updated:s.updated}},T={subscribe(s){return S().page.subscribe(s)}};var V=d("<h1> </h1> <p> </p>",1);function B(s,t){y(t,!0);const n={};D(n);const e=()=>w(T,"$page",n);var r=V(),u=v(r),p=i(u),g=c(c(u,!0)),_=i(g);E(()=>{var o;l(p,e().status),l(_,(o=e().error)==null?void 0:o.message)}),m(s,r),N()}export{B as component};