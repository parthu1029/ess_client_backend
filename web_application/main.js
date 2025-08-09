(function(){
  const modulesContainer = document.getElementById('modulesContainer');
  const serverStatus = document.getElementById('serverStatus');
  const baseUrlInput = document.getElementById('baseUrl');
  const empIdInput = document.getElementById('empId');
  const companyIdInput = document.getElementById('companyId');
  const applyCookiesBtn = document.getElementById('applyCookiesBtn');
  const clearCookiesBtn = document.getElementById('clearCookiesBtn');
  const varsContainer = document.getElementById('variables');
  const addVarBtn = document.getElementById('addVarBtn');
  const saveVarsBtn = document.getElementById('saveVarsBtn');

  const COMMON_FILE_KEYS = ['photo','receipt','attachment'];

  function loadVars(){
    try{ return JSON.parse(localStorage.getItem('ess_vars')||'{}'); }catch(e){ return {}; }
  }
  function saveVars(obj){ localStorage.setItem('ess_vars', JSON.stringify(obj||{})); }

  function renderVars(){
    const vars = loadVars();
    varsContainer.innerHTML = '';
    Object.entries(vars).forEach(([k,v])=>{
      varsContainer.appendChild(varRow(k,v));
    });
  }
  function varRow(k='', v=''){
    const row = document.createElement('div');
    row.className = 'var-row';
    row.innerHTML = `
      <input class="var-key" placeholder="key" value="${k}">
      <input class="var-val" placeholder="value" value="${v}">
      <button class="secondary remove">✕</button>
    `;
    row.querySelector('.remove').onclick = ()=>{ row.remove(); };
    return row;
  }

  addVarBtn.onclick = ()=>{ varsContainer.appendChild(varRow()); };
  saveVarsBtn.onclick = ()=>{
    const rows = varsContainer.querySelectorAll('.var-row');
    const obj = {};
    rows.forEach(r=>{
      const k = r.querySelector('.var-key').value.trim();
      const v = r.querySelector('.var-val').value;
      if(k) obj[k]=v;
    });
    saveVars(obj);
    alert('Variables saved');
  };

  function setCookie(name, value, days){
    const maxAge = days ? `; Max-Age=${days*24*60*60}` : '';
    document.cookie = `${name}=${value}; Path=/; SameSite=Lax${maxAge}`;
  }
  function clearCookie(name){
    document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
  }

  applyCookiesBtn.onclick = ()=>{
    const emp = empIdInput.value.trim();
    const comp = companyIdInput.value.trim();
    if(!emp || !comp){ alert('Please enter EmpID and CompanyID'); return; }
    // Flat EmpID for convenience
    setCookie('EmpID', emp, 7);
    // Context as JSON cookie with cookie-parser j: prefix
    const ctx = 'j:'+JSON.stringify({ CompanyID: comp });
    setCookie('Context', ctx, 7);
    serverStatus.textContent = 'Cookies set (EmpID, Context)';
  };
  clearCookiesBtn.onclick = ()=>{
    ['EmpID','CompanyID','Context','Companyid','companyid'].forEach(clearCookie);
    serverStatus.textContent = 'Cookies cleared';
  };

  function guessPlaceholders(url){
    const re = /\{\{([^}]+)\}\}/g; // {{var}}
    const list = new Set();
    let m; while((m=re.exec(url))){ list.add(m[1]); }
    return Array.from(list);
  }
  function replacePlaceholders(text, vars){
    return text.replace(/\{\{([^}]+)\}\}/g, (_, k)=> String(vars[k] ?? ''));
  }
  function parseQuery(url){
    try{
      const u = new URL(url, baseUrlInput.value || window.location.origin);
      const out = {};
      u.searchParams.forEach((v,k)=>{ out[k]=v; });
      return out;
    }catch(e){ return {}; }
  }
  function buildUrl(url, runtimeVars, queryOverrides){
    let out = url;
    // Handle {{baseUrl}} specially
    const base = baseUrlInput.value.trim() || window.location.origin;
    out = out.replace(/\{\{\s*baseUrl\s*\}\}/g, base);
    out = replacePlaceholders(out, runtimeVars);
    // Merge query overrides
    try{
      const u = new URL(out, base);
      Object.entries(queryOverrides||{}).forEach(([k,v])=>{
        if(v!=='' && v!=null) u.searchParams.set(k, v);
      });
      out = u.toString();
    }catch(e){}
    return out;
  }

  function endpointCard(modName, ep){
    const tpl = document.getElementById('endpointTemplate');
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.method').textContent = ep.method;
    node.querySelector('.name').textContent = ep.name;
    node.querySelector('.url').textContent = ep.url;

    const bodyWrap = node.querySelector('.endpoint-body');

    // Headers section (from Postman collection)
    if (Array.isArray(ep.headers) && ep.headers.length) {
      const hsec = document.createElement('div');
      hsec.className = 'field-group headers';
      hsec.innerHTML = '<h4>Headers</h4>';
      ep.headers.forEach(h => {
        const key = h && h.key ? h.key : '';
        const val = h && (h.value !== undefined) ? h.value : '';
        const disabled = !!(h && h.disabled);
        const row = document.createElement('div');
        row.className = 'fd-row';
        row.innerHTML = `
          <input type="checkbox" class="h-enabled" ${disabled ? '' : 'checked'} title="enabled">
          <input class="h-key" placeholder="Header name" value="${key}">
          <input class="h-val" placeholder="Header value" value="${val}">
        `;
        hsec.appendChild(row);
      });
      bodyWrap.appendChild(hsec);
    }

    // Placeholder inputs
    const ph = guessPlaceholders(ep.url).filter(k=>k!=='baseUrl');
    const vars = loadVars();
    if(ph.length){
      const psec = document.createElement('div');
      psec.className = 'field-group';
      psec.innerHTML = '<h4>Path/Variable Inputs</h4>';
      ph.forEach(k=>{
        const v = vars[k] || '';
        const row = document.createElement('label');
        row.innerHTML = `<span>{{${k}}}</span><input data-ph="${k}" value="${v}">`;
        psec.appendChild(row);
      });
      bodyWrap.appendChild(psec);
    }

    // Query params
    const initialQuery = parseQuery(ep.url);
    if(Object.keys(initialQuery).length){
      const qsec = document.createElement('div');
      qsec.className = 'field-group';
      qsec.innerHTML = '<h4>Query Params</h4>';
      Object.entries(initialQuery).forEach(([k,v])=>{
        const row = document.createElement('label');
        row.innerHTML = `<span>${k}</span><input data-qk="${k}" value="${v}">`;
        qsec.appendChild(row);
      });
      bodyWrap.appendChild(qsec);
    }

    // Body section for non-GET/DELETE (prefill from Postman definition when available)
    const needsBody = !['GET','DELETE'].includes(ep.method);
    let modeSel, jsonArea, fdWrap;
    if(needsBody){
      const bsec = document.createElement('div');
      bsec.className = 'field-group';
      const gid = 'mode-' + crypto.randomUUID();
      bsec.innerHTML = `
        <h4>Body</h4>
        <div class="body-mode">
          <label><input type="radio" name="${gid}" value="json" checked> JSON</label>
          <label><input type="radio" name="${gid}" value="form"> Form-Data</label>
          <label><input type="radio" name="${gid}" value="urlencoded"> URL-Encoded</label>
        </div>
        <textarea class="json-body" placeholder='{"key":"value"}'></textarea>
        <div class="formdata hidden">
          <div class="fd-rows"></div>
          <div class="actions tight">
            <button type="button" class="secondary add-fd">+ Add Field</button>
            <button type="button" class="secondary add-file">+ Add File</button>
          </div>
        </div>
      `;
      bodyWrap.appendChild(bsec);
      modeSel = bsec.querySelectorAll('.body-mode input[type=radio]');
      jsonArea = bsec.querySelector('.json-body');
      fdWrap = bsec.querySelector('.formdata');
      const fdRows = fdWrap.querySelector('.fd-rows');
      function addFieldRow(k='', v=''){
        const r = document.createElement('div'); r.className='fd-row';
        r.innerHTML = `<input placeholder="key" class="fd-k" value="${k}"> <input placeholder="value" class="fd-v" value="${v}"> <button class="secondary rm">✕</button>`;
        r.querySelector('.rm').onclick=()=>r.remove();
        fdRows.appendChild(r);
      }
      function addFileRow(k='file'){
        const r = document.createElement('div'); r.className='fd-row';
        r.innerHTML = `<input placeholder="key" class="fd-k" value="${k}"> <input type="file" class="fd-f"> <button class="secondary rm">✕</button>`;
        r.querySelector('.rm').onclick=()=>r.remove();
        fdRows.appendChild(r);
      }
      // Helper to toggle mode UI
      const setMode = (val)=>{
        const target = bsec.querySelector(`.body-mode input[value="${val}"]`);
        if (target) target.checked = true;
        if(val==='json'){ jsonArea.classList.remove('hidden'); fdWrap.classList.add('hidden'); }
        else { jsonArea.classList.add('hidden'); fdWrap.classList.remove('hidden'); }
      };

      // Prefill body from Postman definition
      const bodyDef = ep.body || {};
      const bodyMode = (bodyDef.mode || '').toLowerCase();
      if (bodyMode === 'raw') {
        if (typeof bodyDef.raw === 'string' && bodyDef.raw.trim()) {
          // Pretty print JSON if possible
          try { jsonArea.value = JSON.stringify(JSON.parse(bodyDef.raw), null, 2); }
          catch { jsonArea.value = bodyDef.raw; }
        }
        // Ensure JSON mode visible
        setMode('json');
      } else if (bodyMode === 'formdata') {
        setMode('form');
        const items = Array.isArray(bodyDef.formdata) ? bodyDef.formdata : [];
        if (items.length) {
          items.forEach(it => {
            const key = it && it.key ? it.key : '';
            const type = it && it.type ? it.type : 'text';
            if (type === 'file') addFileRow(key);
            else addFieldRow(key, (it && (it.value!==undefined?it.value:'')));
          });
        } else {
          // No template: seed common file keys to hint uploads
          COMMON_FILE_KEYS.forEach(k=>addFileRow(k));
        }
      } else if (bodyMode === 'urlencoded') {
        setMode('urlencoded');
        const items = Array.isArray(bodyDef.urlencoded) ? bodyDef.urlencoded : [];
        if (items.length) {
          items.forEach(it => addFieldRow(it && it.key ? it.key : '', (it && (it.value!==undefined?it.value:'')) ));
        }
      } else {
        // Unknown or absent template: provide helpful defaults
        COMMON_FILE_KEYS.forEach(k=>addFileRow(k));
      }
      bsec.querySelector('.add-fd').onclick = ()=> addFieldRow();
      bsec.querySelector('.add-file').onclick = ()=> addFileRow();
      modeSel.forEach(r=>{
        r.onchange = ()=>{
          if(r.value==='json') { jsonArea.classList.remove('hidden'); fdWrap.classList.add('hidden'); }
          else { jsonArea.classList.add('hidden'); fdWrap.classList.remove('hidden'); }
        };
      });
    }

    // Actions
    const sendBtn = node.querySelector('.sendBtn');
    const clearBtn = node.querySelector('.clearBtn');
    const respEl = node.querySelector('.response');
    const statusEl = node.querySelector('.status');
    const timeEl = node.querySelector('.time');

    clearBtn.onclick = ()=>{ respEl.textContent=''; statusEl.textContent=''; timeEl.textContent=''; };

    sendBtn.onclick = async ()=>{
      const start = performance.now();
      const runtimeVars = Object.assign({}, loadVars());
      // Collect placeholder inputs
      node.querySelectorAll('input[data-ph]').forEach(inp=>{ runtimeVars[inp.dataset.ph]=inp.value; });
      const queryOverrides = {};
      node.querySelectorAll('input[data-qk]').forEach(inp=>{ queryOverrides[inp.dataset.qk]=inp.value; });

      const finalUrl = buildUrl(ep.url, runtimeVars, queryOverrides);
      const opts = { method: ep.method, headers: {}, credentials: 'include' };

      // Collect headers from the headers section (with variable substitution)
      const headersSection = node.querySelector('.headers');
      if (headersSection) {
        headersSection.querySelectorAll('.fd-row').forEach(row => {
          const enabled = row.querySelector('.h-enabled');
          if (enabled && !enabled.checked) return;
          const k = row.querySelector('.h-key')?.value?.trim();
          const v = row.querySelector('.h-val')?.value ?? '';
          if (k) opts.headers[k] = replacePlaceholders(String(v), runtimeVars);
        });
      }

      if(needsBody){
        // Determine mode
        const selModeEl = modeSel && Array.from(modeSel).find(r=>r.checked);
        const selMode = selModeEl ? selModeEl.value : 'json';
        if(selMode === 'json'){
          let bodyText = jsonArea.value.trim();
          if(bodyText){
            bodyText = replacePlaceholders(bodyText, runtimeVars);
            try { JSON.parse(bodyText); } catch(e) { alert('Body is not valid JSON after applying variables'); return; }
          }
          opts.headers['Content-Type'] = 'application/json';
          opts.body = bodyText || '{}';
        } else if (selMode === 'form') {
          const fd = new FormData();
          node.querySelectorAll('.fd-row').forEach(r=>{
            const kInp = r.querySelector('.fd-k');
            const fileInp = r.querySelector('.fd-f');
            if(!kInp || !kInp.value) return;
            const key = kInp.value;
            if(fileInp){
              if(fileInp.files && fileInp.files[0]) fd.append(key, fileInp.files[0]);
            } else {
              const vInp = r.querySelector('.fd-v');
              fd.append(key, vInp ? replacePlaceholders(String(vInp.value), runtimeVars) : '');
            }
          });
          opts.body = fd;
        } else if (selMode === 'urlencoded') {
          const params = new URLSearchParams();
          node.querySelectorAll('.fd-row').forEach(r=>{
            const kInp = r.querySelector('.fd-k');
            if(!kInp || !kInp.value) return;
            const fileInp = r.querySelector('.fd-f');
            if (fileInp) return; // ignore file inputs in urlencoded
            const vInp = r.querySelector('.fd-v');
            const key = kInp.value;
            const val = vInp ? replacePlaceholders(String(vInp.value), runtimeVars) : '';
            params.append(key, val);
          });
          opts.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
          opts.body = params.toString();
        }
      }

      statusEl.textContent = 'Sending…';
      timeEl.textContent = '';
      respEl.textContent = '';

      try{
        const res = await fetch(finalUrl, opts);
        const dt = (performance.now()-start).toFixed(1)+' ms';
        timeEl.textContent = dt;
        statusEl.textContent = `${res.status} ${res.statusText}`;
        const ctype = res.headers.get('content-type')||'';
        if(ctype.includes('application/json')){
          const j = await res.json();
          respEl.textContent = JSON.stringify(j, null, 2);
        } else {
          const t = await res.text();
          respEl.textContent = t;
        }
      }catch(err){
        statusEl.textContent = 'Request failed';
        respEl.textContent = String(err);
      }
    };

    return node;
  }

  async function init(){
    baseUrlInput.value = window.location.origin;
    renderVars();
    try{
      const res = await fetch('/web/endpoints');
      if(!res.ok) throw new Error('Failed to load endpoints');
      const data = await res.json();
      serverStatus.textContent = 'Endpoints loaded';
      const modules = data.modules || [];
      modulesContainer.innerHTML = '';
      modules.forEach(mod => {
        const sec = document.createElement('section');
        sec.className = 'module';
        sec.innerHTML = `<h2>${mod.name}</h2>`;
        const list = document.createElement('div'); list.className='endpoint-list';
        (mod.endpoints||[]).forEach(ep=> list.appendChild(endpointCard(mod.name, ep)) );
        sec.appendChild(list);
        modulesContainer.appendChild(sec);
      });
    }catch(e){
      serverStatus.textContent = 'Failed to load endpoints';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
