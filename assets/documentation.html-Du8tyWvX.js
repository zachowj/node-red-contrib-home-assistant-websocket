import{_ as a,c as n,e as t,o}from"./app-YEeKhUZS.js";const s={};function i(l,e){return o(),n("div",null,e[0]||(e[0]=[t(`<h1 id="documentation" tabindex="-1"><a class="header-anchor" href="#documentation"><span>Documentation</span></a></h1><p>The documentation is built with <a href="https://v2.vuepress.vuejs.org/" target="_blank" rel="noopener noreferrer">VuePress v2</a>. The pages are written in Markdown and are located in the <code>docs</code> directory.</p><h2 id="small-changes" tabindex="-1"><a class="header-anchor" href="#small-changes"><span>Small changes</span></a></h2><p>If you want to make small changes to the documentation, you can do so directly in the GitHub web interface. Just navigate to the file you want to change and click the pencil icon in the top right corner.</p><p>There is a link on the bottom of each page to edit the file directly in the GitHub web interface.</p><h2 id="local-development" tabindex="-1"><a class="header-anchor" href="#local-development"><span>Local development</span></a></h2><p>If you want to make larger changes to the documentation, you can clone the repository.</p><h3 id="developing-with-visual-studio-code-and-docker" tabindex="-1"><a class="header-anchor" href="#developing-with-visual-studio-code-and-docker"><span>Developing with Visual Studio Code and Docker</span></a></h3><ol><li><p>Install <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">Visual Studio Code</a>.</p></li><li><p>Install the <a href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers" target="_blank" rel="noopener noreferrer">Remote - Containers</a> extension.</p></li><li><p>Go to the <a href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket" target="_blank" rel="noopener noreferrer">Node-RED Home Assistant</a> repository and fork it.</p></li><li><p>Clone your forked repository to your local machine.</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> clone https://github.com/<span class="token operator">&lt;</span>GITHUB_USER_NAME<span class="token operator">&gt;</span>/node-red-contrib-home-assistant-websocket</span>
<span class="line"></span></code></pre></div></li><li><p>Open the repository in Visual Studio Code.</p></li><li><p>Click on the green &quot;Open a Remote Window&quot; button in the bottom left corner and select &quot;Reopen in Container&quot;.</p></li><li><p>Open a terminal in Visual Studio Code and run <code>pnpm docs:dev</code> to start the development server.</p></li></ol><h3 id="manual-environment" tabindex="-1"><a class="header-anchor" href="#manual-environment"><span>Manual environment</span></a></h3><ol><li><p>Install <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a>.</p></li><li><p>Enable pnpm</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">corepack <span class="token builtin class-name">enable</span> <span class="token operator">&amp;&amp;</span> corepack <span class="token builtin class-name">enable</span> <span class="token function">npm</span></span>
<span class="line"></span></code></pre></div></li><li><p>Go to the <a href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket" target="_blank" rel="noopener noreferrer">Node-RED Home Assistant</a> repository and fork it.</p></li><li><p>Clone your forked repository to your local machine.</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> clone https://github.com/<span class="token operator">&lt;</span>GITHUB_USER_NAME<span class="token operator">&gt;</span>/node-red-contrib-home-assistant-websocket</span>
<span class="line"></span></code></pre></div></li><li><p>Open the repository in your favorite editor.</p></li><li><p>Run <code>pnpm install</code> to install the dependencies.</p></li><li><p>Run <code>pnpm run docs:dev</code> to start the development server.</p></li></ol>`,11)]))}const p=a(s,[["render",i],["__file","documentation.html.vue"]]),c=JSON.parse('{"path":"/guide/documentation.html","title":"Documentation","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Small changes","slug":"small-changes","link":"#small-changes","children":[]},{"level":2,"title":"Local development","slug":"local-development","link":"#local-development","children":[{"level":3,"title":"Developing with Visual Studio Code and Docker","slug":"developing-with-visual-studio-code-and-docker","link":"#developing-with-visual-studio-code-and-docker","children":[]},{"level":3,"title":"Manual environment","slug":"manual-environment","link":"#manual-environment","children":[]}]}],"git":{"updatedTime":1724315473000,"contributors":[{"name":"Jason","email":"37859597+zachowj@users.noreply.github.com","commits":2},{"name":"jason","email":"37859597+zachowj@users.noreply.github.com","commits":1}]},"filePathRelative":"guide/documentation.md"}');export{p as comp,c as data};
