"use strict";(self.webpackChunksofie_documentation=self.webpackChunksofie_documentation||[]).push([[3608,9514],{8516:function(e,a,t){var r=t(7378),n=t(42),c=t.n(n),l=t(9635),i=t(353),s=t(1869);a.Z=function(e){var a=(0,r.useRef)(!1),n=(0,r.useRef)(null),o=(0,r.useState)(!1),u=o[0],h=o[1],d=(0,l.k6)(),m=(0,i.Z)(),f=m.siteConfig,p=void 0===f?{}:f,g=m.isClient,v=void 0!==g&&g,E=p.baseUrl,b=(0,s.usePluginData)("docusaurus-lunr-search"),_=function(){a.current||(Promise.all([fetch(""+E+b.fileNames.searchDoc).then((function(e){return e.json()})),fetch(""+E+b.fileNames.lunrIndex).then((function(e){return e.json()})),Promise.all([t.e(9734),t.e(6533)]).then(t.bind(t,4549)),Promise.all([t.e(532),t.e(5077)]).then(t.bind(t,5077))]).then((function(e){var a=e[0],t=e[1],r=e[2].default;0!==a.length&&(!function(e,a,t){new t({searchDocs:e,searchIndex:a,inputSelector:"#search_input_react",handleSelected:function(e,a,t){var r=E+t.url;document.createElement("a").href=r,d.push(r)}})}(a,t,r),h(!0))})),a.current=!0)},N=(0,r.useCallback)((function(a){n.current.contains(a.target)||n.current.focus(),e.handleSearchBarToggle&&e.handleSearchBarToggle(!e.isSearchBarExpanded)}),[e.isSearchBarExpanded]);return(0,r.useEffect)((function(){v&&_()}),[v]),r.createElement("div",{className:"navbar__search",key:"search-box"},r.createElement("span",{"aria-label":"expand searchbar",role:"button",className:c()("search-icon",{"search-icon-hidden":e.isSearchBarExpanded}),onClick:N,onKeyDown:N,tabIndex:0}),r.createElement("input",{id:"search_input_react",type:"search",placeholder:u?"Search":"Loading...","aria-label":"Search",className:c()("navbar__search-input",{"search-bar-expanded":e.isSearchBarExpanded},{"search-bar":!e.isSearchBarExpanded}),onClick:_,onMouseOver:_,onFocus:N,onBlur:N,ref:n,disabled:!u}))}},6876:function(e,a,t){t.r(a),t.d(a,{default:function(){return o}});var r=t(7378),n=t(29),c=t(4142),l=t(1787);function i(e){var a=e.year,t=e.posts;return r.createElement(r.Fragment,null,r.createElement("h3",null,a),r.createElement("ul",null,t.map((function(e){return r.createElement("li",{key:e.metadata.date},r.createElement(c.Z,{to:e.metadata.permalink},e.metadata.formattedDate," - ",e.metadata.title))}))))}function s(e){var a=e.years;return r.createElement("section",{className:"margin-vert--lg"},r.createElement("div",{className:"container"},r.createElement("div",{className:"row"},a.map((function(e,a){return r.createElement("div",{key:a,className:"col col--4 margin-vert--lg"},r.createElement(i,e))})))))}function o(e){var a,t,c=e.archive,i=(0,l.I)({id:"theme.blog.archive.title",message:"Archive",description:"The page & hero title of the blog archive page"}),o=(0,l.I)({id:"theme.blog.archive.description",message:"Archive",description:"The page & hero description of the blog archive page"}),u=(a=c.blogPosts,t=a.reduceRight((function(e,a){var t=a.metadata.date.split("-")[0],r=e.get(t)||[];return e.set(t,[a].concat(r))}),new Map),Array.from(t,(function(e){return{year:e[0],posts:e[1]}})));return r.createElement(n.Z,{title:i,description:o},r.createElement("header",{className:"hero hero--primary"},r.createElement("div",{className:"container"},r.createElement("h1",{className:"hero__title"},i),r.createElement("p",{className:"hero__subtitle"},o))),r.createElement("main",null,u.length>0&&r.createElement(s,{years:u})))}}}]);