(function(){
  const KEY='gng.collapse.';
  function applyState(card){
    const id=card.getAttribute('data-collapsible');
    const st=localStorage.getItem(KEY+id);
    const open = st===null ? (id==='weather'||id==='top5') : (st==='open');
    card.classList.toggle('collapsed', !open);
    const btn=card.querySelector('.toggle');
    if(btn){ btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? '▾' : '▸'; }
  }
  function toggle(card){
    const id=card.getAttribute('data-collapsible'); const nowClosed = !card.classList.contains('collapsed');
    card.classList.toggle('collapsed', nowClosed);
    localStorage.setItem('gng.collapse.'+id, nowClosed ? 'closed' : 'open');
    const btn=card.querySelector('.toggle');
    if(btn){ btn.setAttribute('aria-expanded', String(!nowClosed)); btn.textContent = nowClosed ? '▸' : '▾'; }
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.card[data-collapsible]').forEach(card=>{
      applyState(card);
      const btn=card.querySelector('.toggle'); if(btn) btn.addEventListener('click', ()=>toggle(card));
    });
  });
})();