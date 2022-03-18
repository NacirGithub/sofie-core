"use strict";(self.webpackChunksofie_documentation=self.webpackChunksofie_documentation||[]).push([[3988],{5318:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return m}});var a=n(7378);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),d=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=d(e.components);return a.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},p=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),p=d(n),m=i,f=p["".concat(l,".").concat(m)]||p[m]||u[m]||r;return n?a.createElement(f,o(o({ref:t},c),{},{components:n})):a.createElement(f,o({ref:t},c))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=p;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,o[1]=s;for(var d=2;d<r;d++)o[d]=n[d];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}p.displayName="MDXCreateElement"},4119:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return s},contentTitle:function(){return l},metadata:function(){return d},toc:function(){return c},default:function(){return p}});var a=n(5773),i=n(808),r=(n(7378),n(5318)),o=["components"],s={sidebar_position:3},l="Access Levels",d={unversionedId:"user-guide/features/access-levels",id:"version-1.37.0/user-guide/features/access-levels",isDocsHomePage:!1,title:"Access Levels",description:"A variety of access levels can be set via the URL. By default, a user cannot edit settings, nor play out anything. Some of the access levels provide additional administrative pages or helpful tool tips for new users. These modes are persistent between sessions and will need to be manually disabled by replacing the 1 with a 0 in the URL. Below is a quick reference to the modes and what they have access to.",source:"@site/versioned_docs/version-1.37.0/user-guide/features/access-levels.md",sourceDirName:"user-guide/features",slug:"/user-guide/features/access-levels",permalink:"/sofie-core/docs/1.37.0/user-guide/features/access-levels",editUrl:"https://github.com/nrkno/sofie-core/edit/master/packages/documentation/versioned_docs/version-1.37.0/user-guide/features/access-levels.md",tags:[],version:"1.37.0",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"version-1.37.0/gettingStarted",previous:{title:"Sofie Views",permalink:"/sofie-core/docs/1.37.0/user-guide/features/sofie-views"},next:{title:"Prompter",permalink:"/sofie-core/docs/1.37.0/user-guide/features/prompter"}},c=[{value:"Basic mode",id:"basic-mode",children:[]},{value:"Studio mode",id:"studio-mode",children:[]},{value:"Configuration mode",id:"configuration-mode",children:[]},{value:"Help Mode",id:"help-mode",children:[]},{value:"Admin Mode",id:"admin-mode",children:[]},{value:"Testing Mode",id:"testing-mode",children:[]},{value:"Developer Mode",id:"developer-mode",children:[]}],u={toc:c};function p(e){var t=e.components,n=(0,i.Z)(e,o);return(0,r.kt)("wrapper",(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"access-levels"},"Access Levels"),(0,r.kt)("p",null,"A variety of access levels can be set via the URL. By default, a user cannot edit settings, nor play out anything. Some of the access levels provide additional administrative pages or helpful tool tips for new users. These modes are persistent between sessions and will need to be manually disabled by replacing the ",(0,r.kt)("em",{parentName:"p"},"1")," with a ",(0,r.kt)("em",{parentName:"p"},"0")," in the URL. Below is a quick reference to the modes and what they have access to."),(0,r.kt)("p",null,"If user accounts are enabled ","(",(0,r.kt)("inlineCode",{parentName:"p"},"enableUserAccounts")," in ",(0,r.kt)("a",{parentName:"p",href:"../configuration/sofie-core-settings#settings-file"},(0,r.kt)("em",{parentName:"a"},"Sofie","\xa0","Core")," settings"),")",", the access levels are set under the user settings. If no user accounts are set, the access level for a browser is set by adding ",(0,r.kt)("inlineCode",{parentName:"p"},"?theaccessmode=1")," to the URL as described below."),(0,r.kt)("p",null,"The access level is persisted in browser's Local Storage. To disable, visit",(0,r.kt)("inlineCode",{parentName:"p"},"?theaccessmode=0"),"."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Access area"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Basic Mode"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Configuration Mode"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Studio Mode"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Admin Mode"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("strong",{parentName:"td"},"Rundowns")),(0,r.kt)("td",{parentName:"tr",align:"left"},"View Only"),(0,r.kt)("td",{parentName:"tr",align:"left"},"View Only"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Yes, playout"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Yes, playout")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("strong",{parentName:"td"},"Settings")),(0,r.kt)("td",{parentName:"tr",align:"left"},"No"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Yes"),(0,r.kt)("td",{parentName:"tr",align:"left"},"No"),(0,r.kt)("td",{parentName:"tr",align:"left"},"Yes")))),(0,r.kt)("h3",{id:"basic-mode"},"Basic mode"),(0,r.kt)("p",null,"Without enabling any additional modes in Sofie, the browser will have minimal access to the system. It will be able to view a rundown but, will not have the ability to manipulate it. This includes activating, deactivating, or resetting the rundown as well as taking the next part, adlib, etc."),(0,r.kt)("h3",{id:"studio-mode"},"Studio mode"),(0,r.kt)("p",null,"Studio Mode gives the current browser full control of the studio and all information associated to it. This includes allowing actions like activating and deactivating rundowns, taking parts, adlibbing, etc. This mode is accessed by adding a ",(0,r.kt)("inlineCode",{parentName:"p"},"?studio=1")," to the end of the URL."),(0,r.kt)("h3",{id:"configuration-mode"},"Configuration mode"),(0,r.kt)("p",null,"Configuration mode gives the user full control over the Settings pages and allows full access to the system including the ability to modify ",(0,r.kt)("em",{parentName:"p"},"Blueprints"),", ",(0,r.kt)("em",{parentName:"p"},"Studios"),", or ",(0,r.kt)("em",{parentName:"p"},"Show Styles"),", creating and restoring ",(0,r.kt)("em",{parentName:"p"},"Snapshots"),", as well as modifying attached devices."),(0,r.kt)("h3",{id:"help-mode"},"Help Mode"),(0,r.kt)("p",null,"Enables some tooltips that might be useful to new users. This mode is accessed by adding ",(0,r.kt)("inlineCode",{parentName:"p"},"?help=1")," to the end of the URL."),(0,r.kt)("h3",{id:"admin-mode"},"Admin Mode"),(0,r.kt)("p",null,"This mode will give the user the same access as the ",(0,r.kt)("em",{parentName:"p"},"Configuration")," and ",(0,r.kt)("em",{parentName:"p"},"Studio")," modes as well as having access to a set of ",(0,r.kt)("em",{parentName:"p"},"Test Tools")," and a ",(0,r.kt)("em",{parentName:"p"},"Manual Control")," section on the Rundown page."),(0,r.kt)("p",null,"This mode is enabled when ",(0,r.kt)("inlineCode",{parentName:"p"},"?admin=1")," is added the end of the URL."),(0,r.kt)("h3",{id:"testing-mode"},"Testing Mode"),(0,r.kt)("p",null,"Enables the page Test Tools, which contains various tools useful for testing the system during development. This mode is enabled when ",(0,r.kt)("inlineCode",{parentName:"p"},"?testing=1")," is added the end of the URL."),(0,r.kt)("h3",{id:"developer-mode"},"Developer Mode"),(0,r.kt)("p",null,"This mode will enable the browsers default right click menu to appear and can be accessed by adding ",(0,r.kt)("inlineCode",{parentName:"p"},"?develop=1")," to the URL. It will also reveal the Manual Control section on the Rundown page."))}p.isMDXComponent=!0}}]);