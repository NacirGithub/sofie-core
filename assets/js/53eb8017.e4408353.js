"use strict";(self.webpackChunksofie_documentation=self.webpackChunksofie_documentation||[]).push([[10],{559:function(e,t,n){n.r(t),n.d(t,{assets:function(){return d},contentTitle:function(){return s},default:function(){return u},frontMatter:function(){return l},metadata:function(){return p},toc:function(){return c}});var a=n(2685),i=n(1244),r=(n(7378),n(5318)),o=["components"],l={},s="Adding FFmpeg and FFprobe to your PATH on Windows",p={unversionedId:"user-guide/installation/installing-connections-and-additional-hardware/ffmpeg-installation",id:"version-1.37.0/user-guide/installation/installing-connections-and-additional-hardware/ffmpeg-installation",title:"Adding FFmpeg and FFprobe to your PATH on Windows",description:"Some parts of Sofie (specifically the Package Manager) require that FFmpeg and FFprobe be available in your PATH environment variable. This guide will go over how to download these executables and add them to your PATH.",source:"@site/versioned_docs/version-1.37.0/user-guide/installation/installing-connections-and-additional-hardware/ffmpeg-installation.md",sourceDirName:"user-guide/installation/installing-connections-and-additional-hardware",slug:"/user-guide/installation/installing-connections-and-additional-hardware/ffmpeg-installation",permalink:"/sofie-core/docs/1.37.0/user-guide/installation/installing-connections-and-additional-hardware/ffmpeg-installation",editUrl:"https://github.com/nrkno/sofie-core/edit/master/packages/documentation/versioned_docs/version-1.37.0/user-guide/installation/installing-connections-and-additional-hardware/ffmpeg-installation.md",tags:[],version:"1.37.0",frontMatter:{},sidebar:"version-1.37.0/gettingStarted",previous:{title:"Installing CasparCG&nbsp;Server for Sofie",permalink:"/sofie-core/docs/1.37.0/user-guide/installation/installing-connections-and-additional-hardware/casparcg-server-installation"},next:{title:"Configuring Vision Mixers",permalink:"/sofie-core/docs/1.37.0/user-guide/installation/installing-connections-and-additional-hardware/vision-mixers"}},d={},c=[{value:"Installation",id:"installation",level:3}],m={toc:c};function u(e){var t=e.components,l=(0,i.Z)(e,o);return(0,r.kt)("wrapper",(0,a.Z)({},m,l,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"adding-ffmpeg-and-ffprobe-to-your-path-on-windows"},"Adding FFmpeg and FFprobe to your PATH on Windows"),(0,r.kt)("p",null,"Some parts of Sofie (specifically the Package Manager) require that ",(0,r.kt)("a",{parentName:"p",href:"https://www.ffmpeg.org/"},(0,r.kt)("inlineCode",{parentName:"a"},"FFmpeg"))," and ",(0,r.kt)("a",{parentName:"p",href:"https://ffmpeg.org/ffprobe.html"},(0,r.kt)("inlineCode",{parentName:"a"},"FFprobe"))," be available in your ",(0,r.kt)("inlineCode",{parentName:"p"},"PATH")," environment variable. This guide will go over how to download these executables and add them to your ",(0,r.kt)("inlineCode",{parentName:"p"},"PATH"),"."),(0,r.kt)("h3",{id:"installation"},"Installation"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"FFmpeg")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"FFprobe")," can be downloaded from the ",(0,r.kt)("a",{parentName:"p",href:"https://ffmpeg.org/download.html"},"FFmpeg Downloads page"),' under the "Get packages & executable files" heading. At the time of writing, there are two sources of Windows builds: ',(0,r.kt)("inlineCode",{parentName:"p"},"gyan.dev")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"BtbN")," -- either one will work.")),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Once downloaded, extract the archive to some place permanent such as ",(0,r.kt)("inlineCode",{parentName:"p"},"C:\\Program Files\\FFmpeg"),"."),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"You should end up with a ",(0,r.kt)("inlineCode",{parentName:"li"},"bin")," folder inside of ",(0,r.kt)("inlineCode",{parentName:"li"},"C:\\Program Files\\FFmpeg")," and in that ",(0,r.kt)("inlineCode",{parentName:"li"},"bin")," folder should be three executables: ",(0,r.kt)("inlineCode",{parentName:"li"},"ffmpeg.exe"),", ",(0,r.kt)("inlineCode",{parentName:"li"},"ffprobe.exe"),", and ",(0,r.kt)("inlineCode",{parentName:"li"},"ffplay.exe"),"."))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Open your Start Menu and type ",(0,r.kt)("inlineCode",{parentName:"p"},"path"),'. An option named "Edit the system environment variables" should come up. Click on that option to open the System Properties menu.'),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("img",{loading:"lazy",alt:"Start Menu screenshot",src:n(4124).Z,width:"1039",height:"852"}))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},'In the System Properties menu, click the "Environment Varibles..." button at the bottom of the "Advanced" tab.'),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("img",{loading:"lazy",alt:"System Properties screenshot",src:n(3580).Z,width:"546",height:"572"}))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"If you installed ",(0,r.kt)("inlineCode",{parentName:"p"},"FFmpeg")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"FFprobe")," to a system-wide location such as ",(0,r.kt)("inlineCode",{parentName:"p"},"C:\\Program Files\\FFmpeg"),", select and edit the ",(0,r.kt)("inlineCode",{parentName:"p"},"Path"),' variable under the "System variables" heading. Else, if you installed them to some place specific to your user account, edit the ',(0,r.kt)("inlineCode",{parentName:"p"},"Path"),' variable under the "User variables for <YOUR ACCOUNT NAME',">",'" heading.'),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("img",{loading:"lazy",alt:"Environment Variables screenshot",src:n(5837).Z,width:"706",height:"777"}))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},'In the window that pops up when you click "Edit...", click "New" and enter the path to the ',(0,r.kt)("inlineCode",{parentName:"p"},"bin")," folder you extracted earlier. Then, click OK to add it."),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("img",{loading:"lazy",alt:"Edit environment variable screenshot",src:n(3145).Z,width:"602",height:"664"}))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},'Click "OK" to close the Environment Variables window, and then click "OK" again to close the\nSystem Properties window.')),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Verify that it worked by opening a Command Prompt and executing the following commands:"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre",className:"language-cmd"},"ffmpeg -version\nffprobe -version\n")),(0,r.kt)("p",{parentName:"li"},"If you see version output from both of those commands, then you are all set! If not, double check the paths you entered and try restarting your computer."))))}u.isMDXComponent=!0},5318:function(e,t,n){n.d(t,{Zo:function(){return d},kt:function(){return u}});var a=n(7378);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=p(n),u=i,f=m["".concat(s,".").concat(u)]||m[u]||c[u]||r;return n?a.createElement(f,o(o({ref:t},d),{},{components:n})):a.createElement(f,o({ref:t},d))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var p=2;p<r;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},3145:function(e,t,n){t.Z=n.p+"assets/images/edit_path_environment_variable-1f646439e52a16d5fc4f70ad1b4dc104.png"},4124:function(e,t,n){t.Z=n.p+"assets/images/edit_system_environment_variables-f3a021a86e3de7c21fee7f8aba212673.jpg"},5837:function(e,t,n){t.Z=n.p+"assets/images/environment_variables-08e1b380a3dfe4e7746531335bca5ac0.png"},3580:function(e,t,n){t.Z=n.p+"assets/images/system_properties-e5e8a7a6b27af5dbb164364daf2cf8bf.png"}}]);