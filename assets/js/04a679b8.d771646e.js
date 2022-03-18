"use strict";(self.webpackChunksofie_documentation=self.webpackChunksofie_documentation||[]).push([[3522],{5318:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return p}});var r=t(7378);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=r.createContext({}),c=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},u=function(e){var n=c(e.components);return r.createElement(l.Provider,{value:n},e.children)},w={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=c(t),p=o,y=d["".concat(l,".").concat(p)]||d[p]||w[p]||a;return t?r.createElement(y,i(i({ref:n},u),{},{components:t})):r.createElement(y,i({ref:n},u))}));function p(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,i=new Array(a);i[0]=d;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var c=2;c<a;c++)i[c]=t[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},7408:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return s},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return u},default:function(){return d}});var r=t(5773),o=t(808),a=(t(7378),t(5318)),i=["components"],s={},l="iNEWS Gateway",c={unversionedId:"user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/inews-gateway",id:"version-1.37.0/user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/inews-gateway",isDocsHomePage:!1,title:"iNEWS Gateway",description:"The iNEWS Gateway communicates with an iNEWS system to ingest and remain in sync with a rundown.",source:"@site/versioned_docs/version-1.37.0/user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/inews-gateway.md",sourceDirName:"user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection",slug:"/user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/inews-gateway",permalink:"/sofie-core/docs/1.37.0/user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/inews-gateway",editUrl:"https://github.com/nrkno/sofie-core/edit/master/packages/documentation/versioned_docs/version-1.37.0/user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/inews-gateway.md",tags:[],version:"1.37.0",frontMatter:{},sidebar:"version-1.37.0/gettingStarted",previous:{title:"Playout Gateway",permalink:"/sofie-core/docs/1.37.0/user-guide/installation/installing-a-gateway/playout-gateway"},next:{title:"Google Spreadsheet Gateway",permalink:"/sofie-core/docs/1.37.0/user-guide/installation/installing-a-gateway/rundown-or-newsroom-system-connection/installing-sofie-with-google-spreadsheet-support"}},u=[{value:"Installing iNEWS for Sofie",id:"installing-inews-for-sofie",children:[]}],w={toc:u};function d(e){var n=e.components,t=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},w,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"inews-gateway"},"iNEWS Gateway"),(0,a.kt)("p",null,"The iNEWS Gateway communicates with an iNEWS system to ingest and remain in sync with a rundown."),(0,a.kt)("h3",{id:"installing-inews-for-sofie"},"Installing iNEWS for Sofie"),(0,a.kt)("p",null,"The iNEWS Gateway allows you to create rundowns from within iNEWS and sync them with the ",(0,a.kt)("em",{parentName:"p"},"Sofie","\xa0","Core"),". The rundowns will update in real time and any changes made will be seen from within your Playout Timeline. "),(0,a.kt)("p",null,"The setup for the iNEWS Gateway is already in the Docker Compose file you downloaded earlier. Remove the ",(0,a.kt)("em",{parentName:"p"},"#")," symbol from the start of the line labeled ",(0,a.kt)("inlineCode",{parentName:"p"},"image: tv2/inews-ftp-gateway:develop")," and add a ",(0,a.kt)("em",{parentName:"p"},"#")," to the other ingest gateway that was being used."),(0,a.kt)("p",null,"Although the iNEWS Gateway is available free of charge, an iNEWS license is not. Visit ",(0,a.kt)("a",{parentName:"p",href:"https://www.avid.com/products/inews/how-to-buy"},"Avid's website")," to find an iNEWS reseller that handles your geographic area."))}d.isMDXComponent=!0}}]);