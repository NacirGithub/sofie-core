"use strict";(self.webpackChunksofie_documentation=self.webpackChunksofie_documentation||[]).push([[3147],{5318:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return f}});var n=r(7378);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=s(r),f=a,d=c["".concat(p,".").concat(f)]||c[f]||m[f]||o;return r?n.createElement(d,i(i({ref:t},u),{},{components:r})):n.createElement(d,i({ref:t},u))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=c;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var s=2;s<o;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},1806:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return l},contentTitle:function(){return p},metadata:function(){return s},toc:function(){return u},default:function(){return c}});var n=r(5773),a=r(808),o=(r(7378),r(5318)),i=["components"],l={sidebar_label:"v1.37 (2021-12-08)",sidebar_position:996,title:"Release 37"},p=void 0,s={unversionedId:"release37",id:"release37",isDocsHomePage:!1,title:"Release 37",description:"Release date: 2021-12-08 \\(1.37.0\\)",source:"@site/releases/release37.md",sourceDirName:".",slug:"/release37",permalink:"/sofie-core/releases/release37",tags:[],version:"current",sidebarPosition:996,frontMatter:{sidebar_label:"v1.37 (2021-12-08)",sidebar_position:996,title:"Release 37"},sidebar:"default",previous:{title:"v1.38 (2022-01-26)",permalink:"/sofie-core/releases/release38"},next:{title:"v1.35 (2021-07-13)",permalink:"/sofie-core/releases/release35"}},u=[{value:"Main features",id:"main-features",children:[]},{value:"Components",id:"components",children:[]}],m={toc:u};function c(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Release date: 2021-12-08 ","(","1.37.0",")"),(0,o.kt)("h3",{id:"main-features"},"Main features"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/nrkno/tv-automation-server-core/issues/553"},"Action Triggers")," - new 'hotkey' system"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/nrkno/tv-automation-server-core/pull/540"},"Back timing")," - rundowns can be timed from when they should end instead of when they should start"),(0,o.kt)("li",{parentName:"ul"},"New styling for infinite Pieces"),(0,o.kt)("li",{parentName:"ul"},"Beta version of the ",(0,o.kt)("a",{parentName:"li",href:"https://github.com/nrkno/tv-automation-package-manager"},"Package manager")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/nrkno/tv-automation-server-core/pull/574"},"Pieces can specify how to be direct-played")," (when double clicked in the timeline)"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/nrkno/tv-automation-server-core/pull/592"},"Rundown View Layout SourceLayer visibility")),(0,o.kt)("li",{parentName:"ul"},"Various fixes and internal improvements")),(0,o.kt)("h3",{id:"components"},"Components"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:"left"},"Component"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Version"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("a",{parentName:"td",href:"https://github.com/nrkno/tv-automation-server-core"},"Core")," ",(0,o.kt)("br",null)," ",(0,o.kt)("a",{parentName:"td",href:"https://www.npmjs.com/package/@sofie-automation/blueprints-integration"},"Blueprints API ( Core )"),(0,o.kt)("br",null),(0,o.kt)("a",{parentName:"td",href:"https://www.npmjs.com/package/@sofie-automation/server-core-integration"},"Gateway API"),(0,o.kt)("br",null),(0,o.kt)("a",{parentName:"td",href:"https://github.com/nrkno/tv-automation-mos-gateway"},"Mos Gateway"),(0,o.kt)("br",null),(0,o.kt)("a",{parentName:"td",href:"https://github.com/nrkno/tv-automation-playout-gateway"},"Playout Gateway")),(0,o.kt)("td",{parentName:"tr",align:"left"},"1.37")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("a",{parentName:"td",href:"https://www.npmjs.com/package/timeline-state-resolver"},"Blueprints API ( TSR )")),(0,o.kt)("td",{parentName:"tr",align:"left"},"6.2.0")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("a",{parentName:"td",href:"https://github.com/nrkno/tv-automation-package-manager"},"Package Manager")),(0,o.kt)("td",{parentName:"tr",align:"left"},"1.2")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("a",{parentName:"td",href:"https://github.com/nrkno/tv-automation-media-management"},"Media Manager")),(0,o.kt)("td",{parentName:"tr",align:"left"},"1.12")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("a",{parentName:"td",href:"https://github.com/nrkno/tv-automation-quantel-gateway"},"Quantel Gateway")),(0,o.kt)("td",{parentName:"tr",align:"left"},"1.5.1")))))}c.isMDXComponent=!0}}]);