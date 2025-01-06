import{_ as n,c as a,e as t,o as p}from"./app-YEeKhUZS.js";const o="/node-red-contrib-home-assistant-websocket/assets/expiration-date-monitor_01-D-HOPyeA.png",e="/node-red-contrib-home-assistant-websocket/assets/expiration-date-monitor_02-CLuUTqyf.png",u="/node-red-contrib-home-assistant-websocket/assets/expiration-date-monitor_03-Cmsu_170.png",c={};function r(l,s){return p(),a("div",null,s[0]||(s[0]=[t(`<h1 id="expiration-date-monitor-with-notification" tabindex="-1"><a class="header-anchor" href="#expiration-date-monitor-with-notification"><span>Expiration Date Monitor with notification</span></a></h1><p>Originally posted <a href="https://community.home-assistant.io/t/json-object-of-all-input-texts/177146/6" target="_blank" rel="noopener noreferrer">here</a> on the Home Assistant Forums.</p><p>Here&#39;s a demo showing how to build a system to track the expiration date of items in the pantry. Using the Home Assistant <a href="https://www.home-assistant.io/integrations/shopping_list/" target="_blank" rel="noopener noreferrer">Shopping List</a> as a way to input and update a list of items and their expiration date.</p><p>The format of the name in the shopping list would be <code>[item] : [expiration date]</code> with a colon separating the item name from the expiration date.</p><h2 id="home-assistant-stuff" tabindex="-1"><a class="header-anchor" href="#home-assistant-stuff"><span>Home Assistant stuff</span></a></h2><p>First, you would have to activate the shopping list in the config. <a href="https://www.home-assistant.io/integrations/shopping_list/" target="_blank" rel="noopener noreferrer">https://www.home-assistant.io/integrations/shopping_list/</a></p><div class="language-yaml" data-highlighter="prismjs" data-ext="yml" data-title="yml"><pre><code><span class="line"><span class="token comment"># Example configuration.yaml entry</span></span>
<span class="line"><span class="token key atrule">shopping_list</span><span class="token punctuation">:</span></span>
<span class="line"></span></code></pre></div><p>There&#39;s already a lovelace card for the shopping list. I also added an <code>input_number</code> to dynamically control the expiration window to check.</p><div class="language-yaml" data-highlighter="prismjs" data-ext="yml" data-title="yml"><pre><code><span class="line"><span class="token comment"># Example configuration.yaml entry</span></span>
<span class="line"><span class="token key atrule">input_number</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token key atrule">pantry_expiration</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">name</span><span class="token punctuation">:</span> Pantry Expiration Window</span>
<span class="line">    <span class="token key atrule">initial</span><span class="token punctuation">:</span> <span class="token number">90</span></span>
<span class="line">    <span class="token key atrule">min</span><span class="token punctuation">:</span> <span class="token number">30</span></span>
<span class="line">    <span class="token key atrule">max</span><span class="token punctuation">:</span> <span class="token number">120</span></span>
<span class="line">    <span class="token key atrule">step</span><span class="token punctuation">:</span> <span class="token number">1</span></span>
<span class="line">    <span class="token key atrule">unit_of_measurement</span><span class="token punctuation">:</span> days</span>
<span class="line">    <span class="token key atrule">icon</span><span class="token punctuation">:</span> mdi<span class="token punctuation">:</span>calendar<span class="token punctuation">-</span>clock</span>
<span class="line"></span></code></pre></div><p>Simple Lovelace config</p><p><img src="`+o+`" alt="image|498x346"></p><div class="language-yaml" data-highlighter="prismjs" data-ext="yml" data-title="yml"><pre><code><span class="line"><span class="token key atrule">type</span><span class="token punctuation">:</span> vertical<span class="token punctuation">-</span>stack</span>
<span class="line"><span class="token key atrule">cards</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Pantry Items</span>
<span class="line">    <span class="token key atrule">type</span><span class="token punctuation">:</span> shopping<span class="token punctuation">-</span>list</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">type</span><span class="token punctuation">:</span> entities</span>
<span class="line">    <span class="token key atrule">entities</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> input_number.pantry_expiration</span>
<span class="line"></span></code></pre></div><h2 id="node-red-stuff" tabindex="-1"><a class="header-anchor" href="#node-red-stuff"><span>Node-RED stuff</span></a></h2><p>You can set the inject node to fire at a set time each day or every other day whatever fits your needs.</p><p><img src="`+e+'" alt="image|690x93"></p><div class="language-json" data-highlighter="prismjs" data-ext="json" data-title="json"><pre><code><span class="line"><span class="token punctuation">[</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;e78bbe2c.9141&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;inject&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;topic&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;payload&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;payloadType&quot;</span><span class="token operator">:</span><span class="token string">&quot;date&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;repeat&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;crontab&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;once&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;onceDelay&quot;</span><span class="token operator">:</span><span class="token number">0.1</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">284</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1056</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;720213f9.9bb8fc&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;adeab5ee.bc4098&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;ha-api&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;Get Items&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;debugenabled&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;protocol&quot;</span><span class="token operator">:</span><span class="token string">&quot;websocket&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;method&quot;</span><span class="token operator">:</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;path&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;data&quot;</span><span class="token operator">:</span><span class="token string">&quot;{\\&quot;type\\&quot;: \\&quot;shopping_list/items\\&quot;}&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;dataType&quot;</span><span class="token operator">:</span><span class="token string">&quot;json&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;location&quot;</span><span class="token operator">:</span><span class="token string">&quot;payload&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;locationType&quot;</span><span class="token operator">:</span><span class="token string">&quot;msg&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;responseType&quot;</span><span class="token operator">:</span><span class="token string">&quot;json&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">652</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1056</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;236e3cd6.fab7d4&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;236e3cd6.fab7d4&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;function&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;do the stuff&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;func&quot;</span><span class="token operator">:</span><span class="token string">&quot;const items = msg.payload;\\n\\nif (items.length === 0) return;\\n\\nconst expItems = [];\\n\\n// Current timestamp + expiration days in milliseconds\\nconst expireWindow = Date.now() + msg.expDays * 8.64e7;\\n\\nitems.forEach(i =&gt; {\\n  // If the name doesn&#39;t contain the split character don&#39;t process\\n  // If complete set to true in the shopping list don&#39;t process\\n  if (!i.name.includes(\\&quot;:\\&quot;) || i.complete === true) return;\\n\\n  // Split the name and remove white spaces\\n  const [name, exp] = i.name.split(\\&quot;:\\&quot;).map(x =&gt; x.trim());\\n\\n  // check for valid date\\n  const expiredDate = Date.parse(exp);\\n  if (isNaN(expiredDate) || expiredDate &gt; expireWindow) return;\\n  \\n  // Add item to expired list\\n  expItems.push({ \\n      name, \\n      exp, \\n      inThePast: expiredDate &lt; Date.now()\\n  });\\n});\\n\\n// If array is empty nothing to report\\nif (expItems.length === 0) return;\\n\\nmsg.payload = expItems;\\n\\nreturn msg;\\n&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;outputs&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token property">&quot;noerr&quot;</span><span class="token operator">:</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">822</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1056</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;4270d967.43cc08&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;720213f9.9bb8fc&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;api-current-state&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;Get expiration window&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;version&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token property">&quot;outputs&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token property">&quot;halt_if&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;halt_if_type&quot;</span><span class="token operator">:</span><span class="token string">&quot;str&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;halt_if_compare&quot;</span><span class="token operator">:</span><span class="token string">&quot;is&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;override_topic&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;entity_id&quot;</span><span class="token operator">:</span><span class="token string">&quot;input_number.pantry_expiration&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;state_type&quot;</span><span class="token operator">:</span><span class="token string">&quot;num&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;state_location&quot;</span><span class="token operator">:</span><span class="token string">&quot;expDays&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;override_payload&quot;</span><span class="token operator">:</span><span class="token string">&quot;msg&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;entity_location&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;override_data&quot;</span><span class="token operator">:</span><span class="token string">&quot;none&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;blockInputOverrides&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">468</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1056</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;adeab5ee.bc4098&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;4270d967.43cc08&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;split&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;splt&quot;</span><span class="token operator">:</span><span class="token string">&quot;\\\\n&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;spltType&quot;</span><span class="token operator">:</span><span class="token string">&quot;str&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;arraySplt&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token property">&quot;arraySpltType&quot;</span><span class="token operator">:</span><span class="token string">&quot;len&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;stream&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;addname&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">290</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1120</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;e1f6793d.9be5f8&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;3d3871cd.cb442e&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;join&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;mode&quot;</span><span class="token operator">:</span><span class="token string">&quot;auto&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;build&quot;</span><span class="token operator">:</span><span class="token string">&quot;string&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;property&quot;</span><span class="token operator">:</span><span class="token string">&quot;payload&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;propertyType&quot;</span><span class="token operator">:</span><span class="token string">&quot;msg&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;key&quot;</span><span class="token operator">:</span><span class="token string">&quot;topic&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;joiner&quot;</span><span class="token operator">:</span><span class="token string">&quot;\\\\n&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;joinerType&quot;</span><span class="token operator">:</span><span class="token string">&quot;str&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;accumulate&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;timeout&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;count&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;reduceRight&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;reduceExp&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;reduceInit&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;reduceInitType&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;reduceFixup&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">674</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1120</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;ddffd5ea.ebd528&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;e1f6793d.9be5f8&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;moment&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;pretty&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;topic&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;input&quot;</span><span class="token operator">:</span><span class="token string">&quot;payload.exp&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;inputType&quot;</span><span class="token operator">:</span><span class="token string">&quot;msg&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;inTz&quot;</span><span class="token operator">:</span><span class="token string">&quot;America/Los_Angeles&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;adjAmount&quot;</span><span class="token operator">:</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token property">&quot;adjType&quot;</span><span class="token operator">:</span><span class="token string">&quot;days&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;adjDir&quot;</span><span class="token operator">:</span><span class="token string">&quot;add&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;format&quot;</span><span class="token operator">:</span><span class="token string">&quot;timeAgo&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;locale&quot;</span><span class="token operator">:</span><span class="token string">&quot;en_US&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;output&quot;</span><span class="token operator">:</span><span class="token string">&quot;payload.pretty&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;outputType&quot;</span><span class="token operator">:</span><span class="token string">&quot;msg&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;outTz&quot;</span><span class="token operator">:</span><span class="token string">&quot;America/Los_Angeles&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">418</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1120</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;c96d522b.7cfbb&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;c96d522b.7cfbb&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;function&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;format&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;func&quot;</span><span class="token operator">:</span><span class="token string">&quot;const d = msg.payload;\\nmsg.payload = `${d.name} expire${d.inThePast ? &#39;d&#39; : &#39;s&#39;} ${d.pretty}`;\\nreturn msg;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;outputs&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token property">&quot;noerr&quot;</span><span class="token operator">:</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">544</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1120</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token string">&quot;3d3871cd.cb442e&quot;</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token punctuation">{</span><span class="token property">&quot;id&quot;</span><span class="token operator">:</span><span class="token string">&quot;ddffd5ea.ebd528&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;type&quot;</span><span class="token operator">:</span><span class="token string">&quot;api-call-service&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;z&quot;</span><span class="token operator">:</span><span class="token string">&quot;56b1c979.b2c618&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;version&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token property">&quot;debugenabled&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;service_domain&quot;</span><span class="token operator">:</span><span class="token string">&quot;notify&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;service&quot;</span><span class="token operator">:</span><span class="token string">&quot;mobile_app_phone&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;entityId&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;data&quot;</span><span class="token operator">:</span><span class="token string">&quot;{\\t    \\&quot;title\\&quot;: \\&quot;Pantry Items Expiring:\\&quot;,\\t    \\&quot;message\\&quot;: $join(payload, \\&quot;\\\\n\\&quot;)\\t}&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;dataType&quot;</span><span class="token operator">:</span><span class="token string">&quot;jsonata&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;mergecontext&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;output_location&quot;</span><span class="token operator">:</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;output_location_type&quot;</span><span class="token operator">:</span><span class="token string">&quot;none&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;mustacheAltTags&quot;</span><span class="token operator">:</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token property">&quot;x&quot;</span><span class="token operator">:</span><span class="token number">882</span><span class="token punctuation">,</span><span class="token property">&quot;y&quot;</span><span class="token operator">:</span><span class="token number">1120</span><span class="token punctuation">,</span><span class="token property">&quot;wires&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">]</span></span>\n<span class="line"></span></code></pre></div><p><img src="'+u+'" alt="image|551x297"></p><p>There&#39;s a lot more polish that could go into this such as being notified if the date entered in the shopping list is invalid or doesn&#39;t have a date at all. Sort the expired list so that the closest to expiring is at the top.</p>',18)]))}const k=n(c,[["render",r],["__file","expiration-date-monitor.html.vue"]]),q=JSON.parse('{"path":"/cookbook/expiration-date-monitor.html","title":"Expiration Date Monitor with notification","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Home Assistant stuff","slug":"home-assistant-stuff","link":"#home-assistant-stuff","children":[]},{"level":2,"title":"Node-RED stuff","slug":"node-red-stuff","link":"#node-red-stuff","children":[]}],"git":{"updatedTime":1647350454000,"contributors":[{"name":"Jason","email":"37859597+zachowj@users.noreply.github.com","commits":2}]},"filePathRelative":"cookbook/expiration-date-monitor.md"}');export{k as comp,q as data};
