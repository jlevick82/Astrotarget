(function(){
  const KEY='gng.collapse.';
  function applyState(card){
    const id=card.getAttribute('data-collapsible');
    const st=localStorage.getItem(KEY+id);
    const open = st===null ? defaultOpen(id) : (st==='open');
    card.classList.toggle('collapsed', !open);
    const btn=card.querySelector('.toggle');
    if(btn){ btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? '▾' : '▸'; }
  }
  function defaultOpen(id){
    // Defaults: setup=false, weather=true, top5=true, catalog=false
    return (id==='weather' || id==='top5');
  }
  function toggle(card){
    const id=card.getAttribute('data-collapsible'); const nowCollapsed = !card.classList.contains('collapsed');
    card.classList.toggle('collapsed', nowCollapsed);
    localStorage.setItem('gng.collapse.'+id, nowCollapsed ? 'closed' : 'open');
    const btn=card.querySelector('.toggle');
    if(btn){ btn.setAttribute('aria-expanded', String(!nowCollapsed)); btn.textContent = nowCollapsed ? '▸' : '▾'; }
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.card[data-collapsible]').forEach(card=>{
      applyState(card);
      const btn=card.querySelector('.toggle');
      if(btn) btn.addEventListener('click', ()=>toggle(card));
    });
  });
})();